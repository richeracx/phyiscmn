import { SILVER, WHITE, clamp, easeInOutCubic, easeOutExpo, rand, smoothstep, interactionGain } from '../math';
import { SegmentBatch, drawSprite } from '../sprites';
import { soundController } from '../audio';
import type { Act, Frame } from '../types';

const STAR_COUNT = 3200;

/**
 * ACT I — Singularity & Big Bang cosmic starfield expansion.
 * 3,200 star-streaks flying past the camera in true 3D space,
 * with mouse-driven camera pitch / yaw and an intro expansion from a point.
 */
export class GenesisAct implements Act {
  private x = new Float32Array(STAR_COUNT);
  private y = new Float32Array(STAR_COUNT);
  private z = new Float32Array(STAR_COUNT);
  private px = new Float32Array(STAR_COUNT);
  private py = new Float32Array(STAR_COUNT);
  private fresh = new Uint8Array(STAR_COUNT);
  private col = new Uint8Array(STAR_COUNT);
  private size = new Float32Array(STAR_COUNT);
  private batch = new SegmentBatch([WHITE, SILVER], 6, [0.5, 0.9, 1.5]);
  private fov = 800;
  private spread = 1800;
  private depth = 4800;
  private w = 1;

  private yaw = 0;
  private pitch = 0;
  private disp: [number, number] = [0, 0];

  resize(w: number, h: number) {
    const first = this.w === 1;
    this.w = w;

    this.fov = Math.max(w, h) * 0.46;
    this.spread = this.fov * 2.4;
    this.depth = this.fov * 6;
    if (first) {
      for (let i = 0; i < STAR_COUNT; i++) this.spawn(i, true);
    }
  }

  private spawn(i: number, anywhere: boolean) {
    // keep a small empty core so nothing parks dead-centre forever
    let x = 0;
    let y = 0;
    do {
      x = rand(-1, 1) * this.spread;
      y = rand(-1, 1) * this.spread;
    } while (x * x + y * y < (this.spread * 0.05) ** 2);
    this.x[i] = x;
    this.y[i] = y;
    this.z[i] = anywhere ? rand(-this.fov * 0.6, this.depth) : this.depth + rand(0, this.fov);
    this.fresh[i] = 1;
    const r = Math.random();
    this.col[i] = r < 0.65 ? 0 : 1; // pure white & silver starlight
    this.size[i] = rand(0.6, 1.4) * (Math.random() < 0.04 ? 2.2 : 1);
  }

  /** world → screen using camera yaw/pitch about the eye; returns scale or -1 if behind. */
  private project(x: number, y: number, z: number, out: Float32Array, cx: number, cy: number, expand: number) {
    const zc = z + this.fov; // camera sits at z = -fov
    const cyw = Math.cos(this.yaw);
    const syw = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);
    const x1 = x * cyw + zc * syw;
    const z1 = -x * syw + zc * cyw;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    if (z2 < this.fov * 0.16) return -1;
    const scale = this.fov / z2; // ≡ fov / (fov + z) in the un-rotated frame
    out[0] = cx + x1 * scale * expand;
    out[1] = cy + y2 * scale * expand;
    out[2] = z2 - this.fov; // depth relative to screen plane, used for fog
    return scale;
  }

  private tmp = new Float32Array(3);
  private target = new Int32Array(STAR_COUNT);
  private assigned = false;

  /** Nearest visible mesh vertex for every star (spatial hash), computed once per morph. */
  private assignVertices(
    grid: { x: Float32Array; y: Float32Array; ok: Uint8Array },
    cx: number,
    cy: number,
    expand: number,
    w: number,
    h: number,
  ) {
    const CELL = 48;
    const gw = Math.ceil(w / CELL) + 1;
    const gh = Math.ceil(h / CELL) + 1;
    const buckets: number[][] = Array.from({ length: gw * gh }, () => []);
    const onScreen: number[] = [];
    for (let v = 0; v < grid.ok.length; v++) {
      if (!grid.ok[v]) continue;
      const x = grid.x[v];
      const y = grid.y[v];
      if (x < 0 || x > w || y < 0 || y > h) continue;
      buckets[Math.floor(y / CELL) * gw + Math.floor(x / CELL)].push(v);
      onScreen.push(v);
    }
    if (!onScreen.length) return;
    const out = this.tmp;
    for (let i = 0; i < STAR_COUNT; i++) {
      const sc = this.project(this.x[i], this.y[i], this.z[i], out, cx, cy, expand);
      const sx = clamp(sc < 0 ? Math.random() * w : out[0], 0, w - 1);
      const sy = clamp(sc < 0 ? Math.random() * h : out[1], 0, h - 1);
      if (sc < 0) {
        this.px[i] = sx;
        this.py[i] = sy;
      }
      const bx = Math.floor(sx / CELL);
      const by = Math.floor(sy / CELL);
      let best = -1;
      let bestD = Infinity;
      for (let r = 0; r <= 2 && best < 0; r++) {
        for (let yy = by - r; yy <= by + r; yy++) {
          for (let xx = bx - r; xx <= bx + r; xx++) {
            if (xx < 0 || yy < 0 || xx >= gw || yy >= gh) continue;
            for (const v of buckets[yy * gw + xx]) {
              const d = (grid.x[v] - sx) ** 2 + (grid.y[v] - sy) ** 2;
              if (d < bestD) {
                bestD = d;
                best = v;
              }
            }
          }
        }
      }
      this.target[i] = best >= 0 ? best : onScreen[(Math.random() * onScreen.length) | 0];
    }
    this.assigned = true;
  }

  render(f: Frame) {
    const { ctx, w, h, t, dt, weight, sprites, shocks } = f;
    if (f.resumed) this.fresh.fill(1);
    const cx = w / 2;
    const cy = h / 2;
    const motion = f.reduced ? 0.25 : 1;

    // camera tilt follows the (already lerped) pointer — only while Act I owns the screen
    const gain = interactionGain(weight);
    this.yaw = f.nmx * 0.2 * gain;
    this.pitch = -f.nmy * 0.13 * gain;

    // big-bang: everything expands out of a singular point during the first seconds
    const bang = f.reduced ? 1 : easeOutExpo(clamp(t / 2.6));
    const expand = 0.02 + 0.98 * bang;

    const actP = clamp(f.progress / 0.35);
    const speed =
      this.fov *
      motion *
      (0.92 + 2.2 * smoothstep(0, 1, actP) + Math.min(5, f.scrollSpeed * 28) + (1 - bang) * 6.0);
    const dz = speed * dt * (1 - smoothstep(0, 0.55, f.morphOut));
    const streakMul = 2.4 + Math.min(5, f.scrollSpeed * 32);
    if (f.scrollSpeed > 0.005 && weight > 0.5) soundController.playWarp();
    const shockOn = shocks.active;
    const out = this.tmp;

    ctx.globalCompositeOperation = 'lighter';

    // singularity flash
    if (bang < 1) {
      const k = 1 - bang;
      drawSprite(ctx, sprites.whiteHalo, cx, cy, Math.min(w, h) * (0.25 + 1.2 * bang), 0.9 * k * weight);
      drawSprite(ctx, sprites.white, cx, cy, Math.min(w, h) * (0.4 + 1.6 * bang), 0.6 * k * weight);
    }

    const spritesByCol = [sprites.white, sprites.silver];
    const fogDepth = this.depth + this.fov;

    // I → II warp collapse: decelerate, then snap each star onto the nearest point of the light paths
    const m = f.morphOut;
    const me = easeInOutCubic(m);
    let grid: ReturnType<Frame['bridge']['anchors']> | null = null;
    if (m > 0) {
      grid = f.bridge.anchors(f);
      if (!this.assigned) this.assignVertices(grid, cx, cy, expand, w, h);
    } else {
      this.assigned = false;
    }

    // stars ---------------------------------------------------------------
    for (let i = 0; i < STAR_COUNT; i++) {
      this.z[i] -= dz;
      if (m === 0 && this.z[i] < -this.fov * 0.8) this.spawn(i, false);
      const scale = this.project(this.x[i], this.y[i], this.z[i], out, cx, cy, expand);
      let sx = scale < 0 ? this.px[i] : out[0];
      let sy = scale < 0 ? this.py[i] : out[1];
      if (scale < 0 && m === 0) {
        this.fresh[i] = 1;
        continue;
      }
      if (shockOn) {
        shocks.displace(sx, sy, t, this.disp);
        sx += this.disp[0];
        sy += this.disp[1];
      }
      const zr = scale < 0 ? 0 : out[2];
      // depth fog into #000 + gentle fade-in at the far plane
      let fog = Math.pow(clamp(1 - zr / fogDepth), 1.5) * smoothstep(fogDepth, fogDepth * 0.82, zr);
      let size = Math.min(34, (3.2 + Math.max(0, scale) * 4.2) * this.size[i]);
      if (grid) {
        const v = this.target[i];
        if (grid.ok[v]) {
          sx += (grid.x[v] - sx) * me;
          sy += (grid.y[v] - sy) * me;
        }
        // landed stars become crisp vertex glints
        fog = fog + (0.75 - fog) * me;
        size = size + (5 - size) * me;
      } else if (sx < -200 || sx > w + 200 || sy < -200 || sy > h + 200) {
        this.fresh[i] = 1;
        this.px[i] = sx;
        this.py[i] = sy;
        continue;
      }
      const a = fog * weight;
      if (!this.fresh[i] && a > 0.01) {
        let dx = sx - this.px[i];
        let dy = sy - this.py[i];
        const len = Math.hypot(dx, dy) * streakMul * (1 - me);
        if (len > 0.6) {
          const lim = Math.min(len, 320) / (Math.hypot(dx, dy) || 1);
          dx *= lim;
          dy *= lim;
          const wl = scale < 0.5 ? 0 : scale < 1.4 ? 1 : 2;
          this.batch.add(this.col[i], a * 0.85, wl, sx - dx, sy - dy, sx, sy);
        }
      }
      this.fresh[i] = 0;
      this.px[i] = sx;
      this.py[i] = sy;
      drawSprite(ctx, spritesByCol[this.col[i]], sx, sy, size, a);
    }
    this.batch.flush(ctx);
    ctx.globalAlpha = 1;
  }
}
