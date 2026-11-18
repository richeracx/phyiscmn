'use client';

import { useTransform, type MotionValue } from 'framer-motion';
import { actOpacityRange } from '@/lib/cosmos/math';

/** Scroll-linked opacity / lift for an act overlay, with clicks + focus disabled while hidden. */
export function useActVisibility(progress: MotionValue<number>, act: number, lift = 28) {
  const [input, output] = actOpacityRange(act);
  const opacity = useTransform(progress, input, output);
  const y = useTransform(opacity, [0, 1], [lift, 0]);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? 'auto' : 'none'));
  const visibility = useTransform(opacity, (v) => (v < 0.01 ? 'hidden' : 'visible'));
  return { opacity, y, pointerEvents, visibility };
}
