import 'server-only';
import { ApiError, FinishReason, GoogleGenAI, ThinkingLevel, type Content, type GenerateContentConfig } from '@google/genai';
import { z } from 'zod';
import type { Lang } from '@/lib/i18n';
import { SolverError } from '../errors';
import { ModelSolution } from '../schema';
import { config } from './config';
import { systemInstruction } from './prompt';

const REQUEST_TIMEOUT_MS = 100_000;
const MAX_OUTPUT_TOKENS = 24_576;

const responseSchema = (() => {
  const { $schema: _ignored, ...schema } = z.toJSONSchema(ModelSolution) as Record<string, unknown>;
  return schema;
})();

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  const apiKey = config.geminiApiKey();
  if (!apiKey) throw new SolverError('not_configured');
  client ??= new GoogleGenAI({
    apiKey,
    httpOptions: { timeout: REQUEST_TIMEOUT_MS, retryOptions: { attempts: 2 } },
  });
  return client;
}

function generationConfig(lang: Lang, signal: AbortSignal): GenerateContentConfig {
  return {
    systemInstruction: systemInstruction(lang),
    responseMimeType: 'application/json',
    responseJsonSchema: responseSchema,
    thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    abortSignal: signal,
  };
}

const BLOCKED = new Set<FinishReason>([
  FinishReason.SAFETY,
  FinishReason.BLOCKLIST,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.SPII,
  FinishReason.IMAGE_SAFETY,
  FinishReason.IMAGE_PROHIBITED_CONTENT,
  FinishReason.RECITATION,
]);

function checkFinish(reason: FinishReason | undefined, blockedPrompt: boolean) {
  if (blockedPrompt || (reason && BLOCKED.has(reason))) throw new SolverError('model_blocked');
  if (reason === FinishReason.MAX_TOKENS) throw new SolverError('model_output');
}

function translateError(error: unknown, signal: AbortSignal): SolverError {
  if (error instanceof SolverError) return error;
  if (signal.aborted) return new SolverError('model_timeout', { cause: error });
  if (error instanceof ApiError) {
    if (error.status === 429 || error.status >= 500) return new SolverError('model_busy', { cause: error });
    if (error.status === 401 || error.status === 403) return new SolverError('not_configured', { cause: error });
    return new SolverError('internal', { cause: error });
  }
  if (error instanceof Error && error.name === 'AbortError') return new SolverError('model_timeout', { cause: error });
  return new SolverError('model_busy', { cause: error });
}

/** Streams the raw JSON text of a solution, chunk by chunk. */
export async function* streamSolution(contents: Content[], lang: Lang, signal: AbortSignal): AsyncGenerator<string> {
  const ai = getClient();
  try {
    const stream = await ai.models.generateContentStream({
      model: config.geminiModel(),
      contents,
      config: generationConfig(lang, signal),
    });
    let finish: FinishReason | undefined;
    let blockedPrompt = false;
    for await (const chunk of stream) {
      if (chunk.promptFeedback?.blockReason) blockedPrompt = true;
      finish = chunk.candidates?.[0]?.finishReason ?? finish;
      const text = chunk.text;
      if (text) yield text;
    }
    checkFinish(finish, blockedPrompt);
  } catch (error) {
    throw translateError(error, signal);
  }
}

/** One complete, non-streamed solution (used for the corrective second attempt). */
export async function generateSolution(contents: Content[], lang: Lang, signal: AbortSignal): Promise<string> {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: config.geminiModel(),
      contents,
      config: generationConfig(lang, signal),
    });
    checkFinish(response.candidates?.[0]?.finishReason, Boolean(response.promptFeedback?.blockReason));
    const text = response.text;
    if (!text) throw new SolverError('model_output');
    return text;
  } catch (error) {
    throw translateError(error, signal);
  }
}
