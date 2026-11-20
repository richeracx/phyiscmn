'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { telemetry } from '@/lib/cosmos/engine';
import { smoothstep } from '@/lib/cosmos/math';
import { soundController } from '@/lib/cosmos/audio';
import { useOdyssey } from './ScrollProvider';

/**
 * Act III Finale overlay.
 *
 * Two independent layers:
 *
 * 1. WORDMARK (top ~26% of screen, `absolute top-[22%]`):
 *    Large crisp HTML "PHYSICSMN" that fades in as the canvas particles dissolve.
 *    Layered CSS glow (blur-sm + drop-shadow stack) for the cinematic look.
 *
 * 2. CTA PANEL (bottom, `justify-end`):
 *    Tagline → stats → solid-white CTA → ghost links
 *
 * Both are gated behind telemetry.finale > 0.86 so the canvas explosion always
 * takes visual precedence.
 */
export function ActExplosionFinale() {
  const { activeAct } = useOdyssey();
  const rawOpacity = useMotionValue(0);

  useAnimationFrame(() => {
    const target = activeAct === 2 ? smoothstep(0.86, 0.96, telemetry.finale) : 0;
    if (Math.abs(target - rawOpacity.get()) > 0.001) rawOpacity.set(target);
  });

  const opacity = useSpring(rawOpacity, { stiffness: 60, damping: 20 });
  const y = useTransform(opacity, [0, 1], [52, 0]);
  const pointerEvents = useTransform(rawOpacity, (v) => (v > 0.5 ? 'auto' : 'none'));
  const visibility = useTransform(rawOpacity, (v) => (v < 0.01 ? 'hidden' : 'visible'));

  // Wordmark: starts fading in slightly ahead of the CTA panel
  const wordmarkScale = useTransform(opacity, [0, 1], [0.88, 1]);

  const tagline = 'MEB müfredatına uygun · adım adım garantili';
  const letters = tagline.split('');

  return (
    <motion.section
      style={{ opacity, pointerEvents, visibility }}
      className="absolute inset-0 z-20 flex flex-col items-center"
    >
      {/* ── WORDMARK ─────────────────────────────────────────────────────────────
          Positioned in the same upper-third band as the canvas word so it
          materialises exactly on top of the dissolving particles.
          Three stacked filter layers create the cinematic luminous glow. */}
      <motion.div
        style={{ scale: wordmarkScale }}
        className="absolute top-[18%] sm:top-[20%] inset-x-0 flex items-center justify-center px-4"
      >
        {/* Outermost: wide, very soft halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className="
              font-display font-black tracking-[0.08em] uppercase select-none
              text-[clamp(2.6rem,10vw,7.5rem)]
              text-white/10
              blur-2xl
            "
          >
            PHYSICSMN
          </span>
        </div>
        {/* Middle: medium bloom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className="
              font-display font-black tracking-[0.08em] uppercase select-none
              text-[clamp(2.6rem,10vw,7.5rem)]
              text-white/20
              blur-md
            "
          >
            PHYSICSMN
          </span>
        </div>
        {/* Foreground: sharp white letterforms with drop-shadow glow */}
        <h1
          className="
            relative font-display font-black tracking-[0.08em] uppercase
            text-[clamp(2.6rem,10vw,7.5rem)]
            text-white
            drop-shadow-[0_0_28px_rgba(255,255,255,0.75)]
            [text-shadow:0_0_60px_rgba(255,255,255,0.45),0_0_120px_rgba(255,255,255,0.2)]
            select-none
          "
        >
          PHYSICSMN
        </h1>
      </motion.div>

      {/* ── CTA PANEL ────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ y }}
        className="mt-auto w-full flex flex-col items-center pb-8 sm:pb-12 px-5 text-center"
      >
        {/* Tagline */}
        <div aria-label={tagline} className="mb-6 sm:mb-7 overflow-hidden">
          <p className="font-sans text-[11.5px] sm:text-[13px] font-medium uppercase tracking-[0.28em] text-white/40 leading-none">
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
                style={{ whiteSpace: ch === ' ' ? 'pre' : 'normal' }}
              >
                {ch}
              </motion.span>
            ))}
          </p>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 sm:mb-8 flex items-center gap-6 sm:gap-10"
        >
          {[
            { value: '94.7%', label: 'MEB Başarısı' },
            { value: 'N=57', label: 'Kıyaslama Sorusu' },
            { value: '9–12', label: 'Sınıf Kapsamı' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="font-display text-[18px] sm:text-[22px] font-semibold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                {value}
              </span>
              <span className="font-sans text-[9.5px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <Link
            href="/solve"
            onMouseEnter={() => soundController.playButtonHover()}
            onClick={() => soundController.playButtonClick()}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-3.5 sm:px-11 sm:py-4 font-sans text-[13.5px] sm:text-[14.5px] font-semibold tracking-[0.06em] text-black shadow-[0_0_40px_rgba(255,255,255,0.22),0_0_80px_rgba(255,255,255,0.08)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(255,255,255,0.35),0_0_120px_rgba(255,255,255,0.14)] active:scale-[0.98]"
          >
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              aria-hidden
            />
            <span className="relative">ÇÖZÜME BAŞLA</span>
            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="relative transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          {/* Ghost links */}
          <div className="flex items-center gap-4 sm:gap-5 font-sans text-[11px] sm:text-[12px] tracking-wide text-white/25">
            <Link href="/why" className="transition-colors duration-200 hover:text-white/70">
              Neden Physicsmn?
            </Link>
            <span className="text-white/15">·</span>
            <Link href="/docs" className="transition-colors duration-200 hover:text-white/70">
              Belgeler & Kıyaslama
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
