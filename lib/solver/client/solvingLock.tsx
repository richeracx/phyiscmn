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
    const isNavTarget = (target: EventTarget | null) => Boolean(
      target instanceof Element && target.closest('a, button, [role="link"], [role="button"]'),
    );
    const blockNavigation = (event: Event) => {
      if (!isSolving() || !isNavTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSolving() || !isNavTarget(event.target)) return;
      if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
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

    window.addEventListener('click', blockNavigation, true);
    window.addEventListener('pointerdown', blockNavigation, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('click', blockNavigation, true);
      window.removeEventListener('pointerdown', blockNavigation, true);
      window.removeEventListener('keydown', handleKeyDown, true);
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
