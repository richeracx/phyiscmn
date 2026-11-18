/**
 * Physicsmn E2E Test Suite — Test Utilities & Assertion Library
 */

import fs from 'node:fs';
import path from 'node:path';

// Root directory of the physicsmnv2 project
export const ROOT_DIR = path.resolve(process.cwd());

export class TestHarness {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    };
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = prevSuite;
    }
  }

  test(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {});
    }
    this.currentSuite.tests.push({ name, fn });
  }

  async runAll() {
    this.stats = { total: 0, passed: 0, failed: 0, skipped: 0 };
    const results = [];

    for (const suite of this.suites) {
      const suiteResult = {
        name: suite.name,
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: [],
      };

      for (const t of suite.tests) {
        this.stats.total++;
        const testResult = {
          name: t.name,
          passed: false,
          error: null,
          skipped: false,
          skipReason: null,
        };

        try {
          const maybePromise = t.fn();
          if (maybePromise && typeof maybePromise.then === 'function') {
            await maybePromise;
          }
          testResult.passed = true;
          suiteResult.passed++;
          this.stats.passed++;
        } catch (err) {
          if (err && err.isSkipped) {
            testResult.skipped = true;
            testResult.skipReason = err.message;
            suiteResult.skipped++;
            this.stats.skipped++;
          } else {
            testResult.passed = false;
            testResult.error = err ? err.stack || err.message || String(err) : 'Unknown error';
            suiteResult.failed++;
            this.stats.failed++;
          }
        }

        suiteResult.tests.push(testResult);
      }
      results.push(suiteResult);
    }

    return {
      stats: { ...this.stats },
      suites: results,
    };
  }
}

// Global default harness instance
export const harness = new TestHarness();
export const describe = (name, fn) => harness.describe(name, fn);
export const test = (name, fn) => harness.test(name, fn);

// Assertions
export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    throw new Error(`${message ? message + ' — ' : ''}Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertDeepEqual(actual, expected, message = '') {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message ? message + ' — ' : ''}Objects not deeply equal:\nExpected: ${expectedStr}\nActual:   ${actualStr}`);
  }
}

export function assertMatch(string, regex, message = '') {
  if (typeof string !== 'string' || !regex.test(string)) {
    throw new Error(`${message ? message + ' — ' : ''}String "${string}" failed to match regex ${regex}`);
  }
}

export function assertNotMatch(string, regex, message = '') {
  if (typeof string === 'string' && regex.test(string)) {
    throw new Error(`${message ? message + ' — ' : ''}String "${string}" matched forbidden regex ${regex}`);
  }
}

export function assertCloseTo(actual, expected, delta = 0.05, message = '') {
  const diff = Math.abs(actual - expected);
  if (diff > delta) {
    throw new Error(`${message ? message + ' — ' : ''}Value ${actual} is not within ±${delta} of ${expected} (diff: ${diff})`);
  }
}

export function assertThrows(fn, message = 'Expected function to throw') {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(message);
  }
}

// File system inspection helpers
export function fileExists(relPath) {
  const fullPath = path.resolve(ROOT_DIR, relPath);
  return fs.existsSync(fullPath);
}

export function fileSizeBytes(relPath) {
  const fullPath = path.resolve(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return -1;
  const stat = fs.statSync(fullPath);
  return stat.size;
}

export function safeReadFile(relPath) {
  const fullPath = path.resolve(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf-8');
}

export function safeReadBuffer(relPath) {
  const fullPath = path.resolve(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath);
}

export function findFilesRecursively(dirRelPath, filter = () => true) {
  const fullDir = path.resolve(ROOT_DIR, dirRelPath);
  if (!fs.existsSync(fullDir)) return [];
  const results = [];

  function recurse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullEntryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.agents') {
          recurse(fullEntryPath);
        }
      } else if (entry.isFile()) {
        const rel = path.relative(ROOT_DIR, fullEntryPath);
        if (filter(rel, entry.name)) {
          results.push(rel);
        }
      }
    }
  }

  recurse(fullDir);
  return results;
}
