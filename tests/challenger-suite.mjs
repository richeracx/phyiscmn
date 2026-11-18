import fs from 'fs';
import crypto from 'crypto';

console.log('======================================================================');
console.log(' CHALLENGER M1-1: INDEPENDENT EMPIRICAL ADVERSARIAL SUITE');
console.log('======================================================================\n');

let passedCount = 0;
let failedCount = 0;

function check(title, condition, detail = '') {
  if (condition) {
    passedCount++;
    console.log(`✓ [PASS] ${title}`);
  } else {
    failedCount++;
    console.log(`✗ [FAIL] ${title}${detail ? ' — ' + detail : ''}`);
  }
}

// 1. Asset Integrity Verification
console.log('-- Category 1: Media Asset Binary Integrity --');
const expectedAssets = {
  'camera-lens.jpg': { size: 547122, sha: 'DB2B0F2C91DE5419FFCECB1E3CBB47A5E4ECE74A951C2728F5505C27F9752036' },
  'prism-laser.mp4': { size: 2287940, sha: '1E44954D2781F3CFFC55AFFA223689D817896BC8B632C6EC1F347615AF255D4D' },
  'gyroscope.jpg': { size: 541373, sha: 'F3969A824931F38A7CC80F254CAC01C841425D5937B013EE4545FC562808737C' },
  'magnet-filings.mp4': { size: 3764974, sha: '515974E788934682A5FEB29CF647AA83EE69603872F26FFEAEB2910D07D8746E' },
  'notebook.jpg': { size: 744185, sha: '48DF03C5285F0437B0EDBD89FA7CC39720969A9B1A6C7D8AC040DE9CC851BA2C' },
  'water-ripples.mp4': { size: 6118599, sha: 'C69A5CDE8BBF2023FBB534679428A91B310D73A93F2D1EE47269EC53C7D1710E' },
};

for (const [filename, expected] of Object.entries(expectedAssets)) {
  const p = `public/assets/${filename}`;
  const exists = fs.existsSync(p);
  const size = exists ? fs.statSync(p).size : -1;
  const sha = exists ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase() : '';
  check(`Asset ${filename} exists in public/assets/`, exists);
  check(`Asset ${filename} byte size matches (${expected.size})`, size === expected.size, `Got ${size}`);
  check(`Asset ${filename} SHA-256 matches exact hash`, sha === expected.sha, `Got ${sha}`);
}

// Favicon check
const faviconExists = fs.existsSync('public/favicon.svg');
const faviconContent = faviconExists ? fs.readFileSync('public/favicon.svg', 'utf-8') : '';
check('public/favicon.svg exists', faviconExists);
check('public/favicon.svg contains SVG root element', faviconContent.includes('<svg') && faviconContent.includes('</svg>'));
check('public/favicon.svg contains aperture calibration ticks', faviconContent.includes('Optical Calibration Ticks'));
check('public/favicon.svg contains electric-blue laser beam', faviconContent.includes('#2E8BFF'));

// 2. Hero Video Masking Verification
console.log('\n-- Category 2: Hero Video CSS Masking & Seamless Blending --');
const heroVideoCode = fs.readFileSync('src/components/hero/HeroVideo.tsx', 'utf-8');

check('HeroVideo has WebkitMaskImage linear-gradient', heroVideoCode.includes('WebkitMaskImage:'));
check('HeroVideo has standard maskImage linear-gradient', heroVideoCode.includes('maskImage:'));
check('HeroVideo mask implements left 55% fade', /to right.*55%.*black 100%/s.test(heroVideoCode));
check('HeroVideo mask implements bottom 25% fade', /to top, transparent 0%, black 25%/s.test(heroVideoCode));
check('HeroVideo has WebkitMaskComposite: source-in', heroVideoCode.includes("WebkitMaskComposite: 'source-in'"));
check('HeroVideo has maskComposite: intersect', heroVideoCode.includes("maskComposite: 'intersect'"));
check('HeroVideo has left gradient overlay fallback (w-3/5 from #06080D)', heroVideoCode.includes('w-3/5') && heroVideoCode.includes('bg-gradient-to-r from-[#06080D]'));
check('HeroVideo has bottom gradient overlay fallback (h-40 from #06080D)', heroVideoCode.includes('h-40') && heroVideoCode.includes('bg-gradient-to-t from-[#06080D]'));
check('HeroVideo has top gradient overlay fallback (h-24 from #06080D)', heroVideoCode.includes('h-24') && heroVideoCode.includes('bg-gradient-to-b from-[#06080D]'));
check('HeroVideo applies scale-[1.02] to clip subpixel right/top seams', heroVideoCode.includes('scale-[1.02]'));
check('HeroVideo DOM autoplay muted playsInline attributes present', /autoPlay[\s\S]*loop[\s\S]*muted[\s\S]*playsInline/.test(heroVideoCode));
check('HeroVideo imperative video.muted = true in useEffect', heroVideoCode.includes('video.muted = true'));

// 3. Water Ripples Cropping Verification
console.log('\n-- Category 3: Water Ripples Cropping & Aspect Containment --');
const domainCardCode = fs.readFileSync('src/components/domains/DomainCard.tsx', 'utf-8');
const enCode = fs.readFileSync('src/i18n/en.ts', 'utf-8');
const trCode = fs.readFileSync('src/i18n/tr.ts', 'utf-8');

check('DomainCard media container has overflow-hidden', domainCardCode.includes('overflow-hidden bg-[#06080D] border-b'));
check('DomainCard video element accepts mediaClass override', domainCardCode.includes('${mediaClass || \'\'}'));
check('English i18n waves card configures scale-[1.08]', /id:\s*"waves"[\s\S]*?mediaClass:\s*"scale-\[1\.08\]"/s.test(enCode));
check('Turkish i18n waves card configures scale-[1.08]', /id:\s*"waves"[\s\S]*?mediaClass:\s*"scale-\[1\.08\]"/s.test(trCode));
check('DomainCard video element has autoPlay muted loop playsInline', /autoPlay[\s\S]*muted[\s\S]*loop[\s\S]*playsInline/.test(domainCardCode));
check('DomainCard imperative videoRef.current.muted = true in useEffect', domainCardCode.includes('videoRef.current.muted = true'));

// 4. Anti-Slop & Design Token Conformance
console.log('\n-- Category 4: Anti-Slop Constraints & Design Tokens --');
const allSrcFiles = ['src/components/hero/Hero.tsx', 'src/components/hero/HeroVideo.tsx', 'src/components/hero/QuickSolveBar.tsx', 'src/components/layout/Navbar.tsx', 'src/components/layout/Footer.tsx', 'src/components/showcase/MultimodalShowcase.tsx', 'src/components/showcase/NotebookCard.tsx', 'src/components/showcase/SolutionPreviewCard.tsx', 'src/components/showcase/FreeBodyDiagram.tsx', 'src/components/domains/PhysicsDomains.tsx', 'src/components/domains/DomainCard.tsx', 'src/components/methodology/MethodologyStrip.tsx'];

let prohibitedFound = false;
for (const f of allSrcFiles) {
  const content = fs.readFileSync(f, 'utf-8');
  if (/from-purple|to-pink|from-fuchsia|shadow-neon|border-neon/i.test(content)) {
    prohibitedFound = true;
    console.log(`Forbidden gradient/neon in ${f}`);
  }
}
check('Zero purple/pink gradients across all components', !prohibitedFound);

let signInFound = false;
for (const f of allSrcFiles) {
  const content = fs.readFileSync(f, 'utf-8');
  if (/\bsign[\s_-]?in\b|\bgiriş[\s_-]?yap\b/i.test(content)) {
    signInFound = true;
    console.log(`Sign-in string found in ${f}`);
  }
}
check('Zero sign-in UI references across all components', !signInFound);

// 5. Build Artifact Verification
console.log('\n-- Category 5: Production Build Artifacts --');
check('dist/index.html exists', fs.existsSync('dist/index.html'));
check('dist/favicon.svg exists', fs.existsSync('dist/favicon.svg'));
for (const filename of Object.keys(expectedAssets)) {
  const distAsset = `dist/assets/${filename}`;
  check(`dist/assets/${filename} emitted and non-empty`, fs.existsSync(distAsset) && fs.statSync(distAsset).size > 0);
}

console.log('\n======================================================================');
console.log(` CHALLENGER RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('======================================================================');
