'use client';

import { motion, useTransform } from 'framer-motion';
import { CommandBar } from './CommandBar';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { useOdyssey } from './ScrollProvider';
import { useActVisibility } from './useActVisibility';

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroAct() {
  const { t } = useLanguage();
  const { progress } = useOdyssey();
  const { opacity, pointerEvents, visibility } = useActVisibility(progress, 0);
  const y = useTransform(progress, [0, 0.16], [0, -90]);
  const scale = useTransform(progress, [0, 0.16], [1, 0.94]);
  const blur = useTransform(progress, [0.06, 0.15], ['blur(0px)', 'blur(6px)']);

  return (
    <motion.section
      aria-labelledby="hero-title"
      style={{ opacity, y, scale, filter: blur, pointerEvents, visibility }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.1, ease }}
        className="mb-7 font-sans text-[13px] font-medium uppercase tracking-[0.25em] text-white/60"
      >
        <span lang="en">PHYSICSMN</span> — {t.hero.eyebrow}
      </motion.p>
      <motion.h1
        id="hero-title"
        key={t.hero.title}
        initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.5, delay: 1.3, ease }}
        className="max-w-[16ch] font-sans text-[clamp(2.8rem,7.4vw,7.25rem)] font-normal leading-[0.96] tracking-[-0.04em] text-white"
      >
        {t.hero.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.5, ease }}
        className="mt-7 max-w-xl text-[18px] font-extralight leading-[1.5] text-[#bdbdbd]"
      >
        {t.hero.subtitle}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.75, ease }}
        className="mt-10 flex w-full justify-center"
      >
        <CommandBar />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 2.2 }}
        className="pointer-events-none absolute bottom-24 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 font-sans text-[12px] uppercase tracking-[0.2em] text-[#9a9a9a] sm:bottom-10"
      >
        <span>{t.hero.hintScroll}</span>
        <span className="hidden text-[#71717A] sm:block">{t.hero.hintClick}</span>
        <motion.span
          className="mt-1 block h-8 w-px bg-gradient-to-b from-white/60 to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
      </motion.div>
    </motion.section>
  );
}
