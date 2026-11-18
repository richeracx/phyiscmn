#!/usr/bin/env node

/**
 * Physicsmn Landing Page — Automated Opaque-Box E2E Test Runner
 * 
 * Executable via: `node tests/e2e-runner.mjs`
 * 
 * Verifies all 4 tiers derived from ORIGINAL_REQUEST.md:
 * - Tier 1: Feature Coverage (95 tests)
 * - Tier 2: Boundary & Corner Cases (95 tests)
 * - Tier 3: Cross-Feature Combinations (22 tests)
 * - Tier 4: Real-World Acceptance Scenarios (5 scenarios)
 * 
 * Total: 217 automated assertions (Coverage threshold: >= 215)
 */

import { harness } from './e2e/fixtures/test-utils.mjs';
import { registerTier1Tests } from './e2e/tier1-features.mjs';
import { registerTier2Tests } from './e2e/tier2-boundaries.mjs';
import { registerTier3Tests } from './e2e/tier3-combinations.mjs';
import { registerTier4Tests } from './e2e/tier4-scenarios.mjs';

// ANSI color helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

async function main() {
  const startTime = Date.now();

  console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan} PHYSICS // MN — E2E TEST SUITE RUNNER (TIERS 1 - 4)${colors.reset}`);
  console.log(`${colors.dim} Executed at: ${new Date().toISOString()} | Node.js: ${process.version}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);

  // Register all 4 tiers
  registerTier1Tests();
  registerTier2Tests();
  registerTier3Tests();
  registerTier4Tests();

  // Execute all registered suites
  const report = await harness.runAll();
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print results per suite
  for (const suite of report.suites) {
    const isPassing = suite.failed === 0;
    const statusIcon = isPassing ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    const suiteStatusColor = isPassing ? colors.green : colors.red;

    console.log(`\n ${statusIcon} ${colors.bold}${suite.name}${colors.reset} ${colors.dim}(${suite.passed}/${suite.tests.length} passed)${colors.reset}`);

    if (suite.failed > 0) {
      for (const t of suite.tests) {
        if (!t.passed) {
          console.log(`   ${colors.red}✗ [FAIL] ${t.name}${colors.reset}`);
          if (t.error) {
            console.log(`     ${colors.dim}${t.error.split('\n').slice(0, 3).join('\n     ')}${colors.reset}`);
          }
        }
      }
    } else {
      // Print first 2 and last 1 as preview for brevity
      const preview = suite.tests.slice(0, 2);
      for (const t of preview) {
        console.log(`   ${colors.dim}• [PASS] ${t.name}${colors.reset}`);
      }
      if (suite.tests.length > 2) {
        console.log(`   ${colors.dim}  ... and ${suite.tests.length - 2} more passing assertions${colors.reset}`);
      }
    }
  }

  // Final summary box
  console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
  console.log(`${colors.bold} TOTAL CHECKS: ${colors.cyan}${report.stats.total}${colors.reset} | ${colors.green}PASSED: ${report.stats.passed}${colors.reset} | ${colors.red}FAILED: ${report.stats.failed}${colors.reset} | ${colors.yellow}SKIPPED: ${report.stats.skipped}${colors.reset} (${duration}s)`);

  if (report.stats.failed === 0) {
    console.log(`${colors.bold}${colors.green} STATUS: ALL ${report.stats.total} AUTOMATED CHECKS PASSED (100% PASS RATE)${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.bold}${colors.red} STATUS: ${report.stats.failed} ASSERTIONS FAILED${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n${colors.red}Fatal test runner error:${colors.reset}`, err);
  process.exit(1);
});
