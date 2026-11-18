import assert from 'node:assert/strict';
import { verifyPhysicsSolution } from '../lib/solver/server/verify.ts';

console.log('======================================================================');
console.log(' DETERMINISTIC NEURO-SYMBOLIC VERIFICATION TEST SUITE (mathjs)');
console.log('======================================================================\n');

// 1. Valid Physics Test
console.log('--- TEST 1: Valid Kinetic Energy Derivation ---');
const test1Solution = {
  status: 'solved',
  reason: '',
  topic: { grade: 11, unit: 'Kuvvet ve Hareket', title: 'Kinetik Enerji' },
  statement: 'm = 2 kg kütleli cisim v = 10 m/s hızla hareket etmektedir. Kinetik enerjisini bulunuz.',
  given: [],
  find: [],
  assumptions: [],
  principles: [],
  steps: [],
  answers: [{ label: 'Kinetik Enerji', expression: 'E_k = 100\\,\\text{J}' }],
  choice: '',
  check: '',
  diagram: { kind: 'none', surface: 'none', inclineDeg: 0, forces: [] },
  verification: {
    variables: [
      { symbol: 'm', value: 2, unit: 'kg' },
      { symbol: 'v', value: 10, unit: 'm/s' },
    ],
    formula_expression: '0.5 * m * v^2',
    claimed_value: 100,
    claimed_unit: 'J',
  },
};

const res1 = verifyPhysicsSolution(test1Solution);
console.log('Result 1:', res1);
assert.equal(res1.passed, true, 'Test 1 must pass');
assert.equal(res1.mathVerified, true, 'Test 1 must be mathVerified');
assert.equal(res1.computedResult, '100.00 J');
console.log('✓ [PASS] Test 1: Valid physics passed cleanly with 100.00 J.\n');

// 2. Sabotaged Math Error Test
console.log('--- TEST 2: Sabotaged Numerical Calculation Error ---');
const test2Solution = {
  ...test1Solution,
  verification: {
    variables: [
      { symbol: 'm', value: 2, unit: 'kg' },
      { symbol: 'v', value: 10, unit: 'm/s' },
    ],
    formula_expression: '0.5 * m * v^2',
    claimed_value: 999, // Sabotaged wrong number (correct is 100)
    claimed_unit: 'J',
  },
};

const res2 = verifyPhysicsSolution(test2Solution);
console.log('Result 2:', res2);
assert.equal(res2.passed, false, 'Test 2 must fail due to arithmetic mismatch');
assert.equal(res2.mathVerified, false);
console.log('Exact errorReason:\n  ' + res2.errorReason);
console.log('✓ [PASS] Test 2: Arithmetic sabotage successfully caught and rejected.\n');

// 3. Sabotaged SI Unit Mismatch Test
console.log('--- TEST 3: Sabotaged SI Dimensional Mismatch ---');
const test3Solution = {
  ...test1Solution,
  verification: {
    variables: [
      { symbol: 'm', value: 2, unit: 'kg' },
      { symbol: 'v', value: 10, unit: 'm/s' },
    ],
    formula_expression: '0.5 * m * v^2',
    claimed_value: 100,
    claimed_unit: 'm/s', // Sabotaged wrong unit: velocity instead of energy!
  },
};

const res3 = verifyPhysicsSolution(test3Solution);
console.log('Result 3:', res3);
assert.equal(res3.passed, false, 'Test 3 must fail due to dimensional mismatch');
assert.equal(res3.mathVerified, false);
console.log('Exact errorReason:\n  ' + res3.errorReason);
console.log('✓ [PASS] Test 3: Dimensional sabotage successfully caught and rejected.\n');

// 4. Degree vs. Radian Trigonometry Test
console.log('--- TEST 4: Trigonometric Evaluation with Degrees ---');
const test4Solution = {
  status: 'solved',
  reason: '',
  topic: { grade: 11, unit: 'Kuvvet ve Hareket', title: 'Eğik Atış' },
  statement: 'v0 = 50 m/s ve theta = 37° için düşey hız bileşenini bulunuz.',
  given: [],
  find: [],
  assumptions: [],
  principles: [],
  steps: [],
  answers: [{ label: 'Düşey Hız', expression: 'v_y = 30\\,\\text{m/s}' }],
  choice: '',
  check: '',
  diagram: { kind: 'none', surface: 'none', inclineDeg: 0, forces: [] },
  verification: {
    variables: [
      { symbol: 'v0', value: 50, unit: 'm/s' },
      { symbol: 'theta', value: 37, unit: 'deg' },
    ],
    formula_expression: 'v0 * sin(theta)',
    claimed_value: 30, // sin(37°) ≈ 0.6018, 50 * 0.6018 ≈ 30.09 m/s (within 2% of 30)
    claimed_unit: 'm/s',
  },
};

const res4 = verifyPhysicsSolution(test4Solution);
console.log('Result 4:', res4);
assert.equal(res4.passed, true, 'Test 4 must pass in degrees');
assert.equal(res4.mathVerified, true, 'Test 4 must be mathVerified');
assert.equal(res4.computedResult, '30.09 m/s');
console.log('✓ [PASS] Test 4: Trigonometric angles evaluated correctly in degrees.\n');

console.log('======================================================================');
console.log(' ALL 4 DETERMINISTIC MATHJS UNIT TESTS PASSED (100%)');
console.log('======================================================================');
