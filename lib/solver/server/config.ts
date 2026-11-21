import 'server-only';

const read = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

const isProduction = () => process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

const normalizeOrigin = (value: string): string | undefined => {
  const raw = value.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
};

export { normalizeOrigin };

const DEFAULT_RATE_LIMIT_SALT = 'physicsmn-v2-luna-secure-salt';

/**
 * Server-side configuration for the physics solver.
 * API keys and rate-limit secrets are read lazily and confined to server-only runtime.
 */
export const config = {
  // GPT Luna API Key
  openaiApiKey: () =>
    read('OPENAI_API_KEY') ?? read('GPT_API_KEY') ?? read('LUNA_API_KEY'),
  openaiBaseUrl: () => read('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1',
  openaiModel: () => read('OPENAI_MODEL') ?? read('GPT_MODEL') ?? 'gpt-5.6-luna',

  hasApiKey: () =>
    Boolean(
      read('OPENAI_API_KEY') ?? read('GPT_API_KEY') ?? read('LUNA_API_KEY'),
    ),

  /**
   * Allowed origin strings. On Vercel, the platform deployment hosts are allowed by
   * default. Explicit `SOLVER_ALLOWED_ORIGINS` entries are unioned in. Localhost
   * origins are only added outside production.
   */
  allowedOrigins: () => {
    const origins = new Set<string>();

    for (const value of (read('SOLVER_ALLOWED_ORIGINS') ?? '').split(',')) {
      const origin = normalizeOrigin(value);
      if (origin) origins.add(origin);
    }

    for (const host of [read('VERCEL_URL'), read('VERCEL_PROJECT_PRODUCTION_URL')]) {
      const origin = host ? normalizeOrigin(host) : undefined;
      if (origin) origins.add(origin);
    }

    if (!isProduction()) {
      origins.add('http://localhost');
      origins.add('http://localhost:3000');
      origins.add('http://127.0.0.1');
      origins.add('http://127.0.0.1:3000');
    }

    return [...origins];
  },

  redis: () => {
    const url = read('UPSTASH_REDIS_REST_URL');
    const token = read('UPSTASH_REDIS_REST_TOKEN');
    if (isProduction() && (!url || !token)) {
      throw new Error(
        '[solver] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in production; durable rate limiting requires Redis.',
      );
    }
    return url && token ? { url, token } : undefined;
  },

  /** Salt for hashing client addresses before they are used as rate-limit keys. */
  rateLimitSalt: () => {
    const salt = read('RATE_LIMIT_SALT');
    if (isProduction() && (!salt || salt === DEFAULT_RATE_LIMIT_SALT)) {
      throw new Error('[solver] RATE_LIMIT_SALT must be set to a non-default random value in production.');
    }
    return salt ?? DEFAULT_RATE_LIMIT_SALT;
  },
};
