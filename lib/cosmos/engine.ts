import { GenesisAct } from './acts/genesis';
import { FinaleAct } from './acts/finale';
import { TeslaAct } from './acts/tesla';
import { soundController } from './audio';
import { ACTS, actIndexAt, actWeight, damp, interactionGain, morphIn, morphOut } from './math';
import { Shockwaves } from './shockwaves';
import { createSprites, type Sprites } from './sprites';
import type { Act, Bridge, Frame } from './types';

/** Live readings shared with the DOM telemetry (read in its own rAF, never via React state). */
export const telemetry = {
  mx: 0,
  my: 0,
  nmx: 0,
  nmy: 0,
  progress: 0,
  act: 0,
  fps: 60,
  /** finale's own choreography clock, 0 → 1 (drives the launch CTA reveal) */
  finale: 0,
};

const MOUSE_LERP = 0.08;
const MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

export class CosmosEngine {
  private ctx: CanvasRenderingContext2D;
  private sprites: Sprites;
  private shocks = new Shockwaves();
  private acts: Act[];
  private tesla: TeslaAct;
  private finale: FinaleAct;
  private bridge: Bridge;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private raf = 0;
  private t0 = performance.now();
  private last = 0;
  private tx = 0;
  private ty = 0;
  private mx = 0;
  private my = 0;
  private progress = 0;
  private lastProgress = 0;
  private scrollSpeed = 0;
  private reduced = false;
  private monoFamily = 'monospace';
  private ro: ResizeObserver;
  private dprQuery: MediaQueryList | null = null;
  private cleanup: (() => void)[] = [];
  private frameIndex = 0;
  private lastRendered = new Array<number>(ACTS.length).fill(-10);

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
    this.sprites = createSprites();
    this.tesla = new TeslaAct();
    this.finale = new FinaleAct();
    this.acts = [new GenesisAct(), this.tesla, this.finale];

    const ANCHORS_N = MOBILE ? 400 : 600;
    const ATOMS_N = MOBILE ? 64 : 96;
    const bridgeX = new Float32Array(ANCHORS_N);
    const bridgeY = new Float32Array(ANCHORS_N);
    const bridgeOk = new Uint8Array(ANCHORS_N).fill(1);
    this.bridge = {
      anchors: (f) => {
        const cx = f.w / 2;
        const cy = f.h / 2;
        const rMax = Math.min(f.w, f.h) * 0.38;
        for (let i = 0; i < ANCHORS_N; i++) {
          const u = i / ANCHORS_N;
          const th = u * Math.PI * 2 * 5.618;
          const rad = Math.sqrt(u) * rMax;
          bridgeX[i] = cx + Math.cos(th) * rad;
          bridgeY[i] = cy + Math.sin(th) * rad * 0.85;
        }
        return { x: bridgeX, y: bridgeY, ok: bridgeOk };
      },
      atoms: (f) => {
        const cx = f.w / 2;
        const cy = f.h / 2;
        const rMax = Math.min(f.w, f.h) * 0.42;
        for (let i = 0; i < ATOMS_N; i++) {
          const u = i / ATOMS_N;
          const th = u * Math.PI * 2 * 3.618;
          const rad = Math.sqrt(u) * rMax;
          bridgeX[i] = cx + Math.cos(th) * rad;
          bridgeY[i] = cy + Math.sin(th) * rad * 0.82;
        }
        return { x: bridgeX, y: bridgeY, n: ATOMS_N };
      },
    };

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced = rm.matches;
    const onRm = () => (this.reduced = rm.matches);
    rm.addEventListener('change', onRm);
    this.cleanup.push(() => rm.removeEventListener('change', onRm));

    this.resolveFonts();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.mx = this.tx = this.w / 2;
    this.my = this.ty = this.h / 2;

    const onMove = (e: PointerEvent) => {
      this.tx = e.clientX;
      this.ty = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest('a,button,input,textarea,select,label,[role="button"],[data-no-shock]')) return;
      this.tx = e.clientX;
      this.ty = e.clientY;
      // shockwaves belong to Act I — later acts never receive them
      if (interactionGain(actWeight(this.progress, 0)) > 0.05) {
        this.shocks.add(e.clientX, e.clientY, this.now());
        soundController.playGravWave();
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    this.cleanup.push(() => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    });
  }

  private now() {
    return (performance.now() - this.t0) / 1000;
  }

  /** next/font exposes hashed family names via CSS variables — resolve them for canvas text. */
  private async resolveFonts() {
    const css = getComputedStyle(document.documentElement);
    const mono = css.getPropertyValue('--font-mono').trim();
    const display = css.getPropertyValue('--font-display').trim() || 'sans-serif';
    if (mono) this.monoFamily = mono;
    this.tesla.setFont(this.monoFamily);
    this.finale.setFont(display);
    try {
      await Promise.all([
        document.fonts.load(`400 12px ${this.monoFamily}`, '.·:+*#%@∑ΔθλπΩ'),
        document.fonts.load(`700 100px ${display}`, 'PHYSICSMN'),
      ]);
      await document.fonts.ready;
    } catch {
      /* fall back to whatever is available */
    }
    this.tesla.setFont(this.monoFamily);
    this.finale.setFont(display);
  }

  private watchDpr() {
    this.dprQuery?.removeEventListener('change', this.onDprChange);
    this.dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    this.dprQuery.addEventListener('change', this.onDprChange);
  }

  private onDprChange = () => this.resize();

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, MOBILE ? 1.5 : 2);
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    for (const a of this.acts) a.resize(w, h, dpr);
    this.watchDpr();
  }

  setProgress(p: number) {
    this.progress = p;
  }

  start() {
    if (this.raf) return;
    this.last = this.now();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Dev-only: average CPU cost of a frame at a given scroll progress. */
  benchmark(progress: number, frames = 60) {
    const prev = this.progress;
    this.progress = this.lastProgress = progress;
    this.frame();
    const t0 = performance.now();
    for (let i = 0; i < frames; i++) this.frame();
    const ms = (performance.now() - t0) / frames;
    this.progress = prev;
    return ms;
  }

  private frame() {
    const t = this.now();
    const dt = Math.min(0.05, Math.max(0.001, t - this.last));
    this.last = t;
    telemetry.fps += (1 / dt - telemetry.fps) * 0.05;

    // pointer: linear interpolation (0.08 @ 60fps, frame-rate independent)
    const k = damp(MOUSE_LERP, dt);
    this.mx += (this.tx - this.mx) * k;
    this.my += (this.ty - this.my) * k;

    const p = this.progress;
    const v = Math.abs(p - this.lastProgress) / dt;
    this.lastProgress = p;
    this.scrollSpeed += (v - this.scrollSpeed) * damp(0.1, dt);

    const { ctx, w, h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, w, h);

    const f: Frame = {
      ctx,
      w,
      h,
      dpr,
      t,
      dt,
      mx: this.mx,
      my: this.my,
      rawMx: this.tx,
      rawMy: this.ty,
      nmx: (this.mx / w) * 2 - 1,
      nmy: (this.my / h) * 2 - 1,
      progress: p,
      scrollSpeed: this.scrollSpeed,
      weight: 0,
      morphIn: 1,
      morphOut: 0,
      resumed: false,
      sprites: this.sprites,
      shocks: this.shocks,
      reduced: this.reduced,
      monoFamily: this.monoFamily,
      bridge: this.bridge,
    };

    this.frameIndex++;
    for (let i = 0; i < ACTS.length; i++) {
      const wgt = actWeight(p, i);
      const mIn = morphIn(p, i);
      // an incoming act renders through its whole morph window (it builds itself out of the outgoing one)
      if (wgt < 0.002 && !(mIn > 0 && mIn < 1)) continue;
      f.weight = wgt;
      f.morphIn = mIn;
      f.morphOut = morphOut(p, i);
      f.resumed = this.lastRendered[i] !== this.frameIndex - 1;
      this.lastRendered[i] = this.frameIndex;
      ctx.save();
      this.acts[i].render(f);
      ctx.restore();
    }
    this.shocks.draw(ctx, t, this.sprites);

    telemetry.mx = this.mx;
    telemetry.my = this.my;
    telemetry.nmx = f.nmx;
    telemetry.nmy = f.nmy;
    telemetry.progress = p;
    telemetry.act = actIndexAt(p);
    telemetry.finale = actWeight(p, ACTS.length - 1) > 0.002 ? this.finale.clock : 0;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro.disconnect();
    this.dprQuery?.removeEventListener('change', this.onDprChange);
    this.cleanup.forEach((fn) => fn());
  }
}
