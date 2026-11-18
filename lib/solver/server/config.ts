import 'server-only';

const read = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

/**
 * Server-side configuration.
 * All API keys and secrets are read lazily and strictly confined to server-only runtime.
 * Zero leaks to client bundles.
 */
export const config = {
  // GPT-6 Luna & OpenAI-compatible provider
  openaiApiKey: () => {
    const raw = read('OPENAI_API_KEY') ?? read('GPT_API_KEY') ?? read('LUNA_API_KEY');
    if (raw && !raw.startsWith('AIza')) return raw;
    const geminiRaw = read('GEMINI_API_KEY');
    if (geminiRaw && (geminiRaw.startsWith('sk-') || geminiRaw.startsWith('sess-'))) return geminiRaw;
    return undefined;
  },
  openaiBaseUrl: () => read('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1',
  openaiModel: () => read('OPENAI_MODEL') ?? read('GPT_MODEL') ?? 'gpt-6-luna',

  // Google Gemini provider (fallback or primary)
  geminiApiKey: () => {
    const gemini = read('GEMINI_API_KEY');
    if (gemini && !gemini.startsWith('sk-')) return gemini;
    const raw = read('OPENAI_API_KEY') ?? read('GPT_API_KEY') ?? read('LUNA_API_KEY');
    if (raw && raw.startsWith('AIza')) return raw;
    return undefined;
  },
  geminiModel: () => read('GEMINI_MODEL') ?? 'gemini-2.0-flash',

  // Check if any LLM provider key is available
  hasApiKey: () =>
    Boolean(
      read('OPENAI_API_KEY') ??
        read('GPT_API_KEY') ??
        read('LUNA_API_KEY') ??
        read('GEMINI_API_KEY'),
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
