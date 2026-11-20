import { SILVER, WHITE, clamp, interactionGain, rand, smoothstep } from '../math';
import { SegmentBatch, drawSprite } from '../sprites';
import { soundController } from '../audio';
import type { Act, Frame } from '../types';

const SWIRL = 420;
const HOVER_R = 120;
const WORD = 'PHYSICSMN';
const TRACK = 0.18;
/** Seconds for the whole finale clock (singularity → supernova → cosmic stardust). */
const FINALE_SECONDS = 9;
/** Share of the clock the scroll morph pre-charges before the finale runs on its own. */
const PRE = 0.12;
/** Clock position of the detonation (≈ 2.3 s of spin-up + implosion after the morph lands). */
const DETONATE = 0.345;
/** Free-flying debris sparks that sell the violence of the blast. */
const SPARKS = 900;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Violent start, long slow drift — the blast hits instantly, then hangs in the air. */
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -9 * t));

/**
 * ACT V — singularity bomb → supernova → PHYSICSMN wordmark.
 * Detonates in a stunning monochrome supernova. The ejecta particles coalesce
 * and assemble cleanly into the word PHYSICSMN in pure white & silver stardust.
 */
export class FinaleAct implements Act {
  /** Choreography clock 0 → 1, read by the engine for the launch CTA reveal. */
  clock = 0;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private displayFamily = 'sans-serif';
  private dot = 3;
  private wordCx = 0;
  private wordCy = 0;
  private wordWidth = 0;

  private n = 0;
  private tx = new Float32Array(0);
  private ty = new Float32Array(0);
  private col = new Uint8Array(0);
  private dir = new Float32Array(0);
  private spd = new Float32Array(0);
  private twist = new Float32Array(0);
  private delay = new Float32Array(0);
  private arc = new Float32Array(0);
  private tw = new Float32Array(0);
  private ox = new Float32Array(0);
  private oy = new Float32Array(0);
  private vx = new Float32Array(0);
  private vy = new Float32Array(0);
  private px = new Float32Array(0);
  private py = new Float32Array(0);

  private su = new Float32Array(SWIRL);
  private sa = new Float32Array(SWIRL);
  private kDir = new Float32Array(SPARKS);
  private kSpd = new Float32Array(SPARKS);
  private kLife = new Float32Array(SPARKS);
  private kCol = new Uint8Array(SPARKS);
  private streaks = new SegmentBatch([WHITE, SILVER], 5, [0.8]);
  private swirl = new SegmentBatch([WHITE, SILVER], 6, [0.7, 1.4]);
  private sparks = new SegmentBatch([WHITE, SILVER], 6, [0.8, 1.6]);
  private fresh = true;

  constructor() {
    for (let i = 0; i < SWIRL; i++) {
      this.su[i] = Math.random();
      this.sa[i] = rand(0, Math.PI * 2);
    }
    for (let i = 0; i < SPARKS; i++) {
      this.kDir[i] = rand(0, Math.PI * 2);
      this.kSpd[i] = 0.35 + Math.pow(Math.random(), 0.6) * 1.25;
      this.kLife[i] = rand(1.1, 2.6); // seconds
      this.kCol[i] = Math.random() < 0.45 ? 0 : 1;
    }
  }

  setFont(display: string) {
    this.displayFamily = display;
    this.build();
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.build();
  }

  /** Render the wordmark PHYSICSMN offscreen and sample it into particle targets. */
  private build() {
    if (typeof document === 'undefined' || this.w < 2) return;
    const { w, h, dpr } = this;
    const mobile = w < 768;
    const meas = document.createElement('canvas').getContext('2d')!;
    const widthAt = (size: number) => {
      meas.font = `600 ${size}px ${this.displayFamily}`;
      let tw = 0;
      for (const ch of WORD) tw += meas.measureText(ch).width;
      return tw + size * TRACK * (WORD.length - 1);
    };

    let fs = clamp(w * (mobile ? 0.095 : 0.075), 32, 100);
    let tw = widthAt(fs);
    const maxW = w * (mobile ? 0.88 : 0.72);
    if (tw > maxW) {
      fs *= maxW / tw;
      tw = widthAt(fs);
    }

    // Place the wordmark in the upper-third of the screen so HTML text below NEVER collides
    const cy = h * (mobile ? 0.24 : 0.26);
    const top = cy - (fs * 0.72) / 2;
    const pad = 12;
    const lw = Math.ceil(tw) + pad * 2;
    const lh = Math.ceil(fs * 1.1) + pad * 2;
    const lx = Math.floor((w - tw) / 2) - pad;
    const ly = Math.floor(top) - pad;

    this.wordCx = w / 2;
    this.wordCy = cy;
    this.wordWidth = tw;

    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(lw * dpr));
    c.height = Math.max(1, Math.round(lh * dpr));
    const g = c.getContext('2d', { willReadFrequently: true })!;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.font = `600 ${fs}px ${this.displayFamily}`;
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#FFFFFF';

    let curX = pad;
    const base = pad + fs * 0.75;
    for (const ch of WORD) {
      g.fillText(ch, curX, base);
      meas.font = g.font;
      curX += meas.measureText(ch).width + fs * TRACK;
    }

    // Sample pixels from the rendered text
    const imgData = g.getImageData(0, 0, c.width, c.height).data;
    const xs: number[] = [];
    const ys: number[] = [];
    const cs: number[] = [];

    // Step size tuned to dpr so density is consistent
    const step = Math.max(2, Math.round(2.2 * dpr));
    for (let py = 0; py < c.height; py += step) {
      for (let px = 0; px < c.width; px += step) {
        const idx = (py * c.width + px) * 4;
        const a = imgData[idx + 3];
        if (a > 110) {
          xs.push(lx + px / dpr);
          ys.push(ly + py / dpr);
          const r = Math.random();
          cs.push(r < 0.65 ? 0 : 1); // pure white and silver stardust
        }
      }
    }

    const n = xs.length;
    this.n = n;
    this.dot = 3.0;
    const F = (len: number) => new Float32Array(len);
    this.tx = F(n);
    this.ty = F(n);
    this.col = new Uint8Array(n);
    this.dir = F(n);
    this.spd = F(n);
    this.twist = F(n);
    this.delay = F(n);
    this.arc = F(n);
    this.tw = F(n);
    this.ox = F(n);
    this.oy = F(n);
    this.vx = F(n);
    this.vy = F(n);
    this.px = F(n);
    this.py = F(n);

    for (let i = 0; i < n; i++) {
      this.tx[i] = xs[i];
      this.ty[i] = ys[i];
      this.col[i] = cs[i];
      this.dir[i] = rand(0, Math.PI * 2);
      this.spd[i] = Math.sqrt(Math.random()) * 0.85 + 0.15;
      this.twist[i] = rand(-1.2, 1.2);
      // Sweep in left to right
      const u = clamp((xs[i] - lx) / tw, 0, 1);
      this.delay[i] = clamp(0.08 + 0.28 * u + rand(0, 0.05), 0, 0.42);
      this.arc[i] = rand(-0.35, 0.35);
      this.tw[i] = rand(0, Math.PI * 2);
    }
    this.fresh = true;
  }

  render(f: Frame) {
    const { ctx, w, h, t, dt, weight, sprites, mx, my } = f;
    // The singularity charges while Tesla's glyphs fall in (morph-in). Once the implosion
    // lands, the finale runs its own clock so the supernova is never rushed by the 1.4 s
    // act-to-act glide; leaving plays it back in reverse.
    const pre = PRE * f.morphIn;
    if (f.resumed) this.clock = pre;
    if (f.morphIn >= 1) this.clock = Math.min(1, Math.max(this.clock, pre) + dt / FINALE_SECONDS);
    else this.clock = Math.max(pre, this.clock - dt * 1.4);
    const L = this.clock;
    const cx = w / 2;
    const cy = h / 2;
    const motion = f.reduced ? 0.3 : 1;
    if (f.resumed) this.fresh = true;

    // phase curves ------------------------------------------------------------
    // spin-up → implosion (the disk is sucked in, the light dies) → one beat of darkness →
    // detonation: white-out, camera kick, shock fronts, debris → slow drift → logo.
    const D = DETONATE;
    const blown = L >= D;
    const since = blown ? (L - D) * FINALE_SECONDS : 0; // seconds since detonation
    const charge = smoothstep(0, 0.3, L); // singularity spins up
    const collapse = smoothstep(0.285, D - 0.01, L); // final implosion
    const sing = blown ? 0 : 1;
    const flash = blown ? Math.exp(-since * 3.2) : 0; // white-out
    const boom = blown ? Math.exp(-since * 0.9) : 0; // lingering bloom
    const e = easeOutExpo(clamp((L - D) / 0.3)); // ejecta: instant burst, long hang
    const c = clamp((L - 0.54) / 0.37); // coalescence
    const settle = smoothstep(0.86, 0.97, L);
    const R = Math.hypot(w, h) * 0.55;

    // Trigger audio effects synchronized with the implosion, explosion & wordmark illumination
    if (blown && weight > 0.3) {
      soundController.playExplosion();
    } else if (!blown && charge > 0.05 && weight > 0.4) {
      soundController.playCharge();
    } else if (L < D * 0.3) {
      soundController.resetFinaleTriggers();
    }

    // camera kick: a hard jolt on detonation that rings down over ~1 s
    if (blown && !f.reduced) {
      const amp = 18 * Math.exp(-since * 3.4) * weight;
      if (amp > 0.15) {
        ctx.translate(
          (Math.sin(t * 83.1) + 0.5 * Math.sin(t * 41.7)) * amp,
          (0.8 * Math.cos(t * 71.3) + 0.4 * Math.sin(t * 29.9)) * amp,
        );
      }
    }

    ctx.globalCompositeOperation = 'lighter';

    // spinning singularity ----------------------------------------------------
    if (sing > 0.002) {
      const shake = charge * charge * charge * 0.07 + collapse * 0.12;
      const tremble = 1 + shake * Math.sin(t * 41);
      const rs = (8 + 24 * charge) * tremble * (1 - 0.9 * collapse);
      // the light drains away in the last instant before the blast
      const a = weight * (1 - 0.75 * smoothstep(0.6, 1, collapse));
      drawSprite(ctx, sprites.whiteHalo, cx, cy, rs * 9 + 60, (0.25 + 0.45 * charge) * a);
      // a white-hot pinpoint brightens as everything is crushed into it
      drawSprite(ctx, sprites.white, cx, cy, 10 + 50 * collapse, collapse * weight);
      for (let i = 0; i < SWIRL; i++) {
        const u = this.su[i];
        const rad = rs * (1.5 + 6 * Math.pow(u, 1.3)) * (1 - 0.35 * charge) * (1 - 0.75 * collapse);
        const om = (0.9 + 2.4 / (u + 0.25)) * (0.6 + 1.6 * charge) * motion;
        const ang = this.sa[i] + t * om;
        const prev = ang - om * 0.06;
        const flat = 0.42; // inclined disk
        const x1 = cx + Math.cos(ang) * rad;
        const y1 = cy + Math.sin(ang) * rad * flat;
        const x0 = cx + Math.cos(prev) * rad;
        const y0 = cy + Math.sin(prev) * rad * flat;
        const al = (0.25 + 0.75 * charge) * (1 - 0.5 * u) * a;
        this.swirl.add(u < 0.35 ? 0 : 1, al, u < 0.3 ? 1 : 0, x0, y0, x1, y1);
      }
      this.swirl.flush(ctx);
      // event horizon + photon ring
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = Math.min(1, a * 1.5);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, rs, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(255,255,255,${(0.85 * a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, rs * 1.12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 5;
      ctx.strokeStyle = `rgba(212,212,216,${(0.12 * a).toFixed(3)})`;
      ctx.stroke();
    }

    // supernova: white-out, bloom, anamorphic flare, shock fronts, debris ------------
    if (blown) {
      const big = Math.max(w, h);
      // full-screen white-out that decays in ~0.7 s
      if (flash > 0.004) {
        ctx.globalAlpha = Math.min(1, (f.reduced ? 0.35 : 0.9) * flash * weight);
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(-40, -40, w + 80, h + 80);
        ctx.globalAlpha = 1;
      }
      if (boom > 0.002) {
        drawSprite(ctx, sprites.whiteHalo, cx, cy, big * (0.35 + 1.8 * e), boom * weight);
        drawSprite(ctx, sprites.white, cx, cy, big * (0.5 + 1.5 * e), 0.7 * boom * weight);
        // horizontal lens streak through the core
        const fa = 0.9 * boom * weight;
        if (fa > 0.01) {
          const lg = ctx.createLinearGradient(0, 0, w, 0);
          lg.addColorStop(0, 'rgba(255,255,255,0)');
          lg.addColorStop(0.5, `rgba(255,255,255,${fa.toFixed(3)})`);
          lg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = lg;
          const th = 1.5 + 9 * flash;
          ctx.fillRect(0, cy - th / 2, w, th);
        }
      }

      // two shock fronts: the main blast and a softer echo a quarter-second behind it
      const fronts: [number, number][] = [
        [0, 1],
        [0.28, 0.55],
      ];
      for (const [lag, str] of fronts) {
        const s = since - lag;
        if (s <= 0 || s > 2.6) continue;
        const k = easeOutExpo(s / 2.6);
        const rr = R * 1.3 * k;
        const fade = Math.pow(1 - k, 1.1) * weight * str;
        const rings: [number, number, string, number][] = [
          [1, 36, '212,212,216', 0.08],
          [1, 10, '255,255,255', 0.25],
          [1, 2, '255,255,255', 0.95],
          [0.9, 1, '212,212,216', 0.5],
        ];
        for (const [kk, lw, rgb, al] of rings) {
          ctx.lineWidth = lw;
          ctx.strokeStyle = `rgba(${rgb},${(al * fade).toFixed(3)})`;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rr * kk, rr * kk * 0.92, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // debris sparks: fast radial streaks that decelerate and burn out
      for (let i = 0; i < SPARKS; i++) {
        const life = this.kLife[i];
        if (since >= life) continue;
        const u = since / life;
        const reach = this.kSpd[i] * R * 1.35;
        const r1 = reach * (1 - Math.exp(-since * 2.8));
        const r0 = reach * (1 - Math.exp(-Math.max(0, since - 0.07) * 2.8));
        const ca = Math.cos(this.kDir[i]);
        const sa = Math.sin(this.kDir[i]) * 0.92;
        const hot = since < 0.35 ? 0 : this.kCol[i];
        this.sparks.add(hot, Math.pow(1 - u, 1.6) * weight, this.kSpd[i] > 1.1 ? 1 : 0, cx + ca * r0, cy + sa * r0, cx + ca * r1, cy + sa * r1);
      }
      this.sparks.flush(ctx);
    }

    // ejecta → logo --------------------------------------------------------
    if (blown && this.n > 0) {
      // PHYSICSMN ILLUMINATION & RADIANT GLOW
      // When settle > 0.02, the wordmark lights up with an ethereal starlight bloom
      if (settle > 0.02 && this.wordWidth > 10) {
        // Fade the canvas glow out in phase 2 (settle 0.55→0.82) — matches particle dissolve
        const glowFade = clamp(1 - smoothstep(0.55, 0.82, settle), 0, 1);
        const settleAura = smoothstep(0.02, 0.55, settle) * weight * glowFade;
        const breathe = 0.88 + 0.12 * Math.sin(t * 2.8);
        const intensity = settleAura * breathe;

        // Soft wide radial halo behind the letters
        drawSprite(ctx, sprites.whiteHalo, this.wordCx, this.wordCy, this.wordWidth * 1.5, 0.48 * intensity);

        // White starlight glow centers spread across the word
        const nPillars = 5;
        for (let p = 0; p < nPillars; p++) {
          const px = this.wordCx - this.wordWidth * 0.4 + (this.wordWidth * 0.8 * p) / (nPillars - 1);
          drawSprite(ctx, sprites.white, px, this.wordCy, 80, 0.2 * intensity);
        }

        // Horizontal starlight flare beam through the wordmark
        const gleamA = 0.52 * intensity;
        if (gleamA > 0.01) {
          const halfSpan = this.wordWidth * 0.75;
          const gl = ctx.createLinearGradient(
            this.wordCx - halfSpan,
            this.wordCy,
            this.wordCx + halfSpan,
            this.wordCy,
          );
          gl.addColorStop(0, 'rgba(255,255,255,0)');
          gl.addColorStop(0.2, `rgba(255,255,255,${(gleamA * 0.35).toFixed(3)})`);
          gl.addColorStop(0.5, `rgba(255,255,255,${gleamA.toFixed(3)})`);
          gl.addColorStop(0.8, `rgba(255,255,255,${(gleamA * 0.35).toFixed(3)})`);
          gl.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gl;
          const beamH = 2.4 + 1.4 * Math.sin(t * 3.5);
          ctx.fillRect(this.wordCx - halfSpan, this.wordCy - beamH / 2, halfSpan * 2, beamH);
        }
      }

      const gain = interactionGain(weight) * settle;
      const step = Math.min(3, dt * 60);
      const spriteBy = [sprites.white, sprites.silver];
      const sizeSettled = this.dot;
      for (let i = 0; i < this.n; i++) {
        // explosion position (curled by a per-particle twist)
        const ang = this.dir[i] + this.twist[i] * e;
        const rad = this.spd[i] * R * e;
        const ex = cx + Math.cos(ang) * rad;
        const ey = cy + Math.sin(ang) * rad * 0.9;
        // staggered, eased flight home along a curved path
        const ci = easeInOutCubic(clamp((c - this.delay[i]) / (1 - 0.42)));
        const dx = this.tx[i] - ex;
        const dy = this.ty[i] - ey;
        const bend = Math.sin(Math.PI * ci) * this.arc[i];
        let x = ex + dx * ci - dy * bend;
        let y = ey + dy * ci + dx * bend;

        // assembled logo parts gently around the cursor and springs back
        if (gain > 0.01 || this.ox[i] !== 0 || this.oy[i] !== 0) {
          let gx = 0;
          let gy = 0;
          const hx = x - mx;
          const hy = y - my;
          const d2 = hx * hx + hy * hy;
          if (gain > 0.01 && d2 < HOVER_R * HOVER_R) {
            const d = Math.sqrt(d2) + 0.001;
            const fall = 1 - d / HOVER_R;
            const push = fall * fall * 14 * gain;
            gx = (hx / d) * push;
            gy = (hy / d) * push;
          }
          this.vx[i] = (this.vx[i] + (gx - this.ox[i]) * 0.12 * step) * Math.pow(0.8, step);
          this.vy[i] = (this.vy[i] + (gy - this.oy[i]) * 0.12 * step) * Math.pow(0.8, step);
          this.ox[i] += this.vx[i] * step;
          this.oy[i] += this.vy[i] * step;
          if (Math.abs(this.ox[i]) + Math.abs(this.oy[i]) + Math.abs(this.vx[i]) + Math.abs(this.vy[i]) < 0.01) {
            this.ox[i] = this.oy[i] = this.vx[i] = this.vy[i] = 0;
          }
          x += this.ox[i];
          y += this.oy[i];
        }

        // motion streaks from the previous frame while in flight
        if (!this.fresh) {
          const sx = x - this.px[i];
          const sy = y - this.py[i];
          if (sx * sx + sy * sy > 1.5) {
            const hot = ci < 0.5 ? 0 : this.col[i];
            this.streaks.add(hot, (0.45 + 0.4 * flash) * weight * (1 - settle), 0, x - sx * 2.2, y - sy * 2.2, x, y);
          }
        }
        this.px[i] = x;
        this.py[i] = y;

        const twinkle = 0.78 + 0.22 * Math.sin(t * 2.6 * motion + this.tw[i]);
        const hotSprite = sprites.white;
        const sprite = ci > 0.55 ? spriteBy[this.col[i]] : hotSprite;
        const size = (3.6 + 4 * (1 - e)) * (1 - ci) + sizeSettled * ci;
        const near = gain > 0.01 ? 1 + 0.35 * Math.max(0, 1 - Math.hypot(x - mx, y - my) / HOVER_R) : 1;
        
        // Phase 1 (settle 0→0.55): particles brighten and assemble — HTML not visible yet.
        // Phase 2 (settle 0.55→0.82): particles dissolve away completely — clean slate.
        // Phase 3 (settle 0.82→1.0): HTML wordmark fades in on empty space.
        // dissolveFade goes 1→0 strictly within settle 0.55–0.82 so both layers
        // never co-exist and the swap feels like a clean cut-through-light.
        const dissolveFade = clamp(1 - smoothstep(0.55, 0.82, settle), 0, 1);
        const peakSettle = Math.min(settle, 0.55) / 0.55; // 0→1 during phase 1 only
        const lightUpScale = 1 + 0.3 * peakSettle;
        const lightUpAlpha = (0.8 + 0.2 * ci) * twinkle * weight * (1 + 0.4 * peakSettle) * dissolveFade;
        drawSprite(ctx, sprite, x, y, size * near * lightUpScale, lightUpAlpha);

        // Extra radiant starlight sparkle — only during phase 1
        if (settle > 0.15 && settle < 0.55 && i % 6 === 0) {
          const spSpark = 0.5 + 0.5 * Math.sin(t * 5.0 + this.tw[i] * 3.0);
          drawSprite(ctx, sprites.white, x, y, size * 2.2, 0.4 * peakSettle * spSpark * weight);
        }
      }
      this.streaks.flush(ctx);
      this.fresh = false;
    }
    ctx.globalAlpha = 1;
  }
}
