import { SolverError } from '@/lib/solver/errors';
import type { SolverEvent } from '@/lib/solver/schema';
import { config } from '@/lib/solver/server/config';
import { rateLimit } from '@/lib/solver/server/rate-limit';
import { assertSameOrigin, clientAddress, readSolveInput, type SolveInput } from '@/lib/solver/server/request';
import { solve } from '@/lib/solver/server/solve';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const SOLVE_BUDGET_MS = 110_000;

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
} as const;

function errorResponse(error: SolverError) {
  const headers: Record<string, string> = { ...NO_STORE };
  if (error.options.retryAfter) headers['Retry-After'] = String(error.options.retryAfter);
  return Response.json(error.toPayload(), { status: error.status, headers });
}

function logFailure(stage: string, error: unknown) {
  if (error instanceof SolverError) {
    const detail = error.options.detail ? ` - ${error.options.detail}` : '';
    console.error(`[solver] ${stage} failed: ${error.code}${detail}`, error.options.cause ?? '');
  } else {
    console.error(`[solver] ${stage} failed: internal`, error);
  }
}

export async function POST(request: Request) {
  let input: SolveInput;
  let remaining = 20;
  let resetAfter = 86_400;

  try {
    assertSameOrigin(request);
    const limit = await rateLimit(clientAddress(request));
    if (!limit.ok) {
      const detail =
        limit.window === 'day'
          ? 'Daily limit reached (20 derivations per day). Please return tomorrow.'
          : `Too many requests. Please wait ${limit.retryAfter} seconds.`;
      throw new SolverError('rate_limited', { retryAfter: limit.retryAfter, detail });
    }
    remaining = limit.remaining;
    resetAfter = limit.resetAfter;

    input = await readSolveInput(request);
    if (!config.hasApiKey()) throw new SolverError('not_configured');
  } catch (error) {
    if (error instanceof SolverError) return errorResponse(error);
    logFailure('request', error);
    return errorResponse(new SolverError('internal'));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SOLVE_BUDGET_MS);
  request.signal.addEventListener('abort', () => controller.abort(), { once: true });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(stream) {
      const send = (event: SolverEvent) => stream.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        for await (const event of solve(input, controller.signal)) send(event);
      } catch (error) {
        const failure = error instanceof SolverError ? error : new SolverError('internal', { cause: error });
        if (failure.status >= 500) logFailure('solve', failure);
        send({ type: 'error', ...failure.toPayload() });
      } finally {
        clearTimeout(timer);
        stream.close();
      }
    },
    cancel() {
      clearTimeout(timer);
      controller.abort();
    },
  });

  return new Response(body, {
    headers: {
      ...NO_STORE,
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-RateLimit-Limit': '20',
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(resetAfter),
    },
  });
}
