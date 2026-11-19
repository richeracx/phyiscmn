'use client';

import { motion, useTransform } from 'framer-motion';
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
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
    >
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.1, ease }}
        className="mb-6 font-sans text-[12px] font-medium uppercase tracking-[0.3em] text-white/50"
      >
        PHYSICSMN // {t.hero.eyebrow}
      </motion.p>
      <motion.h1
        id="hero-title"
        key={t.hero.title}
        initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.5, delay: 1.3, ease }}
        className="max-w-[16ch] font-display text-[clamp(3.2rem,8vw,7.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-white"
      >
        {t.hero.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.5, ease }}
        className="mt-6 max-w-md font-sans text-[16px] font-light leading-relaxed text-[#A1A1AA] sm:text-[18px]"
      >
        {t.hero.subtitle}
      </motion.p>

      {/* Minimalist Scroll Indicator (solving bar removed) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 2.0 }}
        className="pointer-events-none absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 font-sans text-[11px] uppercase tracking-[0.25em] text-white/40"
      >
        <span>{t.hero.hintScroll}</span>
        <motion.span
          className="block h-7 w-px bg-gradient-to-b from-white/40 to-transparent"
          animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originY: 0 }}
        />
      </motion.div>
    </motion.section>
  );
}
