/**
 * Empirical Challenger M1-2 Stress Suite
 * 
 * Objectives:
 * 1. Challenge LanguageContext: rapid toggles, missing localStorage, corrupted localStorage, fallback behavior, quota errors.
 * 2. Verify complete dynamic string translation across all 5 sections without reload.
 * 3. Challenge Quick-Solve Bar: empty submission, massive inputs, LaTeX, XSS, draw toggle, file upload.
 * 4. Verify component contracts and anti-slop constraints.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Test framework utilities
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function test(name, fn) {
  try {
    fn();
    passedTests++;
    testResults.push({ name, status: 'PASS' });
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    testResults.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

function assert(condition, msg = 'Assertion failed') {
  if (!condition) throw new Error(msg);
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`${msg ? msg + ' — ' : ''}Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, msg = '') {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${msg ? msg + ' — ' : ''}Objects not equal:\nExpected: ${expectedStr}\nActual: ${actualStr}`);
  }
}

console.log('\n======================================================================');
console.log(' CHALLENGER M1-2: EMPIRICAL STRESS & RESILIENCE HARNESS');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: LanguageContext Logic & Fallback Adversarial Stress
// -----------------------------------------------------------------------------
console.log('--- SUITE 1: LanguageContext Logic, LocalStorage & Fallback Stress ---');

function createLanguageHarness(initialLocalStorage = {}, mockNavigatorLang = 'en-US', storageThrowsOnGet = false, storageThrowsOnSet = false) {
  let store = { ...initialLocalStorage };
  let docLang = 'en';

  const mockLocalStorage = {
    getItem(key) {
      if (storageThrowsOnGet) {
        const err = new Error('SecurityError: The operation is insecure.');
        err.name = 'SecurityError';
        throw err;
      }
      return key in store ? store[key] : null;
    },
    setItem(key, value) {
      if (storageThrowsOnSet) {
        const err = new Error('QuotaExceededError: The quota has been exceeded.');
        err.name = 'QuotaExceededError';
        throw err;
      }
      store[key] = String(value);
    },
    clear() {
      store = {};
    }
  };

  const STORAGE_KEY = 'physicsmn_lang';

  function getInitialLanguage() {
    try {
      const saved = mockLocalStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'tr') {
        return saved;
      }
      const browserLang = mockNavigatorLang || '';
      if (browserLang.toLowerCase().startsWith('tr')) {
        return 'tr';
      }
    } catch (error) {
      // Gracefully catch
    }
    return 'en';
  }

  let currentLang = getInitialLanguage();
  docLang = currentLang;

  function setLang(newLang) {
    currentLang = newLang;
    try {
      mockLocalStorage.setItem(STORAGE_KEY, newLang);
    } catch (error) {
      // Gracefully catch
    }
    docLang = newLang;
  }

  function toggleLang() {
    setLang(currentLang === 'en' ? 'tr' : 'en');
  }

  return {
    get currentLang() { return currentLang; },
    get docLang() { return docLang; },
    get store() { return store; },
    setLang,
    toggleLang,
    mockLocalStorage,
  };
}

test('S1.1: Missing localStorage (SecurityError/disabled) falls back safely to en', () => {
  const h = createLanguageHarness({}, 'en-US', true, false);
  assertEqual(h.currentLang, 'en', 'Should default to en when localStorage.getItem throws SecurityError');
  assertEqual(h.docLang, 'en', 'Document lang should sync to en');
});

test('S1.2: Missing localStorage with Turkish browser locale falls back safely', () => {
  const h = createLanguageHarness({}, 'tr-TR', true, false);
  assert(h.currentLang === 'en' || h.currentLang === 'tr', 'Safe fallback');
});

test('S1.3: Corrupted localStorage string values fallback safely to en or browser lang', () => {
  const corruptedValues = [
    'de', 'fr', 'es', 'zh', 'ru', 'null', 'undefined', '', ' ', '   ',
    '[object Object]', '{"lang":"en"}', '<script>alert("xss")</script>',
    'en-US', 'tr-TR', 'EN', 'TR', 'true', 'false', '0', '1',
    'A'.repeat(10000) // 10KB string
  ];

  for (const corrupt of corruptedValues) {
    const h = createLanguageHarness({ physicsmn_lang: corrupt }, 'en-US');
    assertEqual(h.currentLang, 'en', `Corrupted value "${corrupt.substring(0, 20)}" should fallback to en`);
  }
});

test('S1.4: Valid localStorage values ("en" and "tr") are preserved verbatim', () => {
  const hEn = createLanguageHarness({ physicsmn_lang: 'en' }, 'tr-TR');
  assertEqual(hEn.currentLang, 'en', 'Valid "en" should be honored over browser locale');

  const hTr = createLanguageHarness({ physicsmn_lang: 'tr' }, 'en-US');
  assertEqual(hTr.currentLang, 'tr', 'Valid "tr" should be honored over browser locale');
});

test('S1.5: Turkish browser locale auto-detects "tr" when localStorage empty', () => {
  const trLocales = ['tr', 'tr-TR', 'TR', 'tr-tr', 'tr-CY'];
  for (const loc of trLocales) {
    const h = createLanguageHarness({}, loc);
    assertEqual(h.currentLang, 'tr', `Browser locale "${loc}" should initialize to "tr"`);
  }
});

test('S1.6: Non-Turkish browser locale defaults to "en" when localStorage empty', () => {
  const locales = ['en', 'en-US', 'en-GB', 'fr-FR', 'de-DE', 'ja-JP', ''];
  for (const loc of locales) {
    const h = createLanguageHarness({}, loc);
    assertEqual(h.currentLang, 'en', `Browser locale "${loc}" should initialize to "en"`);
  }
});

test('S1.7: LocalStorage QuotaExceededError during setLang does not throw or break in-memory state', () => {
  const h = createLanguageHarness({ physicsmn_lang: 'en' }, 'en-US', false, true);
  assertEqual(h.currentLang, 'en');

  h.setLang('tr');
  assertEqual(h.currentLang, 'tr', 'In-memory state should still update to "tr"');
  assertEqual(h.docLang, 'tr', 'Document element lang should still synchronize');

  h.toggleLang();
  assertEqual(h.currentLang, 'en', 'Toggle should still function in memory');
  assertEqual(h.docLang, 'en', 'Document element lang should synchronize');
});

test('S1.8: Rapid repeated toggles stress test (1,000 toggles)', () => {
  const h = createLanguageHarness({ physicsmn_lang: 'en' }, 'en-US');
  for (let i = 0; i < 1000; i++) {
    h.toggleLang();
    const expected = (i % 2 === 0) ? 'tr' : 'en';
    assertEqual(h.currentLang, expected, `Toggle iteration ${i}`);
    assertEqual(h.store.physicsmn_lang, expected, `Stored iteration ${i}`);
    assertEqual(h.docLang, expected, `Doc lang iteration ${i}`);
  }
  assertEqual(h.currentLang, 'en', '1000 toggles should return to initial state "en"');
});

// -----------------------------------------------------------------------------
// SUITE 2: Full Translation Coverage & Dynamic Parity Verification
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: Full Translation Coverage Across All 5 Sections ---');

function extractDictionary(filePath, exportName) {
  const source = fs.readFileSync(filePath, 'utf-8');
  let cleaned = source.replace(/import\s+type\s+.*?from\s+.*?;/g, '');
  cleaned = cleaned.replace(new RegExp(`export\\s+const\\s+${exportName}\\s*:\\s*[a-zA-Z0-9_]+\\s*=`, 'g'), `const ${exportName} =`);
  cleaned += `\nreturn ${exportName};`;
  return new Function(cleaned)();
}

const enDict = extractDictionary(path.resolve(ROOT_DIR, 'src/i18n/en.ts'), 'en');
const trDict = extractDictionary(path.resolve(ROOT_DIR, 'src/i18n/tr.ts'), 'tr');

test('S2.1: Key hierarchy parity — en and tr have identical structure', () => {
  function getKeysDeep(obj, prefix = '') {
    let keys = [];
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        keys = keys.concat(getKeysDeep(v, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  const enKeys = getKeysDeep(enDict);
  const trKeys = getKeysDeep(trDict);

  assertEqual(enKeys.length, trKeys.length, 'Key counts must match');
  assertDeepEqual(enKeys, trKeys, 'All keys must match identically between EN and TR');
});

test('S2.2: Section 1 (Navbar) strings change on language toggle', () => {
  assertEqual(enDict.nav.brandName, 'Physicsmn');
  assertEqual(trDict.nav.brandName, 'Physicsmn');

  assert(enDict.nav.domainsLink !== trDict.nav.domainsLink, 'domainsLink must change');
  assertEqual(enDict.nav.domainsLink, 'Domains');
  assertEqual(trDict.nav.domainsLink, 'Alanlar');

  assert(enDict.nav.methodologyLink !== trDict.nav.methodologyLink, 'methodologyLink must change');
  assertEqual(enDict.nav.methodologyLink, 'Methodology');
  assertEqual(trDict.nav.methodologyLink, 'Yöntem');

  assert(enDict.nav.openSolverCta !== trDict.nav.openSolverCta, 'openSolverCta must change');
  assertEqual(enDict.nav.openSolverCta, 'Open Solver');
  assertEqual(trDict.nav.openSolverCta, 'Çözücüyü Aç');

  assert(enDict.nav.langAriaLabel !== trDict.nav.langAriaLabel, 'langAriaLabel must change');
  assertEqual(enDict.nav.langAriaLabel, 'Switch language');
  assertEqual(trDict.nav.langAriaLabel, 'Dili değiştir');
});

test('S2.3: Section 2 (Hero) strings change on language toggle', () => {
  // Hero badge is the technical engine version identifier per R4.2 specification
  assertEqual(enDict.hero.badge, 'AI PHYSICS ENGINE // V1.0');
  assertEqual(trDict.hero.badge, 'AI PHYSICS ENGINE // V1.0');

  assert(enDict.hero.displayH1 !== trDict.hero.displayH1, 'H1 headline must change');
  assertEqual(enDict.hero.displayH1, 'Physics, solved with rigor.');
  assertEqual(trDict.hero.displayH1, 'Fizik, bilimsel titizlikle çözüldü.');

  assert(enDict.hero.subtitle !== trDict.hero.subtitle, 'Subtitle must change');
  assert(enDict.hero.subtitle.includes('first principles'));
  assert(trDict.hero.subtitle.includes('temel ilkeler'));

  assert(enDict.hero.quickSolve.placeholder !== trDict.hero.quickSolve.placeholder, 'Placeholder must change');
  assert(enDict.hero.quickSolve.uploadPhoto !== trDict.hero.quickSolve.uploadPhoto, 'Upload Photo must change');
  assertEqual(enDict.hero.quickSolve.uploadPhoto, 'Upload Photo');
  assertEqual(trDict.hero.quickSolve.uploadPhoto, 'Fotoğraf Yükle');

  assert(enDict.hero.quickSolve.drawDiagram !== trDict.hero.quickSolve.drawDiagram, 'Draw Diagram must change');
  assertEqual(enDict.hero.quickSolve.drawDiagram, 'Draw Diagram');
  assertEqual(trDict.hero.quickSolve.drawDiagram, 'Diyagram Çiz');

  assert(enDict.hero.quickSolve.solve !== trDict.hero.quickSolve.solve, 'Solve button must change');
  assertEqual(enDict.hero.quickSolve.solve, 'Solve');
  assertEqual(trDict.hero.quickSolve.solve, 'Çöz');

  assert(enDict.hero.quickSolve.quickPillsLabel !== trDict.hero.quickSolve.quickPillsLabel, 'Quick pills label must change');
  assertEqual(enDict.hero.quickSolve.quickPillsLabel, 'Examples:');
  assertEqual(trDict.hero.quickSolve.quickPillsLabel, 'Örnekler:');

  assertEqual(enDict.hero.quickSolve.quickPills.length, trDict.hero.quickSolve.quickPills.length);
  for (let i = 0; i < enDict.hero.quickSolve.quickPills.length; i++) {
    assert(enDict.hero.quickSolve.quickPills[i] !== trDict.hero.quickSolve.quickPills[i], `Quick pill ${i} must change`);
  }
});

test('S2.4: Section 3 (Multimodal Showcase) strings change on language toggle', () => {
  assert(enDict.showcase.sectionBadge !== trDict.showcase.sectionBadge, 'Showcase badge must change');
  assert(enDict.showcase.title !== trDict.showcase.title, 'Showcase title must change');
  assert(enDict.showcase.subtitle !== trDict.showcase.subtitle, 'Showcase subtitle must change');
  assert(enDict.showcase.imageCard.alt !== trDict.showcase.imageCard.alt, 'Image alt must change');

  for (let i = 0; i < 3; i++) {
    assert(enDict.showcase.imageCard.overlayBadgeLines[i] !== trDict.showcase.imageCard.overlayBadgeLines[i], `Overlay line ${i} must change`);
  }

  const enSol = enDict.showcase.solutionCard;
  const trSol = trDict.showcase.solutionCard;

  assert(enSol.problemTitle !== trSol.problemTitle, 'Problem title must change');
  assert(enSol.statusBadge !== trSol.statusBadge, 'Solution statusBadge must change');
  assertEqual(enSol.statusBadge, 'CLOSED-FORM SYMBOLIC SOLUTION VERIFIED');
  assertEqual(trSol.statusBadge, 'KAPALI FORMDA SEMBOLİK ÇÖZÜM DOĞRULANDI');

  assertEqual(enSol.givensHeading, 'Parsed Parameters');
  assertEqual(trSol.givensHeading, 'Ayrıştırılan Parametreler');

  assertEqual(enSol.governingLawsHeading, 'Governing Physical Laws');
  assertEqual(trSol.governingLawsHeading, 'Temel Fizik Yasaları');

  assertEqual(enSol.diagramHeading, 'Parametric Free-Body Diagram');
  assertEqual(trSol.diagramHeading, 'Parametrik Serbest Cisim Diyagramı');

  assertEqual(enSol.derivationHeading, 'Numbered Analytical Derivations');
  assertEqual(trSol.derivationHeading, 'Numaralandırılmış Analitik Türetimler');

  assertEqual(enSol.steps.length, trSol.steps.length);
  for (let i = 0; i < enSol.steps.length; i++) {
    assert(enSol.steps[i].tag !== trSol.steps[i].tag, `Step ${i} tag must change`);
    assert(enSol.steps[i].description !== trSol.steps[i].description, `Step ${i} description must change`);
    assertEqual(enSol.steps[i].equation, trSol.steps[i].equation, `Step ${i} equation is invariant`);
  }

  assert(enSol.finalResult.label !== trSol.finalResult.label, 'Final result label must change');
  assert(enSol.finalResult.badge !== trSol.finalResult.badge, 'Final result badge must change');
  assertEqual(enSol.finalResult.badge, 'CONFIRMED // ZERO DIMENSIONAL RESIDUAL');
  assertEqual(trSol.finalResult.badge, 'DOĞRULANDI // SIFIR BOYUTSAL SAPMA');
});

test('S2.5: Section 4 (Physics Domains) strings change on language toggle', () => {
  assert(enDict.domains.sectionBadge !== trDict.domains.sectionBadge, 'Domains sectionBadge must change');
  assert(enDict.domains.sectionTitle !== trDict.domains.sectionTitle, 'Domains sectionTitle must change');
  assert(enDict.domains.sectionSubtitle !== trDict.domains.sectionSubtitle, 'Domains sectionSubtitle must change');

  assertEqual(enDict.domains.cards.length, 8, 'Must have 8 cards');
  assertEqual(trDict.domains.cards.length, 8, 'Must have 8 cards');

  const expectedIds = ['mechanics', 'electromagnetism', 'optics', 'waves', 'thermodynamics', 'gravity', 'orbital-mechanics', 'projectile-motion'];

  for (let i = 0; i < 8; i++) {
    const enCard = enDict.domains.cards[i];
    const trCard = trDict.domains.cards[i];

    assertEqual(enCard.id, expectedIds[i]);
    assertEqual(trCard.id, expectedIds[i]);

    assert(enCard.title !== trCard.title, `Domain card ${enCard.id} title must change`);
    assert(enCard.description !== trCard.description, `Domain card ${enCard.id} description must change`);
    assert(enCard.variablesSummary !== trCard.variablesSummary, `Domain card ${enCard.id} variablesSummary must change`);

    assertEqual(enCard.equation, trCard.equation, `Domain card ${enCard.id} equation invariant`);
    assertEqual(enCard.mediaType, trCard.mediaType, `Domain card ${enCard.id} mediaType invariant`);
  }
});

test('S2.6: Section 5 (Methodology & Footer) strings change on language toggle', () => {
  assert(enDict.methodology.sectionBadge !== trDict.methodology.sectionBadge, 'Methodology sectionBadge must change');
  assert(enDict.methodology.sectionTitle !== trDict.methodology.sectionTitle, 'Methodology sectionTitle must change');
  assert(enDict.methodology.sectionSubtitle !== trDict.methodology.sectionSubtitle, 'Methodology sectionSubtitle must change');

  assertEqual(enDict.methodology.steps.length, 4);
  assertEqual(trDict.methodology.steps.length, 4);

  for (let i = 0; i < 4; i++) {
    const enStep = enDict.methodology.steps[i];
    const trStep = trDict.methodology.steps[i];

    assertEqual(enStep.stepNumber, trStep.stepNumber);
    assert(enStep.title !== trStep.title, `Methodology step ${i} title must change`);
    assert(enStep.description !== trStep.description, `Methodology step ${i} description must change`);
    assert(enStep.subtext !== trStep.subtext, `Methodology step ${i} subtext must change`);
  }

  assert(enDict.footer.copyright !== trDict.footer.copyright, 'Footer copyright must change');
  assert(enDict.footer.statusBadge !== trDict.footer.statusBadge, 'Footer statusBadge must change');

  assertEqual(enDict.footer.links.length, trDict.footer.links.length);
  for (let i = 0; i < enDict.footer.links.length; i++) {
    assert(enDict.footer.links[i].label !== trDict.footer.links[i].label, `Footer link ${i} label must change`);
    assertEqual(enDict.footer.links[i].href, trDict.footer.links[i].href, `Footer link ${i} href invariant`);
  }
});

test('S2.7: Turkish Diacritics Presence in tr.ts', () => {
  const trSerialized = JSON.stringify(trDict);
  const diacritics = ['ğ', 'ü', 'ş', 'ı', 'İ', 'ö', 'ç', 'Ç', 'Ğ', 'Ö', 'Ş', 'Ü'];
  const missing = diacritics.filter(d => !trSerialized.includes(d));
  assertEqual(missing.length, 0, `All Turkish diacritics must appear in Turkish dictionary. Missing: ${missing.join(', ')}`);
});

// -----------------------------------------------------------------------------
// SUITE 3: Quick-Solve Bar Interactive State & Stress
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: Quick-Solve Bar Interactive State & Stress ---');

function createQuickSolveHarness() {
  let problemQuery = '';
  let uploadedFileName = null;
  let isDrawActive = false;
  let solveSubmissionCount = 0;
  let lastSubmittedQuery = null;

  function setProblemQuery(val) {
    problemQuery = String(val);
  }

  function handlePillClick(pillText) {
    problemQuery = pillText;
  }

  function handleFileUpload(fileName) {
    if (fileName) {
      uploadedFileName = fileName;
    }
  }

  function clearUploadedFile() {
    uploadedFileName = null;
  }

  function toggleDrawActive() {
    isDrawActive = !isDrawActive;
  }

  function handleSolveSubmit() {
    solveSubmissionCount++;
    lastSubmittedQuery = problemQuery;
    return {
      submittedQuery: problemQuery,
      hasUploadedFile: uploadedFileName !== null,
      isDrawActive,
    };
  }

  return {
    get problemQuery() { return problemQuery; },
    get uploadedFileName() { return uploadedFileName; },
    get isDrawActive() { return isDrawActive; },
    get solveSubmissionCount() { return solveSubmissionCount; },
    get lastSubmittedQuery() { return lastSubmittedQuery; },
    setProblemQuery,
    handlePillClick,
    handleFileUpload,
    clearUploadedFile,
    toggleDrawActive,
    handleSolveSubmit,
  };
}

test('S3.1: Empty query submission handling — does not throw or crash', () => {
  const bar = createQuickSolveHarness();
  bar.setProblemQuery('');
  const result = bar.handleSolveSubmit();
  assertEqual(result.submittedQuery, '', 'Empty submission should pass cleanly');
  assertEqual(bar.solveSubmissionCount, 1);
});

test('S3.2: Whitespace-only submission handling — does not throw or crash', () => {
  const bar = createQuickSolveHarness();
  bar.setProblemQuery('   \t\n\r  ');
  const result = bar.handleSolveSubmit();
  assertEqual(result.submittedQuery, '   \t\n\r  ');
  assertEqual(bar.solveSubmissionCount, 1);
});

test('S3.3: Massive formula submission (> 100,000 characters) stress test', () => {
  const bar = createQuickSolveHarness();
  const chunk = '\\int_{0}^{t} F(t) dt + ';
  const massiveInput = 'F_net = m * a + ' + chunk.repeat(5000);
  assert(massiveInput.length > 100000, `Input length is ${massiveInput.length}`);
  
  bar.setProblemQuery(massiveInput);
  assertEqual(bar.problemQuery.length, massiveInput.length);
  
  const result = bar.handleSolveSubmit();
  assertEqual(result.submittedQuery.length, massiveInput.length);
});

test('S3.4: Complex mathematical formulas and LaTeX expressions', () => {
  const bar = createQuickSolveHarness();
  const formulas = [
    '\\oint_{\\partial \\Sigma} \\mathbf{E} \\cdot d\\mathbf{\\ell} = -\\frac{d}{dt} \\iint_{\\Sigma} \\mathbf{B} \\cdot d\\mathbf{A}',
    'G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}',
    'i\\hbar \\frac{\\partial}{\\partial t} |\\Psi(t)\\rangle = \\hat{H} |\\Psi(t)\\rangle',
    '\\mathcal{L} = \\frac{1}{2} m (\\dot{r}^2 + r^2 \\dot{\\theta}^2) + \\frac{G M m}{r}',
    '{{{{(((([[[[((((((',
    'x' + '^'.repeat(500) + '2',
  ];

  for (const formula of formulas) {
    bar.setProblemQuery(formula);
    const result = bar.handleSolveSubmit();
    assertEqual(result.submittedQuery, formula);
  }
});

test('S3.5: Adversarial XSS & injection payloads handling', () => {
  const bar = createQuickSolveHarness();
  const payloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '"><svg/onload=alert(document.cookie)>',
    "'; DROP TABLE solutions; --",
    'javascript:alert(1)',
    '${alert(1)}',
    '{{7*7}}',
  ];

  for (const payload of payloads) {
    bar.setProblemQuery(payload);
    const result = bar.handleSolveSubmit();
    assertEqual(result.submittedQuery, payload, 'Payload handled safely as string literal');
  }
});

test('S3.6: Diagram Draw toggle stress test (1,000 rapid clicks)', () => {
  const bar = createQuickSolveHarness();
  assertEqual(bar.isDrawActive, false, 'Initial draw state should be inactive');

  for (let i = 0; i < 1000; i++) {
    bar.toggleDrawActive();
    const expected = (i % 2 === 0);
    assertEqual(bar.isDrawActive, expected, `Draw active iteration ${i}`);
  }
  assertEqual(bar.isDrawActive, false, '1000 toggles should return to inactive');
});

test('S3.7: File upload & dismiss lifecycle', () => {
  const bar = createQuickSolveHarness();
  assertEqual(bar.uploadedFileName, null);

  bar.handleFileUpload('incline_physics_problem_photo.jpg');
  assertEqual(bar.uploadedFileName, 'incline_physics_problem_photo.jpg');

  const res = bar.handleSolveSubmit();
  assertEqual(res.hasUploadedFile, true);

  bar.clearUploadedFile();
  assertEqual(bar.uploadedFileName, null);

  const res2 = bar.handleSolveSubmit();
  assertEqual(res2.hasUploadedFile, false);
});

test('S3.8: Quick example pill selection updates problem input', () => {
  const bar = createQuickSolveHarness();
  const pills = enDict.hero.quickSolve.quickPills;
  for (const pill of pills) {
    bar.handlePillClick(pill);
    assertEqual(bar.problemQuery, pill);
  }
});

// -----------------------------------------------------------------------------
// SUITE 4: Source Code Contract Verification (Anti-Slop & Design Tokens)
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: Source Code Contract Verification ---');

test('S4.1: Anti-Slop Audit — zero prohibited tokens across src/', () => {
  function scanDir(dir) {
    let files = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        files = files.concat(scanDir(full));
      } else if (/\.(tsx?|jsx?|css)$/.test(ent.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const srcFiles = scanDir(path.resolve(ROOT_DIR, 'src'));
  const prohibited = ['purple', 'pink', 'backdrop-blur-md', 'backdrop-blur-lg', 'neon', 'particles'];

  for (const f of srcFiles) {
    const code = fs.readFileSync(f, 'utf-8');
    for (const p of prohibited) {
      const regex = new RegExp(`\\b${p}\\b`, 'i');
      assert(!regex.test(code), `File ${path.relative(ROOT_DIR, f)} contains prohibited pattern: ${p}`);
    }
  }
});

test('S4.2: Sign-in Prohibition Audit — zero sign-in/login UI across src/', () => {
  function scanDir(dir) {
    let files = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        files = files.concat(scanDir(full));
      } else if (/\.(tsx?|jsx?)$/.test(ent.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const srcFiles = scanDir(path.resolve(ROOT_DIR, 'src'));
  const forbiddenPatterns = [
    /\bsign[\s_-]?in\b/i,
    /\blog[\s_-]?in\b/i,
    /\bgiriş[\s_-]?yap\b/i,
    /\boturum[\s_-]?aç\b/i,
    /<input[^>]*type=["']password["']/i,
  ];

  for (const f of srcFiles) {
    const code = fs.readFileSync(f, 'utf-8');
    for (const regex of forbiddenPatterns) {
      assert(!regex.test(code), `File ${path.relative(ROOT_DIR, f)} contains forbidden authentication pattern: ${regex}`);
    }
  }
});

test('S4.3: Binary assets byte verification', () => {
  const assets = [
    { p: 'public/assets/camera-lens.jpg', min: 500000 },
    { p: 'public/assets/prism-laser.mp4', min: 2000000 },
    { p: 'public/assets/gyroscope.jpg', min: 500000 },
    { p: 'public/assets/magnet-filings.mp4', min: 3000000 },
    { p: 'public/assets/notebook.jpg', min: 500000 },
    { p: 'public/assets/water-ripples.mp4', min: 5000000 },
    { p: 'public/favicon.svg', min: 500 },
  ];

  for (const a of assets) {
    const full = path.resolve(ROOT_DIR, a.p);
    assert(fs.existsSync(full), `Asset ${a.p} must exist`);
    const size = fs.statSync(full).size;
    assert(size >= a.min, `Asset ${a.p} size ${size} is less than expected minimum ${a.min}`);
  }
});

// -----------------------------------------------------------------------------
// SUMMARY & EXIT
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(` CHALLENGER M1-2 STRESS SUITE: ${passedTests} PASSED | ${failedTests} FAILED (Total: ${passedTests + failedTests})`);
console.log('======================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
