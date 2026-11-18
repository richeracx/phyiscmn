import { solverCopy, type SolverCopy } from './solver/copy';

export type Lang = 'en' | 'tr';

export interface Sample {
  label: string;
  problem: string;
}

export interface Copy {
  chapters: [string, string][]; // [numeral, name]
  openSolver: string;
  langLabel: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    placeholder: string;
    upload: string;
    solve: string;
    attached: (name: string) => string;
    hintScroll: string;
    hintClick: string;
  };
  acts: {
    kicker: string;
    title: string;
    body: string;
    label?: string;
    features?: string[];
    cta?: string;
  }[]; // II–IV
  launch: {
    title: string;
    samples: Sample[];
    custom: string;
    launch: string;
    footer: string;
  };
  telemetry: { field: string; timeline: string; act: string };
  solver: SolverCopy;
}

export const copy: Record<Lang, Copy> = {
  en: {
    chapters: [
      ['I', 'Genesis'],
      ['II', 'Rigor'],
      ['III', 'Finale'],
    ],
    openSolver: 'Open Solver',
    langLabel: 'Language',
    hero: {
      eyebrow: 'step-by-step physics solver',
      title: 'Physics, solved step-by-step.',
      subtitle:
        'Type a problem or photograph your worksheet. Physicsmn generates a step-by-step derivation formatted with LaTeX, aligned with the MEB curriculum.',
      placeholder: 'A 2 kg block slides down a 35° incline with μ = 0.2…',
      upload: 'Upload a photo of the problem',
      solve: 'Solve',
      attached: (name) => `Attached · ${name}`,
      hintScroll: 'Scroll once to glide to the next act',
      hintClick: 'Click anywhere to emit a gravitational wave',
    },
    acts: [
      {
        kicker: '02 // MEB CURRICULUM ALIGNMENT',
        title: 'Structured derivations. Aligned with MEB.',
        body: 'Designed for high school students and teachers. Every derivation generates clear LaTeX equations with step-by-step physical reasoning to help students review and verify each stage of the solution.',
        label: 'CURRICULUM ALIGNMENT',
        features: [
          'Step-by-step physics derivations',
          'Full LaTeX typesetting & KaTeX rendering',
          'Explicit SI unit annotations',
          'Structured steps for student verification',
        ],
        cta: 'Open Full Solver',
      },
    ],
    launch: {
      title: 'Begin your derivation.',
      samples: [
        {
          label: '35° Incline Plane',
          problem:
            'A 2 kg block slides down a 35° incline with kinetic friction μ = 0.2. Find its acceleration and the normal force.',
        },
        {
          label: 'Schwarzschild Radius',
          problem:
            'Compute the Schwarzschild radius of a 10 solar-mass black hole and the time-dilation factor at r = 3 r_s.',
        },
        {
          label: 'Double-Slit Interference',
          problem:
            'Light of λ = 550 nm passes through two slits 0.2 mm apart onto a screen 1.5 m away. Find the fringe spacing.',
        },
      ],
      custom: 'Or type your own problem…',
      launch: 'Launch Full Solver',
      footer: '© 2026 Physicsmn · MEB High School Physics',
    },
    telemetry: { field: 'FIELD', timeline: 'T', act: 'ACT' },
    solver: solverCopy.en,
  },
  tr: {
    chapters: [
      ['I', 'Başlangıç'],
      ['II', 'Titizlik'],
      ['III', 'Kozmik Patlama'],
    ],
    openSolver: 'Çözücüyü Aç',
    langLabel: 'Dil',
    hero: {
      eyebrow: 'adım adım fizik çözücü',
      title: 'Fizik, adım adım çözümlerle.',
      subtitle:
        'Problemi yazın veya çalışma kâğıdının fotoğrafını çekin. Physicsmn, MEB müfredatına uygun adımlarla LaTeX formatında açıklamalı çözüm üretir.',
      placeholder: '2 kg’lık bir blok, μ = 0,2 olan 35°’lik eğik düzlemden kayıyor…',
      upload: 'Problemin fotoğrafını yükle',
      solve: 'Çöz',
      attached: (name) => `Eklendi · ${name}`,
      hintScroll: 'Sonraki perdeye geçmek için bir kez kaydır',
      hintClick: 'Kütleçekim dalgası yaymak için herhangi bir yere tıkla',
    },
    acts: [
      {
        kicker: '02 // MEB MÜFREDAT UYUMU',
        title: 'MEB standartlarında adım adım çözümler.',
        body: 'Çözümler yalnızca sonuca odaklanmaz. Her türetim, MEB lise fizik müfredatına uygun açıklamalar, formüller ve adım adım mantıksal aşamalarla sunulur.',
        label: 'MÜFREDAT UYUMU',
        features: [
          'Müfredata uygun korunum yasaları ve formüller',
          'Eksiksiz LaTeX matematik dizgisi',
          'Standart SI birim gösterimi',
          'Öğrencinin adım adım kontrol edebileceği yapı',
        ],
        cta: 'Çözücüyü Aç',
      },
    ],
    launch: {
      title: 'Türetimine başla.',
      samples: [
        {
          label: '35° Eğik Düzlem',
          problem:
            '2 kg’lık bir blok, kinetik sürtünme katsayısı μ = 0,2 olan 35°’lik eğik düzlemden kayıyor. İvmesini ve normal kuvveti bulun.',
        },
        {
          label: 'Schwarzschild Yarıçapı',
          problem:
            '10 Güneş kütlesindeki bir kara deliğin Schwarzschild yarıçapını ve r = 3 r_s’deki zaman genişlemesi çarpanını hesaplayın.',
        },
        {
          label: 'Çift Yarık Girişimi',
          problem:
            'λ = 550 nm dalga boyundaki ışık, aralarında 0,2 mm bulunan iki yarıktan geçerek 1,5 m uzaktaki ekrana düşüyor. Saçak aralığını bulun.',
        },
      ],
      custom: 'Ya da kendi problemini yaz…',
      launch: 'Tam Çözücüyü Başlat',
      footer: '© 2026 Physicsmn · MEB Lise Fizik',
    },
    telemetry: { field: 'ALAN', timeline: 'Z', act: 'PERDE' },
    solver: solverCopy.tr,
  },
};
