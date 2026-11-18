export const SOLVER_ERROR_CODES = [
  'empty_input',
  'text_too_long',
  'image_too_large',
  'image_type',
  'request_too_large',
  'bad_request',
  'forbidden',
  'rate_limited',
  'not_physics',
  'unreadable',
  'insufficient_data',
  'model_busy',
  'model_timeout',
  'model_blocked',
  'model_output',
  'not_configured',
  'network',
  'internal',
] as const;

export type SolverErrorCode = (typeof SOLVER_ERROR_CODES)[number];

export interface SolverErrorPayload {
  code: SolverErrorCode;
  /** Short explanation from the solver itself (e.g. why a photo could not be read). Plain text. */
  detail?: string;
  /** Seconds until another attempt is allowed. */
  retryAfter?: number;
}

const HTTP_STATUS: Record<SolverErrorCode, number> = {
  empty_input: 400,
  text_too_long: 413,
  image_too_large: 413,
  image_type: 415,
  request_too_large: 413,
  bad_request: 400,
  forbidden: 403,
  rate_limited: 429,
  not_physics: 422,
  unreadable: 422,
  insufficient_data: 422,
  model_busy: 503,
  model_timeout: 504,
  model_blocked: 422,
  model_output: 502,
  not_configured: 500,
  network: 503,
  internal: 500,
};

export class SolverError extends Error {
  readonly status: number;

  constructor(
    readonly code: SolverErrorCode,
    readonly options: { detail?: string; retryAfter?: number; cause?: unknown } = {},
  ) {
    super(code, { cause: options.cause });
    this.name = 'SolverError';
    this.status = HTTP_STATUS[code];
  }

  toPayload(): SolverErrorPayload {
    return { code: this.code, detail: this.options.detail, retryAfter: this.options.retryAfter };
  }
}

export function isSolverErrorCode(value: unknown): value is SolverErrorCode {
  return typeof value === 'string' && (SOLVER_ERROR_CODES as readonly string[]).includes(value);
}
