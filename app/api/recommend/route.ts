import { type NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { ApiError, parseJsonBody, toErrorResponse } from '@/lib/api';
import { enforceRateLimit } from '@/lib/ratelimit';
import { recommendSchema } from '@/lib/schemas/tmdb';
import { listUserTitles } from '@/lib/titles-service';
import { recommendConfigured, streamRecommendation } from '@/lib/recommend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * OPTIONAL (spec section 7). Delete this route, the watch-tonight UI, and the
 * ANTHROPIC_API_KEY env var to ship Reel with no model at all.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    await enforceRateLimit('recommend', userId);

    if (!recommendConfigured()) {
      throw new ApiError('CONFIG', 'Watch Tonight is not configured');
    }

    const body = await parseJsonBody(req);
    const { mood, maxRuntime } = recommendSchema.parse(body);

    const titles = await listUserTitles(userId);
    const stream = streamRecommendation({
      titles,
      ...(mood ? { mood } : {}),
      ...(maxRuntime ? { maxRuntime } : {}),
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
