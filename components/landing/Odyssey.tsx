'use client';

import { ActCaption } from './ActCaption';
import { ActExplosionFinale } from './ActExplosionFinale';
import { CosmicCanvas } from './CosmicCanvas';
import { HeroAct } from './HeroAct';
import { useOdyssey } from './ScrollProvider';

/**
 * The 300vh scroll container with a locked sticky cinema viewport (3 acts).
 * Page 1: Hero (Genesis starfield travel)
 * Page 2: Academic Standards & Rigorous Derivations explanation (Tesla)
 * Page 3: Cosmic Bomb Explosion forming PHYSICSMN & Launch Finale
 */
export function Odyssey() {
  const { containerRef, progress } = useOdyssey();

  return (
    <main ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div
        style={{ width: '100vw', height: '100vh', position: 'sticky', top: 0 }}
        className="overflow-hidden bg-black"
      >
        <CosmicCanvas progress={progress} />

        <HeroAct />
        <ActCaption act={1} />
        <ActExplosionFinale />
      </div>
    </main>
  );
}
