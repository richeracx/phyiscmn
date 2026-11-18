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
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
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

    // Avoid duplicate insertions if user re-saves the same solution consecutively
    const first = existing[0];
    if (
      first &&
      first.topicTitle === topicTitle &&
      first.grade === grade &&
      Date.now() - first.timestamp < 5000
    ) {
      return first;
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
