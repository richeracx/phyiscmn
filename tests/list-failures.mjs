import { harness } from './e2e/fixtures/test-utils.mjs';
import { registerTier1Tests } from './e2e/tier1-features.mjs';
import { registerTier2Tests } from './e2e/tier2-boundaries.mjs';
import { registerTier3Tests } from './e2e/tier3-combinations.mjs';
import { registerTier4Tests } from './e2e/tier4-scenarios.mjs';

registerTier1Tests();
registerTier2Tests();
registerTier3Tests();
registerTier4Tests();

const report = await harness.runAll();
let count = 0;
for (const s of report.suites) {
  for (const t of s.tests) {
    if (!t.passed) {
      count++;
      const lines = (t.error || '').split('\n');
      const reason = lines[0] || '';
      const failLine = lines.find((l) => l.includes('failed to match') || l.includes('AssertionError')) || '';
      console.log(`#${count} [${s.name}] ${t.name}`);
      console.log(`   ${reason}`);
      console.log(`   ${failLine.trim()}`);
      console.log('---');
    }
  }
}
console.log(`Total failures: ${count}`);
