import 'server-only';

const read = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

/**
 * Server-side configuration for GPT-6 Luna.
 * All API keys and secrets are read lazily and strictly confined to server-only runtime.
 * Zero leaks to client bundles.
 */
export const config = {
  // GPT-6 Luna API Key
  openaiApiKey: () =>
    read('OPENAI_API_KEY') ?? read('GPT_API_KEY') ?? read('LUNA_API_KEY'),
  openaiBaseUrl: () => read('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1',
  openaiModel: () => 'gpt-6-luna',

  // Check if API key is present
  hasApiKey: () =>
    Boolean(
      read('OPENAI_API_KEY') ??
        read('GPT_API_KEY') ??
        read('LUNA_API_KEY'),
    ),

  /** Comma-separated list of origins allowed to call the solver. Defaults to same-origin. */
  allowedOrigins: () =>
    (read('SOLVER_ALLOWED_ORIGINS') ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),

  redis: () => {
    const url = read('UPSTASH_REDIS_REST_URL');
    const token = read('UPSTASH_REDIS_REST_TOKEN');
    return url && token ? { url, token } : undefined;
  },

  /** Salt for hashing client addresses before they are used as rate-limit keys. */
  rateLimitSalt: () => read('RATE_LIMIT_SALT') ?? 'physicsmn-v2-luna-secure-salt',
};
