import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { translations } from '../i18n';
import type { Language, TranslationDictionary } from '../i18n/types';

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: TranslationDictionary;
}

const STORAGE_KEY = 'physicsmn_lang';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'tr') {
      return saved;
    }
    const browserLang = window.navigator.language || '';
    if (browserLang.toLowerCase().startsWith('tr')) {
      return 'tr';
    }
  } catch (error) {
    console.warn('Unable to access localStorage for initial language:', error);
  }
  return 'en';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (error) {
      console.warn('Failed to persist language in localStorage:', error);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'tr' : 'en');
  };

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch (error) {
      console.warn('Failed to set documentElement.lang:', error);
    }
  }, [lang]);

  const value = useMemo<LanguageContextType>(
    () => ({
      lang,
      setLang,
      toggleLang,
      t: translations[lang] || translations.en,
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
