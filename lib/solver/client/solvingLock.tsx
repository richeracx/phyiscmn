'use client';

import { useEffect, useState } from 'react';

let solving = false;
const listeners = new Set<() => void>();

export const isSolving = () => solving;

export function setSolving(value: boolean) {
  solving = value;
  for (const listener of listeners) listener();
}

export function useSolvingLock() {
  const [locked, setLocked] = useState(isSolving());
  useEffect(() => {
    const listener = () => setLocked(isSolving());
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return locked;
}

export function SolvingLockGuard() {
  const locked = useSolvingLock();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isSolving()) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a, button, [role="link"], [role="button"]');
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const handlePopState = (event: PopStateEvent) => {
      if (!isSolving()) return;
      event.preventDefault();
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isSolving()) return;
      event.preventDefault();
      event.returnValue = 'Çözüm devam ediyor, lütfen bekleyin.';
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!locked) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#E5C158]/40 bg-black/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#E5C158] shadow-lg"
    >
      Çözüm devam ediyor, lütfen bekleyin...
    </div>
  );
}
