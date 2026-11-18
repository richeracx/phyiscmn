import type { Shockwaves } from './shockwaves';
import type { Sprites } from './sprites';

export interface Frame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
  /** seconds since engine start */
  t: number;
  dt: number;
  /** smoothed pointer, CSS px */
  mx: number;
  my: number;
  /** raw (un-smoothed) pointer, CSS px — for acts that want their own, stiffer tracking */
  rawMx: number;
  rawMy: number;
  /** smoothed pointer normalised to [-1, 1] around the viewport centre */
  nmx: number;
  nmy: number;
  /** choreographed timeline 0..1 */
  progress: number;
  /** smoothed |dProgress/dt| */
  scrollSpeed: number;
  /** this act's presence weight 0..1 */
  weight: number;
  /** morph progress from the previous act into this one (1 once arrived) */
  morphIn: number;
  /** morph progress from this act into the next one (0 while it owns the screen) */
  morphOut: number;
  /** true on the first frame after the act was not rendered — drop stale motion history */
  resumed: boolean;
  sprites: Sprites;
  shocks: Shockwaves;
  reduced: boolean;
  monoFamily: string;
  bridge: Bridge;
}

/**
 * Cross-act geometry used by the bespoke morphs: an outgoing act reads where the
 * incoming act's structure lives this frame and transforms itself onto it.
 */
export interface Bridge {
  /** Act II landing points (light paths + prism) in screen space for this frame. */
  anchors(f: Frame): { x: Float32Array; y: Float32Array; ok: Uint8Array };
  /** Act III nuclei in screen space. */
  atoms(f: Frame): { x: Float32Array; y: Float32Array; n: number };
}

export interface Act {
  resize(w: number, h: number, dpr: number): void;
  /** Called every frame the act is visible (weight > 0). */
  render(f: Frame): void;
}
