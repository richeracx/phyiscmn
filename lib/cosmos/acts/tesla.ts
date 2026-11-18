import { ASH, SILVER, WHITE, TESLA_EYE_BOXES, clamp, easeInOutCubic, smoothstep, interactionGain, type RGB } from '../math';
import { drawSprite } from '../sprites';
import type { Act, Frame } from '../types';

const CELL_W = 8;
const CELL_H = 10;
const RAMP = ' .·:+*#%@∑ΔθλπΩ';
const G = { dot: RAMP.indexOf('·'), colon: RAMP.indexOf(':'), hash: RAMP.indexOf('#'), at: RAMP.indexOf('@'), omega: RAMP.indexOf('Ω') };
const LEVELS = 28;
const ROW_WHITE = LEVELS;
const ROW_GOLD = LEVELS + 1;
const ROW_SCLERA = LEVELS + 2;
const ROW_IRIS = LEVELS + 3;
const ROWS_TOTAL = LEVELS + 4;
const FIELD_R = 160;
/** Horizontal focal point (between the eyes) kept centred on narrow screens. */
const FOCAL_X = 0.462;

/** Virtual eyeball depth behind the screen, CSS px — larger = calmer, less twitchy gaze. */
const EYE_DEPTH = 320;
/** Gaze follow time, seconds (critically damped: no overshoot, no lag tail). */
const GAZE_TIME = 0.085;
/** Iris glyph offsets around the pupil, in cell units. */
const IRIS_RING: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-0.8, -0.8],
  [0.8, -0.8],
  [-0.8, 0.8],
  [0.8, 0.8],
];

/** Critically-damped spring toward `target` (Game Programming Gems 4 SmoothDamp). Returns [value, velocity]. */
function smoothDamp(cur: number, target: number, vel: number, time: number, dt: number): [number, number] {
  const omega = 2 / time;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (vel + omega * change) * dt;
  return [target + (change + temp) * exp, (vel - omega * temp) * exp];
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** #52525B deep shadows → #D4D4D8 silver midtones → #FFFFFF crisp highlights. */
function levelColor(t: number): string {
  let c: RGB;
  if (t < 0.62) c = mix(ASH, SILVER, smoothstep(0.08, 0.62, t));
  else c = mix(SILVER, WHITE, smoothstep(0.7, 0.96, t));
  const dim = 0.42 + 0.58 * smoothstep(0, 0.22, t);
  return `rgb(${Math.round(c[0] * dim)},${Math.round(c[1] * dim)},${Math.round(c[2] * dim)})`;
}

interface Eye {
  /** socket ellipse (inscribed in the bounding box), CSS px */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** smoothed continuous pupil offset from the socket centre */
  px: number;
  py: number;
  /** pupil velocity for the critically-damped follow */
  vx: number;
  vy: number;
  /** cell indices (into the visible-cell arrays) that belong to this socket */
  cells: number[];
}

/**
 * ACT V — 100% pure-ASCII Tesla.
 * Every pixel of the portrait is a glyph on one uniform 8 × 10 px grid sampled via an
 * invisible offscreen canvas. The eyes are part of that grid: each socket renders light
 * sclera glyphs and a tight grid-snapped pupil cluster that travels along the unit
 * vector toward the cursor, clamped inside the socket — no sprites, no overlays.
 * On exit the glyphs spiral inward into Act VI's accretion disk.
 */
export class TeslaAct implements Act {
  private img: HTMLImageElement | null = null;
  private ready = false;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private atlas: HTMLCanvasElement | null = null;
  private cache: HTMLCanvasElement | null = null;
  private cacheDirty = true;
  private dyn = new Int32Array(0);
  private dynLvl = new Uint8Array(0);
  private monoFamily = 'monospace';

  // visible cells
  private n = 0;
  private bx = new Float32Array(0);
  private by = new Float32Array(0);
  private glyph = new Uint8Array(0);
  private level = new Uint8Array(0);
  private seed = new Float32Array(0);
  private eye = new Uint8Array(0); // 0 = face, 1/2 = socket of eye k-1
  private ox = new Float32Array(0);
  private oy = new Float32Array(0);
  private vx = new Float32Array(0);
  private vy = new Float32Array(0);

  private eyes: Eye[] = [0, 1].map(() => ({ cx: 0, cy: 0, rx: 1, ry: 1, px: 0, py: 0, vx: 0, vy: 0, cells: [] }));

  constructor() {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.decoding = 'async';
    img.src = '/assets/tesla.jpg';
    img.onload = () => {
      this.img = img;
      this.ready = true;
      this.sample();
    };
  }

  setFont(family: string) {
    this.monoFamily = family;
    this.buildAtlas();
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w;
    this.h = h;
    this.dpr = dpr;
    this.buildAtlas();
    this.sample();
  }

  private buildAtlas() {
    if (typeof document === 'undefined') return;
    const cw = Math.ceil(CELL_W * this.dpr);
    const ch = Math.ceil(CELL_H * this.dpr);
    const c = this.atlas ?? document.createElement('canvas');
    c.width = cw * RAMP.length;
    c.height = ch * ROWS_TOTAL;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `400 ${(10.5 * this.dpr).toFixed(2)}px ${this.monoFamily}`;
    const special: Record<number, string> = {
      [ROW_WHITE]: '#FFFFFF',
      [ROW_GOLD]: '#E4E4E7',
      [ROW_SCLERA]: '#9A9AA3',
      [ROW_IRIS]: '#5F5F68',
    };
    for (let row = 0; row < ROWS_TOTAL; row++) {
      g.fillStyle = special[row] ?? levelColor(row / (LEVELS - 1));
      for (let gi = 1; gi < RAMP.length; gi++) {
        g.save();
        g.beginPath();
        g.rect(gi * cw, row * ch, cw, ch);
        g.clip();
        g.fillText(RAMP[gi], gi * cw + cw / 2, row * ch + ch / 2 + 0.5 * this.dpr);
        g.restore();
      }
    }
    this.atlas = c;
    this.cacheDirty = true;
  }

  /** Portrait placement in CSS px: cover-fit, aspect preserved, centred on the eyes; lifted on mobile. */
  private layout() {
    const img = this.img!;
    const s = Math.max(this.w / img.naturalWidth, this.h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    const ox = clamp(this.w / 2 - FOCAL_X * dw, this.w - dw, 0);
    // < 768px: shift the face upward so the bottom caption never covers it
    const lift = this.w < 768 ? this.h * 0.1 : 0;
    const oy = (this.h - dh) / 2 - lift;
    return { dw, dh, ox, oy };
  }

  private sample() {
    if (!this.ready || !this.img || typeof document === 'undefined') return;
    const cols = Math.ceil(this.w / CELL_W);
    const rows = Math.ceil(this.h / CELL_H);
    const off = document.createElement('canvas'); // invisible, never attached to the DOM
    off.width = cols;
    off.height = rows;
    const g = off.getContext('2d', { willReadFrequently: true })!;
    g.fillStyle = '#000000';
    g.fillRect(0, 0, cols, rows);
    const { dw, dh, ox, oy } = this.layout();
    g.imageSmoothingQuality = 'high';
    // divide x by cell width and y by cell height so non-square cells keep the aspect ratio
    g.drawImage(this.img, ox / CELL_W, oy / CELL_H, dw / CELL_W, dh / CELL_H);
    const data = g.getImageData(0, 0, cols, rows).data;

    // eye sockets: normalised bounding boxes → inscribed ellipses in CSS px
    TESLA_EYE_BOXES.forEach((b, k) => {
      const e = this.eyes[k];
      const x0 = ox + b.x0 * dw;
      const x1 = ox + b.x1 * dw;
      const y0 = oy + b.y0 * dh;
      const y1 = oy + b.y1 * dh;
      e.cx = (x0 + x1) / 2;
      e.cy = (y0 + y1) / 2;
      e.rx = Math.max(CELL_W * 1.6, (x1 - x0) / 2);
      e.ry = Math.max(CELL_H * 1.05, (y1 - y0) / 2);
      e.cells = [];
    });

    const total = cols * rows;
    const bx = new Float32Array(total);
    const by = new Float32Array(total);
    const glyph = new Uint8Array(total);
    const level = new Uint8Array(total);
    const seed = new Float32Array(total);
    const eye = new Uint8Array(total);
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * CELL_W;
        const y = r * CELL_H;
        const cxp = x + CELL_W / 2;
        const cyp = y + CELL_H / 2;
        let socket = 0;
        this.eyes.forEach((e, k) => {
          const ex = (cxp - e.cx) / e.rx;
          const ey = (cyp - e.cy) / e.ry;
          if (ex * ex + ey * ey <= 1) socket = k + 1;
        });
        const p = (r * cols + c) * 4;
        let lum = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
        lum = Math.pow(clamp((lum - 0.035) / 0.9), 0.92);
        if (lum < 0.035 && !socket) continue;
        bx[n] = x;
        by[n] = y;
        glyph[n] = 1 + Math.min(RAMP.length - 2, Math.floor(lum * (RAMP.length - 1)));
        level[n] = Math.min(LEVELS - 1, Math.floor(lum * LEVELS));
        seed[n] = Math.random();
        eye[n] = socket;
        if (socket) this.eyes[socket - 1].cells.push(n);
        n++;
      }
    }
    this.n = n;
    this.bx = bx.slice(0, n);
    this.by = by.slice(0, n);
    this.glyph = glyph.slice(0, n);
    this.level = level.slice(0, n);
    this.seed = seed.slice(0, n);
    this.eye = eye.slice(0, n);
    this.ox = new Float32Array(n);
    this.oy = new Float32Array(n);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.dyn = new Int32Array(n);
    this.dynLvl = new Uint8Array(n);
    this.cacheDirty = true;
  }

  /**
   * Magnetic field: glyphs gravitate toward the pointer with spring relaxation.
   * `gain` gates the pull by this act's weight. Returns the boosted level, or −1 at rest.
   */
  private field(j: number, mx: number, my: number, step: number, gain: number) {
    const dx = mx - (this.bx[j] + CELL_W / 2);
    const dy = my - (this.by[j] + CELL_H / 2);
    const d2 = dx * dx + dy * dy;
    let ox = this.ox[j];
    let oy = this.oy[j];
    const inField = gain > 0.01 && d2 < FIELD_R * FIELD_R;
    if (!inField && ox * ox + oy * oy + this.vx[j] * this.vx[j] + this.vy[j] * this.vy[j] < 0.0004) {
      if (ox !== 0 || oy !== 0) {
        this.ox[j] = this.oy[j] = this.vx[j] = this.vy[j] = 0;
        return this.level[j];
      }
      return -1;
    }
    let tx = 0;
    let ty = 0;
    let lvl = this.level[j];
    if (inField) {
      const fall = 1 - Math.sqrt(d2) / FIELD_R;
      const pull = fall * fall * 0.38 * gain;
      tx = dx * pull;
      ty = dy * pull;
      lvl = Math.min(LEVELS - 1, lvl + Math.round(fall * 7 * gain));
    }
    const damping = Math.pow(0.78, step);
    const vx = (this.vx[j] + (tx - ox) * 0.13 * step) * damping;
    const vy = (this.vy[j] + (ty - oy) * 0.13 * step) * damping;
    ox += vx * step;
    oy += vy * step;
    this.vx[j] = vx;
    this.vy[j] = vy;
    this.ox[j] = ox;
    this.oy[j] = oy;
    return lvl;
  }

  /**
   * Aim each pupil at the cursor as if the eyeball sat EYE_DEPTH px behind the screen:
   * the offset is the projected look direction (dx / √(dx² + dy² + Z²)), so it grows
   * smoothly with distance instead of snapping to the rim, and both eyes converge on the
   * same point. Tracking uses the raw pointer and a critically-damped follow, so the gaze
   * starts and stops softly without trailing behind the cursor.
   */
  private updateGaze(mx: number, my: number, dt: number, gain: number) {
    for (const e of this.eyes) {
      const dx = mx - e.cx;
      const dy = my - e.cy;
      const inv = 1 / Math.sqrt(dx * dx + dy * dy + EYE_DEPTH * EYE_DEPTH);
      const ax = Math.max(0, e.rx - CELL_W * 1.1);
      const ay = Math.max(0, e.ry - CELL_H * 0.75);
      // gentle over-reach so the pupil actually touches the rim when you point far away
      const tx = clamp(dx * inv * 1.35, -1, 1) * ax * gain;
      const ty = clamp(dy * inv * 1.35, -1, 1) * ay * gain;
      [e.px, e.vx] = smoothDamp(e.px, tx, e.vx, GAZE_TIME, dt);
      [e.py, e.vy] = smoothDamp(e.py, ty, e.vy, GAZE_TIME, dt);
    }
  }

  /**
   * Live socket: sclera glyphs stay on the grid, while the iris ring and pupil glide at
   * sub-cell precision so the eye moves continuously instead of hopping cell to cell.
   */
  private drawEyes(ctx: CanvasRenderingContext2D, atlas: HTMLCanvasElement, cw: number, ch: number) {
    for (const e of this.eyes) {
      const pcx = e.cx + e.px;
      const pcy = e.cy + e.py;
      for (const j of e.cells) {
        const qx = (this.bx[j] + CELL_W / 2 - pcx) / (CELL_W * 1.45);
        const qy = (this.by[j] + CELL_H / 2 - pcy) / (CELL_H * 1.45);
        if (qx * qx + qy * qy < 1) continue; // under the iris
        ctx.drawImage(atlas, G.dot * cw, ROW_SCLERA * ch, cw, ch, this.bx[j], this.by[j], CELL_W, CELL_H);
      }
      for (const [ox, oy] of IRIS_RING) {
        const x = pcx + ox * CELL_W;
        const y = pcy + oy * CELL_H;
        const ux = (x - e.cx) / e.rx;
        const uy = (y - e.cy) / e.ry;
        if (ux * ux + uy * uy > 1.15) continue; // the lid hides what leaves the socket
        ctx.drawImage(atlas, G.colon * cw, ROW_IRIS * ch, cw, ch, x - CELL_W / 2, y - CELL_H / 2, CELL_W, CELL_H);
      }
      ctx.drawImage(atlas, G.at * cw, ROW_WHITE * ch, cw, ch, pcx - CELL_W / 2, pcy - CELL_H / 2, CELL_W, CELL_H);
    }
  }

  /**
   * Glyph + colour row for a socket cell. The pupil is a compact 1–2 glyph core: a white
   * '@', plus a gold '#' on the side the pupil is drifting toward when it sits between
   * cells — ringed by darker ':' iris and '·' sclera glyphs.
   */
  private socketGlyph(j: number): [number, number] {
    const e = this.eyes[this.eye[j] - 1];
    const pxC = (e.cx + e.px - CELL_W / 2) / CELL_W;
    const pyC = (e.cy + e.py - CELL_H / 2) / CELL_H;
    const pc = Math.round(pxC);
    const pr = Math.round(pyC);
    const frac = pxC - pc;
    const dc = Math.round(this.bx[j] / CELL_W) - pc;
    const dr = Math.round(this.by[j] / CELL_H) - pr;
    if (dc === 0 && dr === 0) return [G.at, ROW_WHITE]; // pupil core
    if (dr === 0 && Math.abs(frac) > 0.22 && dc === Math.sign(frac)) return [G.hash, ROW_GOLD]; // 2nd core glyph
    if (Math.abs(dc) <= 1 && Math.abs(dr) <= 1) return [G.colon, ROW_IRIS]; // iris border
    return [G.dot, ROW_SCLERA]; // sclera
  }

  private glyphFor(j: number, lvl: number): [number, number] {
    if (this.eye[j]) return this.socketGlyph(j);
    return [this.glyph[j], lvl];
  }

  private bakeCache() {
    if (!this.atlas) return;
    const c = this.cache ?? document.createElement('canvas');
    c.width = Math.round(this.w * this.dpr);
    c.height = Math.round(this.h * this.dpr);
    const g = c.getContext('2d')!;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.w, this.h);
    g.globalCompositeOperation = 'lighter';
    const cw = Math.ceil(CELL_W * this.dpr);
    const ch = Math.ceil(CELL_H * this.dpr);
    for (let j = 0; j < this.n; j++) {
      if (this.eye[j]) continue; // sockets are live every frame
      g.drawImage(this.atlas, this.glyph[j] * cw, this.level[j] * ch, cw, ch, this.bx[j], this.by[j], CELL_W, CELL_H);
    }
    this.cache = c;
    this.cacheDirty = false;
  }

  render(f: Frame) {
    if (!this.ready || !this.atlas || this.n === 0) return;
    const { ctx, dt, weight, mx, my, w, h, sprites, morphIn, morphOut } = f;
    const atlas = this.atlas;
    const cw = Math.ceil(CELL_W * this.dpr);
    const ch = Math.ceil(CELL_H * this.dpr);
    const settled = morphIn >= 1 && morphOut === 0;
    const step = Math.min(3, dt * 60);
    // cursor interactions belong to this act only while it owns the screen
    const gain = interactionGain(weight) * (1 - morphOut);

    this.updateGaze(f.rawMx, f.rawMy, dt, gain);
    ctx.globalCompositeOperation = 'lighter';

    if (settled) {
      ctx.globalAlpha = Math.min(1, weight * 1.4);
      // Fast path: one blit of the cached portrait, then patch only disturbed cells + the live sockets.
      if (this.cacheDirty) this.bakeCache();
      ctx.drawImage(this.cache!, 0, 0, w, h);
      let nd = 0;
      for (let j = 0; j < this.n; j++) {
        if (this.eye[j]) continue;
        const lvl = this.field(j, mx, my, step, gain);
        if (lvl < 0) continue;
        this.dyn[nd] = j;
        this.dynLvl[nd] = lvl;
        nd++;
      }
      if (nd > 0) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000000';
        for (let q = 0; q < nd; q++) ctx.fillRect(this.bx[this.dyn[q]], this.by[this.dyn[q]], CELL_W, CELL_H);
        ctx.globalCompositeOperation = 'lighter';
        for (let q = 0; q < nd; q++) {
          const j = this.dyn[q];
          ctx.drawImage(atlas, this.glyph[j] * cw, this.dynLvl[q] * ch, cw, ch, this.bx[j] + this.ox[j], this.by[j] + this.oy[j], CELL_W, CELL_H);
        }
      }
      this.drawEyes(ctx, atlas, cw, ch);
      ctx.globalAlpha = 1;
      return;
    }

    // Morph paths -------------------------------------------------------------
    // III → IV crystallisation: each glyph begins as a spark thrown off one of Act III's
    // nuclei and condenses onto its luminance cell, flashing gold as it locks.
    // IV → V implosion: glyphs peel off the grid (rim first) and spiral into the singularity.
    const cx = w / 2;
    const cy = h / 2;
    const rMax = Math.hypot(w, h) / 2;
    ctx.globalAlpha = morphIn < 1 ? 1 : Math.min(1, weight * 1.4);
    const atoms = morphIn < 1 ? f.bridge.atoms(f) : null;
    for (let j = 0; j < this.n; j++) {
      const sd = this.seed[j];
      const kIn = morphIn >= 1 ? 1 : easeInOutCubic(clamp((morphIn - sd * 0.45) / 0.55));
      if (kIn <= 0) continue;
      const boosted = this.eye[j] || morphOut > 0 || kIn < 1 ? -1 : this.field(j, mx, my, step, gain);
      let [gi, row] = this.glyphFor(j, boosted < 0 ? this.level[j] : boosted);
      let x = this.bx[j] + this.ox[j];
      let y = this.by[j] + this.oy[j];

      if (kIn < 1) {
        let sx = this.bx[j] + (sd - 0.5) * 70;
        let sy = this.by[j];
        if (atoms && atoms.n > 0) {
          const k = (j * 7919) % atoms.n;
          const a = sd * 40.7;
          sx = atoms.x[k] + Math.cos(a) * 10 - CELL_W / 2;
          sy = atoms.y[k] + Math.sin(a) * 10 - CELL_H / 2;
        }
        x = sx + (x - sx) * kIn;
        y = sy + (y - sy) * kIn;
        if (kIn < 0.82) {
          // still a photon in flight
          drawSprite(ctx, sprites.whiteSm, x + CELL_W / 2, y + CELL_H / 2, 5 + 3 * (1 - kIn), 0.9);
          continue;
        }
        if (kIn < 0.93) row = ROW_GOLD; // lock flash
      }

      if (morphOut > 0) {
        const rx = x + CELL_W / 2 - cx;
        const ry = y + CELL_H / 2 - cy;
        const r = Math.hypot(rx, ry);
        // peel order: rim first, then inward
        const delay = (1 - Math.min(1, r / rMax)) * 0.32 + sd * 0.08;
        const sOut = clamp((morphOut - delay) / 0.6);
        if (sOut > 0) {
          const sink = sOut * sOut;
          if (sink > 0.985) continue; // swallowed
          // inner glyphs whirl faster (ω ∝ r^−3/2) as every radius contracts to the singularity
          const th = Math.atan2(ry, rx) + sOut * (1.6 + 140 / Math.sqrt(r + 40));
          const lift = 1 + 0.1 * Math.sin(Math.PI * Math.min(1, sOut * 2.2)); // the peel
          const rr = r * Math.pow(1 - sink, 1.6) * lift;
          x = cx + Math.cos(th) * rr - CELL_W / 2;
          y = cy + Math.sin(th) * rr - CELL_H / 2;
          if (sOut > 0.4 && row < LEVELS) row = row > LEVELS * 0.5 ? ROW_GOLD : row;
        }
      }
      ctx.drawImage(atlas, gi * cw, row * ch, cw, ch, x, y, CELL_W, CELL_H);
    }
    ctx.globalAlpha = 1;
  }
}
