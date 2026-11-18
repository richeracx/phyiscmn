import 'server-only';
import katex from 'katex';
import type { ModelSolution, RichText, Solution } from '../schema';

const KATEX_OPTIONS = {
  throwOnError: false,
  trust: false,
  strict: 'ignore', // Never break on Unicode characters or Turkish diacritics
  output: 'htmlAndMathml',
  maxSize: 25,
  maxExpand: 500,
} as const;

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
/** A run like "........" or "____" signals degenerate model output rather than prose. */
const DEGENERATE = /(\S)\1{11,}/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Normalizes broken LaTeX accents and OCR/LLM-split diacritics into clean UTF-8 Turkish characters.
 * E.g., o¨ -> ö, u¨ -> ü, s\c -> ş, g˘ -> ğ, c\c -> ç, \c{c} -> ç
 */
export function normalizeBrokenTurkishAccents(input: string): string {
  let s = input;
  // Standard LaTeX accent commands
  s = s.replace(/\\c\s*\{c\}|\\c\s+c/gi, 'ç');
  s = s.replace(/\\c\s*\{C\}|\\c\s+C/g, 'Ç');
  s = s.replace(/\\c\s*\{s\}|\\c\s+s/gi, 'ş');
  s = s.replace(/\\c\s*\{S\}|\\c\s+S/g, 'Ş');
  s = s.replace(/\\v\s*\{s\}|\\v\s+s/gi, 'ş');
  s = s.replace(/\\v\s*\{S\}|\\v\s+S/g, 'Ş');
  s = s.replace(/\\"\s*\{o\}|\\"\s+o/gi, 'ö');
  s = s.replace(/\\"\s*\{O\}|\\"\s+O/g, 'Ö');
  s = s.replace(/\\"\s*\{u\}|\\"\s+u/gi, 'ü');
  s = s.replace(/\\"\s*\{U\}|\\"\s+U/g, 'Ü');
  s = s.replace(/\\u\s*\{g\}|\\u\s+g|\\~\s*\{g\}|\\~\s+g/gi, 'ğ');
  s = s.replace(/\\u\s*\{G\}|\\u\s+G|\\~\s*\{G\}|\\~\s+G/g, 'Ğ');
  s = s.replace(/\\i\b/g, 'ı');
  s = s.replace(/\\I\b/g, 'İ');

  // Broken diacritic splittings from LLM/OCR (e.g. "o¨", "u¨", "s\c", "g˘", "c\c")
  s = s.replace(/o¨/g, 'ö').replace(/O¨/g, 'Ö');
  s = s.replace(/u¨/g, 'ü').replace(/U¨/g, 'Ü');
  s = s.replace(/s\\c/g, 'ş').replace(/S\\c/g, 'Ş');
  s = s.replace(/c\\c/g, 'ç').replace(/C\\c/g, 'Ç');
  s = s.replace(/g˘/g, 'ğ').replace(/G˘/g, 'Ğ');
  s = s.replace(/ı¨/g, 'i').replace(/I¨/g, 'İ');
  return s;
}

/**
 * Strips outer or stray math delimiters from a LaTeX field, normalizes accents,
 * and ensures any accidental Turkish prose inside math mode is safely wrapped in \text{}.
 */
function cleanTexSource(source: string): string {
  let tex = source.replace(CONTROL_CHARS, '').trim();
  if (!tex) return '';

  // 1. Strip outer delimiters: \(...\), \[...\], $$...$$, $...$
  tex = tex.replace(/^\\\[\s*/, '').replace(/\s*\\\]$/, '');
  tex = tex.replace(/^\\\(\s*/, '').replace(/\s*\\\)$/, '');
  tex = tex.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '');
  tex = tex.replace(/^\$\s*/, '').replace(/\s*\$$/, '');

  // 2. Strip unmatched leading delimiters
  if (tex.startsWith('\\(') && !tex.includes('\\)')) tex = tex.slice(2).trim();
  if (tex.startsWith('\\[') && !tex.includes('\\]')) tex = tex.slice(2).trim();
  if (tex.startsWith('$') && !tex.slice(1).includes('$')) tex = tex.slice(1).trim();

  // 3. Strip unmatched trailing delimiters
  if (tex.endsWith('\\)') && !tex.includes('\\(')) tex = tex.slice(0, -2).trim();
  if (tex.endsWith('\\]') && !tex.includes('\\[')) tex = tex.slice(0, -2).trim();
  if (tex.endsWith('$') && !tex.slice(0, -1).includes('$')) tex = tex.slice(0, -1).trim();

  // 4. Normalize broken Turkish diacritic representations
  tex = normalizeBrokenTurkishAccents(tex);

  // 5. If the entire string is prose words with spaces or Turkish characters and no math operators,
  // wrap it entirely in \text{...} so KaTeX renders it as clean prose with proper spacing
  const hasMathOperators = /[=+\-*/^_{}\\]/.test(tex);
  const hasTurkishDiacritics = /[çÇğĞıİöÖşŞüÜ]/.test(tex);
  const words = tex.split(/\s+/).filter(Boolean);

  if (!hasMathOperators && (words.length > 1 || hasTurkishDiacritics)) {
    return `\\text{${tex}}`;
  }

  // 6. If it's a math expression containing isolated Turkish words outside of \text{...},
  // wrap those words safely in \text{...}
  tex = tex.replace(
    /(?<!\\text\{)(?<![a-zA-Z0-9\\])\b([a-zA-ZçÇğĞıİöÖşŞüÜ]{2,})\b(?!\})/g,
    (match) => {
      // Don't wrap standard LaTeX math functions or commands
      if (
        ['sin', 'cos', 'tan', 'cot', 'log', 'ln', 'exp', 'det', 'dim', 'ker', 'deg', 'min', 'max', 'lim'].includes(
          match.toLowerCase(),
        )
      ) {
        return match;
      }
      if (
        /[çÇğĞıİöÖşŞüÜ]/.test(match) ||
        ['birim', 'saga', 'sola', 'yukari', 'asagi', 'dogru', 'vektor', 'vektoru'].includes(match.toLowerCase())
      ) {
        return `\\text{${match}}`;
      }
      return match;
    },
  );

  return tex;
}

/**
 * Normalizes all inline and display delimiters in prose text, converts \( ... \) and \[ ... \]
 * to standard single-dollar $ ... $, and auto-balances any unclosed math delimiters.
 */
function normalizeDelimiters(text: string): { normalized: string; hadUnclosed: boolean } {
  let s = text.replace(CONTROL_CHARS, '').trim();
  s = normalizeBrokenTurkishAccents(s);

  let hadUnclosed = false;

  // 1. Replace display math \[ ... \] with $ ... $
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, '$$$1$$');

  // 2. Replace inline math \( ... \) with $ ... $
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 3. Auto-balance unclosed \(
  if (s.includes('\\(') && !s.includes('\\)')) {
    hadUnclosed = true;
    s = s.replace(/\\\(([\s\S]*)$/, '$$$1$$');
  }

  // 4. Auto-balance unclosed \[
  if (s.includes('\\[') && !s.includes('\\]')) {
    hadUnclosed = true;
    s = s.replace(/\\\[([\s\S]*)$/, '$$$1$$');
  }

  // 5. Auto-balance odd number of unescaped $ delimiters
  const dollarMatches = s.match(/(?<!\\)\$/g);
  if (dollarMatches && dollarMatches.length % 2 !== 0) {
    hadUnclosed = true;
    s += '$';
  }

  return { normalized: s, hadUnclosed };
}

class MathCompiler {
  readonly failures: string[] = [];

  tex(source: string, displayMode = false): string {
    const raw = cleanTexSource(source);
    if (!raw) return '';
    try {
      return katex.renderToString(raw, { ...KATEX_OPTIONS, displayMode });
    } catch {
      this.failures.push(raw);
      return `<span class="katex-fallback font-mono">${escapeHtml(raw)}</span>`;
    }
  }

  /** Splits prose on single-dollar inline math and compiles each math span. */
  rich(source: string): RichText {
    const { normalized, hadUnclosed } = normalizeDelimiters(source);
    if (hadUnclosed) this.failures.push(`Unclosed math delimiter in: ${source.slice(0, 60)}`);
    if (DEGENERATE.test(normalized)) this.failures.push(normalized.slice(0, 80));

    const out: Array<RichText[number]> = [];
    const pattern = /(?<!\\)\$([^$]+?)(?<!\\)\$/g;
    let cursor = 0;
    for (const match of normalized.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index > cursor) {
        out.push({ kind: 'text', value: normalized.slice(cursor, index).replace(/\\\$/g, '$') });
      }
      out.push({ kind: 'math', html: this.tex(match[1]) });
      cursor = index + match[0].length;
    }
    const tail = normalized.slice(cursor);
    if (tail) out.push({ kind: 'text', value: tail.replace(/\\\$/g, '$') });
    return out;
  }
}

export type CompileResult =
  | { ok: true; solution: Solution }
  | { ok: false; failures: string[]; solution: Solution };

export function compileSolution(raw: ModelSolution): CompileResult {
  const m = new MathCompiler();
  const solution: Solution = {
    topic: raw.topic,
    statement: m.rich(raw.statement),
    given: raw.given.map((g) => ({
      symbol: m.tex(g.symbol),
      value: m.tex(g.value),
      meaning: m.rich(g.meaning),
    })),
    find: raw.find.map((f) => ({ symbol: m.tex(f.symbol), meaning: m.rich(f.meaning) })),
    assumptions: raw.assumptions.map((a) => m.rich(a)),
    principles: raw.principles.map((p) => ({ name: p.name.trim(), formula: m.tex(p.formula, true) })),
    steps: raw.steps.map((s) => ({
      title: s.title.trim(),
      text: m.rich(s.text),
      equations: s.equations.map((e) => m.tex(e, true)),
    })),
    answers: raw.answers.map((a) => ({ label: a.label.trim(), expression: m.tex(a.expression, true) })),
    choice: raw.choice,
    check: m.rich(raw.check),
    diagram: {
      kind: raw.diagram.kind,
      surface: raw.diagram.surface,
      inclineDeg: raw.diagram.inclineDeg,
      forces: raw.diagram.kind === 'forces' ? raw.diagram.forces.map((f) => ({ ...f, label: m.tex(f.label) })) : [],
    },
  };
  return m.failures.length > 0 ? { ok: false, failures: m.failures, solution } : { ok: true, solution };
}
