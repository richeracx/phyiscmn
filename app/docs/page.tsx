import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LanguageProvider } from '@/components/shared/LanguageProvider';
import { DocsPage } from '@/components/docs/DocsPage';

export const metadata: Metadata = {
  title: 'Documentation & Benchmark Research — Physicsmn',
  description:
    'Comprehensive technical documentation: system architecture pipeline, deterministic mathjs fault-injection unit tests, and empirical N = 57 MEB visual benchmark evaluation.',
  openGraph: {
    title: 'Documentation & Benchmark Research — Physicsmn',
    description:
      'Technical architecture, mathjs verification tests, and 57-question empirical benchmark study comparing Raw LLMs, Gemini Web, and Physicsmn.',
    type: 'website',
  },
};

export default function Page() {
  return (
    <Suspense>
      <LanguageProvider>
        <DocsPage />
      </LanguageProvider>
    </Suspense>
  );
}
