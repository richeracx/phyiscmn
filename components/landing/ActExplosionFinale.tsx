'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { telemetry } from '@/lib/cosmos/engine';
import { smoothstep } from '@/lib/cosmos/math';
import { soundController } from '@/lib/cosmos/audio';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { useOdyssey } from './ScrollProvider';

/**
 * Act III Finale overlay:
 * Appears ONLY after the cosmic bomb explosion has fully detonated,
 * coalesced into the particle wordmark PHYSICSMN, and lit up.
 *
 * Positioned in the lower half of the screen with a smooth upward pull
 * so it NEVER collides with the particle wordmark PHYSICSMN.
 * Features a frosted glass pill button saying "START SOLVING".
 */
export function ActExplosionFinale() {
  const { lang } = useLanguage();
  const { activeAct } = useOdyssey();
  const opacity = useMotionValue(0);

  useAnimationFrame(() => {
    // Reveal strictly AFTER the bomb has exploded and PHYSICSMN has settled and lit up (telemetry.finale > 0.86)
    const target = activeAct === 2 ? smoothstep(0.86, 0.96, telemetry.finale) : 0;
    if (Math.abs(target - opacity.get()) > 0.001) {
      opacity.set(target);
    }
  });

  const y = useTransform(opacity, [0, 1], [40, 0]);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? 'auto' : 'none'));
  const visibility = useTransform(opacity, (v) => (v < 0.01 ? 'hidden' : 'visible'));
  const tr = lang === 'tr';

  return (
    <motion.section
      style={{ opacity, y, pointerEvents, visibility }}
      className="absolute inset-x-0 bottom-8 top-[38%] z-20 flex flex-col items-center justify-start px-6 text-center md:top-[36%]"
    >
      <div className="flex max-w-2xl flex-col items-center">
        <span className="mb-3 inline-flex items-center gap-2 font-sans text-[12px] font-medium uppercase tracking-[0.25em] text-white/50">
          <Sparkles size={13} className="text-white/70" />
          <span>{tr ? '03 // ADIM ADIM ÇÖZÜM' : '03 // STEP-BY-STEP DERIVATION'}</span>
        </span>

        <p className="mt-2 max-w-xl font-sans text-[16px] font-extralight leading-[1.6] text-[#bdbdbd] md:text-[18px]">
          {tr
            ? 'Newton mekaniğinden dalgalara ve optiğe kadar. LaTeX formatında, adım adım MEB lise fizik çözümleri.'
            : 'From Newtonian mechanics to waves and optics. Step-by-step high school physics derivations formatted in LaTeX.'}
        </p>

        {/* Translucent Frosted Glass Pill Button saying "START SOLVING" */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/solve"
            onMouseEnter={() => soundController.playButtonHover()}
            onClick={() => soundController.playButtonClick()}
            className="group relative inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/[0.08] px-9 py-4 text-[14px] font-medium tracking-[0.08em] text-white shadow-[0_0_30px_rgba(255,255,255,0.06),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-white/40 hover:bg-white/[0.16] hover:shadow-[0_0_40px_rgba(255,255,255,0.18)] active:scale-[0.98]"
          >
            <span>START SOLVING</span>
            <ArrowRight size={17} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/solve?q=35+deg+incline"
            className="px-6 py-4 font-sans text-[13.5px] text-white/60 transition-colors duration-300 hover:text-white"
          >
            {tr ? 'Örnek Türetimleri İncele →' : 'Explore Sample Derivations →'}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
