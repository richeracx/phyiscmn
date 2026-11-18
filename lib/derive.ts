import type { Lang } from './i18n';

/** A 3-line step-by-step preview: Given → Principle → Result. */
export interface Derivation {
  given: string;
  principle: string;
  result: string;
}

const g = 9.81;
const DEG = Math.PI / 180;

const num = (n: number, lang: Lang, digits = 2) => {
  const s = n.toFixed(digits);
  return lang === 'tr' ? s.replace('.', ',') : s;
};

/** Worked previews for the three launch presets (values verified by hand). */
export function presetDerivation(i: number, lang: Lang): Derivation {
  const tr = lang === 'tr';
  switch (i) {
    case 0: {
      // m = 2 kg, θ = 35°, μk = 0.2
      const th = 35 * DEG;
      const a = g * (Math.sin(th) - 0.2 * Math.cos(th)); // 4.02 m/s²
      const N = 2 * g * Math.cos(th); // 16.07 N
      return {
        given: `m = 2 kg · θ = 35° · μₖ = ${num(0.2, lang)} · g = ${num(9.81, lang)} m/s²`,
        principle: tr
          ? 'Newton II (eğim boyunca): mg sinθ − μₖ mg cosθ = ma ;  N = mg cosθ'
          : "Newton's 2nd law along the slope: mg sinθ − μₖ mg cosθ = ma ;  N = mg cosθ",
        result: `a = g(sinθ − μₖ cosθ) ≈ ${num(a, lang)} m/s²  ·  N ≈ ${num(N, lang)} N`,
      };
    }
    case 1: {
      // 10 solar masses; r = 3 r_s
      const rs = (2 * 6.674e-11 * 10 * 1.989e30) / (2.998e8 * 2.998e8) / 1000; // 29.5 km
      return {
        given: tr ? 'M = 10 M☉ = 1,989×10³¹ kg · r = 3 r_s' : 'M = 10 M☉ = 1.989×10³¹ kg · r = 3 r_s',
        principle: tr
          ? 'Schwarzschild metriği: r_s = 2GM/c² ;  dτ/dt = √(1 − r_s/r)'
          : 'Schwarzschild metric: r_s = 2GM/c² ;  dτ/dt = √(1 − r_s/r)',
        result: `r_s ≈ ${num(rs, lang, 1)} km  ·  dτ/dt = √(2/3) ≈ ${num(Math.sqrt(2 / 3), lang, 3)}`,
      };
    }
    default: {
      const dy = ((550e-9 * 1.5) / 0.2e-3) * 1000; // 4.13 mm
      return {
        given: `λ = 550 nm · d = ${num(0.2, lang)} mm · L = ${num(1.5, lang, 1)} m`,
        principle: tr
          ? 'Yapıcı girişim: d sinθ = mλ ;  küçük açı → y_m = mλL/d'
          : 'Constructive interference: d sinθ = mλ ;  small angle → y_m = mλL/d',
        result: `Δy = λL/d ≈ ${num(dy, lang)} mm`,
      };
    }
  }
}

// --- free-text heuristics ---------------------------------------------------

const N = String.raw`(\d+(?:[.,]\d+)?)`;
const toNum = (s: string) => parseFloat(s.replace(',', '.'));
const grab = (q: string, re: RegExp) => {
  const m = q.match(re);
  return m ? toNum(m[1]) : undefined;
};

interface Q {
  m?: number;
  theta?: number;
  v?: number;
  len?: number;
  k?: number;
  mu?: number;
  V?: number;
  R?: number;
  I?: number;
  lambda?: number;
  slit?: number;
  solar?: number;
}

function parse(q: string): Q {
  const lenM = q.match(new RegExp(`${N}\\s*(km|cm|mm|m)(?![a-zA-Z/²])`));
  let len: number | undefined;
  if (lenM) {
    const unit = lenM[2];
    len = toNum(lenM[1]) * (unit === 'km' ? 1000 : unit === 'cm' ? 0.01 : unit === 'mm' ? 0.001 : 1);
  }
  return {
    m: grab(q, new RegExp(`${N}\\s*kg`)),
    theta: grab(q, new RegExp(`${N}\\s*(?:°|deg|degree|derece)`, 'i')),
    v: grab(q, new RegExp(`${N}\\s*m/s(?!²|\\^)`)),
    len,
    k: grab(q, new RegExp(`${N}\\s*N/m`)),
    mu: grab(q, new RegExp(`(?:μ|mu)\\s*[ₖk]?\\s*=\\s*${N}`, 'i')),
    V: grab(q, new RegExp(`${N}\\s*V\\b`)),
    R: grab(q, new RegExp(`${N}\\s*(?:Ω|ohm)`, 'i')),
    I: grab(q, new RegExp(`${N}\\s*A\\b`)),
    lambda: grab(q, new RegExp(`${N}\\s*nm`)),
    slit: grab(q, new RegExp(`${N}\\s*mm`)),
    solar: grab(q, new RegExp(`${N}\\s*(?:solar|M☉|güneş)`, 'i')),
  };
}

function givenLine(p: Q, lang: Lang) {
  const parts: string[] = [];
  if (p.m !== undefined) parts.push(`m = ${num(p.m, lang, 2).replace(/[.,]00$/, '')} kg`);
  if (p.theta !== undefined) parts.push(`θ = ${num(p.theta, lang, 1).replace(/[.,]0$/, '')}°`);
  if (p.v !== undefined) parts.push(`v₀ = ${num(p.v, lang, 2).replace(/[.,]00$/, '')} m/s`);
  if (p.len !== undefined) parts.push(`L = ${num(p.len, lang, 3).replace(/[.,]?0+$/, '')} m`);
  if (p.k !== undefined) parts.push(`k = ${p.k} N/m`);
  if (p.mu !== undefined) parts.push(`μ = ${num(p.mu, lang, 2)}`);
  if (p.V !== undefined) parts.push(`V = ${p.V} V`);
  if (p.R !== undefined) parts.push(`R = ${p.R} Ω`);
  if (p.I !== undefined) parts.push(`I = ${p.I} A`);
  if (p.lambda !== undefined) parts.push(`λ = ${p.lambda} nm`);
  if (parts.length === 0) return lang === 'tr' ? 'Problem metninden okunan büyüklükler' : 'Quantities as stated in your problem';
  return parts.join(' · ');
}

export function deriveFromQuery(raw: string, lang: Lang): Derivation {
  const q = raw.trim();
  const low = q.toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en');
  const p = parse(q);
  const tr = lang === 'tr';
  const given = givenLine(p, lang);
  const later = tr ? '→ sayısal sonuç tam çözücüde' : '→ numbers in the full solver';
  const has = (re: RegExp) => re.test(low);

  if (has(/incline|ramp|slope|eğik düzlem|rampa|eğim/)) {
    const mu = p.mu ?? 0;
    const principle = tr ? 'Newton II eğim boyunca: ΣF∥ = mg sinθ − μmg cosθ = ma' : "Newton's 2nd law along the slope: ΣF∥ = mg sinθ − μmg cosθ = ma";
    if (p.theta !== undefined) {
      const a = g * (Math.sin(p.theta * DEG) - mu * Math.cos(p.theta * DEG));
      const extra = p.m !== undefined ? `  ·  N ≈ ${num(p.m * g * Math.cos(p.theta * DEG), lang)} N` : '';
      return { given, principle, result: `a = g(sinθ − μ cosθ) ≈ ${num(a, lang)} m/s²${extra}` };
    }
    return { given, principle, result: `a = g(sinθ − μ cosθ)  ${later}` };
  }
  if (has(/projectile|launch|thrown|throw|cannon|fırlat|atış|atıl/) || (p.v !== undefined && p.theta !== undefined)) {
    const principle = tr ? 'Sabit ivmeli kinematik: x = v₀cosθ·t ;  y = v₀sinθ·t − ½gt²' : 'Constant-acceleration kinematics: x = v₀cosθ·t ;  y = v₀sinθ·t − ½gt²';
    if (p.v !== undefined && p.theta !== undefined) {
      const th = p.theta * DEG;
      const R = (p.v * p.v * Math.sin(2 * th)) / g;
      const H = (p.v * p.v * Math.sin(th) ** 2) / (2 * g);
      const T = (2 * p.v * Math.sin(th)) / g;
      return { given, principle, result: `R = v₀² sin2θ / g ≈ ${num(R, lang)} m  ·  H ≈ ${num(H, lang)} m  ·  T ≈ ${num(T, lang)} s` };
    }
    return { given, principle, result: `R = v₀² sin2θ / g  ·  H = v₀² sin²θ / 2g  ${later}` };
  }
  if (has(/pendulum|sarkaç/)) {
    const principle = tr ? 'Küçük açılı harmonik hareket: θ̈ + (g/L)θ = 0' : 'Small-angle harmonic motion: θ̈ + (g/L)θ = 0';
    const result =
      p.len !== undefined ? `T = 2π√(L/g) ≈ ${num(2 * Math.PI * Math.sqrt(p.len / g), lang)} s` : `T = 2π√(L/g)  ${later}`;
    return { given, principle, result };
  }
  if (has(/spring|oscillat|yay|salınım/)) {
    const principle = tr ? 'Hooke yasası + Newton II: m ẍ = −kx' : "Hooke's law + Newton II: m ẍ = −kx";
    if (p.k !== undefined && p.m !== undefined) {
      const w = Math.sqrt(p.k / p.m);
      return { given, principle, result: `ω = √(k/m) ≈ ${num(w, lang)} rad/s  ·  T = 2π/ω ≈ ${num((2 * Math.PI) / w, lang)} s` };
    }
    return { given, principle, result: `ω = √(k/m) ;  T = 2π√(m/k)  ${later}` };
  }
  if (has(/drop|fall|height|cliff|düş|yükseklik|bırak/)) {
    const principle = tr ? 'Enerjinin korunumu: mgh = ½mv²' : 'Energy conservation: mgh = ½mv²';
    const result =
      p.len !== undefined
        ? `v = √(2gh) ≈ ${num(Math.sqrt(2 * g * p.len), lang)} m/s  ·  t = √(2h/g) ≈ ${num(Math.sqrt((2 * p.len) / g), lang)} s`
        : `v = √(2gh) ;  t = √(2h/g)  ${later}`;
    return { given, principle, result };
  }
  if (has(/black hole|schwarzschild|kara delik|event horizon|olay ufku/)) {
    const principle = tr ? 'Schwarzschild metriği: r_s = 2GM/c²' : 'Schwarzschild metric: r_s = 2GM/c²';
    const result =
      p.solar !== undefined ? `r_s ≈ ${num(2.953 * p.solar, lang, 1)} km` : `r_s = 2GM/c² ≈ ${num(2.95, lang)} km × (M/M☉)`;
    return { given, principle, result };
  }
  if (has(/slit|interference|fringe|diffraction|yarık|girişim|saçak|kırınım/)) {
    const principle = tr ? 'Yapıcı girişim: d sinθ = mλ' : 'Constructive interference: d sinθ = mλ';
    if (p.lambda !== undefined && p.slit !== undefined && p.len !== undefined && p.len > 0.01) {
      return { given, principle, result: `Δy = λL/d ≈ ${num(((p.lambda * 1e-9 * p.len) / (p.slit * 1e-3)) * 1000, lang)} mm` };
    }
    return { given, principle, result: `Δy = λL/d  ${later}` };
  }
  if (has(/orbit|satellite|planet|kepler|yörünge|uydu|gezegen/)) {
    return {
      given,
      principle: tr ? 'Kütleçekim = merkezcil kuvvet: GMm/r² = mv²/r' : 'Gravity supplies the centripetal force: GMm/r² = mv²/r',
      result: `v = √(GM/r)  ·  T = 2π√(r³/GM)  ${later}`,
    };
  }
  if (has(/resist|ohm|current|voltage|circuit|direnç|akım|gerilim|devre/)) {
    const principle = tr ? 'Ohm yasası: V = IR ;  P = VI' : "Ohm's law: V = IR ;  P = VI";
    if (p.V !== undefined && p.R !== undefined) return { given, principle, result: `I = V/R ≈ ${num(p.V / p.R, lang)} A  ·  P ≈ ${num((p.V * p.V) / p.R, lang)} W` };
    if (p.I !== undefined && p.R !== undefined) return { given, principle, result: `V = IR ≈ ${num(p.I * p.R, lang)} V  ·  P ≈ ${num(p.I * p.I * p.R, lang)} W` };
    return { given, principle, result: `I = V/R  ${later}` };
  }
  if (has(/collision|momentum|impact|çarpış|momentum|çarpma/)) {
    return {
      given,
      principle: tr ? 'Momentumun korunumu: Σp önce = Σp sonra' : 'Conservation of momentum: Σp_before = Σp_after',
      result: `m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′  ${later}`,
    };
  }
  if (has(/relativ|lorentz|dilation|genişleme|görelilik/)) {
    return {
      given,
      principle: tr ? 'Özel görelilik: Lorentz dönüşümü' : 'Special relativity: Lorentz transformation',
      result: `γ = 1/√(1 − v²/c²)  ·  Δt = γΔτ  ${later}`,
    };
  }
  if (has(/gas|pressure|temperature|gaz|basınç|sıcaklık/)) {
    return {
      given,
      principle: tr ? 'İdeal gaz yasası: PV = nRT' : 'Ideal gas law: PV = nRT',
      result: `P = nRT/V  ${later}`,
    };
  }
  return {
    given,
    principle: tr ? 'Temel korunum yasaları ve formül modeli kurulumu' : 'Model set-up from conservation laws and governing equations',
    result: tr ? 'Açıklamalı çözüm tam çözücüde adım adım türetilecek' : 'Step-by-step solution derived in the full solver',
  };
}
