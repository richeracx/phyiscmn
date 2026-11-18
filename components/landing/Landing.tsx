'use client';

import { HUD } from './HUD';
import { LanguageProvider } from '@/components/shared/LanguageProvider';
import { Odyssey } from './Odyssey';
import { ScrollProvider } from './ScrollProvider';

export function Landing() {
  return (
    <LanguageProvider>
      <ScrollProvider>
        <HUD />
        <Odyssey />
      </ScrollProvider>
    </LanguageProvider>
  );
}
