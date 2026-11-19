#!/usr/bin/env node
/**
 * Physicsmn Multi-Question Worksheet Benchmark Runner
 *
 * Runs each worksheet image TWICE:
 *   - Run A: Raw LLM baseline (without mathjs verification / self-correction)
 *   - Run B: Full Physicsmn (with deterministic mathjs SI unit & numerical verification + self-correction retry active)
 *
 * Expands each worksheet's `problems[]` array so every single question gets its own
 * numbered row in benchmark/results-57.csv and in the terminal output. Zero answer-key JSON needed.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';

const require = createRequire(import.meta.url);
const ROOT_DIR = process.cwd();

// Auto-load .env.local and .env if present
for (const envFile of ['.env.local', '.env']) {
  const envPath = path.resolve(ROOT_DIR, envFile);
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
    } catch {}
  }
}

// Initialize jiti to load TypeScript modules with 'server-only' safely stubbed
const jiti = require('jiti')(ROOT_DIR, {
  alias: {
    'server-only': path.resolve(ROOT_DIR, 'node_modules/server-only/empty.js'),
    '@': ROOT_DIR,
  },
});

const { solve } = jiti('./lib/solver/server/solve.ts');
const { streamGptSolution } = jiti('./lib/solver/server/gpt.ts');
const { compileWorksheet } = jiti('./lib/solver/server/render.ts');
const { WorksheetResponse } = jiti('./lib/solver/schema.ts');
const { verifyPhysicsSolution } = jiti('./lib/solver/server/verify.ts');

const BENCHMARK_DIR = path.resolve(ROOT_DIR, 'benchmark');
const IMAGES_DIR = path.resolve(BENCHMARK_DIR, 'images');
const CSV_OUTPUT_PATH = path.resolve(BENCHMARK_DIR, 'results-57.csv');

// Parse CLI flags
const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return null;
}
const isMock = args.includes('--mock');
const limitArg = getArg('--limit');
const limit = limitArg ? parseInt(limitArg, 10) : Infinity;
const fileArg = getArg('--file');
const lang = (getArg('--lang') || 'tr').toLowerCase();

// Support passing API key directly via CLI flag (--key or --api-key)
const cliKey = getArg('--key') || getArg('--api-key');
if (cliKey) {
  process.env.OPENAI_API_KEY = cliKey;
}

/**
 * Sniffs image MIME type from binary buffer magic numbers or extension fallback.
 */
function detectMimeType(buffer, filename) {
  if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length > 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'image/png';
  }
  if (
    buffer.length > 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'image/png';
}

/**
 * Parses raw LLM text output into validated WorksheetResponse.
 */
function parseRawWorksheet(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const json = JSON.parse(cleaned);
  const result = WorksheetResponse.safeParse(json);
  if (!result.success) {
    throw new Error('Worksheet schema validation failed: ' + JSON.stringify(result.error.issues));
  }
  return result.data;
}

/**
 * Extracts clean choice or short answer string from problem object.
 */
function getProblemChoice(prob) {
  if (!prob) return 'N/A';
  if (prob.choice && String(prob.choice).trim()) {
    const cleanChoice = String(prob.choice)
      .replace(/<[^>]*>?|<[^>]*$/g, '')
      .trim()
      .toUpperCase();
    const match = cleanChoice.match(/\b([A-E])\b/);
    if (match) return match[1];
    if (cleanChoice.length > 0 && ['A', 'B', 'C', 'D', 'E'].includes(cleanChoice[0])) return cleanChoice[0];
    return cleanChoice || 'N/A';
  }
  if (prob.answers && prob.answers.length > 0) {
    const rawExpr = prob.answers[0].expression || prob.answers[0].label || '';
    // Strip LaTeX and HTML markup for clean table representation
    const clean = rawExpr
      .replace(/<[^>]*>?|<[^>]*$/g, '')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/[\$\\]/g, '')
      .trim();
    if (clean) return clean.slice(0, 20);
  }
  return 'N/A';
}

/**
 * Escapes CSV values with RFC-4180 rules.
 */
function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Run A: Raw LLM baseline without mathjs verification or self-correction loop.
 */
async function runWithoutMathJs(imageBuffer, filename) {
  const mimeType = detectMimeType(imageBuffer, filename);
  const input = {
    problem: '',
    lang,
    image: { data: imageBuffer, mimeType },
  };

  const controller = new AbortController();
  const startTime = Date.now();
  let text = '';

  try {
    for await (const chunk of streamGptSolution(input, controller.signal)) {
      text += chunk;
    }
    const parsed = parseRawWorksheet(text);
    const compiled = compileWorksheet(parsed);
    const elapsedMs = Date.now() - startTime;
    return {
      solution: compiled.solution,
      rawParsed: parsed,
      elapsedMs,
      error: null,
    };
  } catch (err) {
    const elapsedMs = Date.now() - startTime;
    return {
      solution: null,
      rawParsed: null,
      elapsedMs,
      error: err,
    };
  }
}

/**
 * Run B: Full Physicsmn pipeline with deterministic mathjs verification + self-correction retry active.
 */
async function runWithPhysicsmn(imageBuffer, filename) {
  const mimeType = detectMimeType(imageBuffer, filename);
  const input = {
    problem: '',
    lang,
    image: { data: imageBuffer, mimeType },
  };

  let gptCallCount = 0;
  let rawGptJson = null;
  let streamPromise = null;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    const urlStr = String(url);
    if (urlStr.includes('/chat/completions')) {
      gptCallCount++;
      const reqBody = typeof options.body === 'string' ? options.body : '';
      const isStream = reqBody.includes('"stream":true');

      const response = await originalFetch(url, options);

      if (isStream && response.body) {
        const [s1, s2] = response.body.tee();
        streamPromise = (async () => {
          try {
            const reader = s2.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            let fullText = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              const lines = buf.split('\n');
              buf = lines.pop() ?? '';
              for (const line of lines) {
                const tr = line.trim();
                if (tr.startsWith('data: ') && tr !== 'data: [DONE]') {
                  try {
                    const p = JSON.parse(tr.slice(6));
                    const delta = p.choices?.[0]?.delta?.content;
                    if (delta) fullText += delta;
                  } catch {}
                }
              }
            }
            if (fullText) {
              rawGptJson = parseRawWorksheet(fullText);
            }
          } catch {}
        })();

        return new Response(s1, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } else if (!isStream) {
        const clone = response.clone();
        (async () => {
          try {
            const json = await clone.json();
            const content = json.choices?.[0]?.message?.content;
            if (content) {
              rawGptJson = parseRawWorksheet(content);
            }
          } catch {}
        })();
        return response;
      }
    }
    return originalFetch(url, options);
  };

  const startTime = Date.now();
  let solution = null;
  const abortController = new AbortController();

  try {
    for await (const event of solve(input, abortController.signal)) {
      if (event.type === 'result') {
        solution = event.solution;
      }
    }
    if (streamPromise) {
      await streamPromise;
    }
    const elapsedMs = Date.now() - startTime;
    const selfCorrectionFired = gptCallCount > 1;

    return {
      solution,
      rawGptJson,
      selfCorrectionFired,
      elapsedMs,
      error: null,
    };
  } catch (err) {
    const elapsedMs = Date.now() - startTime;
    return {
      solution: null,
      rawGptJson: null,
      selfCorrectionFired: gptCallCount > 1,
      elapsedMs,
      error: err,
    };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

/**
 * Generates synthetic mock worksheet data simulating 6-7 questions per image,
 * where mathjs catches raw LLM calculation errors on a few questions and corrects them.
 */
function getMockWorksheetData(imgIdx, filename) {
  // 6 or 7 questions per worksheet
  const qCount = imgIdx % 2 === 0 ? 7 : 6;
  const choicesPool = ['A', 'B', 'C', 'D', 'E'];

  const problemsA = [];
  const problemsB = [];
  const rawProblems = [];

  let anySelfCorrectionFired = false;

  for (let q = 0; q < qCount; q++) {
    const baseChoice = choicesPool[(imgIdx * 3 + q) % choicesPool.length];
    // Simulate ~12% discrepancy rate where Raw LLM made an arithmetic mistake caught by MathJS
    const willErrorInRaw = (imgIdx * 7 + q) % 8 === 2;

    const choiceA = willErrorInRaw
      ? choicesPool[(choicesPool.indexOf(baseChoice) + 1) % choicesPool.length]
      : baseChoice;
    const choiceB = baseChoice;

    const mathVerified = true;
    const selfCorrected = willErrorInRaw;
    if (selfCorrected) anySelfCorrectionFired = true;

    problemsA.push({
      choice: choiceA,
      mathVerified: false,
      answers: [{ label: 'Sonuç', expression: `v = 1${q}\\,\\text{m/s}` }],
      principles: [{ name: 'Newton Yasaları', formula: 'F = m * a' }],
    });

    problemsB.push({
      choice: choiceB,
      mathVerified: true,
      answers: [{ label: 'Sonuç', expression: `v = 1${q}\\,\\text{m/s}` }],
      principles: [{ name: 'Newton Yasaları', formula: 'F = m * a' }],
    });

    rawProblems.push({
      verification: {
        formula_expression: 'm * a',
        claimed_unit: 'N',
        claimed_value: 10 + q * 2,
        variables: [
          { symbol: 'm', value: 2, unit: 'kg' },
          { symbol: 'a', value: 5 + q, unit: 'm/s^2' },
        ],
      },
    });
  }

  return {
    runA: {
      solution: { problems: problemsA },
      rawParsed: { problems: rawProblems },
      elapsedMs: 1400 + Math.floor(Math.sin(imgIdx) * 200),
      error: null,
    },
    runB: {
      solution: { problems: problemsB },
      rawGptJson: { problems: rawProblems },
      selfCorrectionFired: anySelfCorrectionFired,
      elapsedMs: anySelfCorrectionFired ? 2600 : 1600,
      error: null,
    },
  };
}

/**
 * Main benchmark runner entrypoint.
 */
async function main() {
  console.log('==================================================================================================');
  console.log('                 PHYSICSMN MULTI-QUESTION WORKSHEET BENCHMARK RUNNER');
  console.log('         Empirical Comparison: Raw LLM Baseline vs Full Physicsmn (MathJS + Self-Correction)');
  console.log('==================================================================================================\n');

  if (!fs.existsSync(BENCHMARK_DIR)) {
    fs.mkdirSync(BENCHMARK_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Discover and sort image files naturally
  const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp']);
  let imageFiles = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => imageExtensions.has(path.extname(f).toLowerCase()))
    .sort((a, b) => {
      const aNum = a.match(/^(\d+)(?:[._-]|$)/);
      const bNum = b.match(/^(\d+)(?:[._-]|$)/);
      if (aNum && bNum) {
        const diff = parseInt(aNum[1], 10) - parseInt(bNum[1], 10);
        if (diff !== 0) return diff;
      }
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });

  if (fileArg) {
    imageFiles = imageFiles.filter((f) => f === fileArg || path.parse(f).name === fileArg);
  }
  if (Number.isFinite(limit) && limit > 0) {
    imageFiles = imageFiles.slice(0, limit);
  }

  console.log(`[Config] Images directory:       ${path.relative(ROOT_DIR, IMAGES_DIR)}`);
  console.log(`[Config] Target images:          ${imageFiles.length} worksheet(s)`);
  console.log(`[Config] Output CSV:             ${path.relative(ROOT_DIR, CSV_OUTPUT_PATH)}\n`);

  if (imageFiles.length === 0 && !isMock) {
    console.log('--------------------------------------------------------------------------------------------------');
    console.log(' No image files (.png, .jpg, .jpeg, .webp) found in benchmark/images/');
    console.log('--------------------------------------------------------------------------------------------------');
    console.log('To run the benchmark:');
    console.log('1. Place your worksheet images into:');
    console.log(`   ${IMAGES_DIR}`);
    console.log('2. Run the runner:');
    console.log('   node scripts/test-images-57.mjs\n');
    console.log('Tip: You can test the runner and CSV output with synthetic mock worksheets:');
    console.log('   node scripts/test-images-57.mjs --mock\n');
    return;
  }

  // Check for API key presence if not mocking
  const hasKey = Boolean(
    process.env.OPENAI_API_KEY || process.env.GPT_API_KEY || process.env.LUNA_API_KEY
  );
  if (!hasKey && !isMock) {
    console.warn('⚠️  WARNING: No OpenAI API key detected (OPENAI_API_KEY, GPT_API_KEY, or LUNA_API_KEY).');
    console.warn('   Ensure OPENAI_API_KEY is configured in your environment or .env / .env.local file.\n');
  }

  const runList = isMock
    ? imageFiles.length > 0
      ? imageFiles
      : Array.from({ length: 10 }, (_, i) => `worksheet_${String(i + 1).padStart(2, '0')}.png`)
    : imageFiles;

  const allRows = [];
  const changedQuestions = [];
  let totalQuestionsCount = 0;
  let totalMathVerifiedCount = 0;
  let totalSelfCorrectedCount = 0;
  let totalChangedCount = 0;

  for (let imgIdx = 0; imgIdx < runList.length; imgIdx++) {
    const filename = runList[imgIdx];
    const imageNumStr = String(imgIdx + 1).padStart(2, '0');
    const totalImagesStr = String(runList.length).padStart(2, '0');

    console.log(`==================================================================================================`);
    console.log(`[${imageNumStr}/${totalImagesStr}] WORKSHEET: ${filename}`);
    console.log(`==================================================================================================`);

    let resA, resB;

    if (isMock) {
      const mockData = getMockWorksheetData(imgIdx, filename);
      resA = mockData.runA;
      resB = mockData.runB;
    } else {
      const imgPath = path.resolve(IMAGES_DIR, filename);
      const buffer = fs.readFileSync(imgPath);

      process.stdout.write(`  ▶ Executing Run A (Raw LLM baseline)... `);
      resA = await runWithoutMathJs(buffer, filename);
      if (resA.error) {
        console.log(`✗ Error (${resA.elapsedMs}ms): ${resA.error.message || resA.error}`);
      } else {
        const qCountA = resA.solution?.problems?.length || 1;
        console.log(`✓ Done (${resA.elapsedMs}ms, ${qCountA} questions detected)`);
      }

      process.stdout.write(`  ▶ Executing Run B (Full Physicsmn with MathJS)... `);
      resB = await runWithPhysicsmn(buffer, filename);
      if (resB.error) {
        console.log(`✗ Error (${resB.elapsedMs}ms): ${resB.error.message || resB.error}`);
      } else {
        const qCountB = resB.solution?.problems?.length || 1;
        console.log(`✓ Done (${resB.elapsedMs}ms, ${qCountB} questions detected, Self-Correction: ${resB.selfCorrectionFired ? 'YES' : 'NO'})`);
      }
    }

    if (resA.error && resB.error) {
      console.log(`\n  ✗ Failed to process worksheet ${filename}: Both runs encountered errors.\n`);
      continue;
    }

    const solA = resA.solution;
    const solB = resB.solution;

    const problemsA = solA?.problems && solA.problems.length > 0 ? solA.problems : solA ? [solA] : [];
    const problemsB = solB?.problems && solB.problems.length > 0 ? solB.problems : solB ? [solB] : [];
    const questionCount = Math.max(problemsA.length, problemsB.length);

    console.log(`\n  Detected Questions: ${questionCount}`);
    console.log(`  +------------+----------------+-------------+-----------------+-----------------+----------+`);
    console.log(`  | Question # | Without_MathJS | With_MathJS | MathJS_Verified | Self_Corrected? | Changed? |`);
    console.log(`  +------------+----------------+-------------+-----------------+-----------------+----------+`);

    for (let qIdx = 0; qIdx < questionCount; qIdx++) {
      const pA = problemsA[qIdx];
      const pB = problemsB[qIdx];
      const rawProbB = resB.rawGptJson?.problems?.[qIdx] ?? (qIdx === 0 ? resB.rawGptJson : null);

      const qNum = qIdx + 1;
      const choiceA = getProblemChoice(pA);
      const choiceB = getProblemChoice(pB);

      const mathVerified = pB ? Boolean(pB.mathVerified) : false;
      const selfCorrected = Boolean(resB.selfCorrectionFired);
      const isChanged = choiceA !== 'N/A' && choiceB !== 'N/A' && choiceA !== choiceB;

      totalQuestionsCount++;
      if (mathVerified) totalMathVerifiedCount++;
      if (selfCorrected) totalSelfCorrectedCount++;
      if (isChanged) totalChangedCount++;

      // Extract formula for CSV
      let formulaUnits = '';
      if (rawProbB?.verification?.formula_expression) {
        const f = rawProbB.verification.formula_expression.trim();
        const u = rawProbB.verification.claimed_unit ? rawProbB.verification.claimed_unit.trim() : '';
        formulaUnits = u ? `${f} [${u}]` : f;
      } else if (pB?.principles?.[0]?.formula) {
        formulaUnits = pB.principles[0].formula.trim();
      }

      if (rawProbB?.verification) {
        try {
          const audit = verifyPhysicsSolution(rawProbB);
          if (audit.computedResult) {
            formulaUnits += ` (audit: ${audit.computedResult})`;
          }
        } catch {}
      }

      const qPad = `Q${qNum}`.padEnd(10);
      const aPad = choiceA.padEnd(14);
      const bPad = choiceB.padEnd(11);
      const mvPad = (mathVerified ? 'YES' : 'NO').padEnd(15);
      const scPad = (selfCorrected ? 'YES' : 'NO').padEnd(15);
      const chPad = isChanged ? 'YES ⚠️' : 'NO';

      console.log(`  | ${qPad} | ${aPad} | ${bPad} | ${mvPad} | ${scPad} | ${chPad.padEnd(8)} |`);

      const row = {
        image: filename,
        question: qNum,
        withoutMathJs: choiceA,
        withMathJs: choiceB,
        mathJsVerified: mathVerified ? 'YES' : 'NO',
        selfCorrected: selfCorrected ? 'YES' : 'NO',
        changed: isChanged ? 'YES' : 'NO',
        formulaUnits,
      };
      allRows.push(row);

      if (isChanged) {
        changedQuestions.push({
          image: filename,
          question: qNum,
          withoutMathJs: choiceA,
          withMathJs: choiceB,
          mathJsVerified: mathVerified ? 'YES' : 'NO',
          selfCorrected: selfCorrected ? 'YES' : 'NO',
          formulaUnits,
        });
      }
    }
    console.log(`  +------------+----------------+-------------+-----------------+-----------------+----------+\n`);
  }

  // Export results to CSV
  const csvHeaders = [
    'Image',
    'Question #',
    'Without_MathJS',
    'With_MathJS',
    'MathJS_Verified',
    'Self_Corrected?',
    'Changed?',
    'Extracted_Formula_Units',
  ];

  const csvLines = [csvHeaders.join(',')];
  for (const r of allRows) {
    csvLines.push(
      [
        escapeCsv(r.image),
        escapeCsv(r.question),
        escapeCsv(r.withoutMathJs),
        escapeCsv(r.withMathJs),
        escapeCsv(r.mathJsVerified),
        escapeCsv(r.selfCorrected),
        escapeCsv(r.changed),
        escapeCsv(r.formulaUnits),
      ].join(','),
    );
  }
  fs.writeFileSync(CSV_OUTPUT_PATH, csvLines.join('\n') + '\n', 'utf-8');

  // Print final accuracy & discrepancy summary
  const mvPct =
    totalQuestionsCount > 0 ? ((totalMathVerifiedCount / totalQuestionsCount) * 100).toFixed(2) : '0.00';
  const scPct =
    totalQuestionsCount > 0 ? ((totalSelfCorrectedCount / totalQuestionsCount) * 100).toFixed(2) : '0.00';
  const chPct =
    totalQuestionsCount > 0 ? ((totalChangedCount / totalQuestionsCount) * 100).toFixed(2) : '0.00';

  console.log('==================================================================================================');
  console.log('                          PHYSICSMN MULTI-QUESTION BENCHMARK SUMMARY');
  console.log('==================================================================================================');
  console.log(`  Total Worksheet Images Processed:    ${runList.length}`);
  console.log(`  Total Questions Detected:            ${totalQuestionsCount}`);
  console.log(`  MathJS Verification Passed:          ${totalMathVerifiedCount} / ${totalQuestionsCount} (${mvPct}%)`);
  console.log(`  Auto-Repaired via Self-Correction:   ${totalSelfCorrectedCount} / ${totalQuestionsCount} (${scPct}%)`);
  console.log(`  Discrepancies / Answers Changed:     ${totalChangedCount} / ${totalQuestionsCount} (${chPct}%)`);
  console.log(`  Benchmark CSV Exported:              ${path.relative(ROOT_DIR, CSV_OUTPUT_PATH)}`);
  console.log('==================================================================================================\n');

  console.log('DISCREPANCIES & REPAIRED QUESTIONS (Changed? = YES):');
  console.log('--------------------------------------------------------------------------------------------------');
  if (changedQuestions.length === 0) {
    console.log('  ✓ No discrepancies detected. All question choices matched identically between Run A and Run B.\n');
  } else {
    changedQuestions.forEach((item, idx) => {
      console.log(
        `  ${idx + 1}. [${item.image} - Question ${item.question}]`,
      );
      console.log(
        `     Raw LLM (Without_MathJS): ${item.withoutMathJs}  -->  Physicsmn (With_MathJS): ${item.withMathJs}`,
      );
      console.log(
        `     MathJS Verified: ${item.mathJsVerified} | Self-Correction Fired: ${item.selfCorrected}`,
      );
      if (item.formulaUnits) {
        console.log(`     Formula/Units:   ${item.formulaUnits}`);
      }
      console.log('');
    });
    console.log(`  Total Discrepancies Repaired: ${changedQuestions.length} question(s)\n`);
  }
}

main().catch((err) => {
  console.error('[Benchmark Runner] Fatal error:', err);
  process.exit(1);
});
