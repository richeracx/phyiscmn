import 'server-only';
import { SolverError, type SolverErrorCode } from '../errors';
import { ModelSolution, type SolverEvent, type Stage } from '../schema';
import { config } from './config';
import { generateGptSolution, streamGptSolution } from './gpt';
import { correctionPrompt, systemInstruction, userPrompt } from './prompt';
import { compileSolution } from './render';
import type { SolveInput } from './request';
import { verifyPhysicsSolution } from './verify';

/** Top-level keys in schema order; their first appearance in the stream marks real progress. */
const STAGE_MARKERS: ReadonlyArray<{ key: string; stage: Stage }> = [
  { key: '"principles"', stage: 'laws' },
  { key: '"steps"', stage: 'derive' },
  { key: '"answers"', stage: 'verify' },
];

const UNSOLVED: Record<Exclude<ModelSolution['status'], 'solved'>, SolverErrorCode> = {
  not_physics: 'not_physics',
  unreadable: 'unreadable',
  insufficient_data: 'insufficient_data',
};

function parse(text: string): ModelSolution {
  let cleaned = text.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let json: unknown;
  try {
    json = JSON.parse(cleaned);
  } catch (error) {
    console.error('[solver] JSON.parse failed. Raw text preview:', text.slice(0, 300));
    throw new SolverError('model_output', { cause: error });
  }

  const result = ModelSolution.safeParse(json);
  if (!result.success) {
    console.error('[solver] Zod validation failed:', JSON.stringify(result.error.issues, null, 2));
    throw new SolverError('model_output', { cause: result.error });
  }

  const solution = result.data;
  if (solution.status !== 'solved') {
    throw new SolverError(UNSOLVED[solution.status], { detail: solution.reason.trim() || undefined });
  }

  // Ensure steps and answers are never empty
  if (solution.steps.length === 0) {
    solution.steps.push({
      title: 'Çözüm',
      text: solution.statement || 'Çözüm adımları',
      equations: [],
    });
  }
  if (solution.answers.length === 0) {
    const lastStep = solution.steps[solution.steps.length - 1];
    const lastEq = lastStep?.equations?.[lastStep.equations.length - 1];
    solution.answers.push({
      label: 'Sonuç',
      expression: lastEq || '',
    });
  }

  // Ensure "find" is always populated if empty by extracting from answers
  if (solution.find.length === 0 && solution.answers.length > 0) {
    for (const ans of solution.answers) {
      let targetSym = ans.expression.trim();
      const eqIdx = targetSym.indexOf('=');
      if (eqIdx !== -1) {
        targetSym = targetSym.slice(0, eqIdx).trim();
      }
      if (targetSym) {
        solution.find.push({
          symbol: `${targetSym} = ?`,
          meaning: ans.label || 'İstenen Değer',
        });
      }
    }
  }

  return solution;
}

/**
 * Solves physics problems strictly using GPT-6 Luna.
 */
export async function* solve(input: SolveInput, signal: AbortSignal): AsyncGenerator<SolverEvent> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) {
    throw new SolverError('not_configured', { detail: 'OpenAI API key is missing. Set OPENAI_API_KEY in Vercel.' });
  }

  yield { type: 'stage', stage: 'read' };

  let text = '';
  let marker = 0;

  for await (const chunk of streamGptSolution(input, signal)) {
    text += chunk;
    while (marker < STAGE_MARKERS.length && text.includes(STAGE_MARKERS[marker].key)) {
      yield { type: 'stage', stage: STAGE_MARKERS[marker].stage };
      marker += 1;
    }
  }
  while (marker < STAGE_MARKERS.length) {
    yield { type: 'stage', stage: STAGE_MARKERS[marker].stage };
    marker += 1;
  }

  const firstParsed = parse(text);
  const firstCompile = compileSolution(firstParsed);
  const firstAudit = verifyPhysicsSolution(firstParsed);

  // If both KaTeX compilation and deterministic mathjs verification passed (or was skipped for qualitative problems)
  if (firstCompile.ok && firstAudit.passed) {
    if (firstAudit.mathVerified) {
      firstCompile.solution.mathVerified = true;
    }
    yield { type: 'result', solution: firstCompile.solution };
    return;
  }

  // Attempt self-correction retry loop if KaTeX formatting or mathjs verification failed
  try {
    const promptText = userPrompt(input.problem, Boolean(input.image), input.lang);

    // Construct actionable error feedback for the model
    const feedbackParts: string[] = [];
    if (!firstCompile.ok) {
      feedbackParts.push(correctionPrompt(firstCompile.failures, input.lang));
    }
    if (!firstAudit.passed && firstAudit.errorReason) {
      feedbackParts.push(
        input.lang === 'tr'
          ? `Deterministik mathjs ve SI birim denetimi başarısız oldu:\n- ${firstAudit.errorReason}\nLütfen cebirsel bağıntılarınızı, "formula_expression" ifadenizi ve sayısal işlemlerinizi kontrol edin. Çelişkiyi giderip tüm çözümü düzeltilmiş JSON olarak tekrar gönderin.`
          : `Deterministic mathjs & SI unit audit failed:\n- ${firstAudit.errorReason}\nPlease verify your algebraic relations, "formula_expression", and arithmetic calculation. Resolve the discrepancy and return the corrected complete JSON solution.`,
      );
    }
    const combinedFeedback = feedbackParts.join('\n\n');

    const messages = [
      {
        role: 'system' as const,
        content: `${systemInstruction(input.lang)}\n\nIMPORTANT: You must return your entire output strictly as a valid JSON object matching the requested schema. No markdown formatting outside JSON.`,
      },
      {
        role: 'user' as const,
        content: input.image
          ? [
              { type: 'image_url' as const, image_url: { url: `data:${input.image.mimeType};base64,${input.image.data.toString('base64')}` } },
              { type: 'text' as const, text: promptText },
            ]
          : promptText,
      },
      { role: 'assistant' as const, content: text },
      { role: 'user' as const, content: combinedFeedback },
    ];
    const secondParsed = parse(await generateGptSolution(messages, signal));
    const secondCompile = compileSolution(secondParsed);
    const secondAudit = verifyPhysicsSolution(secondParsed);

    if (secondAudit.mathVerified) {
      secondCompile.solution.mathVerified = true;
    }
    yield { type: 'result', solution: secondCompile.solution };
  } catch (err) {
    console.warn('[solver] Auto-repair attempt failed; serving initial parsed solution with fallback:', err);
    if (firstAudit.mathVerified) {
      firstCompile.solution.mathVerified = true;
    }
    yield { type: 'result', solution: firstCompile.solution };
  }
}
