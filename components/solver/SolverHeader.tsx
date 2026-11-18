'use client';

import Link from 'next/link';
import { LanguageSwitch } from '@/components/shared/LanguageSwitch';
import { useLanguage } from '@/components/shared/LanguageProvider';

export function SolverHeader() {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center text-[#F5F5F7]" aria-label={t.solver.back}>
          <span lang="en" className="font-display text-[14px] font-semibold tracking-[0.16em]">
            PHYSICSMN
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hidden font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#71717A] transition-colors hover:text-[#F5F5F7] sm:inline"
          >
            ← {t.solver.back}
          </Link>
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
