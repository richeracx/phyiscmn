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
      className="absolute inset-0 z-20 flex items-center justify-between px-6 sm:px-10 lg:px-14 xl:px-20"
    >
      <div className="flex w-full flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
        {/* Left: Text & Explanation (anchored far left to give Tesla full breathing room in center) */}
        <div className="flex w-full max-w-md xl:max-w-lg flex-col items-start shrink-0">
          <span className="mb-3.5 inline-block font-sans text-[11.5px] font-medium uppercase tracking-[0.25em] text-white/50">
            {c.kicker}
          </span>
          <h2 className="font-display text-[clamp(2.1rem,4vw,3.6rem)] font-light leading-[1.04] tracking-[-0.03em] text-white">
            {c.title}
          </h2>
          <p className="mt-4 max-w-md font-sans text-[15px] font-light leading-[1.6] text-[#A1A1AA] sm:text-[16px]">
            {c.body}
          </p>

          {c.features && (
            <ul className="mt-6 flex flex-col gap-2.5 font-sans text-[13.5px] text-white/90">
              {c.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-white/70 shrink-0" />
                  <span className="font-light text-white/90">{f}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Link to Why Physicsmn */}
          <div className="mt-8 flex items-center">
            <Link
              href="/why"
              onMouseEnter={() => soundController.playButtonHover()}
              onClick={() => soundController.playButtonClick()}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-3 font-sans text-[13px] font-medium text-white shadow-[0_0_25px_rgba(255,255,255,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/[0.14] hover:shadow-[0_0_35px_rgba(255,255,255,0.12)] active:scale-[0.98]"
            >
              <span>Neden Physicsmn? →</span>
            </Link>
          </div>
        </div>

        {/* Right: Validation telemetry specs (anchored far right) */}
        <div className="flex w-full max-w-[330px] xl:max-w-[380px] flex-col gap-3 font-sans text-[13px] text-[#A1A1AA] shrink-0">
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
