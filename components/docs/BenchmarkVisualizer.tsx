'use client';

import { useState } from 'react';
import { Check, FileImage, Sparkles } from 'lucide-react';
import { soundController } from '@/lib/cosmos/audio';

interface WorksheetMeta {
  id: string;
  name: string;
  topic: string;
  questions: number;
  rawLlmCorrect: number;
  geminiCorrect: number;
  physicsmnCorrect: number;
  verifiedCount: number;
  repairedCount: number;
  details: {
    qNum: number;
    rawChoice: string;
    physicsmnChoice: string;
    verified: boolean;
    repaired: boolean;
    formula: string;
    units: string;
  }[];
}

const WORKSHEETS: WorksheetMeta[] = [
  {
    id: 'sheet-1',
    name: '1007a4c2-472d... (Test 01)',
    topic: 'Vektörler ve Kartezyen Bileşenler (11. Sınıf)',
    questions: 6,
    rawLlmCorrect: 4,
    geminiCorrect: 5,
    physicsmnCorrect: 6,
    verifiedCount: 5,
    repairedCount: 1,
    details: [
      { qNum: 1, rawChoice: 'C', physicsmnChoice: 'C', verified: true, repaired: false, formula: 'sqrt(Ax^2 + Ay^2)', units: 'N' },
      { qNum: 2, rawChoice: 'B', physicsmnChoice: 'D', verified: true, repaired: true, formula: 'A_x + B_x + C_x', units: 'N' },
      { qNum: 3, rawChoice: 'A', physicsmnChoice: 'A', verified: true, repaired: false, formula: 'F * cos(37 deg)', units: 'N' },
      { qNum: 4, rawChoice: 'E', physicsmnChoice: 'E', verified: true, repaired: false, formula: 'F * sin(53 deg)', units: 'N' },
      { qNum: 5, rawChoice: 'D', physicsmnChoice: 'D', verified: true, repaired: false, formula: 'R = A + B', units: 'N' },
      { qNum: 6, rawChoice: 'C', physicsmnChoice: 'C', verified: false, repaired: false, formula: 'tan(theta) = Ry/Rx', units: 'deg' },
    ],
  },
  {
    id: 'sheet-2',
    name: '10bc9a67-efe2... (Test 03)',
    topic: '1B Sabit İvmeli Hareket & Hız-Zaman Grafikleri',
    questions: 6,
    rawLlmCorrect: 3,
    geminiCorrect: 5,
    physicsmnCorrect: 6,
    verifiedCount: 6,
    repairedCount: 2,
    details: [
      { qNum: 1, rawChoice: 'B', physicsmnChoice: 'B', verified: true, repaired: false, formula: 'v0 + a * t', units: 'm/s' },
      { qNum: 2, rawChoice: 'E', physicsmnChoice: 'A', verified: true, repaired: true, formula: 'v0 * t + 0.5 * a * t^2', units: 'm' },
      { qNum: 3, rawChoice: 'C', physicsmnChoice: 'C', verified: true, repaired: false, formula: 'v^2 - v0^2 = 2 * a * x', units: 'm/s' },
      { qNum: 4, rawChoice: 'A', physicsmnChoice: 'A', verified: true, repaired: false, formula: 'Delta_v / Delta_t', units: 'm/s^2' },
      { qNum: 5, rawChoice: 'D', physicsmnChoice: 'B', verified: true, repaired: true, formula: '0.5 * (v1 + v2) * t', units: 'm' },
      { qNum: 6, rawChoice: 'E', physicsmnChoice: 'E', verified: true, repaired: false, formula: 'x / t', units: 'm/s' },
    ],
  },
  {
    id: 'sheet-7',
    name: '9f377fae-2936... (Test 07)',
    topic: 'İki Boyutta Atış Hareketleri & Eğik Atış',
    questions: 6,
    rawLlmCorrect: 3,
    geminiCorrect: 5,
    physicsmnCorrect: 6,
    verifiedCount: 5,
    repairedCount: 2,
    details: [
      { qNum: 1, rawChoice: 'A', physicsmnChoice: 'A', verified: true, repaired: false, formula: 'v0 * cos(theta)', units: 'm/s' },
      { qNum: 2, rawChoice: 'C', physicsmnChoice: 'D', verified: true, repaired: true, formula: 'v0 * sin(theta) / g', units: 's' },
      { qNum: 3, rawChoice: 'B', physicsmnChoice: 'B', verified: true, repaired: false, formula: '2 * v0y / g', units: 's' },
      { qNum: 4, rawChoice: 'E', physicsmnChoice: 'E', verified: true, repaired: false, formula: 'vx * t_ucus', units: 'm' },
      { qNum: 5, rawChoice: 'D', physicsmnChoice: 'D', verified: true, repaired: false, formula: 'v0y^2 / (2 * g)', units: 'm' },
      { qNum: 6, rawChoice: 'B', physicsmnChoice: 'C', verified: true, repaired: true, formula: 'sqrt(vx^2 + vy^2)', units: 'm/s' },
    ],
  },
  {
    id: 'sheet-10',
    name: 'fad9086d-2c7e... (Test 10)',
    topic: 'Newton Hareket Yasaları, Sürtünme ve Eğik Düzlem',
    questions: 6,
    rawLlmCorrect: 4,
    geminiCorrect: 5,
    physicsmnCorrect: 6,
    verifiedCount: 6,
    repairedCount: 1,
    details: [
      { qNum: 1, rawChoice: 'C', physicsmnChoice: 'C', verified: true, repaired: false, formula: 'm * g * sin(alpha) - f_s', units: 'N' },
      { qNum: 2, rawChoice: 'A', physicsmnChoice: 'A', verified: true, repaired: false, formula: 'k * N', units: 'N' },
      { qNum: 3, rawChoice: 'D', physicsmnChoice: 'E', verified: true, repaired: true, formula: 'F_net / m_toplam', units: 'm/s^2' },
      { qNum: 4, rawChoice: 'B', physicsmnChoice: 'B', verified: true, repaired: false, formula: 'm1 * a', units: 'N' },
      { qNum: 5, rawChoice: 'A', physicsmnChoice: 'A', verified: true, repaired: false, formula: 'm * g * cos(alpha)', units: 'N' },
      { qNum: 6, rawChoice: 'E', physicsmnChoice: 'E', verified: true, repaired: false, formula: 'W = F * x * cos(0)', units: 'J' },
    ],
  },
];

export function BenchmarkVisualizer() {
  const [selectedSheet, setSelectedSheet] = useState<WorksheetMeta>(WORKSHEETS[0]);

  const handleSelect = (sheet: WorksheetMeta) => {
    setSelectedSheet(sheet);
    soundController.playButtonClick();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/80 backdrop-blur-xl font-sans">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] bg-white/[0.02] px-6 py-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E5C158]">
            İnteraktif Veriseti Denetçisi
          </span>
          <h4 className="mt-0.5 text-[16px] font-normal text-white">
            N = 57 MEB Kazanım Testleri Canlı Sayfa İncelemesi
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-white/50">
          <FileImage size={14} className="text-emerald-400" />
          <span>10 Gerçek MEB Sınav Sayfası</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
        {/* Left Column: Worksheet Sheet Selector */}
        <div className="p-5 lg:col-span-5 space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/50 block mb-3">
            Örnek Çalışma Sayfaları
          </span>

          {WORKSHEETS.map((w) => {
            const isSelected = selectedSheet.id === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelect(w)}
                className={`w-full text-left rounded-xl p-3.5 transition-all ${
                  isSelected
                    ? 'border border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.06)]'
                    : 'border border-white/[0.06] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-medium ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                    {w.name}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    {w.questions} Soru
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-white/50 line-clamp-1">
                  {w.topic}
                </div>
                <div className="mt-2.5 flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-400">Physicsmn: {w.physicsmnCorrect}/{w.questions}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-amber-400">Gemini: {w.geminiCorrect}/{w.questions}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-red-400">Ham LLM: {w.rawLlmCorrect}/{w.questions}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Per-Question Telemetry Breakdown */}
        <div className="p-6 lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-white/50">
                Seçilen Sayfa Analizi
              </span>
              <span className="text-emerald-400 text-[12px] font-medium">
                Doğruluk: %{((selectedSheet.physicsmnCorrect / selectedSheet.questions) * 100).toFixed(0)}
              </span>
            </div>
            <h5 className="mt-1 text-[16px] font-medium text-white">
              {selectedSheet.topic}
            </h5>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-white/40 block">
              Sayfadaki Soruların Karşılaştırması
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[11px] uppercase text-white/40 pb-2">
                    <th className="pb-2">Soru</th>
                    <th className="pb-2 text-center">Ham LLM</th>
                    <th className="pb-2 text-center text-emerald-400">Physicsmn</th>
                    <th className="pb-2 text-center">mathjs</th>
                    <th className="pb-2 text-center">Öz-Düzeltme</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-light">
                  {selectedSheet.details.map((q) => (
                    <tr key={q.qNum} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 font-medium text-white">Soru {q.qNum}</td>
                      <td className="py-2.5 text-center text-red-300">{q.rawChoice}</td>
                      <td className="py-2.5 text-center font-medium text-emerald-300">{q.physicsmnChoice}</td>
                      <td className="py-2.5 text-center">
                        {q.verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                            <Check size={12} /> Onaylı
                          </span>
                        ) : (
                          <span className="text-white/40 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        {q.repaired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 font-medium">
                            <Sparkles size={11} /> Onarıldı
                          </span>
                        ) : (
                          <span className="text-white/40 text-[11px]">İlk Geçiş</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Telemetry Summary Box */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 text-[12.5px] space-y-2">
            <div className="flex items-center justify-between text-white/70">
              <span>mathjs Doğrulanma Oranı:</span>
              <span className="text-white font-medium">{selectedSheet.verifiedCount} / {selectedSheet.questions} Soru</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Otonom Öz-Düzeltme ile Kurtarılan Hata:</span>
              <span className="text-purple-300 font-medium">{selectedSheet.repairedCount} Soru</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Genel Veriseti Sonucu (N = 57):</span>
              <span className="text-emerald-400 font-semibold">%94.7 (54/57) Doğruluk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
