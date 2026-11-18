import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { StickyCinemaStoryboard } from './components/cinema/StickyCinemaStoryboard';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/hero/Hero';
import { MultimodalShowcase } from './components/showcase/MultimodalShowcase';
import { PhysicsDomains } from './components/domains/PhysicsDomains';
import { MethodologyStrip } from './components/methodology/MethodologyStrip';
import { Footer } from './components/layout/Footer';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#06080D] text-slate-100 font-sans selection:bg-[#2E8BFF]/30 selection:text-white antialiased overflow-x-hidden">
        {/* Flagship Interactive Cinema Experience */}
        <StickyCinemaStoryboard />

        {/* Deep-Dive Technical Laboratory & Editorial Documentation */}
        <div className="relative z-30 bg-[#06080D] border-t border-white/[0.08]">
          <Navbar />
          <main>
            <Hero />
            <MultimodalShowcase />
            <PhysicsDomains />
            <MethodologyStrip />
          </main>
          <Footer />
        </div>
      </div>
    </LanguageProvider>
  );
};

export default App;
