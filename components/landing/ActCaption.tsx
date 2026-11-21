'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { soundController } from '@/lib/cosmos/audio';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { useOdyssey } from './ScrollProvider';
import { useActVisibility } from './useActVisibility';

export function ActCaption({ act }: { act: 1 }) {
  const { t } = useLanguage();
  const { progress } = useOdyssey();
  const { opacity, y, pointerEvents, visibility } = useActVisibility(progress, act);
  const c = t.acts[0];

  return (
    <motion.section
      style={{ opacity, y, pointerEvents, visibility }}
      className="absolute inset-0 z-20 flex flex-col justify-end lg:justify-center items-center lg:items-stretch px-4 pb-6 sm:pb-10 lg:p-0 lg:px-14 xl:px-20 pointer-events-none"
    >
      {/* Mobile: Anchored bottom frosted card to give Tesla full breathing room in top half.
          Desktop: Full-width transparent row flanked far left and far right. */}
      <div className="w-full max-w-lg lg:max-w-none flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 lg:gap-16 bg-zinc-950/85 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none max-md:backdrop-blur-none border border-white/10 lg:border-none rounded-2xl lg:rounded-none p-5 sm:p-6 lg:p-0 shadow-[0_16px_48px_rgba(0,0,0,0.85)] lg:shadow-none max-md:shadow-none pointer-events-auto">
        {/* Left: Text & Explanation */}
        <div className="flex w-full max-w-md xl:max-w-lg flex-col items-start shrink-0">
          <span className="mb-2 sm:mb-3.5 inline-block font-sans text-[11px] sm:text-[11.5px] font-medium uppercase tracking-[0.25em] text-white/50">
            {c.kicker}
          </span>
          <h2 className="font-display text-[clamp(1.5rem,3.2vw,3.6rem)] font-light leading-[1.08] tracking-[-0.03em] text-white">
            {c.title}
          </h2>
          <p className="mt-2.5 sm:mt-4 max-w-md font-sans text-[13.5px] sm:text-[15px] font-light leading-[1.55] text-[#A1A1AA] sm:text-[16px]">
            {c.body}
          </p>

          {/* Desktop full vertical checklist */}
          {c.features && (
            <ul className="mt-6 hidden lg:flex flex-col gap-2.5 font-sans text-[13.5px] text-white/90">
              {c.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-white/70 shrink-0" />
                  <span className="font-light text-white/90">{f}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Mobile sleek compact badge grid (replaces vertical list and clutter) */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 font-sans text-[11.5px] sm:text-[12px] w-full lg:hidden">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-zinc-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span className="truncate">MEB Müfredat Uyumu</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-zinc-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span className="truncate">mathjs Bağımsız Denetim</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-zinc-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span className="truncate">SI Birim Sistemi</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-zinc-300">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <span className="truncate">Adım Adım Çözüm</span>
            </div>
          </div>

          {/* Link to Why Physicsmn & Benchmark */}
          <div className="mt-4 sm:mt-6 lg:mt-8 flex w-full lg:w-auto items-center justify-between lg:justify-start gap-3 sm:gap-4">
            <Link
              href="/why"
              onMouseEnter={() => soundController.playButtonHover()}
              onClick={() => soundController.playButtonClick()}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 sm:px-5 sm:py-3 font-sans text-[12.5px] sm:text-[13px] font-medium text-white shadow-[0_0_25px_rgba(255,255,255,0.05)] backdrop-blur-xl max-md:backdrop-blur-none transition-all duration-300 hover:border-white/40 hover:bg-white/[0.14] hover:shadow-[0_0_35px_rgba(255,255,255,0.12)] max-md:shadow-none max-md:hover:shadow-none active:scale-[0.98]"
            >
              <span>Neden Physicsmn? →</span>
            </Link>
            <Link
              href="/docs#benchmark"
              className="lg:hidden font-sans text-[12px] text-white/50 underline underline-offset-4 transition-colors hover:text-white"
            >
              57 MEB Raporu →
            </Link>
          </div>
        </div>

        {/* Right: Validation telemetry specs (anchored far right on desktop) */}
        <div className="hidden lg:flex w-full max-w-[330px] xl:max-w-[380px] flex-col gap-3 font-sans text-[13px] text-[#A1A1AA] shrink-0">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-white/60">Müfredat Uyumu</span>
            <span className="text-white font-medium">MEB Lise Müfredatı</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-white/60">Doğrulama Motoru</span>
            <span className="text-emerald-400 font-medium">mathjs ile Bağımsız Denetim</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-white/60">Birim Sistemi</span>
            <span className="text-white font-medium">SI Birimleri (metre, joule vb.)</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-white/60">Çözüm Formatı</span>
            <span className="text-white font-medium">Adım Adım Açıklamalı</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-white/60">Kontrol Güvencesi</span>
            <span className="text-white font-medium">Her İşlem Tek Tek Onaylı</span>
          </div>
          <div className="pt-2 text-right">
            <Link
              href="/docs#benchmark"
              className="font-sans text-[12px] text-white/50 underline underline-offset-4 transition-colors hover:text-white"
            >
              57 Soruluk MEB Başarı Raporu →
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
