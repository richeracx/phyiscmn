import 'server-only';
import { SolverError } from '../errors';
import { config } from './config';
import { systemInstruction, userPrompt } from './prompt';
import type { SolveInput } from './request';

const REQUEST_TIMEOUT_MS = 110_000;
const LUNA_MODEL = 'gpt-6-luna';

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
 * Executes a call directly to OpenAI Chat Completions for GPT-6 Luna.
 * Note: GPT-6 Luna is a high reasoning model.
 * Per OpenAI documentation:
 * - Reasoning models reject custom temperature (must not pass temperature).
 * - reasoning_effort is supported (none, low, medium, high, xhigh, max).
 * - max_completion_tokens is used instead of max_tokens.
 * - Tier Free is not supported (requires paid tier like Build).
 */
async function callGpt6Luna(
  url: string,
  apiKey: string,
  payload: Record<string, unknown>,
  signal: AbortSignal,
): Promise<Response> {
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

    if (res.ok) return res;

    const errText = await res.text().catch(() => '');
    console.error(`[solver] GPT-6 Luna request failed (HTTP ${res.status}): ${errText}`);

    let parsedError: { error?: { message?: string; type?: string; code?: string } } | null = null;
    try {
      parsedError = JSON.parse(errText);
    } catch {}

    const errorMessage = parsedError?.error?.message || errText || 'Unknown provider error';
    const errorCode = parsedError?.error?.code;

    if (res.status === 401 || res.status === 403) {
      throw new SolverError('not_configured', {
        detail: `OpenAI authentication failed (${res.status}): ${errorMessage}`,
      });
    }

    if (res.status === 429) {
      const isQuota = errorCode === 'insufficient_quota' || errorMessage.toLowerCase().includes('quota');
      throw new SolverError('model_busy', {
        detail: isQuota
          ? 'OpenAI quota exceeded. GPT-6 Luna requires a paid tier (Build/Launch/Grow) with available credits.'
          : `OpenAI rate limit exceeded: ${errorMessage}`,
      });
    }

    if (res.status === 404) {
      throw new SolverError('model_busy', {
        detail: `GPT-6 Luna model access error: ${errorMessage}`,
      });
    }

    if (res.status === 400) {
      throw new SolverError('bad_request', {
        detail: `OpenAI API request validation error: ${errorMessage}`,
      });
    }

    if (res.status >= 500) {
      throw new SolverError('model_busy', {
        detail: `OpenAI service error (${res.status}). Please try again shortly.`,
      });
    }

    throw new SolverError('model_busy', {
      detail: `GPT-6 Luna error (${res.status}): ${errorMessage}`,
    });
  } catch (err) {
    if (err instanceof SolverError) throw err;
    if (signal.aborted) throw new SolverError('model_timeout', { cause: err });
    console.error('[solver] Network exception calling GPT-6 Luna:', err);
    throw new SolverError('network', { cause: err });
  }
}

/**
 * Streams solution tokens from GPT-6 Luna via Server-Sent Events (SSE).
 */
export async function* streamGptSolution(input: SolveInput, signal: AbortSignal): AsyncGenerator<string> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) {
    throw new SolverError('not_configured', { detail: 'OpenAI API key is missing. Set OPENAI_API_KEY in Vercel.' });
  }

  const url = `${config.openaiBaseUrl().replace(/\/+$/, '')}/chat/completions`;
  const messages = buildMessages(input);

  const payload: Record<string, unknown> = {
    model: LUNA_MODEL,
    messages,
    response_format: { type: 'json_object' },
    reasoning_effort: 'medium',
    max_completion_tokens: 16384,
    stream: true,
  };

  const response = await callGpt6Luna(url, apiKey, payload, signal);

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
              choices?: Array<{
                delta?: {
                  content?: string;
                  reasoning_content?: string;
                };
              }>;
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
 * Non-streaming single generation for solution retry or repair using GPT-6 Luna.
 */
export async function generateGptSolution(
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) {
    throw new SolverError('not_configured', { detail: 'OpenAI API key is missing. Set OPENAI_API_KEY in Vercel.' });
  }

  const url = `${config.openaiBaseUrl().replace(/\/+$/, '')}/chat/completions`;

  const payload: Record<string, unknown> = {
    model: LUNA_MODEL,
    messages,
    response_format: { type: 'json_object' },
    reasoning_effort: 'medium',
    max_completion_tokens: 16384,
    stream: false,
  };

  const response = await callGpt6Luna(url, apiKey, payload, signal);

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
