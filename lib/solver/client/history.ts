import { z } from 'zod';
import type { Solution } from '../schema';

export interface HistoryItem {
  id: string;
  timestamp: number;
  topicTitle: string;
  grade: number;
  unit: string;
  problemCount: number;
  hasMathVerified: boolean;
  problemSnippet: string;
  solution: Solution;
}

const STORAGE_KEY = 'physicsmn.solution_history';
const MAX_HISTORY_ITEMS = 30;

const MAX_TEXT = 20_000;
const MAX_HTML = 50_000;
const MAX_ARRAY = 50;

const richTextSchema = z
  .array(
    z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('text'), value: z.string().max(MAX_TEXT) }),
      z.object({ kind: z.literal('math'), html: z.string().max(MAX_HTML) }),
    ]),
  )
  .max(MAX_ARRAY);

const compiledProblemSchema = z.object({
  topic: z.object({
    grade: z.number().int().min(9).max(12),
    unit: z.string().max(200),
    title: z.string().max(500),
  }),
  statement: richTextSchema,
  given: z
    .array(
      z.object({
        symbol: z.string().max(MAX_HTML),
        value: z.string().max(MAX_HTML),
        meaning: richTextSchema,
      }),
    )
    .max(MAX_ARRAY),
  find: z
    .array(
      z.object({
        symbol: z.string().max(MAX_HTML),
        meaning: richTextSchema,
      }),
    )
    .max(MAX_ARRAY),
  assumptions: z.array(richTextSchema).max(MAX_ARRAY),
  principles: z
    .array(
      z.object({
        name: z.string().max(1_000),
        formula: z.string().max(MAX_HTML),
      }),
    )
    .max(MAX_ARRAY),
  steps: z
    .array(
      z.object({
        title: z.string().max(1_000),
        text: richTextSchema,
        equations: z.array(z.string().max(MAX_HTML)).max(MAX_ARRAY),
      }),
    )
    .max(25),
  answers: z
    .array(
      z.object({
        label: z.string().max(2_000),
        expression: z.string().max(MAX_HTML),
      }),
    )
    .max(MAX_ARRAY),
  choice: z.enum(['', 'A', 'B', 'C', 'D', 'E']),
  check: richTextSchema,
  diagram: z.object({
    kind: z.enum(['none', 'forces']),
    surface: z.enum(['none', 'floor', 'incline']),
    inclineDeg: z.number().min(0).max(89),
    forces: z
      .array(
        z.object({
          label: z.string().max(MAX_HTML),
          angleDeg: z.number().min(0).max(360),
          magnitude: z.number().min(0).max(1),
        }),
      )
      .max(30),
  }),
  mathVerified: z.boolean().optional(),
});

const solutionSchema = compiledProblemSchema.extend({
  problems: z.array(compiledProblemSchema).max(10).optional(),
});

const historyItemSchema = z.object({
  id: z.string().min(1).max(200),
  timestamp: z.number().nonnegative(),
  topicTitle: z.string().max(500),
  grade: z.number().int().min(9).max(12),
  unit: z.string().max(200),
  problemCount: z.number().int().min(1).max(10),
  hasMathVerified: z.boolean(),
  problemSnippet: z.string().max(200),
  solution: solutionSchema,
});

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const deduplicated: HistoryItem[] = [];
    const seen = new Set<string>();

    for (const item of parsed) {
      const result = historyItemSchema.safeParse(item);
      if (!result.success) continue;
      const validItem = result.data as HistoryItem;

      if (!validItem.id) continue;
      const answerKey = validItem.solution?.answers?.[0]?.expression || validItem.solution?.choice || validItem.id;
      const key =
        validItem.problemSnippet && validItem.problemSnippet.trim().length > 10
          ? validItem.problemSnippet.trim()
          : `${validItem.topicTitle}-${validItem.grade}-${answerKey}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(validItem);
      }
    }

    // If duplicate records or malformed entries were pruned, update localStorage silently
    if (deduplicated.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated));
    }

    return deduplicated;
  } catch {
    return [];
  }
}

export function saveToHistory(solution: Solution, problemText?: string): HistoryItem | null {
  if (typeof window === 'undefined') return null;

  try {
    const existing = getHistory();

    const topicTitle = solution.topic?.title?.trim() || 'Fizik Problemi';
    const grade = solution.topic?.grade || 11;
    const unit = solution.topic?.unit?.trim() || 'Fizik';
    const problemCount = solution.problems && solution.problems.length > 0 ? solution.problems.length : 1;
    const hasMathVerified = Boolean(
      solution.mathVerified || (solution.problems && solution.problems.some((p) => p.mathVerified)),
    );

    let snippet = (problemText || '').trim();
    if (!snippet && solution.statement) {
      snippet = solution.statement
        .map((p) => (p.kind === 'text' ? p.value : ''))
        .join(' ')
        .trim();
    }
    if (snippet.length > 120) {
      snippet = `${snippet.slice(0, 117)}…`;
    }

    // Robust deduplication: check if this solution or problem snippet already exists in history
    const existingIndex = existing.findIndex((item) => {
      // 1. Same snippet
      if (snippet && snippet.length > 10 && item.problemSnippet && item.problemSnippet.length > 10) {
        if (
          item.problemSnippet === snippet ||
          snippet.startsWith(item.problemSnippet) ||
          item.problemSnippet.startsWith(snippet)
        ) {
          return true;
        }
      }
      // 2. Same topic, grade, and answers/choice
      const itemAns = item.solution?.answers?.[0]?.expression || item.solution?.choice;
      const currAns = solution?.answers?.[0]?.expression || solution?.choice;
      if (
        item.topicTitle === topicTitle &&
        item.grade === grade &&
        itemAns &&
        currAns &&
        itemAns === currAns
      ) {
        return true;
      }
      return false;
    });

    if (existingIndex !== -1) {
      // Already in history: update the existing item rather than inserting a duplicate
      const matched = existing[existingIndex];
      const updatedItem: HistoryItem = {
        ...matched,
        timestamp: Date.now(),
        solution,
      };
      const updated = [updatedItem, ...existing.filter((_, idx) => idx !== existingIndex)].slice(0, MAX_HISTORY_ITEMS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('physicsmn:history'));
      return updatedItem;
    }

    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      topicTitle,
      grade,
      unit,
      problemCount,
      hasMathVerified,
      problemSnippet: snippet,
      solution,
    };

    const updated = [newItem, ...existing.filter((item) => item.id !== newItem.id)].slice(0, MAX_HISTORY_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('physicsmn:history'));
    return newItem;
  } catch (err) {
    console.warn('[history] Failed to save solution to local storage:', err);
    return null;
  }
}

export function deleteFromHistory(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getHistory();
    const updated = existing.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('physicsmn:history'));
  } catch (err) {
    console.warn('[history] Failed to delete item from local storage:', err);
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('physicsmn:history'));
  } catch (err) {
    console.warn('[history] Failed to clear history from local storage:', err);
  }
}
