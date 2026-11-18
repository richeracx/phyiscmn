'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { soundController } from '@/lib/cosmos/audio';
import { useLanguage } from '@/components/shared/LanguageProvider';
import { useOdyssey } from './ScrollProvider';
import { useActVisibility } from './useActVisibility';

export function ActCaption({ act }: { act: 1 }) {
  const { t, lang } = useLanguage();
  const { progress } = useOdyssey();
  const { opacity, y, pointerEvents, visibility } = useActVisibility(progress, act);
  const c = t.acts[0];
  const tr = lang === 'tr';

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
            <span className="mb-4 inline-block font-sans text-[13px] font-medium uppercase tracking-[0.22em] text-white/60">
              {c.kicker}
            </span>
            <h2 className="font-sans text-[clamp(2.4rem,4.8vw,4.6rem)] font-normal leading-[1.02] tracking-[-0.04em] text-white">
              {c.title}
            </h2>
            <p className="mt-6 max-w-xl font-sans text-[18px] font-extralight leading-[1.6] text-[#bdbdbd]">
              {c.body}
            </p>

            {c.features && (
              <ul className="mt-8 flex flex-col gap-3 font-sans text-[14px] text-[#ffffff]/90">
                {c.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-white" />
                    <span className="font-extralight text-[#ffffff]">{f}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10">
              <Link
                href="/solve"
                onMouseEnter={() => soundController.playButtonHover()}
                onClick={() => soundController.playButtonClick()}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[13.5px] font-medium uppercase tracking-[0.03em] text-black transition-all duration-300 hover:bg-neutral-200 active:scale-[0.98]"
              >
                <span>{c.cta || (tr ? 'Çözücüyü Aç' : 'Open Full Solver')}</span>
                <ArrowRight size={15} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right: Validation telemetry badge */}
          <div className="flex flex-col gap-5 font-mono text-[13.5px] text-[#9a9a9a] lg:col-span-5 lg:pl-8">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-[#bdbdbd]">{tr ? 'Müfredat Uyumu' : 'Curriculum Standard'}</span>
              <span className="text-white">MEB & Üniversite %100</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-[#bdbdbd]">{tr ? 'Boyut & Birim Analizi' : 'Dimensional Analysis'}</span>
              <span className="text-white">[M][L][T]⁻² SI Doğrulandı</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-[#bdbdbd]">{tr ? 'LaTeX Matematik Dizgisi' : 'LaTeX Typesetting'}</span>
              <span className="text-white">KaTeX Native</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <span className="text-[#bdbdbd]">{tr ? 'Türetim Gerekçelendirme' : 'Derivation Reasoning'}</span>
              <span className="text-white">Tavizsiz / Sıfır Uydurma</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
