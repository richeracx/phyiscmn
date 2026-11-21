import 'server-only';
import { createHash } from 'node:crypto';
import { config } from './config';

interface Window {
  name: 'minute' | 'day';
  limit: number;
  seconds: number;
}

export const DAILY_LIMIT = 20;

const MAX_MEMORY_KEYS = 2_000;

const WINDOWS: readonly Window[] = [
  { name: 'minute', limit: 5, seconds: 60 },
  { name: 'day', limit: DAILY_LIMIT, seconds: 86_400 },
];

export type RateLimitResult =
  | { ok: true; remaining: number; resetAfter: number }
  | { ok: false; retryAfter: number; remaining: 0; window: 'minute' | 'day' };

interface Store {
  /** Increments the counter for `key` and returns its value and seconds until it resets. */
  hit(key: string, seconds: number): Promise<{ count: number; resetIn: number }>;
}

class MemoryStore implements Store {
  private readonly counters = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, seconds: number) {
    const now = Date.now();
    const entry = this.counters.get(key);
    if (!entry || entry.resetAt <= now) {
      this.counters.set(key, { count: 1, resetAt: now + seconds * 1000 });
      this.prune(now);
      return { count: 1, resetIn: seconds };
    }
    entry.count += 1;
    this.prune(now);
    return { count: entry.count, resetIn: Math.ceil((entry.resetAt - now) / 1000) };
  }

  private prune(now: number) {
    for (const [key, entry] of this.counters) if (entry.resetAt <= now) this.counters.delete(key);
    while (this.counters.size > MAX_MEMORY_KEYS) {
      const oldest = this.counters.keys().next();
      if (oldest.done) break;
      this.counters.delete(oldest.value);
    }
  }
}

class RedisStore implements Store {
  constructor(private readonly redis: { url: string; token: string }) {}

  async hit(key: string, seconds: number) {
    const response = await fetch(`${this.redis.url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.redis.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(seconds), 'NX'],
        ['TTL', key],
      ]),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Rate-limit store responded ${response.status}`);
    const [incr, , ttl] = (await response.json()) as Array<{ result: number }>;
    return { count: incr.result, resetIn: ttl.result > 0 ? ttl.result : seconds };
  }
}

let store: Store | undefined;

function getStore(): Store {
  if (!store) {
    const redis = config.redis();
    store = redis ? new RedisStore(redis) : new MemoryStore();
  }
  return store;
}

const anonymise = (address: string) =>
  createHash('sha256').update(`${config.rateLimitSalt()}:${address}`).digest('base64url').slice(0, 22);

export async function rateLimit(address: string): Promise<RateLimitResult> {
  const id = anonymise(address);
  let retryAfter = 0;
  let window: 'minute' | 'day' = 'day';
  let remaining = DAILY_LIMIT;
  let resetAfter = 86_400;

  for (const current of WINDOWS) {
    const { count, resetIn } = await getStore().hit(`solver:${current.name}:${id}`, current.seconds);

    if (count > current.limit && resetIn > retryAfter) {
      retryAfter = resetIn;
      window = current.name;
    }

    if (current.name === 'day') {
      remaining = Math.max(0, current.limit - count);
      resetAfter = resetIn;
    }
  }

  if (retryAfter > 0) return { ok: false, retryAfter, remaining: 0, window };
  return { ok: true, remaining, resetAfter };
}
