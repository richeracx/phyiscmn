'use client';

import { useEffect, useRef } from 'react';
import { telemetry } from '@/lib/cosmos/engine';
import { useLanguage } from '@/components/shared/LanguageProvider';

const NUMERALS = ['I', 'II', 'III'];
const sign = (v: number) => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(3);

/** Bottom-left live readout. Updated imperatively per frame — no React re-renders. */
export function Telemetry() {
  const { t } = useLanguage();
  const field = useRef<HTMLSpanElement>(null);
  const px = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const act = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (field.current) field.current.textContent = `x ${sign(telemetry.nmx)}  y ${sign(-telemetry.nmy)}`;
      if (px.current) px.current.textContent = `${Math.round(telemetry.mx)},${Math.round(telemetry.my)}px`;
      if (time.current) time.current.textContent = `${(telemetry.progress * 100).toFixed(1).padStart(5, '0')}%`;
      if (act.current) act.current.textContent = NUMERALS[telemetry.act] ?? 'I';
      if (bar.current) bar.current.style.transform = `scaleX(${telemetry.progress})`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-6 left-16 z-40 select-none font-mono text-[11px] leading-[1.7] text-[#71717A]"
    >
      <div className="flex gap-3">
        <span className="text-[#52525B]">{t.telemetry.field}</span>
        <span ref={field} className="tabular-nums" />
        <span ref={px} className="hidden tabular-nums text-[#52525B] sm:inline" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[#52525B]">{t.telemetry.timeline}</span>
        <span ref={time} className="tabular-nums" />
        <span className="relative block h-px w-24 overflow-hidden bg-white/[0.08]">
          <span ref={bar} className="absolute inset-0 origin-left bg-white/70" style={{ transform: 'scaleX(0)' }} />
        </span>
        <span className="text-[#52525B]">{t.telemetry.act}</span>
        <span ref={act} className="text-white" />
      </div>
    </div>
  );
}
