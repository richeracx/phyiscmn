'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { copy, type Copy, type Lang } from '@/lib/i18n';

const STORAGE_KEY = 'physicsmn.lang';

interface LanguageContext {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
  /** False until the saved preference has been read; the server always renders English. */
  ready: boolean;
}

const Context = createContext<LanguageContext | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'tr') setLangState(saved);
    } catch {
      // Storage can be unavailable (private browsing); English stays the default.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    // The document language drives correct Turkish casing (i → İ) for CSS `uppercase`.
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference simply isn't persisted.
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: copy[lang], ready }), [lang, setLang, ready]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLanguage() {
  const value = useContext(Context);
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return value;
}
