import 'server-only';
import katex from 'katex';
import type { ModelSolution, RichText, Solution } from '../schema';

const KATEX_OPTIONS = {
  throwOnError: true,
  trust: false,
  strict: 'ignore',
  output: 'htmlAndMathml',
  maxSize: 20,
  maxExpand: 200,
} as const;

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
/** A run like "........" or "____" signals degenerate model output rather than prose. */
const DEGENERATE = /(\S)\1{11,}/;

class MathCompiler {
  readonly failures: string[] = [];

  tex(source: string, displayMode = false): string {
    const tex = source.replace(CONTROL_CHARS, '').trim();
    try {
      return katex.renderToString(tex, { ...KATEX_OPTIONS, displayMode });
    } catch {
      this.failures.push(tex);
      return '';
    }
  }

  /** Splits prose on single-dollar inline math and compiles each math span. */
  rich(source: string): RichText {
    const text = source.replace(CONTROL_CHARS, '').trim();
    if (DEGENERATE.test(text)) this.failures.push(text.slice(0, 80));
    const out: Array<RichText[number]> = [];
    const pattern = /(?<!\\)\$([^$]+?)(?<!\\)\$/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      const index = match.index ?? 0;
      if (index > cursor) out.push({ kind: 'text', value: text.slice(cursor, index).replace(/\\\$/g, '$') });
      out.push({ kind: 'math', html: this.tex(match[1]) });
      cursor = index + match[0].length;
    }
    const tail = text.slice(cursor);
    if (tail.includes('$') && !tail.includes('\\$')) this.failures.push(tail);
    if (tail) out.push({ kind: 'text', value: tail.replace(/\\\$/g, '$') });
    return out;
  }
}

export type CompileResult = { ok: true; solution: Solution } | { ok: false; failures: string[] };

export function compileSolution(raw: ModelSolution): CompileResult {
  const m = new MathCompiler();
  const solution: Solution = {
    topic: raw.topic,
    statement: m.rich(raw.statement),
    given: raw.given.map((g) => ({ symbol: m.tex(g.symbol), value: m.tex(g.value), meaning: m.rich(g.meaning) })),
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
  return m.failures.length > 0 ? { ok: false, failures: m.failures } : { ok: true, solution };
}
