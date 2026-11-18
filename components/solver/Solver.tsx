'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { soundController } from '@/lib/cosmos/audio';
import { takeStashedPhoto } from '@/lib/solver/client/handoff';
import { getHistory, saveToHistory } from '@/lib/solver/client/history';
import { preparePhoto, releasePhoto, type Photo } from '@/lib/solver/client/photo';
import { SolverError } from '@/lib/solver/errors';
import { LIMITS } from '@/lib/solver/limits';
import type { Solution } from '@/lib/solver/schema';
import { Composer } from './Composer';
import { ErrorNotice } from './ErrorNotice';
import { HistoryDrawer } from './HistoryDrawer';
import { Progress } from './Progress';
import { SolutionView } from './SolutionView';
import { SolverHeader } from './SolverHeader';
import { useSolver } from './useSolver';

export function Solver() {
  const { t, lang, ready } = useLanguage();
  const copy = t.solver;
  const params = useSearchParams();
  const { phase, solve, cancel, fail, restore } = useSolver();

  const [problem, setProblem] = useState(() => (params.get('q') ?? '').slice(0, LIMITS.problemChars));
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  const photoRef = useRef<Photo | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const handoff = useRef<{ query: string; photo: { blob: Blob; name: string } | null } | null>(null);

  const replacePhoto = useCallback((next: Photo | null) => {
    releasePhoto(photoRef.current);
    photoRef.current = next;
    setPhoto(next);
  }, []);

  useEffect(() => {
    soundController.stopAll();
  }, []);

  useEffect(() => () => releasePhoto(photoRef.current), []);

  // Sync history item count
  useEffect(() => {
    const updateCount = () => setHistoryCount(getHistory().length);
    updateCount();
    window.addEventListener('physicsmn:history', updateCount);
    return () => window.removeEventListener('physicsmn:history', updateCount);
  }, []);

  // Automatically record verified solutions to client-side history vault
  useEffect(() => {
    if (phase.kind === 'solved') {
      saveToHistory(phase.solution, problem);
    }
  }, [phase, problem]);

  const attach = useCallback(
    async (file: Blob, name: string) => {
      setPreparing(true);
      try {
        const prepared = await preparePhoto(file, name);
        replacePhoto(prepared);
        return prepared;
      } catch (error) {
        const failure = error instanceof SolverError ? error : new SolverError('image_type', { cause: error });
        fail(failure.toPayload());
        return null;
      } finally {
        setPreparing(false);
      }
    },
    [fail, replacePhoto],
  );

  const submit = useCallback(
    (text: string, image: Photo | null) => {
      void solve({ problem: text.trim(), lang, photo: image?.blob });
      window.requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    },
    [lang, solve],
  );

  const handleRestoreHistory = useCallback(
    (solution: Solution) => {
      restore(solution);
      setHistoryOpen(false);
      window.requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    },
    [restore],
  );

  // Arriving from the landing page with a problem (and possibly a photo) starts solving at once,
  // after the saved language is known so the solution comes back in the reader's language.
  useEffect(() => {
    if (!ready) return;
    handoff.current ??= {
      query: params.get('q')?.trim() ?? '',
      photo: params.get('photo') === '1' ? takeStashedPhoto() : null,
    };
    const { query, photo: stashed } = handoff.current;
    if (!query && !stashed) return;
    window.history.replaceState(null, '', '/solve');

    let active = true;
    void (async () => {
      const prepared = stashed ? await attach(stashed.blob, stashed.name) : null;
      if (active && (!stashed || prepared)) submit(query, prepared);
    })();
    return () => {
      active = false;
      cancel();
    };
    // Runs once the language is known; the hand-off lives in a ref so a remount can resume it.
  }, [ready]);

  const busy = phase.kind === 'solving';

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(229,193,88,0.09),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(245,245,247,0.07)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]" />
      </div>

      <SolverHeader historyCount={historyCount} onOpenHistory={() => setHistoryOpen(true)} />

      <main className="mx-auto max-w-4xl px-5 pb-28 pt-14 sm:px-8 sm:pt-20">
        <section className="mx-auto max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#E5C158]/85">{copy.kicker}</p>
          <h1 className="mt-5 font-display text-[clamp(2.1rem,5vw,3.4rem)] font-light leading-[1.05] tracking-[-0.04em] text-[#F5F5F7]">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[#A1A1AA]">{copy.subtitle}</p>

          <div className="mt-10">
            <Composer
              problem={problem}
              onProblemChange={setProblem}
              photo={photo}
              preparingPhoto={preparing}
              onPhoto={(file) => void attach(file, file.name || 'photo.jpg')}
              onRemovePhoto={() => replacePhoto(null)}
              onSubmit={() => submit(problem, photo)}
              busy={busy}
            />
          </div>

          {phase.kind === 'idle' && (
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#52525B]">{copy.examplesLabel}</span>
              {copy.examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => setProblem(example.problem)}
                  className="text-[13px] text-[#A1A1AA] underline decoration-white/15 underline-offset-[6px] transition-colors hover:text-[#F5F5F7] hover:decoration-[#E5C158]/60"
                >
                  {example.label}
                </button>
              ))}
            </div>
          )}
        </section>

        <div ref={resultRef} className="mt-14 scroll-mt-24">
          {phase.kind === 'solving' && (
            <div className="mx-auto max-w-3xl">
              <Progress stage={phase.stage} startedAt={phase.startedAt} onCancel={cancel} />
            </div>
          )}
          {phase.kind === 'failed' && (
            <div className="mx-auto max-w-3xl">
              <ErrorNotice error={phase.error} onRetry={() => submit(problem, photo)} />
            </div>
          )}
          {phase.kind === 'solved' && <SolutionView solution={phase.solution} />}
        </div>
      </main>

      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleRestoreHistory}
      />
    </div>
  );
}
