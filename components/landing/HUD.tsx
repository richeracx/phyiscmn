'use client';

import Link from 'next/link';
import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageSwitch } from '@/components/shared/LanguageSwitch';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { soundController } from '@/lib/cosmos/audio';
import { useOdyssey } from './ScrollProvider';

export function HUD() {
  const { t } = useLanguage();
  const { activeAct: active, jumpTo } = useOdyssey();
  const [muted, setMuted] = useState(soundController.isMuted);

  useEffect(() => {
    return soundController.subscribe((m) => setMuted(m));
  }, []);

  const handleToggleSound = () => {
    soundController.toggleMute();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 sm:px-10">
      <button
        type="button"
        onClick={() => jumpTo(0)}
        className="flex items-center text-white transition-opacity hover:opacity-80"
        aria-label="Physicsmn — back to start"
      >
        <span lang="en" className="font-sans text-[15px] font-semibold tracking-[0.08em] text-white">
          PHYSICSMN
        </span>
      </button>

      <div className="flex items-center gap-6 lg:gap-10">
        <nav aria-label="Chapters" className="hidden items-center gap-6 lg:flex xl:gap-8">
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
                className={`group relative text-[13px] font-medium uppercase tracking-[0.04em] transition-colors duration-300 ${
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
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={muted ? 'Unmute sound & music' : 'Mute sound'}
            title={muted ? 'Enable sound effects & music' : 'Mute sound'}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12px] font-medium uppercase tracking-[0.05em] text-white/70 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.1] hover:text-white"
          >
            {muted ? (
              <>
                <VolumeX size={15} className="text-white/50" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 size={15} className="text-white" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            )}
          </button>

          <LanguageSwitch />
          <Link
            href="/solve"
            onMouseEnter={() => soundController.playButtonHover()}
            onClick={() => soundController.playButtonClick()}
            className="hidden rounded-full bg-white px-5 py-2 text-[13px] font-medium text-black transition-all duration-300 hover:bg-neutral-200 active:scale-[0.98] sm:inline-block"
          >
            {t.openSolver}
          </Link>
        </div>
      </div>
    </header>
  );
}
