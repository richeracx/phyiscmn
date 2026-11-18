'use client';

import { animate, useMotionValue, type AnimationPlaybackControls, type MotionValue } from 'framer-motion';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ANCHORS, clamp, nearestAct } from '@/lib/cosmos/math';

/** Act-to-act glide: 1.4 s, cubic-bezier(0.65, 0, 0.35, 1) ≡ easeInOutCubic. */
const GLIDE_S = 1.4;
const EASE_IN_OUT_CUBIC = [0.65, 0, 0.35, 1] as const;
/** One gesture → one act; further input is ignored for this long. */
const COOLDOWN_MS = 900;
/** Wheel events closer together than this belong to the same gesture (trackpad inertia). */
const GESTURE_GAP_MS = 160;
const SWIPE_PX = 36;
const LAST_ACT = ANCHORS.length - 1;

interface ScrollCtx {
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** The choreographed timeline every layer reads — canvas, overlays, HUD and telemetry. */
  progress: MotionValue<number>;
  /** The act the choreography is resting on / gliding toward (0–4). */
  activeAct: number;
  jumpTo: (act: number) => void;
}

const Ctx = createContext<ScrollCtx | null>(null);

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progress = useMotionValue(0);
  const [activeAct, setActiveAct] = useState(0);
  const actRef = useRef(0);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const lockUntil = useRef(0);
  const lastSyncedY = useRef(-1);

  /** Keep the native scroll position in step with the timeline (the sticky stage depends on it). */
  const geometry = () => {
    const el = containerRef.current;
    if (!el) return null;
    return { top: el.getBoundingClientRect().top + window.scrollY, travel: Math.max(1, el.offsetHeight - window.innerHeight) };
  };
  const syncScroll = useCallback((v: number) => {
    const g = geometry();
    if (!g) return;
    const y = Math.round(g.top + v * g.travel);
    lastSyncedY.current = y;
    if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
  }, []);

  const goTo = useCallback(
    (target: number) => {
      const next = Math.round(clamp(target, 0, LAST_ACT));
      actRef.current = next;
      setActiveAct(next);
      anim.current?.stop();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const span = Math.abs(ANCHORS[next] - progress.get()) * LAST_ACT; // in acts
      anim.current = animate(progress, ANCHORS[next], {
        // one act = 1.4 s; multi-act chapter jumps get a little extra so each morph still reads
        duration: reduced ? 0 : GLIDE_S + Math.max(0, span - 1) * 0.45,
        ease: EASE_IN_OUT_CUBIC,
        onUpdate: syncScroll,
      });
    },
    [progress, syncScroll],
  );

  const stepAct = useCallback(
    (dir: number) => {
      const now = performance.now();
      if (now < lockUntil.current) return;
      const next = clamp(actRef.current + dir, 0, LAST_ACT);
      if (next === actRef.current) return;
      lockUntil.current = now + COOLDOWN_MS;
      goTo(next);
    },
    [goTo],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __smooth?: MotionValue<number> }).__smooth = progress;

    // resume on the act nearest to wherever the browser restored the page
    const g = geometry();
    const start = g ? nearestAct(clamp((window.scrollY - g.top) / g.travel)) : 0;
    actRef.current = start;
    setActiveAct(start);
    progress.jump(ANCHORS[start]);
    syncScroll(ANCHORS[start]);

    // wheel / trackpad: one gesture → one act
    let lastWheel = 0;
    let lastAbs = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const ad = Math.abs(d);
      const now = performance.now();
      // a new gesture starts after a pause, or when a fresh swipe out-accelerates the inertia tail
      const fresh = now - lastWheel > GESTURE_GAP_MS || ad > lastAbs * 1.6 + 6;
      lastWheel = now;
      lastAbs = ad;
      if (ad < 2 || !fresh) return;
      stepAct(Math.sign(d));
    };

    // touch: one swipe → one act
    let y0 = 0;
    let x0 = 0;
    const onTouchStart = (e: TouchEvent) => {
      y0 = e.touches[0].clientY;
      x0 = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isEditable(e.target)) e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      const dy = y0 - t.clientY;
      const dx = x0 - t.clientX;
      if (Math.abs(dy) > SWIPE_PX && Math.abs(dy) > Math.abs(dx)) stepAct(Math.sign(dy));
    };

    // keyboard
    const onKey = (e: KeyboardEvent) => {
      if (isEditable(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      let handled = true;
      if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) stepAct(1);
      else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) stepAct(-1);
      else if (k === 'Home') goTo(0);
      else if (k === 'End') goTo(LAST_ACT);
      else handled = false;
      if (handled) e.preventDefault();
    };

    // scrollbar drags / find-in-page: scrub live, then settle on the nearest act
    let settleTimer = 0;
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastSyncedY.current) <= 2) return; // our own sync
      const geo = geometry();
      if (!geo) return;
      anim.current?.stop();
      const p = clamp((window.scrollY - geo.top) / geo.travel);
      progress.set(p);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => goTo(nearestAct(p)), 180);
    };

    const onResize = () => syncScroll(progress.get());

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(settleTimer);
      anim.current?.stop();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [goTo, progress, stepAct, syncScroll]);

  const value = useMemo(() => ({ containerRef, progress, activeAct, jumpTo: goTo }), [progress, activeAct, goTo]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOdyssey() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOdyssey must be used inside <ScrollProvider>');
  return v;
}
