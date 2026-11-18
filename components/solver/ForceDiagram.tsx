import type { Solution } from '@/lib/solver/schema';
import { Tex } from './Tex';

const W = 400;
const H = 300;
const GROUND = 236;
const BLOCK = { w: 72, h: 46 };
const DEG = Math.PI / 180;

interface Point {
  x: number;
  y: number;
}

function layout(diagram: Solution['diagram']) {
  if (diagram.surface === 'incline' && diagram.inclineDeg > 0) {
    const theta = diagram.inclineDeg * DEG;
    const run = Math.min(300, 170 / Math.tan(theta));
    const a: Point = { x: (W - run) / 2, y: GROUND };
    const c: Point = { x: a.x + run, y: GROUND - run * Math.tan(theta) };
    const along = { x: Math.cos(theta), y: -Math.sin(theta) };
    const normal = { x: -Math.sin(theta), y: -Math.cos(theta) };
    const slope = Math.hypot(c.x - a.x, c.y - a.y);
    const center: Point = {
      x: a.x + along.x * slope * 0.55 + normal.x * (BLOCK.h / 2),
      y: a.y + along.y * slope * 0.55 + normal.y * (BLOCK.h / 2),
    };
    return { kind: 'incline' as const, a, c, theta, center };
  }
  if (diagram.surface === 'floor') return { kind: 'floor' as const, center: { x: W / 2, y: GROUND - BLOCK.h / 2 } };
  return { kind: 'point' as const, center: { x: W / 2, y: H / 2 } };
}

function arrow(from: Point, angleDeg: number, magnitude: number) {
  const length = 40 + 78 * Math.max(0.15, magnitude);
  const dx = Math.cos(angleDeg * DEG);
  const dy = -Math.sin(angleDeg * DEG);
  const tip = { x: from.x + dx * length, y: from.y + dy * length };
  const head = 9;
  const left = { x: tip.x - dx * head - dy * head * 0.5, y: tip.y - dy * head + dx * head * 0.5 };
  const right = { x: tip.x - dx * head + dy * head * 0.5, y: tip.y - dy * head - dx * head * 0.5 };
  const label = { x: tip.x + dx * 18, y: tip.y + dy * 18 };
  return { tip, head: `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`, label };
}

/** Smallest box that holds the scene, every arrow and every label, so nothing is clipped. */
function viewBox(scene: ReturnType<typeof layout>, points: Point[]) {
  const xs = [scene.center.x - BLOCK.w, scene.center.x + BLOCK.w, ...points.map((p) => p.x)];
  const ys = [scene.center.y - BLOCK.h, scene.center.y + BLOCK.h, ...points.map((p) => p.y)];
  if (scene.kind !== 'point') {
    xs.push(40, W - 40);
    ys.push(GROUND + 12);
  }
  if (scene.kind === 'incline') ys.push(scene.c.y);
  const pad = 22;
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) - x + pad, h: Math.max(...ys) - y + pad };
}

export function ForceDiagram({ diagram, title }: { diagram: Solution['diagram']; title: string }) {
  const scene = layout(diagram);
  const arrows = diagram.forces.map((force) => ({ force, ...arrow(scene.center, force.angleDeg, force.magnitude) }));
  const box = viewBox(scene, arrows.flatMap((a) => [a.tip, a.label]));

  return (
    <figure className="relative w-full select-none" style={{ aspectRatio: `${box.w} / ${box.h}` }}>
      <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} className="absolute inset-0 h-full w-full" role="img" aria-label={title}>
        <defs>
          <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="#F5F5F7" strokeOpacity="0.12" strokeWidth="1" />
          </pattern>
        </defs>

        {scene.kind === 'incline' && (
          <>
            <polygon
              points={`${scene.a.x},${scene.a.y} ${scene.c.x},${GROUND} ${scene.c.x},${scene.c.y}`}
              fill="url(#hatch)"
              stroke="#F5F5F7"
              strokeOpacity="0.45"
              strokeWidth="1"
            />
            <path
              d={`M ${scene.a.x + 34} ${GROUND} A 34 34 0 0 0 ${scene.a.x + 34 * Math.cos(scene.theta)} ${GROUND - 34 * Math.sin(scene.theta)}`}
              fill="none"
              stroke="#E5C158"
              strokeOpacity="0.7"
              strokeWidth="1"
            />
            <text x={scene.a.x + 44} y={GROUND - 8} fill="#E5C158" fontSize="11" fontFamily="var(--font-mono)">
              {Math.round(diagram.inclineDeg)}°
            </text>
          </>
        )}
        {scene.kind === 'floor' && (
          <>
            <rect x={40} y={GROUND} width={W - 80} height={10} fill="url(#hatch)" />
            <line x1={40} y1={GROUND} x2={W - 40} y2={GROUND} stroke="#F5F5F7" strokeOpacity="0.45" strokeWidth="1" />
          </>
        )}

        {scene.kind === 'point' ? (
          <circle cx={scene.center.x} cy={scene.center.y} r={6} fill="#F5F5F7" />
        ) : (
          <rect
            x={scene.center.x - BLOCK.w / 2}
            y={scene.center.y - BLOCK.h / 2}
            width={BLOCK.w}
            height={BLOCK.h}
            rx={3}
            fill="#0B0B0D"
            stroke="#F5F5F7"
            strokeOpacity="0.7"
            strokeWidth="1.2"
            transform={
              scene.kind === 'incline'
                ? `rotate(${-diagram.inclineDeg} ${scene.center.x} ${scene.center.y})`
                : undefined
            }
          />
        )}

        {arrows.map(({ force, tip, head }, i) => (
          <g key={i}>
            <line
              x1={scene.center.x}
              y1={scene.center.y}
              x2={tip.x}
              y2={tip.y}
              stroke="#F5F5F7"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <polygon points={head} fill="#E5C158" />
            <title>{`${Math.round(force.angleDeg)}°`}</title>
          </g>
        ))}
        <circle cx={scene.center.x} cy={scene.center.y} r={2.2} fill="#E5C158" />
      </svg>

      {arrows.map(({ force, label }, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[13px] text-[#F5F5F7]"
          style={{ left: `${((label.x - box.x) / box.w) * 100}%`, top: `${((label.y - box.y) / box.h) * 100}%` }}
        >
          <Tex html={force.label} />
        </span>
      ))}
    </figure>
  );
}
