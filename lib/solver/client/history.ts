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

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Deduplicate any duplicate entries that may have accumulated in storage
    const seen = new Set<string>();
    const deduplicated: HistoryItem[] = [];

    for (const item of parsed as HistoryItem[]) {
      if (!item || !item.id) continue;
      // Key by problem snippet or topicTitle + answer/choice
      const answerKey = item.solution?.answers?.[0]?.expression || item.solution?.choice || item.id;
      const key =
        item.problemSnippet && item.problemSnippet.trim().length > 10
          ? item.problemSnippet.trim()
          : `${item.topicTitle}-${item.grade}-${answerKey}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    // If duplicate records were pruned, update localStorage silently
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
