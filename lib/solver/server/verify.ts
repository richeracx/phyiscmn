import { evaluate, isUnit, unit, type Unit } from 'mathjs';
import type { ModelSolution } from '../schema';

export interface VerificationResult {
  passed: boolean;
  mathVerified: boolean;
  computedResult?: string;
  errorReason?: string;
  skipped?: boolean;
}

/**
 * Normalizes colloquial or localized unit strings into standard mathjs unit tokens.
 */
export function normalizeUnit(raw: string): string {
  if (!raw) return '';
  let u = raw.trim();

  // Strip LaTeX \text{...} wrappers if present
  u = u.replace(/\\text\{([^}]+)\}/g, '$1').trim();

  // Degree variations
  if (/^(?:°|deg|degree|derece)$/i.test(u)) return 'deg';

  // Dimensionless markers
  if (/^(?:birim|unit|none|-|dimensionless|oran|adet)$/i.test(u)) return '';

  // Turkish / colloquial unit replacements
  u = u.replace(/\bsaniye\b|\bsn\b/gi, 's');
  u = u.replace(/\bmetre\b|\bmeter\b/gi, 'm');
  u = u.replace(/\bkilogram\b/gi, 'kg');
  u = u.replace(/\bnewton\b/gi, 'N');
  u = u.replace(/\bjoule\b/gi, 'J');
  u = u.replace(/\bwatt\b/gi, 'W');
  u = u.replace(/\bpascal\b/gi, 'Pa');
  u = u.replace(/\bvolt\b/gi, 'V');
  u = u.replace(/\bamper\b|\bamp\b/gi, 'A');
  u = u.replace(/\bcoulomb\b/gi, 'C');
  u = u.replace(/\bohms?\b/gi, 'ohm');
  u = u.replace(/\bhertz\b/gi, 'Hz');
  u = u.replace(/\btesla\b/gi, 'T');

  // Acceleration units: m/s2 or m/s^2 -> m/s^2
  u = u.replace(/m\/s2\b/gi, 'm/s^2');
  // Compound dot or spaces: N.m or N m -> N*m
  u = u.replace(/\s*\.\s*|\s+/g, '*');

  return u;
}

/**
 * Checks whether a unit string represents a dimensionless quantity.
 */
export function isDimensionless(u: string): boolean {
  return !u || /^(?:birim|unit|none|-|dimensionless|oran|adet)$/i.test(u);
}

/**
 * Deterministic neuro-symbolic verifier using mathjs.
 * Audits numerical consistency and SI base dimensional equality ([M]^a [L]^b [T]^c).
 */
export function verifyPhysicsSolution(solution: ModelSolution): VerificationResult {
  const vBlock = solution.verification;

  // If no verification block or empty formula/variables, skip deterministic math audit gracefully
  if (!vBlock || !vBlock.formula_expression || vBlock.variables.length === 0) {
    return { passed: true, mathVerified: false, skipped: true };
  }

  // 1. Build mathjs scope with typed units
  const scope: Record<string, number | Unit> = {};

  for (const v of vBlock.variables) {
    // Sanitize symbol name: strip LaTeX slashes, spaces, underscores, braces
    const sym = v.symbol.replace(/[\s\\_{}]/g, '');
    if (!sym) continue;

    const numVal = Number(v.value);
    if (Number.isNaN(numVal)) continue;

    const normUnit = normalizeUnit(v.unit);
    if (isDimensionless(normUnit)) {
      scope[sym] = numVal;
    } else {
      try {
        scope[sym] = unit(numVal, normUnit);
      } catch {
        // Fallback to numeric scalar if custom unit string is unrecognized
        scope[sym] = numVal;
      }
    }
  }

  // 2. Sanitize and prepare algebraic formula expression
  let expr = vBlock.formula_expression.trim();
  expr = expr.replace(/\\times|\\cdot/g, '*');
  expr = expr.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))');
  expr = expr.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');
  expr = expr.replace(/\\left|\\right/g, '');
  expr = expr.replace(/\\sin/g, 'sin').replace(/\\cos/g, 'cos').replace(/\\tan/g, 'tan');

  // 3. Evaluate inside mathjs
  let evaluated: unknown;
  try {
    evaluated = evaluate(expr, scope);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      mathVerified: false,
      errorReason: `Deterministic mathjs evaluation failed for formula "${expr}": ${msg}. Check variable names and operators.`,
    };
  }

  // 4. Dimensional and numerical audit
  const claimedUnitNorm = normalizeUnit(vBlock.claimed_unit);
  const claimedValue = vBlock.claimed_value;

  if (claimedValue === undefined || Number.isNaN(claimedValue)) {
    return { passed: true, mathVerified: false, skipped: true };
  }

  let computedValue: number;
  let computedUnitStr: string;

  if (isUnit(evaluated)) {
    if (isDimensionless(claimedUnitNorm)) {
      return {
        passed: false,
        mathVerified: false,
        errorReason: `Dimensional mismatch: formula evaluated to physical unit "${evaluated.formatUnits()}", but claimed answer is dimensionless or unitless.`,
      };
    }

    let targetUnit: Unit;
    try {
      targetUnit = unit(1, claimedUnitNorm);
    } catch (err) {
      return {
        passed: false,
        mathVerified: false,
        errorReason: `Unrecognized claimed unit "${vBlock.claimed_unit}": ${err instanceof Error ? err.message : String(err)}`,
      };
    }

    // Strict SI base dimensional equivalence: [M]^a [L]^b [T]^c
    if (!evaluated.equalBase(targetUnit)) {
      return {
        passed: false,
        mathVerified: false,
        errorReason: `Dimensional mismatch: formula evaluated to dimensions of "${evaluated.formatUnits()}", which is incompatible with claimed unit "${claimedUnitNorm}". Base SI dimensions do not match.`,
      };
    }

    try {
      computedValue = evaluated.to(claimedUnitNorm).toNumber();
      computedUnitStr = claimedUnitNorm;
    } catch (err) {
      return {
        passed: false,
        mathVerified: false,
        errorReason: `Failed to convert evaluated result to claimed unit "${claimedUnitNorm}": ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  } else if (typeof evaluated === 'number') {
    if (!isDimensionless(claimedUnitNorm)) {
      return {
        passed: false,
        mathVerified: false,
        errorReason: `Dimensional mismatch: formula evaluated to a dimensionless scalar (${evaluated}), but claimed unit was "${claimedUnitNorm}". Physical units are missing.`,
      };
    }
    computedValue = evaluated;
    computedUnitStr = claimedUnitNorm || '';
  } else {
    return {
      passed: false,
      mathVerified: false,
      errorReason: `Evaluation did not produce a numeric or unit value (type: ${typeof evaluated}).`,
    };
  }

  // 5. Compare computed value against claimed value within 2% tolerance
  const absComputed = Math.abs(computedValue);
  const absClaimed = Math.abs(claimedValue);
  const diff = Math.min(
    Math.abs(computedValue - claimedValue),
    Math.abs(absComputed - absClaimed),
  );
  const denom = Math.max(absClaimed, absComputed, 1e-9);
  const relDiff = diff / denom;

  if (relDiff > 0.02) {
    return {
      passed: false,
      mathVerified: false,
      errorReason: `Numerical calculation mismatch: formula "${expr}" evaluated to ${computedValue.toFixed(3)} ${computedUnitStr}, which contradicts your claimed answer of ${claimedValue} ${vBlock.claimed_unit} (diff: ${(relDiff * 100).toFixed(1)}%, exceeds 2% tolerance). Re-calculate your arithmetic.`,
    };
  }

  const resultStr = `${computedValue.toFixed(2)} ${computedUnitStr}`.trim();
  return {
    passed: true,
    mathVerified: true,
    computedResult: resultStr,
  };
}
