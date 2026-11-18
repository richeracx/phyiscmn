'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { STAGES, type Stage } from '@/lib/solver/schema';

function useElapsedSeconds(since: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return Math.max(0, Math.floor((now - since) / 1000));
}

export function Progress({ stage, startedAt, onCancel }: { stage: Stage; startedAt: number; onCancel: () => void }) {
  const { t } = useLanguage();
  const copy = t.solver;
  const elapsed = useElapsedSeconds(startedAt);
  const current = STAGES.indexOf(stage);

  return (
    <section aria-live="polite" aria-busy className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
      <ol className="grid gap-6 sm:grid-cols-4 sm:gap-4">
        {STAGES.map((key, i) => {
          const state = i < current ? 'done' : i === current ? 'active' : 'pending';
          return (
            <li key={key} className="relative flex gap-3 sm:block">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[10.5px] transition-colors duration-500 ${
                  state === 'done'
                    ? 'border-[#E5C158]/50 bg-[#E5C158]/10 text-[#E5C158]'
                    : state === 'active'
                      ? 'border-[#E5C158] text-[#E5C158]'
                      : 'border-white/[0.12] text-[#5B5B63]'
                }`}
              >
                {state === 'done' ? <Check size={13} strokeWidth={2} /> : String(i + 1).padStart(2, '0')}
              </span>
              {state === 'active' && (
                <span className="absolute left-0 top-0 h-7 w-7 animate-ping rounded-full border border-[#E5C158]/40 motion-reduce:animate-none" />
              )}
              <div className="sm:mt-4">
                <p className={`text-[13.5px] ${state === 'pending' ? 'text-[#5B5B63]' : 'text-[#F5F5F7]'}`}>
                  {copy.stages[key].title}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-[#71717A]">{copy.stages[key].detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-5">
        <span className="font-mono text-[11px] tabular-nums tracking-[0.08em] text-[#71717A]">{copy.elapsed(elapsed)}</span>
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#71717A] transition-colors hover:text-[#F5F5F7]"
        >
          {copy.cancel}
        </button>
      </div>
    </section>
  );
}
