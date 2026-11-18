import 'server-only';
import { SolverError, type SolverErrorCode } from '../errors';
import { ModelSolution, type SolverEvent, type Stage } from '../schema';
import { config } from './config';
import { generateGptSolution, streamGptSolution } from './gpt';
import { correctionPrompt, systemInstruction, userPrompt } from './prompt';
import { compileSolution } from './render';
import type { SolveInput } from './request';

/** Top-level keys in schema order; their first appearance in the stream marks real progress. */
const STAGE_MARKERS: ReadonlyArray<{ key: string; stage: Stage }> = [
  { key: '"principles"', stage: 'laws' },
  { key: '"steps"', stage: 'derive' },
  { key: '"answers"', stage: 'verify' },
];

const UNSOLVED: Record<Exclude<ModelSolution['status'], 'solved'>, SolverErrorCode> = {
  not_physics: 'not_physics',
  unreadable: 'unreadable',
  insufficient_data: 'insufficient_data',
};

function parse(text: string): ModelSolution {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new SolverError('model_output', { cause: error });
  }
  const result = ModelSolution.safeParse(json);
  if (!result.success) throw new SolverError('model_output', { cause: result.error });
  const solution = result.data;
  if (solution.status !== 'solved') {
    throw new SolverError(UNSOLVED[solution.status], { detail: solution.reason.trim() || undefined });
  }
  if (solution.answers.length === 0 || solution.steps.length === 0) throw new SolverError('model_output');
  return solution;
}

/**
 * Solves physics problems strictly using GPT-6 Luna.
 */
export async function* solve(input: SolveInput, signal: AbortSignal): AsyncGenerator<SolverEvent> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) {
    throw new SolverError('not_configured', { detail: 'OpenAI API key is missing. Set OPENAI_API_KEY in Vercel.' });
  }

  yield { type: 'stage', stage: 'read' };

  let text = '';
  let marker = 0;

  for await (const chunk of streamGptSolution(input, signal)) {
    text += chunk;
    while (marker < STAGE_MARKERS.length && text.includes(STAGE_MARKERS[marker].key)) {
      yield { type: 'stage', stage: STAGE_MARKERS[marker].stage };
      marker += 1;
    }
  }
  while (marker < STAGE_MARKERS.length) {
    yield { type: 'stage', stage: STAGE_MARKERS[marker].stage };
    marker += 1;
  }

  const first = compileSolution(parse(text));
  if (first.ok) {
    yield { type: 'result', solution: first.solution };
    return;
  }

  // Auto-repair if mathematical verification fails on first pass
  const promptText = userPrompt(input.problem, Boolean(input.image), input.lang);
  const messages = [
    {
      role: 'system' as const,
      content: `${systemInstruction(input.lang)}\n\nIMPORTANT: You must return your entire output strictly as a valid JSON object matching the requested schema. No markdown formatting outside JSON.`,
    },
    {
      role: 'user' as const,
      content: input.image
        ? [
            { type: 'image_url' as const, image_url: { url: `data:${input.image.mimeType};base64,${input.image.data.toString('base64')}` } },
            { type: 'text' as const, text: promptText },
          ]
        : promptText,
    },
    { role: 'assistant' as const, content: text },
    { role: 'user' as const, content: correctionPrompt(first.failures, input.lang) },
  ];
  const second = compileSolution(parse(await generateGptSolution(messages, signal)));
  if (!second.ok) throw new SolverError('model_output');
  yield { type: 'result', solution: second.solution };
}
