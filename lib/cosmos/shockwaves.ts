import { drawSprite, type Sprites } from './sprites';

interface Wave {
  x: number;
  y: number;
  t0: number;
}

const SPEED = 980; // px / s
const LIFE = 2.4; // s
const BAND = 70; // px

/** Expanding golden-white gravitational shockwaves triggered by clicks. */
export class Shockwaves {
  private waves: Wave[] = [];

  add(x: number, y: number, t: number) {
    this.waves.push({ x, y, t0: t });
    if (this.waves.length > 6) this.waves.shift();
  }

  get active() {
    return this.waves.length > 0;
  }

  /** Radial screen-space displacement a point experiences from all live wavefronts. */
  displace(x: number, y: number, t: number, out: [number, number], strength = 1) {
    out[0] = 0;
    out[1] = 0;
    for (let i = 0; i < this.waves.length; i++) {
      const wv = this.waves[i];
      const age = t - wv.t0;
      const r = age * SPEED;
      const dx = x - wv.x;
      const dy = y - wv.y;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const k = (d - r) / BAND;
      if (k > 3 || k < -3) continue;
      const f = Math.exp(-k * k) * 46 * (1 - age / LIFE) * strength;
      out[0] += (dx / d) * f;
      out[1] += (dy / d) * f;
    }
  }

  draw(ctx: CanvasRenderingContext2D, t: number, sprites: Sprites) {
    this.waves = this.waves.filter((w) => t - w.t0 < LIFE);
    if (!this.waves.length) return;
    ctx.globalCompositeOperation = 'lighter';
    for (const wv of this.waves) {
      const age = t - wv.t0;
      const life = 1 - age / LIFE;
      const r = age * SPEED;
      // core flash
      if (age < 0.45) {
        const k = 1 - age / 0.45;
        drawSprite(ctx, sprites.whiteHalo, wv.x, wv.y, 140 + 260 * (1 - k), 0.55 * k * k);
        drawSprite(ctx, sprites.white, wv.x, wv.y, 40 + 60 * k, 0.9 * k);
      }
      // layered ring: silver haze → razor white
      const rings: [number, string][] = [
        [24, `rgba(212,212,216,${(0.05 * life).toFixed(3)})`],
        [8, `rgba(212,212,216,${(0.12 * life).toFixed(3)})`],
        [2.2, `rgba(245,245,247,${(0.35 * life).toFixed(3)})`],
        [0.8, `rgba(255,255,255,${(0.85 * life).toFixed(3)})`],
      ];
      ctx.globalAlpha = 1;
      for (const [lw, col] of rings) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // trailing echo
      if (r > 60) {
        ctx.strokeStyle = `rgba(212,212,216,${(0.20 * life).toFixed(3)})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, r * 0.82, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}
