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
  const sys = systemInstruction(input.lang);
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

function handleFetchError(error: unknown, signal: AbortSignal): never {
  if (error instanceof SolverError) throw error;
  if (signal.aborted) throw new SolverError('model_timeout', { cause: error });
  // Never leak provider internal details or keys
  throw new SolverError('model_busy', { cause: error });
}

/**
 * Streams solution tokens from GPT-6 Luna via Server-Sent Events (SSE).
 */
export async function* streamGptSolution(input: SolveInput, signal: AbortSignal): AsyncGenerator<string> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) throw new SolverError('not_configured');

  const url = `${config.openaiBaseUrl().replace(/\/+$/, '')}/chat/completions`;
  const messages = buildMessages(input);

  const payload = {
    model: config.openaiModel(),
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
    stream: true,
  };

  let response: Response;
  try {
    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const combinedSignal = AbortSignal.any([signal, timeoutSignal]);

    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: combinedSignal,
      cache: 'no-store',
    });
  } catch (error) {
    handleFetchError(error, signal);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      console.error('[solver] GPT-6 Luna auth rejected');
      throw new SolverError('not_configured');
    }
    if (response.status === 429) throw new SolverError('model_busy');
    if (response.status >= 500) throw new SolverError('model_busy');
    throw new SolverError('model_busy');
  }

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
    handleFetchError(error, signal);
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

  const payload = {
    model: config.openaiModel(),
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
    stream: false,
  };

  let response: Response;
  try {
    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const combinedSignal = AbortSignal.any([signal, timeoutSignal]);

    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: combinedSignal,
      cache: 'no-store',
    });
  } catch (error) {
    handleFetchError(error, signal);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new SolverError('not_configured');
    if (response.status === 429 || response.status >= 500) throw new SolverError('model_busy');
    throw new SolverError('model_busy');
  }

  try {
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new SolverError('model_output');
    return content;
  } catch (error) {
    handleFetchError(error, signal);
  }
}
