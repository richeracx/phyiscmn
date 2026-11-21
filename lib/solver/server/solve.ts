import 'server-only';
import { SolverError, type SolverErrorCode } from '../errors';
import { WorksheetResponse, type SingleProblemSolution, type SolverEvent, type Stage } from '../schema';
import { config } from './config';
import { generateGptSolution, streamGptSolution } from './gpt';
import { correctionPrompt, systemInstruction, userPrompt } from './prompt';
import { compileWorksheet } from './render';
import type { SolveInput } from './request';
import { verifyPhysicsSolution } from './verify';

/** Top-level keys in schema order; their first appearance in the stream marks real progress. */
const STAGE_MARKERS: ReadonlyArray<{ key: string; stage: Stage }> = [
  { key: '"principles"', stage: 'laws' },
  { key: '"steps"', stage: 'derive' },
  { key: '"answers"', stage: 'verify' },
];

const UNSOLVED: Record<Exclude<SingleProblemSolution['status'], 'solved'>, SolverErrorCode> = {
  not_physics: 'not_physics',
  unreadable: 'unreadable',
  insufficient_data: 'insufficient_data',
};

function parse(text: string): WorksheetResponse {
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

  const result = WorksheetResponse.safeParse(json);
  if (!result.success) {
    console.error('[solver] Zod validation failed:', JSON.stringify(result.error.issues, null, 2));
    throw new SolverError('model_output', { cause: result.error });
  }

  const worksheet = result.data;

  // If there's a single problem with an unsolved status, throw specific user-friendly error
  if (worksheet.problems.length === 1) {
    const p = worksheet.problems[0];
    if (p.status !== 'solved') {
      throw new SolverError(UNSOLVED[p.status], { detail: p.reason.trim() || undefined });
    }
  }

  // Filter out any invalid non-solved problems if there are other solved problems
  const solved = worksheet.problems.filter((p) => p.status === 'solved');
  const activeProblems = solved.length > 0 ? solved : worksheet.problems;

  // Clean and prepare each problem without injecting fake placeholder cards
  for (const solution of activeProblems) {
    // Populate "find" from answers if empty and answers exist
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
  }

  return { problems: activeProblems };
}

/**
 * Solves physics problems strictly using GPT-6 Luna.
 */
export async function* solve(input: SolveInput, signal: AbortSignal): AsyncGenerator<SolverEvent> {
  const apiKey = config.openaiApiKey();
  if (!apiKey) {
    throw new SolverError('not_configured');
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
  const firstCompile = compileWorksheet(firstParsed);

  // Run mathjs verification independently on EACH problem in the worksheet
  let firstAllAuditsPassed = true;
  const firstAuditErrors: string[] = [];

  for (let i = 0; i < firstParsed.problems.length; i++) {
    const rawProblem = firstParsed.problems[i];
    const compiledProb = firstCompile.solution.problems?.[i];
    const auditRes = verifyPhysicsSolution(rawProblem);

    if (compiledProb) {
      compiledProb.mathVerified = auditRes.mathVerified;
    }
    if (i === 0) {
      firstCompile.solution.mathVerified = auditRes.mathVerified;
    }

    if (!auditRes.passed) {
      firstAllAuditsPassed = false;
      const probTitle = rawProblem.topic?.title || `Soru ${i + 1}`;
      firstAuditErrors.push(`[${probTitle}] ${auditRes.errorReason}`);
    }
  }

  // If both KaTeX compilation and deterministic mathjs verification passed across all problems
  if (firstCompile.ok && firstAllAuditsPassed) {
    yield { type: 'result', solution: firstCompile.solution };
    return;
  }

  // Attempt self-correction retry loop if KaTeX formatting or mathjs verification failed on any problem
  try {
    const promptText = userPrompt(input.problem, Boolean(input.image), input.lang);

    const feedbackParts: string[] = [];
    if (!firstCompile.ok && firstCompile.failures.length > 0) {
      feedbackParts.push(correctionPrompt(firstCompile.failures, input.lang));
    }
    if (!firstAllAuditsPassed && firstAuditErrors.length > 0) {
      feedbackParts.push(
        input.lang === 'tr'
          ? `Deterministik mathjs ve SI birim denetimi şu sorularda başarısız oldu:\n${firstAuditErrors.map((e) => `- ${e}`).join('\n')}\nLütfen ilgili sorulardaki "formula_expression", değişken birimleri ve sayısal işlemleri kontrol edin. Çelişkileri giderip tüm soruları içeren düzeltilmiş "problems" dizisini JSON olarak tekrar gönderin.`
          : `Deterministic mathjs & SI unit audit failed on problem(s):\n${firstAuditErrors.map((e) => `- ${e}`).join('\n')}\nPlease verify your algebraic relations, "formula_expression", and arithmetic calculation. Resolve the discrepancy and return the corrected complete JSON with all problems.`,
      );
    }
    const combinedFeedback = feedbackParts.join('\n\n');

    const messages = [
      {
        role: 'system' as const,
        content: `${systemInstruction(input.lang)}\n\nIMPORTANT: You must return your entire output strictly as a valid JSON object matching the requested schema with a top-level "problems" array. No markdown formatting outside JSON.`,
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
    const secondCompile = compileWorksheet(secondParsed);

    for (let i = 0; i < secondParsed.problems.length; i++) {
      const rawProb = secondParsed.problems[i];
      const compiledProb = secondCompile.solution.problems?.[i];
      const audit = verifyPhysicsSolution(rawProb);
      if (compiledProb) {
        compiledProb.mathVerified = audit.mathVerified;
      }
      if (i === 0) {
        secondCompile.solution.mathVerified = audit.mathVerified;
      }
    }

    yield { type: 'result', solution: secondCompile.solution };
  } catch (err) {
    console.warn('[solver] Auto-repair attempt failed; serving initial parsed solution with fallback:', err);
    yield { type: 'result', solution: firstCompile.solution };
  }
}
