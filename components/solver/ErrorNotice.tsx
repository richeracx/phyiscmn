'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import type { SolverErrorCode, SolverErrorPayload } from '@/lib/solver/errors';

/** Errors the student fixes by changing the input, so retrying the same request is pointless. */
const INPUT_ERRORS = new Set<SolverErrorCode>([
  'empty_input',
  'text_too_long',
  'image_too_large',
  'image_type',
  'request_too_large',
  'not_physics',
  'unreadable',
  'insufficient_data',
  'model_blocked',
]);

function useCountdown(seconds: number | undefined) {
  const [left, setLeft] = useState(seconds ?? 0);
  useEffect(() => {
    setLeft(seconds ?? 0);
    if (!seconds) return;
    const id = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [seconds]);
  return left;
}

export function ErrorNotice({ error, onRetry }: { error: SolverErrorPayload; onRetry: () => void }) {
  const { t } = useLanguage();
  const copy = t.solver;
  const message = copy.errors[error.code];
  const wait = useCountdown(error.retryAfter);
  const retryable = !INPUT_ERRORS.has(error.code);

  return (
    <section role="alert" className="rounded-2xl border border-[#E5C158]/25 bg-[#E5C158]/[0.04] p-6 sm:p-7">
      <div className="flex gap-4">
        <AlertTriangle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#E5C158]" />
        <div className="min-w-0 flex-1">
          <h2 className="text-[15.5px] font-medium text-[#F5F5F7]">{message.title}</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#A1A1AA]">{message.body}</p>
          {error.detail && (
            <p className="mt-4 border-l border-white/15 pl-4 text-[14px] leading-relaxed text-[#D4D4D8]">{error.detail}</p>
          )}
          <div className="mt-5 flex items-center gap-4">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#5B5B63]">{error.code}</span>
            {retryable && (
              <button
                type="button"
                onClick={onRetry}
                disabled={wait > 0}
                className="rounded-full border border-white/[0.15] px-4 py-1.5 text-[12.5px] text-[#F5F5F7] transition-colors hover:border-white/40 disabled:pointer-events-none disabled:opacity-40"
              >
                {wait > 0 ? copy.retryIn(wait) : copy.retry}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
