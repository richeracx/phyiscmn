import type { Lang } from '@/lib/i18n';
import { SolverError, isSolverErrorCode, type SolverErrorPayload } from '../errors';
import type { Solution, SolverEvent, Stage } from '../schema';

export interface SolveRequest {
  problem: string;
  lang: Lang;
  photo?: Blob;
}

function toError(payload: Partial<SolverErrorPayload> | null): SolverError {
  const code = isSolverErrorCode(payload?.code) ? payload.code : 'internal';
  const detail = typeof payload?.detail === 'string' ? payload.detail : undefined;
  const retryAfter = typeof payload?.retryAfter === 'number' ? payload.retryAfter : undefined;
  return new SolverError(code, { detail, retryAfter });
}

async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<SolverEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newline = buffer.indexOf('\n');
    while (newline >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) yield JSON.parse(line) as SolverEvent;
      newline = buffer.indexOf('\n');
    }
  }
}

export async function requestSolution(
  request: SolveRequest,
  options: { signal: AbortSignal; onStage: (stage: Stage) => void },
): Promise<Solution> {
  const form = new FormData();
  form.set('problem', request.problem);
  form.set('lang', request.lang);
  if (request.photo) form.set('image', request.photo, 'problem.jpg');

  let response: Response;
  try {
    response = await fetch('/api/solve', { method: 'POST', body: form, signal: options.signal });
  } catch (error) {
    if (options.signal.aborted) throw error;
    throw new SolverError('network', { cause: error });
  }

  if (!response.ok || !response.body) {
    const payload = (await response.json().catch(() => null)) as Partial<SolverErrorPayload> | null;
    throw toError(payload);
  }

  try {
    for await (const event of readEvents(response.body)) {
      if (event.type === 'stage') options.onStage(event.stage);
      else if (event.type === 'result') return event.solution;
      else throw toError(event);
    }
  } catch (error) {
    if (error instanceof SolverError || options.signal.aborted) throw error;
    throw new SolverError('network', { cause: error });
  }
  throw new SolverError('network');
}
