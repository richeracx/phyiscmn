'use client';

import { useState } from 'react';
import { soundController } from '@/lib/cosmos/audio';

export function VectorPlayground() {
  const [angle, setAngle] = useState(37);
  const force = 100; // 100 N

  const rad = (angle * Math.PI) / 180;
  // MEB rounded conventions for standard angles
  let sinVal = Math.sin(rad);
  let cosVal = Math.cos(rad);
  if (angle === 37) {
    sinVal = 0.6;
    cosVal = 0.8;
  } else if (angle === 53) {
    sinVal = 0.8;
    cosVal = 0.6;
  }

  const fx = force * cosVal;
  const fy = force * sinVal;

  const presets = [
    { label: '30°', val: 30 },
    { label: '37° (MEB Standart)', val: 37 },
    { label: '45°', val: 45 },
    { label: '53° (MEB Standart)', val: 53 },
    { label: '60°', val: 60 },
  ];

  const handleSelectAngle = (val: number) => {
    setAngle(val);
    soundController.playButtonClick();
  };

  // SVG dimensions
  const svgW = 280;
  const svgH = 200;
  const originX = 40;
  const originY = 170;
  const lengthScale = 1.3;

  const tipX = originX + fx * lengthScale;
  const tipY = originY - fy * lengthScale;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/80 p-6 backdrop-blur-xl font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E5C158]">
            MEB Müfredat Vektör Ayrıştırma
          </span>
          <h4 className="mt-0.5 text-[16px] font-normal text-white">
            İnteraktif Vektör & Trigonometri Tuvali
          </h4>
        </div>

        {/* Preset Angle Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.val}
              type="button"
              onClick={() => handleSelectAngle(p.val)}
              className={`rounded-full px-3 py-1 text-[11.5px] transition-all ${
                angle === p.val
                  ? 'bg-white text-black font-medium'
                  : 'border border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        {/* Left: Interactive SVG Vector Canvas */}
        <div className="flex justify-center rounded-xl border border-white/[0.06] bg-black/60 p-4 lg:col-span-7">
          <svg width={svgW} height={svgH} className="overflow-visible">
            {/* Coordinate axes */}
            <line x1={originX} y1={originY} x2={originX + 210} y2={originY} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <line x1={originX} y1={originY} x2={originX} y2={originY - 150} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <text x={originX + 215} y={originY + 4} fill="rgba(255,255,255,0.4)" fontSize="11">+x</text>
            <text x={originX - 4} y={originY - 155} fill="rgba(255,255,255,0.4)" fontSize="11">+y</text>

            {/* Fx component (horizontal - emerald) */}
            <line
              x1={originX}
              y1={originY}
              x2={tipX}
              y2={originY}
              stroke="#10B981"
              strokeWidth="2.5"
            />
            {/* Dashed projection line to tip */}
            <line
              x1={tipX}
              y1={originY}
              x2={tipX}
              y2={tipY}
              stroke="rgba(16, 185, 129, 0.35)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Fy component (vertical - amber) */}
            <line
              x1={originX}
              y1={originY}
              x2={originX}
              y2={tipY}
              stroke="#E5C158"
              strokeWidth="2.5"
            />
            {/* Dashed projection line to tip */}
            <line
              x1={originX}
              y1={tipY}
              x2={tipX}
              y2={tipY}
              stroke="rgba(229, 193, 88, 0.35)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Main Force Vector (white) */}
            <line
              x1={originX}
              y1={originY}
              x2={tipX}
              y2={tipY}
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx={tipX} cy={tipY} r="4" fill="#ffffff" />

            {/* Labels on SVG */}
            <text x={tipX + 8} y={tipY} fill="#ffffff" fontSize="12" fontWeight="500">
              F = 100 N
            </text>
            <text x={originX + (tipX - originX) / 2} y={originY + 16} fill="#10B981" fontSize="11" textAnchor="middle">
              F_x = {fx.toFixed(1)} N
            </text>
            <text x={originX - 8} y={originY - (originY - tipY) / 2} fill="#E5C158" fontSize="11" textAnchor="end">
              F_y = {fy.toFixed(1)} N
            </text>
          </svg>
        </div>

        {/* Right: Real-time MEB Formula Math Breakdown */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 lg:col-span-5 text-[13px]">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-white/50 block mb-2">
              MEB Trigonometrik Sabitler ({angle}°)
            </span>

            <div className="space-y-2.5 text-white/80">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-white/60">Açı Değeri (θ):</span>
                <span className="text-white font-medium">{angle}°</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-white/60">sin({angle}°):</span>
                <span className="text-[#E5C158] font-medium">{sinVal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-white/60">cos({angle}°):</span>
                <span className="text-[#10B981] font-medium">{cosVal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <span className="text-white/60">Yerçekimi İvmesi (g):</span>
                <span className="text-white font-medium">10 m/s² (MEB Sabiti)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-black/60 p-3 text-[12px] text-white/70">
            <span className="text-emerald-400 font-medium">MEB Kuralı:</span> Genel yapay zekalar trigonometrik değerleri karmaşık ondalıklarla (0.60181...) verirken, Physicsmn MEB sınav standartları olan tam 0.6 ve 0.8 değerlerini uygular.
          </div>
        </div>
      </div>
    </div>
  );
}
