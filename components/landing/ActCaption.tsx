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
      className="absolute inset-0 z-20 flex items-center justify-center px-6 lg:px-16"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        {/* PAGE 2 — Academic Rigor & Explanation */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Text & Explanation */}
          <div className="flex flex-col items-start lg:col-span-7">
            <span className="mb-4 inline-block font-sans text-[12px] font-medium uppercase tracking-[0.25em] text-white/50">
              {c.kicker}
            </span>
            <h2 className="font-display text-[clamp(2.4rem,4.8vw,4.4rem)] font-light leading-[1.02] tracking-[-0.03em] text-white">
              {c.title}
            </h2>
            <p className="mt-5 max-w-xl font-sans text-[16px] font-light leading-[1.6] text-[#A1A1AA] sm:text-[17px]">
              {c.body}
            </p>

            {c.features && (
              <ul className="mt-8 flex flex-col gap-3 font-sans text-[14px] text-white/90">
                {c.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-white/70" />
                    <span className="font-light text-white/90">{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Link to Why Physicsmn (solving bar/button removed) */}
            <div className="mt-9 flex items-center">
              <Link
                href="/why"
                onMouseEnter={() => soundController.playButtonHover()}
                onClick={() => soundController.playButtonClick()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3.5 font-sans text-[13.5px] font-medium text-white shadow-[0_0_25px_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/[0.14] hover:shadow-[0_0_35px_rgba(255,255,255,0.12)] active:scale-[0.98]"
              >
                <span>Neden Physicsmn? →</span>
              </Link>
            </div>
          </div>

          {/* Right: Validation telemetry specs (minimalist sans typography) */}
          <div className="flex flex-col gap-4 font-sans text-[13.5px] text-[#A1A1AA] lg:col-span-5 lg:pl-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-white/60">Müfredat Uyumu</span>
              <span className="text-white font-medium">MEB Lise Müfredatı</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-white/60">Doğrulama Motoru</span>
              <span className="text-emerald-400 font-medium">mathjs ile Bağımsız Hesap Denetimi</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-white/60">Birim Sistemi</span>
              <span className="text-white font-medium">SI Fizik Birimleri (metre, joule vb.)</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-white/60">Çözüm Formatı</span>
              <span className="text-white font-medium">Adım Adım Açıklamalı</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-white/60">Kontrol Güvencesi</span>
              <span className="text-white font-medium">Her İşlem Tek Tek Onaylı</span>
            </div>
            <div className="pt-2 text-right">
              <Link
                href="/docs#benchmark"
                className="font-sans text-[12.5px] text-white/50 underline underline-offset-4 transition-colors hover:text-white"
              >
                57 Soruluk MEB Başarı Raporu →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
