import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LanguageProvider } from '@/components/shared/LanguageProvider';
import { WhyPage } from '@/components/why/WhyPage';

export const metadata: Metadata = {
  title: 'Why Physicsmn? — Neuro-Symbolic Physics vs. Probabilistic AI',
  description:
    'Discover why Physicsmn replaces probabilistic AI guessing with deterministic mathjs auditing, autonomous self-correction, and MEB curriculum alignment.',
  openGraph: {
    title: 'Why Physicsmn? — Neuro-Symbolic Physics vs. Probabilistic AI',
    description:
      'Contrasting standard LLMs against Physicsmn: deterministic SI unit checking, mathjs verification, autonomous self-correction, and MEB alignment.',
    type: 'website',
  },
};

export default function Page() {
  return (
    <Suspense>
      <LanguageProvider>
        <WhyPage />
      </LanguageProvider>
    </Suspense>
  );
}
