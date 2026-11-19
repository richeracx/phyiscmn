'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { soundController } from '@/lib/cosmos/audio';
import { useOdyssey } from './ScrollProvider';

export function HUD() {
  const { t } = useLanguage();
  const { activeAct: active, jumpTo } = useOdyssey();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 sm:px-10">
      <button
        type="button"
        onClick={() => jumpTo(0)}
        className="flex items-center text-white transition-opacity hover:opacity-80"
        aria-label="Physicsmn — ana sayfaya dön"
      >
        <span className="font-display text-[15px] font-semibold tracking-[0.14em] text-white">
          PHYSICSMN
        </span>
      </button>

      <div className="flex items-center gap-6 lg:gap-10">
        <nav aria-label="Bölümler" className="hidden items-center gap-6 lg:flex xl:gap-8 font-sans">
          {t.chapters.map(([num, name], i) => {
            const on = i === active;
            return (
              <button
                key={num}
                type="button"
                onMouseEnter={() => soundController.playButtonHover()}
                onClick={() => {
                  soundController.playButtonClick();
                  jumpTo(i);
                }}
                aria-current={on ? 'step' : undefined}
                className={`group relative text-[13px] font-medium tracking-[0.04em] transition-colors duration-300 ${
                  on ? 'text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                <span className={on ? 'text-white font-semibold' : 'text-zinc-500'}>{num}</span>
                <span className="ml-1.5">{name}</span>
                <span
                  className={`absolute -bottom-1.5 left-0 h-[2px] bg-white transition-all duration-300 ${
                    on ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'
                  }`}
                />
              </button>
            );
          })}
          <div className="h-4 w-px bg-white/10" />
          <Link
            href="/why"
            onMouseEnter={() => soundController.playButtonHover()}
            onClick={() => soundController.playButtonClick()}
            className="text-[13px] font-medium tracking-[0.02em] text-zinc-400 transition-colors duration-300 hover:text-white"
          >
            Neden Physicsmn?
          </Link>
          <Link
            href="/docs"
            onMouseEnter={() => soundController.playButtonHover()}
            onClick={() => soundController.playButtonClick()}
            className="text-[13px] font-medium tracking-[0.02em] text-zinc-400 transition-colors duration-300 hover:text-white"
          >
            Belgeler & Kıyaslama
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/solve"
            onMouseEnter={() => soundController.playButtonHover()}
            onClick={() => soundController.playButtonClick()}
            className="rounded-full bg-white px-5 py-2 font-sans text-[13px] font-medium text-black transition-all duration-300 hover:bg-neutral-200 active:scale-[0.98]"
          >
            {t.openSolver}
          </Link>
        </div>
      </div>
    </header>
  );
}
