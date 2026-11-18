export const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Frame-rate independent version of `x += (target - x) * k` tuned at 60 fps. */
export const damp = (k: number, dt: number) => 1 - Math.pow(1 - k, dt * 60);

export type RGB = readonly [number, number, number];
export const WHITE: RGB = [255, 255, 255];
export const SILVER: RGB = [189, 189, 189];
export const GOLD: RGB = [255, 184, 41];
export const VIOLET: RGB = [128, 82, 255];
export const TEAL: RGB = [21, 132, 110];
export const ASH: RGB = [154, 154, 154];

/** Resting position of each act on the timeline — 3 acts. */
export const ANCHORS = [0, 0.5, 1] as const;

/**
 * Morph windows between neighbouring acts:
 * 0: Stars -> Tesla ASCII portrait
 * 1: Tesla ASCII -> Singularity bomb detonation
 */
export const MORPHS = [
  { a: 0.20, b: 0.40 }, // I → II  stars swirl into Tesla's glyph lattice
  { a: 0.65, b: 0.85 }, // II → III Tesla's glyphs implode into the singularity bomb
] as const;

/** Each act spans from the start of its incoming morph to the end of its outgoing one. */
export const ACTS = [
  { id: 'genesis', start: 0, end: MORPHS[0].b },
  { id: 'tesla', start: MORPHS[0].a, end: MORPHS[1].b },
  { id: 'finale', start: MORPHS[1].a, end: 1 },
] as const;

export type ActId = (typeof ACTS)[number]['id'];

/** Morph progress 0 → 1 across transition window k (0 before it, 1 after it). */
export const morphAt = (p: number, k: number) => {
  const m = MORPHS[k];
  return m ? smoothstep(m.a, m.b, p) : 0;
};

/** How far act i has morphed in from its predecessor (1 when fully arrived). */
export const morphIn = (p: number, i: number) => (i === 0 ? 1 : morphAt(p, i - 1));
/** How far act i has morphed out into its successor (0 while it owns the screen). */
export const morphOut = (p: number, i: number) => (i === ACTS.length - 1 ? 0 : morphAt(p, i));

/**
 * Presence weight of act i. The outgoing act stays fully present through most of its
 * morph (it is the thing transforming) and the incoming act materialises late, so the
 * hand-off is carried by the morph itself rather than by an opacity cross-fade.
 */
export function actWeight(p: number, i: number) {
  const inn = i === 0 ? 1 : smoothstep(0.35, 0.85, morphIn(p, i));
  const out = i === ACTS.length - 1 ? 1 : 1 - smoothstep(0.75, 1, morphOut(p, i));
  return inn * out;
}

/**
 * Opacity keyframes for the HTML overlays:
 * Overlays appear only AFTER the physical morph has arrived, so the canvas animation
 * always takes visual precedence and text never appears prematurely during transitions.
 */
export function actOpacityRange(i: number): [number[], number[]] {
  if (i === 0) {
    const fadeOut = MORPHS[0].a + (MORPHS[0].b - MORPHS[0].a) * 0.35;
    return [
      [0, MORPHS[0].a, fadeOut],
      [1, 1, 0],
    ];
  }
  if (i === ACTS.length - 1) {
    return [
      [MORPHS[i - 1].b, 1],
      [1, 1],
    ];
  }
  const prevMorph = MORPHS[i - 1];
  const nextMorph = MORPHS[i];
  const inStart = prevMorph.b - 0.02;
  const inEnd = prevMorph.b + 0.03;
  const outStart = nextMorph.a;
  const outEnd = nextMorph.a + (nextMorph.b - nextMorph.a) * 0.35;
  return [
    [inStart, inEnd, outStart, outEnd],
    [0, 1, 1, 0],
  ];
}

/** The act that owns the screen at p (switches at each morph's midpoint). */
export function actIndexAt(p: number) {
  let i = 0;
  while (i < MORPHS.length && p >= (MORPHS[i].a + MORPHS[i].b) / 2) i++;
  return i;
}

/** Timeline position each act rests on (chapter jumps and scroll gestures land here). */
export const actAnchor = (i: number) => ANCHORS[Math.max(0, Math.min(ANCHORS.length - 1, i))];

/** Nearest act anchor to an arbitrary timeline position. */
export function nearestAct(p: number) {
  let best = 0;
  for (let i = 1; i < ANCHORS.length; i++) if (Math.abs(ANCHORS[i] - p) < Math.abs(ANCHORS[best] - p)) best = i;
  return best;
}

/** Cursor-interaction gate: an act only reacts to the pointer while it owns the screen. */
export const interactionGain = (weight: number) => smoothstep(0.45, 0.85, weight);

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Normalised eye-socket bounding boxes on the Tesla portrait (viewer's left, viewer's
 * right), measured from the 1376 × 768 source around the visible sclera and padded
 * slightly so the compact pupils get a wider range of travel.
 */
export const TESLA_EYE_BOXES = [
  { x0: 533 / 1376, x1: 607 / 1376, y0: 238 / 768, y1: 276 / 768 },
  { x0: 651 / 1376, x1: 737 / 1376, y0: 218 / 768, y1: 257 / 768 },
] as const;
