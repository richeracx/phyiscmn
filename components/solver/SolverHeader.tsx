'use client';

import Link from 'next/link';
import { History as HistoryIcon } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { SolvingLockGuard } from '@/lib/solver/client/solvingLock';

interface SolverHeaderProps {
  historyCount?: number;
  onOpenHistory?: () => void;
}

export function SolverHeader({ historyCount = 0, onOpenHistory }: SolverHeaderProps) {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center text-[#F5F5F7]" aria-label={t.solver.back}>
          <span className="font-display text-[14px] font-semibold tracking-[0.16em]">
            PHYSICSMN
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 font-sans">
          <Link
            href="/why"
            className="hidden text-[12.5px] font-medium tracking-wide text-[#A1A1AA] transition-colors hover:text-[#F5F5F7] md:inline"
          >
            Neden Physicsmn?
          </Link>
          <Link
            href="/docs"
            className="hidden text-[12.5px] font-medium tracking-wide text-[#A1A1AA] transition-colors hover:text-[#F5F5F7] md:inline"
          >
            Belgeler & Kıyaslama
          </Link>
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium text-[#A1A1AA] transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:text-[#F5F5F7]"
              title={t.solver.history.title}
            >
              <HistoryIcon size={13} className="text-[#E5C158]" />
              <span>{t.solver.history.button}</span>
              {historyCount > 0 && (
                <span className="ml-0.5 rounded-full bg-[#E5C158]/20 px-1.5 py-0.2 text-[10px] font-medium text-[#E5C158]">
                  {historyCount}
                </span>
              )}
            </button>
          )}
          <Link
            href="/"
            className="hidden text-[12px] text-[#71717A] transition-colors hover:text-[#F5F5F7] sm:inline"
          >
            ← {t.solver.back}
          </Link>
        </div>
      </div>
      <SolvingLockGuard />
    </header>
  );
}
