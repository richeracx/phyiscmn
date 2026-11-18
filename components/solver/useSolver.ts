'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { requestSolution, type SolveRequest } from '@/lib/solver/client/api';
import { SolverError, type SolverErrorPayload } from '@/lib/solver/errors';
import type { Solution, Stage } from '@/lib/solver/schema';

export type SolverPhase =
  | { kind: 'idle' }
  | { kind: 'solving'; stage: Stage; startedAt: number }
  | { kind: 'solved'; solution: Solution }
  | { kind: 'failed'; error: SolverErrorPayload };

export function useSolver() {
  const [phase, setPhase] = useState<SolverPhase>({ kind: 'idle' });
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const solve = useCallback(async (request: SolveRequest) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setPhase({ kind: 'solving', stage: 'read', startedAt: Date.now() });
    try {
      const solution = await requestSolution(request, {
        signal: current.signal,
        onStage: (stage) =>
          setPhase((previous) => (previous.kind === 'solving' ? { ...previous, stage } : previous)),
      });
      if (!current.signal.aborted) setPhase({ kind: 'solved', solution });
    } catch (error) {
      if (current.signal.aborted) return;
      const failure = error instanceof SolverError ? error : new SolverError('internal', { cause: error });
      setPhase({ kind: 'failed', error: failure.toPayload() });
    }
  }, []);

  const cancel = useCallback(() => {
    controller.current?.abort();
    setPhase({ kind: 'idle' });
  }, []);

  const fail = useCallback((error: SolverErrorPayload) => setPhase({ kind: 'failed', error }), []);

  const restore = useCallback((solution: Solution) => {
    controller.current?.abort();
    setPhase({ kind: 'solved', solution });
  }, []);

  return { phase, solve, cancel, fail, restore };
}
