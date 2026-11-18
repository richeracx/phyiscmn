import { z } from 'zod';
import type { SolverErrorPayload } from './errors';

const tex = (description: string) => z.string().max(400).describe(description);
const prose = (max: number, description: string) => z.string().max(max).describe(description);

/**
 * What the model must return. The same schema constrains Gemini's JSON output,
 * validates it on the server and types the rendered result.
 */
export const ModelSolution = z.object({
  status: z
    .enum(['solved', 'not_physics', 'unreadable', 'insufficient_data'])
    .describe('solved, or why the problem cannot be solved'),
  reason: prose(300, 'Empty when solved. Otherwise one or two plain sentences telling the student what is wrong.'),
  topic: z.object({
    grade: z.number().int().min(9).max(12).describe('MEB lise grade the problem belongs to'),
    unit: prose(80, 'MEB curriculum unit name'),
    title: prose(100, 'Short title for this problem'),
  }),
  statement: prose(1500, 'The problem restated exactly as understood, including any answer options'),
  given: z
    .array(
      z.object({
        symbol: tex('LaTeX symbol, e.g. m'),
        value: tex('LaTeX value with SI unit, e.g. 2\\,\\text{kg}'),
        meaning: prose(100, 'What the quantity is'),
      }),
    )
    .max(16),
  find: z
    .array(
      z.object({
        symbol: tex('LaTeX symbol of the unknown'),
        meaning: prose(100, 'What is asked'),
      }),
    )
    .max(8),
  assumptions: z.array(prose(240, 'One assumption or accepted value, e.g. g = 10 m/s²')).max(8),
  principles: z
    .array(
      z.object({
        name: prose(80, 'Law or principle as named in MEB textbooks'),
        formula: tex('Its general LaTeX form'),
      }),
    )
    .max(8),
  steps: z
    .array(
      z.object({
        title: prose(90, 'Short step heading'),
        text: prose(900, 'Explanation. Inline math only inside $...$'),
        equations: z.array(tex('One display equation, LaTeX')).max(6),
      }),
    )
    .max(14),
  answers: z
    .array(
      z.object({
        label: prose(80, 'What this answer is'),
        expression: tex('Final result in LaTeX with unit, e.g. a = 4\\,\\text{m/s}^2'),
      }),
    )
    .max(8),
  choice: z.enum(['', 'A', 'B', 'C', 'D', 'E']).describe('Correct option letter for multiple choice, else empty'),
  check: prose(500, 'Unit and reasonableness check. Inline math only inside $...$'),
  diagram: z.object({
    kind: z.enum(['none', 'forces']).describe('forces when a free-body diagram helps, else none'),
    surface: z.enum(['none', 'floor', 'incline']),
    inclineDeg: z.number().min(0).max(89),
    forces: z
      .array(
        z.object({
          label: tex('LaTeX label, e.g. F_s or mg'),
          angleDeg: z.number().min(0).max(360).describe('Direction, degrees counter-clockwise from +x (right)'),
          magnitude: z.number().min(0).max(1).describe('Length relative to the largest force'),
        }),
      )
      .max(8),
  }),
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
