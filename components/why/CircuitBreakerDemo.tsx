'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Play, RefreshCw, X } from 'lucide-react';
import { soundController } from '@/lib/cosmos/audio';

export function CircuitBreakerDemo() {
  const [activeTab, setActiveTab] = useState<'llm' | 'mathjs' | 'repair'>('repair');
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(3);

  const runSimulation = (tab: 'llm' | 'mathjs' | 'repair') => {
    setActiveTab(tab);
    setIsRunning(true);
    setStepIndex(0);
    soundController.playButtonClick();

    const t1 = setTimeout(() => {
      setStepIndex(1);
      soundController.playButtonHover();
    }, 600);

    const t2 = setTimeout(() => {
      setStepIndex(2);
      soundController.playButtonHover();
    }, 1300);

    const t3 = setTimeout(() => {
      setStepIndex(3);
      if (tab === 'mathjs') soundController.playButtonHover();
      else if (tab === 'repair') soundController.playButtonHover();
      setIsRunning(false);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/80 backdrop-blur-xl">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] bg-white/[0.02] px-6 py-4">
        <div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Canlı Simülasyon Deneyi
          </span>
          <h4 className="mt-0.5 font-sans text-[16px] font-normal text-white">
            Nöro-Sembolik Devre Kesici (Circuit-Breaker) Mekanizması
          </h4>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 p-1 font-sans text-[12px]">
          <button
            type="button"
            onClick={() => runSimulation('llm')}
            className={`rounded-full px-3 py-1.5 transition-all ${
              activeTab === 'llm'
                ? 'bg-red-500/20 text-red-300 font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            1. Standart LLM (Denetimsiz)
          </button>
          <button
            type="button"
            onClick={() => runSimulation('mathjs')}
            className={`rounded-full px-3 py-1.5 transition-all ${
              activeTab === 'mathjs'
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            2. mathjs Denetim Tuzağı
          </button>
          <button
            type="button"
            onClick={() => runSimulation('repair')}
            className={`rounded-full px-3 py-1.5 transition-all ${
              activeTab === 'repair'
                ? 'bg-emerald-500/20 text-emerald-300 font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            3. Otonom Öz-Düzeltme
          </button>
        </div>
      </div>

      {/* Main Simulation Stage */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12 font-sans">
        {/* Left Column: The Problem & Derivation Stream */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 text-[13.5px]">
            <span className="text-white/50 text-[11px] uppercase tracking-wider block mb-1">Problem Girdisi</span>
            <p className="text-white font-light">
              &quot;m = 2 kg kütleli bir cisim v = 10 m/s hızla hareket etmektedir. Kinetik enerjisini bulun.&quot;
            </p>
          </div>

          {/* Derivation Steps */}
          <div className="space-y-2.5 text-[13px]">
            {/* Step 1 */}
            <div
              className={`rounded-xl border p-3.5 transition-all duration-300 ${
                stepIndex >= 1
                  ? 'border-white/10 bg-white/[0.03] text-white'
                  : 'border-white/[0.04] opacity-30 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[11px]">Adım 1 // Değişken Tespiti</span>
                <span className="text-emerald-400 text-[11px]">✓ OCR Başarılı</span>
              </div>
              <div className="mt-1 font-light">
                m = 2 kg, \quad v = 10 m/s
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`rounded-xl border p-3.5 transition-all duration-300 ${
                stepIndex >= 2
                  ? 'border-white/10 bg-white/[0.03] text-white'
                  : 'border-white/[0.04] opacity-30 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[11px]">Adım 2 // Formül Kurulumu</span>
                <span className="text-emerald-400 text-[11px]">✓ MEB Korunum Yasası</span>
              </div>
              <div className="mt-1 font-light">
                E_k = \frac{1}{2} m v^2 = \frac{1}{2} \cdot (2) \cdot (10)^2
              </div>
            </div>

            {/* Step 3: Divergence point */}
            <div
              className={`rounded-xl border p-3.5 transition-all duration-300 ${
                stepIndex >= 3
                  ? activeTab === 'llm'
                    ? 'border-red-500/40 bg-red-950/20 text-red-200'
                    : activeTab === 'mathjs'
                    ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                    : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                  : 'border-white/[0.04] opacity-30 text-white/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium">
                  Adım 3 // {activeTab === 'repair' ? 'Düzeltilmiş Nihai Çözüm' : 'Hesaplama & Sonuç'}
                </span>
                {activeTab === 'llm' && <span className="text-red-400 text-[11px]">✗ Aritmetik Halüsinasyon</span>}
                {activeTab === 'mathjs' && <span className="text-amber-400 text-[11px]">⚠ Devre Kesici Tetiklendi</span>}
                {activeTab === 'repair' && <span className="text-emerald-400 text-[11px]">✓ mathVerified: true</span>}
              </div>

              <div className="mt-1.5 text-[15px] font-normal">
                {activeTab === 'llm' && (
                  <span>E_k = 999 J <span className="text-[12px] opacity-70">(Yanlış aritmetik hesap öğrenciye sunuldu)</span></span>
                )}
                {activeTab === 'mathjs' && (
                  <span>Model cevabı: 999 J <span className="text-amber-300 font-semibold">≠</span> Gerçek mathjs hesabı: 100.00 J</span>
                )}
                {activeTab === 'repair' && (
                  <span>E_k = 100.00 J <span className="text-emerald-300 text-[12px] font-light">(2. geçişte otonom olarak tamir edildi)</span></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Audit Diagnostics */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-black/60 p-5 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/60">
                Canlı Denetim Teşhisi
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase ${
                  activeTab === 'llm'
                    ? 'bg-red-500/20 text-red-400'
                    : activeTab === 'mathjs'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {activeTab === 'llm' ? 'Denetçi Pasif' : activeTab === 'mathjs' ? 'Devre Kesildi' : 'Onaylandı'}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Temel SI Boyutu:</span>
                <span className="text-white font-medium">[M]¹ [L]² [T]⁻² (Joule)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">mathjs Formül Değeri:</span>
                <span className="text-emerald-400 font-semibold">100.000 J</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">İddia Edilen Değer:</span>
                <span className={activeTab === 'repair' ? 'text-emerald-400' : 'text-red-400'}>
                  {activeTab === 'repair' ? '100 J' : '999 J'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Sayısal Sapma Farkı:</span>
                <span className={activeTab === 'repair' ? 'text-emerald-400' : 'text-amber-400'}>
                  {activeTab === 'repair' ? '0.0% (Tolerans İçi)' : '%89.99 (Tolerans Dışı)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Sınır Eşiği:</span>
                <span className="text-white">±%2.0 Maksimum</span>
              </div>
            </div>

            {/* Diagnostic Message Alert */}
            <div
              className={`mt-5 rounded-xl border p-3.5 text-[12px] leading-relaxed ${
                activeTab === 'llm'
                  ? 'border-red-500/30 bg-red-950/20 text-red-300'
                  : activeTab === 'mathjs'
                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                  : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
              }`}
            >
              {activeTab === 'llm' && (
                <div className="flex items-start gap-2">
                  <X size={15} className="shrink-0 mt-0.5 text-red-400" />
                  <span>
                    <strong>Sonuç:</strong> Standart üretken model aritmetik hatayı fark etmedi. Öğrenciye 999 J yanlış cevabı sunuldu.
                  </span>
                </div>
              )}
              {activeTab === 'mathjs' && (
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>Devre Kesici:</strong> mathjs %90 sayısal sapma tespit etti. Çözüm sunumu bloke edildi ve onarım uyarısı üretildi.
                  </span>
                </div>
              )}
              {activeTab === 'repair' && (
                <div className="flex items-start gap-2">
                  <Check size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    <strong>Otonom Onarım:</strong> mathjs hata raporu modele iletildi, 2. geçişte aritmetik hatasız 100 J olarak onarılıp onaylandı.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Trigger Button */}
          <button
            type="button"
            disabled={isRunning}
            onClick={() => runSimulation(activeTab)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] py-2.5 text-[12.5px] font-medium text-white transition-all hover:bg-white/[0.15] active:scale-[0.98] disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Simüle Ediliyor...</span>
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                <span>Tekrar Simüle Et</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
