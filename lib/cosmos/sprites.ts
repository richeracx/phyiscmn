import { SILVER, WHITE, type RGB } from './math';

/**
 * Soft additive glow sprites. Pre-rendered once into offscreen canvases so every
 * star / photon is a single `drawImage` that blooms when composited with `lighter`.
 */
export function glowSprite(rgb: RGB, size = 96, coreStop = 0.08, haloAlpha = 0.22): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  const col = rgb.join(',');
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(coreStop, `rgba(${col},0.95)`);
  grad.addColorStop(0.22, `rgba(${col},0.42)`);
  grad.addColorStop(0.5, `rgba(${col},${haloAlpha * 0.45})`);
  grad.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export interface Sprites {
  white: HTMLCanvasElement;
  silver: HTMLCanvasElement;
  gold: HTMLCanvasElement;
  violet: HTMLCanvasElement;
  teal: HTMLCanvasElement;
  /** Wide, low-intensity halo for flares and lens bloom. */
  goldHalo: HTMLCanvasElement;
  whiteHalo: HTMLCanvasElement;
  violetHalo: HTMLCanvasElement;
  /** 24 px variants: much cheaper to draw for tiny particles than downscaling the 96 px ones */
  whiteSm: HTMLCanvasElement;
  goldSm: HTMLCanvasElement;
  violetSm: HTMLCanvasElement;
}

export function createSprites(): Sprites {
  const white = glowSprite(WHITE);
  const silver = glowSprite(SILVER);
  const whiteHalo = glowSprite(WHITE, 256, 0.015, 0.4);
  const whiteSm = glowSprite(WHITE, 24);
  return {
    white,
    silver,
    gold: silver,
    violet: white,
    teal: silver,
    goldHalo: whiteHalo,
    whiteHalo,
    violetHalo: whiteHalo,
    whiteSm,
    goldSm: whiteSm,
    violetSm: whiteSm,
  };
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: HTMLCanvasElement,
  x: number,
  y: number,
  size: number,
  alpha: number,
) {
  if (alpha <= 0.003 || size <= 0.2) return;
  ctx.globalAlpha = alpha > 1 ? 1 : alpha;
  const h = size * 0.5;
  ctx.drawImage(sprite, x - h, y - h, size, size);
}

/**
 * Batches thousands of line segments into a handful of stroke calls, keyed by
 * colour × alpha level × width level — avoids per-segment state changes.
 */
export class SegmentBatch {
  private buckets: number[][];
  constructor(
    private readonly colors: readonly RGB[],
    private readonly alphaLevels: number,
    private readonly widths: readonly number[],
  ) {
    this.buckets = Array.from({ length: colors.length * alphaLevels * widths.length }, () => []);
  }

  add(color: number, alpha: number, widthLevel: number, x1: number, y1: number, x2: number, y2: number) {
    if (alpha <= 0.004) return;
    const a = Math.min(this.alphaLevels - 1, Math.floor(Math.min(alpha, 0.999) * this.alphaLevels));
    const key = (color * this.alphaLevels + a) * this.widths.length + widthLevel;
    const b = this.buckets[key];
    b.push(x1, y1, x2, y2);
  }

  flush(ctx: CanvasRenderingContext2D, alphaScale = 1) {
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1;
    const nW = this.widths.length;
    for (let key = 0; key < this.buckets.length; key++) {
      const b = this.buckets[key];
      if (b.length === 0) continue;
      const w = key % nW;
      const a = Math.floor(key / nW) % this.alphaLevels;
      const c = Math.floor(key / (nW * this.alphaLevels));
      const alpha = ((a + 0.5) / this.alphaLevels) * alphaScale;
      if (alpha > 0.003) {
        ctx.strokeStyle = `rgba(${this.colors[c].join(',')},${alpha.toFixed(3)})`;
        ctx.lineWidth = this.widths[w];
        ctx.beginPath();
        for (let i = 0; i < b.length; i += 4) {
          ctx.moveTo(b[i], b[i + 1]);
          ctx.lineTo(b[i + 2], b[i + 3]);
        }
        ctx.stroke();
      }
      b.length = 0;
    }
  }
}
