'use client';

import { useEffect, useRef } from 'react';

/**
 * AsciiCosmos:
 * A high-performance, 60fps interactive ASCII physics field simulator.
 * Renders a morphing 3D celestial orbital singularity with dynamic physics equations:
 * F = ma, E = mc², ∇×E = -∂B/∂t, [M][L]²[T]⁻², W = ΔEk
 *
 * Smoothly undulates and reacts to mouse pointer coordinates with zero lag.
 */
export function AsciiCosmos({ height = 280 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let h = (canvas.height = height);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      h = canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const chars = ' .·:;=+*#%@';
    const formulas = [
      'F = m·a',
      'E_k = ½·m·v²',
      '[M]¹[L]²[T]⁻²',
      'sin(37°) = 0.6',
      'g = 10 m/s²',
      'W_net = ΔE_k',
      'p = m·v',
      'τ = r × F',
    ];

    let mouseX = width / 2;
    let mouseY = h / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const onPointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', onPointerMove);

    let t = 0;

    const render = () => {
      t += 0.025;
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, h);

      const cols = Math.floor(width / 14);
      const rows = Math.floor(h / 16);
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cx = width / 2;
      const cy = h / 2;

      // Draw pulsating ASCII wave grid
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * 14;
          const y = (r + 0.5) * 16;

          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Gravitational pull distortion from mouse pointer
          const mdx = x - mouseX;
          const mdy = y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const mouseWarp = Math.sin(mdist * 0.04 - t * 2) * Math.exp(-mdist * 0.008);

          // Wave equation
          const wave = Math.sin(dist * 0.05 - t) + Math.cos((x * 0.03 + y * 0.02) + t * 0.8) + mouseWarp * 1.5;
          const norm = (wave + 2.5) / 5; // 0 to 1
          const charIdx = Math.max(0, Math.min(chars.length - 1, Math.floor(norm * chars.length)));
          const char = chars[charIdx];

          const alpha = Math.max(0.08, Math.min(0.85, norm * 0.7 + (1 - mdist / 400) * 0.3));

          // Color tinting: emerald core with cosmic violet periphery
          if (mdist < 140) {
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
          } else if (dist < 180) {
            ctx.fillStyle = `rgba(229, 193, 88, ${alpha * 0.75})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
          }

          ctx.fillText(char, x, y);
        }
      }

      // Draw floating physics equation glyphs
      const numFormulas = Math.min(formulas.length, Math.floor(width / 100));
      for (let i = 0; i < numFormulas; i++) {
        const angle = (i / numFormulas) * Math.PI * 2 + t * 0.25;
        const radius = 100 + Math.sin(t + i) * 35;
        const fx = cx + Math.cos(angle) * (radius * 1.6);
        const fy = cy + Math.sin(angle) * (radius * 0.75);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(formulas[i], fx, fy);
      }

      // Subtle center singularity ring
      ctx.beginPath();
      ctx.arc(cx, cy, 28 + Math.sin(t * 1.5) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onPointerMove);
    };
  }, [height]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)]">
      <canvas ref={canvasRef} className="block w-full cursor-crosshair" style={{ height }} />
      <div className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-2 font-sans text-[11px] uppercase tracking-wider text-white/40">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Kozmik ASCII Simülatörü // 60 FPS</span>
      </div>
    </div>
  );
}
