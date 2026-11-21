import { z } from 'zod';
import type { SolverErrorPayload } from './errors';

const tex = (description?: string) =>
  z.preprocess((val) => (val == null ? '' : String(val)), z.string().describe(description ?? ''));

const prose = (description?: string) =>
  z.preprocess((val) => (val == null ? '' : String(val)), z.string().describe(description ?? ''));

const choiceSchema = z.preprocess((val) => {
  if (!val) return '';
  // Strip any HTML tags (complete or unclosed at the end) and normalize whitespace
  const clean = String(val)
    .replace(/<[^>]*>?|<[^>]*$/g, '')
    .trim()
    .toUpperCase();
  const match = clean.match(/\b([A-E])\b/);
  if (match) return match[1];
  if (clean.length > 0 && ['A', 'B', 'C', 'D', 'E'].includes(clean[0])) return clean[0];
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

export const VerificationVariable = z.object({
  symbol: z.string().max(64).describe('Alphanumeric symbol, e.g. m, v, theta, g'),
  value: z.preprocess((val) => {
    const num = Number(val);
    return Number.isNaN(num) ? 0 : num;
  }, z.number()),
  unit: z.preprocess((val) => (val == null ? '' : String(val).trim()), z.string().max(64).default('')),
});

export const VerificationBlock = z.object({
  variables: z
    .preprocess((val) => (Array.isArray(val) ? val : []), z.array(VerificationVariable).max(30))
    .default([]),
  formula_expression: z
    .preprocess((val) => (val == null ? '' : String(val).trim()), z.string().max(500).default('')),
  claimed_value: z.preprocess((val) => {
    if (val == null || val === '') return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  }, z.number().optional()),
  claimed_unit: z.preprocess((val) => (val == null ? '' : String(val).trim()), z.string().max(64).default('')),
});

export type VerificationBlock = z.infer<typeof VerificationBlock>;

/**
 * Resilient schema for model output of a single physics problem.
 * Tolerates variations in LLM formatting while guaranteeing type-safe structure.
 */
export const SingleProblemSolution = z.object({
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

          // If symbol contains "="
          if (sym.includes('=')) {
            const eqIdx = sym.indexOf('=');
            if (!valStr) {
              valStr = sym.slice(eqIdx + 1).trim();
            }
            sym = sym.slice(0, eqIdx).trim();
          }

          // If valStr contains "=" and sym is empty
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
          let sym = '';
          let meaning = '';

          if (typeof item === 'string') {
            const trimmed = item.trim();
            if (trimmed.includes('=')) {
              sym = trimmed;
              meaning = '';
            } else {
              sym = `${trimmed} = ?`;
              meaning = trimmed;
            }
          } else if (item && typeof item === 'object') {
            const raw = item as Record<string, unknown>;
            sym = String(raw.symbol ?? '').trim();
            meaning = String(raw.meaning ?? '').trim();
          }

          // If symbol is missing but meaning has a symbol or text
          if (!sym && meaning) {
            sym = meaning.includes('=') ? meaning : `${meaning} = ?`;
          }

          // Ensure symbol has "= ?" format if it's just a raw variable like "\vec{R}" or "a"
          if (sym && !sym.includes('=') && !sym.includes('?')) {
            sym = `${sym} = ?`;
          }

          return { symbol: sym, meaning };
        });
      },
      z.array(
        z.object({
          symbol: tex('LaTeX symbol of the unknown, e.g. |\\vec{R}| = ?').default(''),
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
      ).max(25),
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
  verification: z
    .preprocess((val) => {
      if (!val || typeof val !== 'object') return undefined;
      return val;
    }, VerificationBlock.optional()),
});

export type SingleProblemSolution = z.infer<typeof SingleProblemSolution>;
export const ModelSolution = SingleProblemSolution;
export type ModelSolution = SingleProblemSolution;

/**
 * Top-level response schema for a worksheet/exam page containing one or multiple problems.
 * Backward-compatible: automatically normalizes a single problem object into `{ problems: [problem] }`.
 */
export const WorksheetResponse = z.preprocess((val) => {
  if (!val || typeof val !== 'object') return { problems: [] };
  const raw = val as Record<string, unknown>;
  if ('problems' in raw && Array.isArray(raw.problems)) {
    return raw;
  }
  // Backward compatibility: If the model returned a single problem object directly
  return { problems: [raw] };
}, z.object({
  problems: z.array(SingleProblemSolution).min(1).max(10),
}));

export type WorksheetResponse = z.infer<typeof WorksheetResponse>;

export type RichText = ReadonlyArray<{ kind: 'text'; value: string } | { kind: 'math'; html: string }>;

/** A single compiled solution with every LaTeX fragment compiled to KaTeX HTML on the server. */
export interface SingleSolution {
  topic: SingleProblemSolution['topic'];
  statement: RichText;
  given: ReadonlyArray<{ symbol: string; value: string; meaning: RichText }>;
  find: ReadonlyArray<{ symbol: string; meaning: RichText }>;
  assumptions: ReadonlyArray<RichText>;
  principles: ReadonlyArray<{ name: string; formula: string }>;
  steps: ReadonlyArray<{ title: string; text: RichText; equations: ReadonlyArray<string> }>;
  answers: ReadonlyArray<{ label: string; expression: string }>;
  choice: SingleProblemSolution['choice'];
  check: RichText;
  diagram: {
    kind: SingleProblemSolution['diagram']['kind'];
    surface: SingleProblemSolution['diagram']['surface'];
    inclineDeg: number;
    forces: ReadonlyArray<{ label: string; angleDeg: number; magnitude: number }>;
  };
  mathVerified?: boolean;
}

/**
 * Top-level solution delivered to the client.
 * Extends SingleSolution for full backward compatibility, and carries `problems` for multi-question worksheets.
 */
export interface Solution extends SingleSolution {
  problems?: ReadonlyArray<SingleSolution>;
}

export const STAGES = ['read', 'laws', 'derive', 'verify'] as const;
export type Stage = (typeof STAGES)[number];

export type SolverEvent =
  | { type: 'stage'; stage: Stage }
  | { type: 'result'; solution: Solution }
  | ({ type: 'error' } & SolverErrorPayload);
