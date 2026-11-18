/**
 * Physicsmn E2E Test Suite — Authoritative Specification Oracle
 * 
 * Derived directly from:
 * - ORIGINAL_REQUEST.md (§R1, §R2, §R3, §R4)
 * - PROJECT.md
 * - TEST_INFRA.md
 * - Verified survey reports (explorer_survey_1, explorer_survey_2, spec_miner_survey_3)
 */

export const EXPECTED_ASSETS = [
  {
    logicalId: 'hero-prism',
    sourceRootFile: 'Cyan_light_caustics_on_prism_35e9df35.mp4',
    targetPublicPath: 'public/assets/prism-laser.mp4',
    altTargetPaths: ['public/assets/Cyan_light_caustics_on_prism_35e9df35.mp4'],
    type: 'video',
    format: 'mp4',
    minSizeBytes: 2000000,
    aspectRatio: '16:9',
  },
  {
    logicalId: 'showcase-notebook',
    sourceRootFile: 'Notebook_with_physics_equations_2179336a.jpg',
    targetPublicPath: 'public/assets/notebook.jpg',
    altTargetPaths: ['public/assets/Notebook_with_physics_equations_2179336a.jpg'],
    type: 'image',
    format: 'jpg',
    minSizeBytes: 500000,
    aspectRatio: '4:3',
  },
  {
    logicalId: 'domain-mechanics',
    sourceRootFile: 'Gyroscope_gimbal_rings_on_pedestal_e07cf76e.jpg',
    targetPublicPath: 'public/assets/gyroscope.jpg',
    altTargetPaths: ['public/assets/Gyroscope_gimbal_rings_on_pedestal_e07cf76e.jpg'],
    type: 'image',
    format: 'jpg',
    minSizeBytes: 500000,
    aspectRatio: '4:3',
  },
  {
    logicalId: 'domain-electromagnetism',
    sourceRootFile: 'Iron_filings_aligned_by_magnet_893f2ce0.mp4',
    targetPublicPath: 'public/assets/magnet-filings.mp4',
    altTargetPaths: ['public/assets/Iron_filings_aligned_by_magnet_893f2ce0.mp4'],
    type: 'video',
    format: 'mp4',
    minSizeBytes: 3000000,
    aspectRatio: '16:9',
  },
  {
    logicalId: 'domain-optics',
    sourceRootFile: 'Camera_lens_catching_light_flare_f2ea6220.jpg',
    targetPublicPath: 'public/assets/camera-lens.jpg',
    altTargetPaths: ['public/assets/Camera_lens_catching_light_flare_f2ea6220.jpg'],
    type: 'image',
    format: 'jpg',
    minSizeBytes: 500000,
    aspectRatio: '4:3',
  },
  {
    logicalId: 'domain-waves',
    sourceRootFile: 'Water_ripples_interfering_in_tank_e4ff79e2.mp4',
    targetPublicPath: 'public/assets/water-ripples.mp4',
    altTargetPaths: ['public/assets/Water_ripples_interfering_in_tank_e4ff79e2.mp4'],
    type: 'video',
    format: 'mp4',
    minSizeBytes: 5000000,
    aspectRatio: '16:9',
    requiresScaleCrop: 'scale-[1.08]',
  },
];

export const DESIGN_TOKENS = {
  colors: {
    voidBlack: '#06080D',
    obsidianSlate: '#0C1018',
    elevatedSurface: '#121824',
    electricBlue: '#2E8BFF',
    cryoCyan: '#BAE0FF',
  },
  hairlineBorders: [
    'border-white/[0.08]',
    'border-white/[0.12]',
    'rgba(255, 255, 255, 0.08)',
    'rgba(255, 255, 255, 0.12)',
  ],
  typography: {
    headings: 'Space Grotesk',
    body: 'Inter',
    monospace: 'JetBrains Mono',
    headingTracking: 'tracking-[-0.03em]',
  },
};

export const TURKISH_DIACRITICS = ['ğ', 'ü', 'ş', 'ı', 'İ', 'ö', 'ç', 'Ğ', 'Ü', 'Ş', 'I', 'Ö', 'Ç'];

export const ANTI_SLOP_CONSTRAINTS = {
  prohibitedColorPatterns: [
    /from-purple/i,
    /to-pink/i,
    /from-violet/i,
    /to-fuchsia/i,
    /bg-gradient-to-[a-z]+.*(?:purple|pink|fuchsia|violet)/i,
    /#[a-f0-9]{6}.*(?:purple|pink)/i,
  ],
  prohibitedBorderGlows: [
    /shadow-\[0_0_[0-9]+px_#[2E8BFF|0-9a-fA-F]+\](?=.*border-)/i,
    /shadow-neon/i,
    /border-neon/i,
    /drop-shadow-\[0_0_/i,
  ],
  prohibitedLayouts: [
    /grid-cols-3.*pricing/i,
    /generic-saas-card/i,
  ],
  prohibitedGlassmorphism: [
    /backdrop-blur-xl/i,
    /backdrop-blur-2xl/i,
    /backdrop-blur-3xl/i,
  ],
  prohibitedParticles: [
    /tsparticles/i,
    /particles-bg/i,
    /particle-canvas/i,
    /canvas-confetti/i,
  ],
  prohibitedSignIn: [
    /\bsign[\s_-]?in\b/i,
    /\blog[\s_-]?in\b/i,
    /\bgiriş[\s_-]?yap\b/i,
    /\bkayıt[\s_-]?ol\b/i,
    /<input[^>]*type=["']password["']/i,
    /auth0/i,
    /firebaseauth/i,
    /supabase\.auth/i,
  ],
};

export const DOMAINS_LIST = [
  { id: 'mechanics', nameEn: 'Mechanics', nameTr: 'Mekanik', equation: 'τ = dL / dt', mediaType: 'image' },
  { id: 'electromagnetism', nameEn: 'Electromagnetism', nameTr: 'Elektromanyetizma', equation: '∇ × B', mediaType: 'video' },
  { id: 'optics', nameEn: 'Optics', nameTr: 'Optik', equation: 'n₁ sin', mediaType: 'image' },
  { id: 'waves', nameEn: 'Waves', nameTr: 'Dalgalar', equation: '∂²ψ/∂t²', mediaType: 'video', scaleCrop: 'scale-[1.08]' },
  { id: 'thermodynamics', nameEn: 'Thermodynamics', nameTr: 'Termodinamik', equation: 'dS ≥ δQ / T', mediaType: 'svg' },
  { id: 'gravity', nameEn: 'Gravity', nameTr: 'Kütleçekimi', equation: 'G_μν', mediaType: 'svg' },
  { id: 'orbital-mechanics', nameEn: 'Orbital Mechanics', nameTr: 'Yörünge Mekaniği', equation: 'v²', mediaType: 'svg' },
  { id: 'projectile-motion', nameEn: 'Projectile Motion', nameTr: 'Eğik Atış', equation: 'y = x tan(θ)', mediaType: 'svg' },
];

export const METHODOLOGY_STEPS = [
  { step: '01', titleEn: 'Parse Givens', titleTr: 'Verilenleri Ayrıştır' },
  { step: '02', titleEn: 'Map Laws', titleTr: 'Yasaları Haritala' },
  { step: '03', titleEn: 'Render Diagram', titleTr: 'Diyagramı Çiz' },
  { step: '04', titleEn: 'Derive & Verify', titleTr: 'Türet ve Doğrula' },
];

/**
 * Mathematical Physics Oracle: 35° Incline Problem
 * Computes exact values for arbitrary block parameters on inclined ramp.
 */
export function solveInclineProblem({
  m = 4.50,
  thetaDeg = 35.0,
  mu_k = 0.22,
  g = 9.81,
} = {}) {
  const thetaRad = (thetaDeg * Math.PI) / 180.0;
  const sinTheta = Math.sin(thetaRad);
  const cosTheta = Math.cos(thetaRad);

  // Normal force: N = mg * cos(theta)
  const N = m * g * cosTheta;

  // Kinetic friction force: f_k = mu_k * N
  const f_k = mu_k * N;

  // Gravitational force parallel to incline: F_parallel = mg * sin(theta)
  const F_parallel = m * g * sinTheta;

  // Net force down incline: F_net = F_parallel - f_k
  const F_net = F_parallel - f_k;

  // Net acceleration down incline: a = F_net / m = g * (sin(theta) - mu_k * cos(theta))
  const a = g * (sinTheta - mu_k * cosTheta);

  return {
    m,
    thetaDeg,
    mu_k,
    g,
    sinTheta,
    cosTheta,
    N,
    f_k,
    F_parallel,
    F_net,
    a,
    formatted: {
      N: N.toFixed(2),
      f_k: f_k.toFixed(2),
      F_parallel: F_parallel.toFixed(2),
      F_net: F_net.toFixed(2),
      a: a.toFixed(2),
    },
  };
}

/**
 * Water tank ripple side edge crop math verification
 */
export function computeWaterRipplesCrop({
  videoWidth = 1280,
  scale = 1.08,
  sidewallArtifactWidth = 20,
} = {}) {
  const scaledWidth = videoWidth * scale;
  const marginPerSide = (scaledWidth - videoWidth) / 2.0;
  const isArtifactPushedBeyondEdge = marginPerSide > sidewallArtifactWidth;
  const marginSurplus = marginPerSide - sidewallArtifactWidth;

  return {
    videoWidth,
    scale,
    scaledWidth,
    marginPerSide,
    sidewallArtifactWidth,
    isArtifactPushedBeyondEdge,
    marginSurplus,
  };
}

/**
 * Authoritative Bilingual Dictionary Schema and Content
 */
export const AUTHORITATIVE_TRANSLATIONS = {
  en: {
    nav: {
      domains: 'Domains',
      methodology: 'Methodology',
      openSolver: 'Open Solver',
    },
    hero: {
      badge: 'AI PHYSICS ENGINE // V1.0',
      displayH1: 'Physics, solved with rigor.',
      subtitle: 'From handwritten laboratory notes to validated tensor derivations. Zero hallucinations, pure first principles.',
      quickSolve: {
        placeholder: 'Describe a problem, paste LaTeX, or drop an equation...',
        uploadPhoto: 'Upload Photo',
        drawDiagram: 'Draw Diagram',
        solve: 'Solve',
        quickPills: ['35° Incline with friction', 'LC oscillator resonance', 'Relativistic Doppler shift'],
      },
    },
    showcase: {
      badge: 'MULTIMODAL REASONING // VISION + SYMBOLIC',
      title: 'From rough handwritten notes to rigorous symbolic derivations.',
      inclineSystemId: 'SYSTEM_ID: PHY-MECH-INCLINE-035',
      problemTitle: 'Block on Rough Inclined Plane (35°)',
      accelerationLabel: 'ACCELERATION',
      accelerationResult: '3.86 m/s²',
    },
    domains: {
      title: 'Eight Foundational Domains.',
      badge: 'PHYSICS TAXONOMY // CORE ENGINES',
    },
    methodology: {
      badge: 'COMPUTATIONAL PIPELINE // 4-STAGE DETERMINISTIC REASONING',
      title: 'Engineered for Mathematical Certainty.',
      steps: [
        { num: '01', title: 'Parse Givens' },
        { num: '02', title: 'Map Laws' },
        { num: '03', title: 'Render Diagram' },
        { num: '04', title: 'Derive & Verify' },
      ],
    },
    footer: {
      status: 'ALL SYSTEMS OPERATIONAL // LATENCY < 45MS',
      copyright: '© 2026 Physicsmn Laboratory. All rights reserved.',
    },
  },
  tr: {
    nav: {
      domains: 'Alanlar',
      methodology: 'Yöntem',
      openSolver: 'Çözücüyü Aç',
    },
    hero: {
      badge: 'AI PHYSICS ENGINE // V1.0',
      displayH1: 'Fizik, bilimsel titizlikle çözüldü.',
      subtitle: 'El yazısı laboratuvar notlarından doğrulanmış tensör türetimlerine. Sıfır yanılsama, salt temel ilkeler.',
      quickSolve: {
        placeholder: 'Bir problem tanımlayın, LaTeX yapıştırın veya denklem girin...',
        uploadPhoto: 'Fotoğraf Yükle',
        drawDiagram: 'Diyagram Çiz',
        solve: 'Çöz',
        quickPills: ['35° Sürtünmeli eğik düzlem', 'LC osilatör rezonansı', 'Rölativistik Doppler kayması'],
      },
    },
    showcase: {
      badge: 'ÇOK MODLU AKIL YÜRÜTME // GÖRSEL + SEMBOLİK',
      title: 'Müsvedde el yazısı notlardan titiz sembolik türetimlere.',
      inclineSystemId: 'SYSTEM_ID: PHY-MECH-INCLINE-035',
      problemTitle: 'Pürüzlü Eğik Düzlem Üzerindeki Blok (35°)',
      accelerationLabel: 'İVME',
      accelerationResult: '3.86 m/s²',
    },
    domains: {
      title: 'Sekiz Temel Alan.',
      badge: 'FİZİK TAKSONOMİSİ // ÇEKİRDEK MOTORLAR',
    },
    methodology: {
      badge: 'HESAPLAMALI SÜREÇ // 4 AŞAMALI BELİRLENİMCİ AKIL YÜRÜTME',
      title: 'Matematiksel Kesinlik İçin Tasarlandı.',
      steps: [
        { num: '01', title: 'Verilenleri Ayrıştır' },
        { num: '02', title: 'Yasaları Haritala' },
        { num: '03', title: 'Diyagramı Çiz' },
        { num: '04', title: 'Türet ve Doğrula' },
      ],
    },
    footer: {
      status: 'TÜM SİSTEMLER AKTİF // GECİKME < 45MS',
      copyright: '© 2026 Physicsmn Laboratuvarı. Tüm hakları saklıdır.',
    },
  },
};
