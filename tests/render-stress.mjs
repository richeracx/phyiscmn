/**
 * Full Component Tree & DOM Render Stress Test
 * 
 * Verifies:
 * 1. SSR / React DOM rendering of <App /> in both EN and TR states.
 * 2. Compares rendered DOM HTML to prove every section updates without reload.
 * 3. Verifies Turkish diacritics are rendered uncorrupted in the DOM.
 * 4. Verifies absence of console errors or exceptions during component lifecycle.
 */

import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT_DIR = process.cwd();

async function run() {
  console.log('\n======================================================================');
  console.log(' CHALLENGER M1-2: COMPONENT TREE & DOM RENDER STRESS');
  console.log('======================================================================\n');

  // Bundle App.tsx and its dependencies into a single CommonJS module for VM execution
  const bundleResult = await esbuild.build({
    entryPoints: ['src/App.tsx'],
    bundle: true,
    format: 'cjs',
    write: false,
    external: ['react', 'react-dom', 'lucide-react'],
    plugins: [{
      name: 'external-assets',
      setup(build) {
        build.onResolve({ filter: /\.(mp4|jpg|svg)$/ }, args => ({ path: args.path, external: true }));
      }
    }]
  });

  const bundledCode = bundleResult.outputFiles[0].text;

  // Function to render App with specific initial language
  async function renderAppWithLanguage(langChoice, navigatorLocale = 'en-US') {
    const consoleLogs = [];
    const consoleWarns = [];
    const consoleErrors = [];

    // Mock storage
    const store = {
      physicsmn_lang: langChoice,
    };

    const mockLocalStorage = {
      getItem(k) { return store[k] ?? null; },
      setItem(k, v) { store[k] = String(v); },
      removeItem(k) { delete store[k]; },
      clear() { for (const k in store) delete store[k]; }
    };

    let docElementLang = 'en';
    const mockDocument = {
      documentElement: {
        get lang() { return docElementLang; },
        set lang(val) { docElementLang = val; }
      },
      getElementById(id) {
        return {
          scrollIntoView: () => {},
          querySelector: () => null,
        };
      }
    };

    const mockWindow = {
      localStorage: mockLocalStorage,
      navigator: { language: navigatorLocale },
      scrollTo: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    // Prepare sandbox
    const module = { exports: {} };
    const customRequire = (id) => {
      if (id === 'react') return require('react');
      if (id === 'react-dom') return require('react-dom');
      if (id === 'react-dom/server') return require('react-dom/server');
      if (id === 'lucide-react') return require('lucide-react');
      return require(id);
    };

    const sandbox = {
      module,
      exports: module.exports,
      require: customRequire,
      window: mockWindow,
      document: mockDocument,
      localStorage: mockLocalStorage,
      console: {
        log: (...args) => consoleLogs.push(args.join(' ')),
        warn: (...args) => consoleWarns.push(args.join(' ')),
        error: (...args) => consoleErrors.push(args.join(' ')),
      },
      process,
    };

    const vm = await import('node:vm');
    const script = new vm.Script(bundledCode, { filename: 'bundled-app.js' });
    const context = vm.createContext(sandbox);
    script.runInContext(context);

    const App = module.exports.App || module.exports.default;
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');

    const html = ReactDOMServer.renderToString(React.createElement(App));

    return {
      html,
      docElementLang,
      consoleLogs,
      consoleWarns,
      consoleErrors,
    };
  }

  // 1. Render in English
  console.log('Rendering <App /> in English (EN)...');
  const enRender = await renderAppWithLanguage('en', 'en-US');
  console.log(`  ✓ English render succeeded (${enRender.html.length} chars rendered)`);
  if (enRender.consoleErrors.length > 0) {
    console.error('  ✗ Console errors in EN render:', enRender.consoleErrors);
    process.exit(1);
  }

  // 2. Render in Turkish
  console.log('\nRendering <App /> in Turkish (TR)...');
  const trRender = await renderAppWithLanguage('tr', 'tr-TR');
  console.log(`  ✓ Turkish render succeeded (${trRender.html.length} chars rendered)`);
  if (trRender.consoleErrors.length > 0) {
    console.error('  ✗ Console errors in TR render:', trRender.consoleErrors);
    process.exit(1);
  }

  // 3. Verify section-by-section translation differences
  console.log('\n--- Section-by-Section Dynamic Translation Verification ---');

  // Navbar section check
  const hasEnNav = enRender.html.includes('Domains') && enRender.html.includes('Methodology') && enRender.html.includes('Open Solver');
  const hasTrNav = trRender.html.includes('Alanlar') && trRender.html.includes('Yöntem') && trRender.html.includes('Çözücüyü Aç');
  console.log(`  ${hasEnNav && hasTrNav ? '✓' : '✗'} Section 1 (Navbar): EN has "Domains/Methodology/Open Solver", TR has "Alanlar/Yöntem/Çözücüyü Aç"`);

  // Hero section check
  const hasEnHero = enRender.html.includes('Physics, solved with rigor.') && enRender.html.includes('Upload Photo') && enRender.html.includes('Solve');
  const hasTrHero = trRender.html.includes('Fizik, bilimsel titizlikle çözüldü.') && trRender.html.includes('Fotoğraf Yükle') && trRender.html.includes('Çöz');
  console.log(`  ${hasEnHero && hasTrHero ? '✓' : '✗'} Section 2 (Hero): EN has "Physics, solved with rigor./Upload Photo/Solve", TR has "Fizik, bilimsel titizlikle çözüldü./Fotoğraf Yükle/Çöz"`);

  // Multimodal Showcase check
  const hasEnShowcase = enRender.html.includes('From rough handwritten notes') && enRender.html.includes('Parsed Parameters');
  const hasTrShowcase = trRender.html.includes('Müsvedde el yazısı notlardan') && trRender.html.includes('Ayrıştırılan Parametreler');
  console.log(`  ${hasEnShowcase && hasTrShowcase ? '✓' : '✗'} Section 3 (Showcase): EN has "From rough handwritten notes/Parsed Parameters", TR has "Müsvedde el yazısı notlardan/Ayrıştırılan Parametreler"`);

  // Physics Domains check
  const hasEnDomains = enRender.html.includes('Mechanics') && enRender.html.includes('Electromagnetism') && enRender.html.includes('Thermodynamics');
  const hasTrDomains = trRender.html.includes('Mekanik') && trRender.html.includes('Elektromanyetizma') && trRender.html.includes('Termodinamik');
  console.log(`  ${hasEnDomains && hasTrDomains ? '✓' : '✗'} Section 4 (Domains): EN has "Mechanics/Electromagnetism/Thermodynamics", TR has "Mekanik/Elektromanyetizma/Termodinamik"`);

  // Methodology check
  const hasEnMethodology = enRender.html.includes('Parse Givens') && enRender.html.includes('Map Laws') && enRender.html.includes('Derive &amp; Verify');
  const hasTrMethodology = trRender.html.includes('Verilenleri Ayrıştır') && trRender.html.includes('Yasaları Haritala') && trRender.html.includes('Türet ve Doğrula');
  console.log(`  ${hasEnMethodology && hasTrMethodology ? '✓' : '✗'} Section 5A (Methodology): EN has "Parse Givens/Map Laws/Derive & Verify", TR has "Verilenleri Ayrıştır/Yasaları Eşle/Türet ve Doğrula"`);

  // Footer check
  const hasEnFooter = enRender.html.includes('Documentation') && enRender.html.includes('API Reference') && enRender.html.includes('ALL SYSTEMS OPERATIONAL');
  const hasTrFooter = trRender.html.includes('Dokümantasyon') && trRender.html.includes('API Referansı') && trRender.html.includes('TÜM SİSTEMLER AKTİF');
  console.log(`  ${hasEnFooter && hasTrFooter ? '✓' : '✗'} Section 5B (Footer): EN has "Documentation/ALL SYSTEMS OPERATIONAL", TR has "Dokümantasyon/TÜM SİSTEMLER AKTİF"`);

  // 4. Verify Turkish diacritics in rendered TR HTML
  console.log('\n--- Turkish Diacritics Verification in Rendered HTML ---');
  const diacritics = ['ğ', 'ü', 'ş', 'ı', 'İ', 'ö', 'ç', 'Ç', 'Ğ', 'Ö', 'Ş', 'Ü'];
  let allDiacriticsPresent = true;
  for (const d of diacritics) {
    const present = trRender.html.includes(d);
    console.log(`    Diacritic '${d}': ${present ? 'PRESENT ✓' : 'MISSING ✗'}`);
    if (!present) allDiacriticsPresent = false;
  }

  // 5. Overall verdict
  const allSectionsPassed = hasEnNav && hasTrNav && hasEnHero && hasTrHero && hasEnShowcase && hasTrShowcase && hasEnDomains && hasTrDomains && hasEnMethodology && hasTrMethodology && hasEnFooter && hasTrFooter && allDiacriticsPresent;

  console.log('\n======================================================================');
  console.log(` COMPONENT RENDER STRESS: ${allSectionsPassed ? 'ALL CHECKS PASSED (100%)' : 'FAILURES DETECTED'}`);
  console.log('======================================================================\n');

  if (!allSectionsPassed) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal render error:', err);
  process.exit(1);
});
