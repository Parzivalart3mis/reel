import { NextResponse, type NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { toErrorResponse } from '@/lib/api';
import { enforceRateLimit } from '@/lib/ratelimit';
import { tmdbDetailsQuerySchema } from '@/lib/schemas/tmdb';
import { getDetails } from '@/lib/tmdb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    await enforceRateLimit('tmdb', userId);

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { tmdbId, type } = tmdbDetailsQuerySchema.parse(params);

    const details = await getDetails(tmdbId, type);
    return NextResponse.json(details);
  } catch (err) {
    return toErrorResponse(err);
  }
}
