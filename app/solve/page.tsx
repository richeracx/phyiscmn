import type { Metadata } from 'next';
import { Suspense } from 'react';
import 'katex/dist/katex.min.css';
import { LanguageProvider } from '@/components/shared/LanguageProvider';
import { Solver } from '@/components/solver/Solver';

export const metadata: Metadata = {
  title: 'Solver — Physicsmn',
  description: 'Type or photograph a physics problem and get a step-by-step solution in the MEB high-school style.',
};

export default function SolvePage() {
  return (
    <Suspense>
      <LanguageProvider>
        <Solver />
      </LanguageProvider>
    </Suspense>
  );
}
