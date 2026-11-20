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
 * Act III Finale overlay — two sequenced layers:
 *
 * PHASE 1 (canvas, settle 0→0.55): particles brighten & assemble.
 * PHASE 2 (canvas, settle 0.55→0.82): particles dissolve away — empty stage.
 * PHASE 3 (HTML, finale 0.90→1.0): crisp wordmark + CTA fade in on clean slate.
 *
 * The two phases never overlap, so the swap always looks like a clean cut-through-light.
 */
export function ActExplosionFinale() {
  const { activeAct } = useOdyssey();

  // CTA panel: starts at finale=0.86
  const rawCtaOpacity = useMotionValue(0);
  // Wordmark: delayed — starts only at finale=0.91, after particles are fully gone
  const rawWordOpacity = useMotionValue(0);

  useAnimationFrame(() => {
    const isActive = activeAct === 2;
    const ctaTarget = isActive ? smoothstep(0.86, 0.96, telemetry.finale) : 0;
    const wordTarget = isActive ? smoothstep(0.91, 1.0, telemetry.finale) : 0;
    if (Math.abs(ctaTarget - rawCtaOpacity.get()) > 0.001) rawCtaOpacity.set(ctaTarget);
    if (Math.abs(wordTarget - rawWordOpacity.get()) > 0.001) rawWordOpacity.set(wordTarget);
  });

  // CTA panel: gentle rise with upward translate
  const ctaOpacity = useSpring(rawCtaOpacity, { stiffness: 55, damping: 22 });
  const ctaY = useTransform(ctaOpacity, [0, 1], [40, 0]);
  const ctaPointer = useTransform(rawCtaOpacity, (v) => (v > 0.5 ? 'auto' : 'none'));
  const ctaVisibility = useTransform(rawCtaOpacity, (v) => (v < 0.01 ? 'hidden' : 'visible'));

  // Wordmark: very stiff spring for a snappy, confident reveal — no scale transform
  const wordOpacity = useSpring(rawWordOpacity, { stiffness: 80, damping: 18 });
  const wordVisibility = useTransform(rawWordOpacity, (v) => (v < 0.01 ? 'hidden' : 'visible'));

  const tagline = 'MEB müfredatına uygun · adım adım garantili';
  const letters = tagline.split('');

  return (
    // Wrapper — no opacity here; each child drives its own
    <div className="absolute inset-0 z-20 pointer-events-none">

      {/* ── WORDMARK ───────────────────────────────────────────────────────────
          Fades in after particles dissolve (finale ≥ 0.91).
          Three blur layers give cinematic luminous depth without motion blur. */}
      <motion.div
        style={{ opacity: wordOpacity, visibility: wordVisibility }}
        className="absolute top-[18%] sm:top-[20%] inset-x-0 flex items-center justify-center px-4 pointer-events-none select-none"
      >
        {/* Layer 1 — wide soft corona */}
        <span
          aria-hidden
          className="absolute font-display font-black tracking-[0.08em] uppercase
            text-[clamp(2.6rem,10vw,7.5rem)] text-white/12 blur-3xl"
        >
          PHYSICSMN
        </span>
        {/* Layer 2 — medium bloom */}
        <span
          aria-hidden
          className="absolute font-display font-black tracking-[0.08em] uppercase
            text-[clamp(2.6rem,10vw,7.5rem)] text-white/22 blur-lg"
        >
          PHYSICSMN
        </span>
        {/* Layer 3 — crisp foreground with glow */}
        <h1
          className="relative font-display font-black tracking-[0.08em] uppercase
            text-[clamp(2.6rem,10vw,7.5rem)] text-white
            drop-shadow-[0_0_32px_rgba(255,255,255,0.8)]
            [text-shadow:0_0_80px_rgba(255,255,255,0.5),0_0_160px_rgba(255,255,255,0.18)]"
        >
          PHYSICSMN
        </h1>
      </motion.div>

      {/* ── CTA PANEL ──────────────────────────────────────────────────────────
          Bottom-anchored — rises up and fades in independently. */}
      <motion.div
        style={{ opacity: ctaOpacity, y: ctaY, visibility: ctaVisibility, pointerEvents: ctaPointer }}
        className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-8 sm:pb-12 px-5 text-center"
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

        {/* Stats — Kıyaslama Sorusu removed per user request */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7 sm:mb-8 flex items-center gap-8 sm:gap-14"
        >
          {[
            { value: '94.7%', label: 'MEB Başarısı' },
            { value: '9–12', label: 'Sınıf Kapsamı' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="font-display text-[20px] sm:text-[24px] font-semibold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]">
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
          initial={{ opacity: 0, scale: 0.92 }}
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
            <ArrowRight size={16} strokeWidth={2.5} className="relative transition-transform duration-300 group-hover:translate-x-1" />
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
    </div>
  );
}
