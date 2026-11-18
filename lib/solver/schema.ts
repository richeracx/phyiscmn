import { z } from 'zod';
import type { SolverErrorPayload } from './errors';

const tex = (description?: string) =>
  z.preprocess((val) => (val == null ? '' : String(val)), z.string().describe(description ?? ''));

const prose = (description?: string) =>
  z.preprocess((val) => (val == null ? '' : String(val)), z.string().describe(description ?? ''));

const choiceSchema = z.preprocess((val) => {
  if (!val) return '';
  const s = String(val).trim().toUpperCase();
  const match = s.match(/\b([A-E])\b/);
  if (match) return match[1];
  if (['A', 'B', 'C', 'D', 'E'].includes(s[0])) return s[0];
  return '';
}, z.enum(['', 'A', 'B', 'C', 'D', 'E']));

const forceSchema = z.object({
  label: tex('LaTeX label, e.g. F_s or mg').default('F'),
  angleDeg: z.preprocess((val) => {
    const num = Number(val);
    if (Number.isNaN(num)) return 0;
    return ((Math.round(num) % 360) + 360) % 360;
  }, z.number().min(0).max(360)),
  magnitude: z.preprocess((val) => {
    const num = Number(val);
    if (Number.isNaN(num) || num <= 0) return 0.5;
    if (num > 1) return 1;
    return num;
  }, z.number().min(0).max(1)),
});

const diagramSchema = z.preprocess(
  (val) => {
    if (!val || typeof val !== 'object') {
      return { kind: 'none', surface: 'none', inclineDeg: 0, forces: [] };
    }
    return val;
  },
  z.object({
    kind: z.preprocess((val) => {
      const s = String(val ?? '').toLowerCase();
      return s.includes('force') ? 'forces' : 'none';
    }, z.enum(['none', 'forces'])),
    surface: z.preprocess((val) => {
      const s = String(val ?? '').toLowerCase();
      if (s.includes('incline') || s.includes('ramp') || s.includes('slope')) return 'incline';
      if (s.includes('floor') || s.includes('ground') || s.includes('flat') || s.includes('table')) return 'floor';
      return 'none';
    }, z.enum(['none', 'floor', 'incline'])),
    inclineDeg: z.preprocess((val) => {
      const num = Number(val);
      if (Number.isNaN(num) || num < 0) return 0;
      return Math.min(89, Math.round(num));
    }, z.number().min(0).max(89)),
    forces: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(forceSchema)).default([]),
  }),
).default({ kind: 'none', surface: 'none', inclineDeg: 0, forces: [] });

/**
 * Resilient schema for model output.
 * Tolerates variations in LLM formatting while guaranteeing type-safe structure.
 */
export const ModelSolution = z.object({
  status: z
    .preprocess((val) => {
      const s = String(val ?? '').toLowerCase();
      if (['solved', 'not_physics', 'unreadable', 'insufficient_data'].includes(s)) return s;
      return 'solved';
    }, z.enum(['solved', 'not_physics', 'unreadable', 'insufficient_data']))
    .default('solved'),
  reason: prose('Empty when solved.').default(''),
  topic: z
    .preprocess(
      (val) => {
        if (!val || typeof val !== 'object') return { grade: 11, unit: 'Fizik', title: 'Problem Çözümü' };
        return val;
      },
      z.object({
        grade: z.preprocess((val) => {
          const num = Number(val);
          if (!Number.isNaN(num) && num >= 9 && num <= 12) return Math.round(num);
          return 11;
        }, z.number().int().min(9).max(12)),
        unit: prose('MEB curriculum unit name').default('Fizik'),
        title: prose('Short title for this problem').default('Problem Çözümü'),
      }),
    )
    .default({ grade: 11, unit: 'Fizik', title: 'Problem Çözümü' }),
  statement: prose('The problem restated exactly as understood').default(''),
  given: z
    .preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val.map((item) => {
          let sym = '';
          let valStr = '';
          let meaning = '';

          if (typeof item === 'string') {
            const trimmed = item.trim();
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx !== -1) {
              sym = trimmed.slice(0, eqIdx).trim();
              valStr = trimmed.slice(eqIdx + 1).trim();
              meaning = '';
            } else {
              sym = '';
              valStr = '';
              meaning = trimmed;
            }
          } else if (item && typeof item === 'object') {
            const raw = item as Record<string, unknown>;
            sym = String(raw.symbol ?? '').trim();
            valStr = String(raw.value ?? '').trim();
            meaning = String(raw.meaning ?? '').trim();
          }

          // If symbol contains "=" and valStr is empty (e.g. sym: "\vec{A} = 2 birim")
          if (sym.includes('=') && !valStr) {
            const eqIdx = sym.indexOf('=');
            valStr = sym.slice(eqIdx + 1).trim();
            sym = sym.slice(0, eqIdx).trim();
          }

          // If valStr contains "=" and sym is empty (e.g. valStr: "\vec{A} = 2 birim")
          if (valStr.includes('=') && !sym) {
            const eqIdx = valStr.indexOf('=');
            sym = valStr.slice(0, eqIdx).trim();
            valStr = valStr.slice(eqIdx + 1).trim();
          }

          // If valStr is pure prose and identical to meaning, clear valStr to avoid math mode duplication
          if (valStr && meaning && (valStr.toLowerCase() === meaning.toLowerCase() || (!/[=+\-*/\\_^]/.test(valStr) && valStr.split(/\s+/).length > 2))) {
            valStr = '';
          }

          return { symbol: sym, value: valStr, meaning };
        });
      },
      z.array(
        z.object({
          symbol: tex('LaTeX symbol, e.g. m').default(''),
          value: tex('LaTeX value with SI unit, e.g. 2\\,\\text{kg}').default(''),
          meaning: prose('What the quantity is').default(''),
        }),
      ),
    )
    .default([]),
  find: z
    .preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val.map((item) => {
          if (typeof item === 'string') return { symbol: item, meaning: item };
          if (item && typeof item === 'object') return item;
          return { symbol: String(item ?? ''), meaning: '' };
        });
      },
      z.array(
        z.object({
          symbol: tex('LaTeX symbol of the unknown').default(''),
          meaning: prose('What is asked').default(''),
        }),
      ),
    )
    .default([]),
  assumptions: z.preprocess((val) => (Array.isArray(val) ? val.map(String) : []), z.array(z.string())).default([]),
  principles: z
    .preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val.map((item) => {
          if (typeof item === 'string') return { name: item, formula: '' };
          if (item && typeof item === 'object') return item;
          return { name: 'Fizik Yasası', formula: '' };
        });
      },
      z.array(
        z.object({
          name: prose('Law or principle').default('Fizik Yasası'),
          formula: tex('Its general LaTeX form').default(''),
        }),
      ),
    )
    .default([]),
  steps: z
    .preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val.map((item, idx) => {
          if (typeof item === 'string') {
            return {
              title: `Adım ${idx + 1}`,
              text: item,
              equations: [],
            };
          }
          if (item && typeof item === 'object') return item;
          return {
            title: `Adım ${idx + 1}`,
            text: String(item ?? ''),
            equations: [],
          };
        });
      },
      z.array(
        z.object({
          title: prose('Short step heading').default('Adım'),
          text: prose('Explanation').default(''),
          equations: z
            .preprocess(
              (v) => (Array.isArray(v) ? v.map(String) : typeof v === 'string' ? [v] : []),
              z.array(z.string()),
            )
            .default([]),
        }),
      ),
    )
    .default([]),
  answers: z
    .preprocess(
      (val) => {
        if (!Array.isArray(val)) return [];
        return val.map((item) => {
          let label = 'Sonuç';
          let expr = '';

          if (typeof item === 'string') {
            const trimmed = item.trim();
            // If it's pure prose like "Çözüm tamamlandı"
            if (trimmed.toLowerCase().includes('çözüm') || trimmed.toLowerCase().includes('tamam')) {
              return { label: trimmed, expression: '' };
            }
            return { label: 'Sonuç', expression: trimmed };
          }
          if (item && typeof item === 'object') {
            const raw = item as Record<string, unknown>;
            label = String(raw.label ?? 'Sonuç').trim();
            expr = String(raw.expression ?? '').trim();
            if (expr.toLowerCase().includes('çözüm tamam') || expr.toLowerCase().includes('tamamlandı')) {
              label = expr;
              expr = '';
            }
            return { label, expression: expr };
          }
          return { label: 'Sonuç', expression: '' };
        });
      },
      z.array(
        z.object({
          label: prose('What this answer is').default('Sonuç'),
          expression: tex('Final result in LaTeX with unit').default(''),
        }),
      ),
    )
    .default([]),
  choice: choiceSchema.default(''),
  check: prose('Unit and reasonableness check').default(''),
  diagram: diagramSchema,
});

export type ModelSolution = z.infer<typeof ModelSolution>;

export type RichText = ReadonlyArray<{ kind: 'text'; value: string } | { kind: 'math'; html: string }>;

/** A solution with every LaTeX fragment compiled to KaTeX HTML on the server. */
export interface Solution {
  topic: ModelSolution['topic'];
  statement: RichText;
  given: ReadonlyArray<{ symbol: string; value: string; meaning: RichText }>;
  find: ReadonlyArray<{ symbol: string; meaning: RichText }>;
  assumptions: ReadonlyArray<RichText>;
  principles: ReadonlyArray<{ name: string; formula: string }>;
  steps: ReadonlyArray<{ title: string; text: RichText; equations: ReadonlyArray<string> }>;
  answers: ReadonlyArray<{ label: string; expression: string }>;
  choice: ModelSolution['choice'];
  check: RichText;
  diagram: {
    kind: ModelSolution['diagram']['kind'];
    surface: ModelSolution['diagram']['surface'];
    inclineDeg: number;
    forces: ReadonlyArray<{ label: string; angleDeg: number; magnitude: number }>;
  };
}

export const STAGES = ['read', 'laws', 'derive', 'verify'] as const;
export type Stage = (typeof STAGES)[number];

export type SolverEvent =
  | { type: 'stage'; stage: Stage }
  | { type: 'result'; solution: Solution }
  | ({ type: 'error' } & SolverErrorPayload);
