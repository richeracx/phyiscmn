import 'server-only';
import { SolverError } from '../errors';
import { config } from './config';
import { systemInstruction, userPrompt } from './prompt';
import type { SolveInput } from './request';

const REQUEST_TIMEOUT_MS = 110_000;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

function buildMessages(input: SolveInput): ChatMessage[] {
  const sys = `${systemInstruction(input.lang)}\n\nIMPORTANT: You must return your entire output strictly as a valid JSON object matching the requested schema. No markdown formatting outside JSON.`;
  const promptText = userPrompt(input.problem, Boolean(input.image), input.lang);

  const messages: ChatMessage[] = [{ role: 'system', content: sys }];

  if (input.image) {
    const dataUri = `data:${input.image.mimeType};base64,${input.image.data.toString('base64')}`;
    messages.push({
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: dataUri } },
        { type: 'text', text: promptText },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: promptText,
    });
  }

  return messages;
}

/**
 * Executes a fetch to the OpenAI-compatible endpoint with automatic fallback
 * if the requested model (e.g. gpt-6-luna) is unavailable or returns 404.
 */
async function fetchWithModelFallback(
  url: string,
  apiKey: string,
  basePayload: Record<string, unknown>,
  signal: AbortSignal,
): Promise<Response> {
  const requestedModel = config.openaiModel();
  const modelsToTry = [
    requestedModel,
    'gpt-4o',
    'gpt-4o-mini',
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastResponse: Response | null = null;
  let hadRateLimit = false;

  for (const model of uniqueModels) {
    const payload: Record<string, unknown> = { ...basePayload, model };
    if (model.startsWith('o1') || model.startsWith('o3')) {
      delete payload.temperature;
    }

    try {
      const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
      const combinedSignal = AbortSignal.any([signal, timeoutSignal]);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: combinedSignal,
        cache: 'no-store',
      });

      if (res.ok) {
        if (model !== requestedModel) {
          console.warn(`[solver] Requested '${requestedModel}' unavailable; succeeded with fallback '${model}'`);
        }
        return res;
      }

      const errText = await res.text().catch(() => '');
      lastResponse = res;
      console.error(`[solver] Model '${model}' failed (HTTP ${res.status}): ${errText}`);

      // If auth fails (401/403), no need to try other models with the same invalid key
      if (res.status === 401 || res.status === 403) {
        throw new SolverError('not_configured', { detail: 'API authentication failed. Check your API key.' });
      }

      if (res.status === 429) {
        hadRateLimit = true;
        // Keep trying fallback model (e.g. gpt-4o-mini might have available quota if gpt-4o hit limits)
        continue;
      }

      // If model not found (404) or bad request (400), try next model
      if (res.status === 404 || res.status === 400 || res.status >= 500) {
        continue;
      }

      break;
    } catch (err) {
      if (err instanceof SolverError) throw err;
      if (signal.aborted) throw new SolverError('model_timeout', { cause: err });
      console.error(`[solver] Network exception calling '${model}':`, err);
    }
  }

  if (hadRateLimit) {
    throw new SolverError('model_busy', {
      detail: 'OpenAI quota or rate limit exceeded. Please check your OpenAI billing/credits.',
    });
  }

  if (lastResponse) {
    if (lastResponse.status >= 500) {
      throw new SolverError('model_busy', { detail: 'AI provider is temporarily overloaded.' });
    }
    throw new SolverError('model_busy', { detail: 'Requested AI model is unavailable. Please verify API key and model.' });
  }

  throw new SolverError('model_busy');
}

/**
 * Streams solution tokens from GPT-6 Luna via Server-Sent Events (SSE).
 */
export async function* streamGptSolution(input: SolveInput, signal: AbortSignal): AsyncGenerator<string> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) throw new SolverError('not_configured');

  const url = `${config.openaiBaseUrl().replace(/\/+$/, '')}/chat/completions`;
  const messages = buildMessages(input);

  const basePayload = {
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
    stream: true,
  };

  const response = await fetchWithModelFallback(url, apiKey, basePayload, signal);

  if (!response.body) throw new SolverError('model_output');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') return;
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) yield chunk;
          } catch {
            // Partial chunk or heartbeat, keep going
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof SolverError) throw error;
    if (signal.aborted) throw new SolverError('model_timeout', { cause: error });
    console.error('[solver] Stream reading error:', error);
    throw new SolverError('model_busy', { cause: error });
  } finally {
    reader.releaseLock();
  }
}

/**
 * Non-streaming single generation for solution retry or repair.
 */
export async function generateGptSolution(
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) throw new SolverError('not_configured');

  const url = `${config.openaiBaseUrl().replace(/\/+$/, '')}/chat/completions`;

  const basePayload = {
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
    stream: false,
  };

  const response = await fetchWithModelFallback(url, apiKey, basePayload, signal);

  try {
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new SolverError('model_output');
    return content;
  } catch (error) {
    if (error instanceof SolverError) throw error;
    throw new SolverError('model_busy', { cause: error });
  }
}
