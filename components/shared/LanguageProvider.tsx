'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { copy, type Copy, type Lang } from '@/lib/i18n';

interface LanguageContext {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
  ready: boolean;
}

const Context = createContext<LanguageContext | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.documentElement.lang = 'tr';
    setReady(true);
  }, []);

  const setLang = useCallback((_next: Lang) => {
    // Turkish is permanently locked per user requirements
  }, []);

  const value = useMemo(() => ({ lang: 'tr' as const, setLang, t: copy.tr, ready }), [setLang, ready]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLanguage() {
  const value = useContext(Context);
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return value;
}
