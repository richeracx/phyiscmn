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
    }, 450);

    const t2 = setTimeout(() => {
      setStepIndex(2);
      soundController.playButtonHover();
    }, 950);

    const t3 = setTimeout(() => {
      setStepIndex(3);
      if (tab === 'mathjs') soundController.playButtonHover();
      else if (tab === 'repair') soundController.playButtonHover();
      setIsRunning(false);
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/80 backdrop-blur-xl font-sans">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] bg-white/[0.02] px-6 py-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Canlı Simülasyon
          </span>
          <h4 className="mt-0.5 text-[16px] font-normal text-white">
            Yapay Zeka Hatalarını Nasıl Yakalayıp Düzeltiyoruz?
          </h4>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 p-1 text-[12px]">
          <button
            type="button"
            onClick={() => runSimulation('llm')}
            className={`rounded-full px-3 py-1.5 transition-all ${
              activeTab === 'llm'
                ? 'bg-red-500/20 text-red-300 font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            1. Normal Yapay Zeka
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
            2. mathjs Kontrolü
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
            3. Otomatik Düzeltme
          </button>
        </div>
      </div>

      {/* Main Simulation Stage */}
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* Left Column: The Problem & Derivation Stream */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 text-[13.5px]">
            <span className="text-white/50 text-[11px] uppercase tracking-wider block mb-1">Örnek Fizik Sorusu</span>
            <p className="text-white font-light">
              &quot;2 kg kütleli bir cisim 10 m/s hızla gitmektedir. Kinetik enerjisini bulunuz.&quot;
            </p>
          </div>

          {/* Derivation Steps (Clean, human-readable math without raw LaTeX codes) */}
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
                <span className="text-white/50 text-[11px]">1. Verilen Değerleri Belirleme</span>
                <span className="text-emerald-400 text-[11px]">✓ Bilgiler Eksiksiz Okundu</span>
              </div>
              <div className="mt-1 font-light text-[14px] text-white/90">
                Kütle: <span className="font-medium text-white">m = 2 kg</span> &nbsp;—&nbsp; Hız: <span className="font-medium text-white">v = 10 m/s</span>
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
                <span className="text-white/50 text-[11px]">2. Fizik Formülünü Kurma</span>
                <span className="text-emerald-400 text-[11px]">✓ MEB Müfredat Kuralı</span>
              </div>
              <div className="mt-1 font-light text-[14px] text-white/90">
                Kinetik Enerji: <span className="font-medium text-white">Ek = ½ · m · v²</span> = ½ · (2) · (10)²
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
                  3. Hesaplama ve Sonuç Kontrolü
                </span>
                {activeTab === 'llm' && <span className="text-red-400 text-[11px]">✗ İşlem Hatası Fark Edilmedi</span>}
                {activeTab === 'mathjs' && <span className="text-amber-400 text-[11px]">⚠ Hatalı Çözüm Durduruldu</span>}
                {activeTab === 'repair' && <span className="text-emerald-400 text-[11px]">✓ mathjs ile Tam Doğrulandı</span>}
              </div>

              <div className="mt-1.5 text-[14.5px] font-normal">
                {activeTab === 'llm' && (
                  <div>
                    <span className="font-medium text-red-300">Ek = 999 Joule</span>
                    <span className="block text-[12px] opacity-80 mt-0.5 text-red-200/80">
                      (Normal yapay zeka çarpma hatası yaptı ve yanlış sonucu doğrudan öğrenciye sundu)
                    </span>
                  </div>
                )}
                {activeTab === 'mathjs' && (
                  <div>
                    <span className="text-amber-200">
                      Yapay Zeka Tahmini: <span className="line-through text-red-300 font-medium">999 J</span> ≠ mathjs Gerçek Hesabı: <span className="text-emerald-300 font-medium">100 Joule</span>
                    </span>
                    <span className="block text-[12px] opacity-80 mt-0.5 text-amber-200/80">
                      (Hata anında yakalandı, yanlış cevabın ekrana gitmesi engellendi)
                    </span>
                  </div>
                )}
                {activeTab === 'repair' && (
                  <div>
                    <span className="font-medium text-emerald-300 text-[16px]">Ek = 100 Joule</span>
                    <span className="block text-[12px] opacity-80 mt-0.5 text-emerald-200/80">
                      (İşlem hatası siz görmeden önce fark edildi ve baştan çözülerek düzeltildi)
                    </span>
                  </div>
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
                Canlı Hesap Denetimi
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
                {activeTab === 'llm' ? 'Denetimsiz' : activeTab === 'mathjs' ? 'Hata Yakalandı' : 'Onaylandı'}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Fiziksel Birim:</span>
                <span className="text-white font-medium">Joule (Enerji)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">mathjs Gerçek Hesap:</span>
                <span className="text-emerald-400 font-semibold">100.00 Joule</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Yapay Zeka Tahmini:</span>
                <span className={activeTab === 'repair' ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {activeTab === 'repair' ? '100 Joule' : '999 Joule'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Hesap Doğrulaması:</span>
                <span className={activeTab === 'repair' ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {activeTab === 'repair' ? 'Tamamen Doğru ✓' : 'İşlem Hatası Yakalandı ✗'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Kontrol Sistemi:</span>
                <span className="text-white">mathjs Bağımsız Motor</span>
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
                    <strong>Sonuç:</strong> Standart yapay zeka işlem hatasını fark edemez. Öğrenciye 999 J yanlış cevabı gösterilir.
                  </span>
                </div>
              )}
              {activeTab === 'mathjs' && (
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    <strong>mathjs Devreye Girdi:</strong> Matematik motorumuz işlem hatasını anında yakaladı: Çarpma işlemi 100 J vermesi gerekirken yapay zeka 999 J yazmıştı. Yanlış cevap durduruldu.
                  </span>
                </div>
              )}
              {activeTab === 'repair' && (
                <div className="flex items-start gap-2">
                  <Check size={15} className="shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    <strong>Otomatik Düzeltildi:</strong> mathjs hatayı yapay zekaya bildirdi ve çözüm daha siz görmeden doğru sonuç olan 100 J olarak anında düzeltildi.
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
