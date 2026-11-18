'use client';

import type { MotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { CosmosEngine } from '@/lib/cosmos/engine';

export function CosmicCanvas({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const engine = new CosmosEngine(canvas);
    engine.setProgress(progress.get());
    const unsubscribe = progress.on('change', (v) => engine.setProgress(v));
    engine.start();
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __cosmos?: CosmosEngine }).__cosmos = engine;
    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [progress]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
