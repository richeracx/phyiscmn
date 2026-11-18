import { en } from './en';
import { tr } from './tr';
import type { Language, TranslationDictionary } from './types';

export const translations: Record<Language, TranslationDictionary> = {
  en,
  tr,
};

export const getTranslation = (lang: Language): TranslationDictionary => {
  return translations[lang] || translations.en;
};

export * from './types';
export { en, tr };
