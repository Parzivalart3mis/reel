import { NextResponse, type NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { toErrorResponse } from '@/lib/api';
import { enforceRateLimit } from '@/lib/ratelimit';
import { tmdbSearchQuerySchema } from '@/lib/schemas/tmdb';
import { searchTitles } from '@/lib/tmdb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    await enforceRateLimit('tmdb', userId);

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { q, type } = tmdbSearchQuerySchema.parse(params);

    const results = await searchTitles(q, type);
    return NextResponse.json({ results });
  } catch (err) {
    return toErrorResponse(err);
  }
}
