import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { ApiError } from '@/lib/api';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

function make(limit: number, prefix: string): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, '60 s'),
    analytics: false,
    prefix: `reel:${prefix}`,
  });
}

/** Per-spec budgets. Null when Upstash isn't configured (local dev). */
const limiters = {
  write: make(60, 'write'),
  tmdb: make(30, 'tmdb'),
  recommend: make(10, 'recommend'),
};

export type LimiterName = keyof typeof limiters;

/**
 * Enforces a rate limit for a user on a named bucket. No-op when Upstash is
 * not configured so local dev and tests run without Redis.
 */
export async function enforceRateLimit(
  name: LimiterName,
  userId: string,
): Promise<void> {
  const limiter = limiters[name];
  if (!limiter) return;
  const { success } = await limiter.limit(userId);
  if (!success) {
    throw new ApiError('RATE_LIMITED', 'Too many requests, slow down a moment');
  }
}
