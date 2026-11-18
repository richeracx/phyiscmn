'use client';

import { useLanguage } from './LanguageProvider';

export function LanguageSwitch() {
  const { t, lang, setLang } = useLanguage();
  return (
    <div role="group" aria-label={t.langLabel} className="flex items-center font-mono text-[11px] tracking-[0.14em]">
      {(['en', 'tr'] as const).map((option, i) => (
        <span key={option} className="flex items-center">
          {i === 1 && <span className="px-2 text-[#3F3F46]">|</span>}
          <button
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={lang === option}
            className={`uppercase transition-colors duration-300 ${
              lang === option ? 'text-[#F5F5F7]' : 'text-[#71717A] hover:text-[#F5F5F7]'
            }`}
          >
            {option}
          </button>
        </span>
      ))}
    </div>
  );
}
