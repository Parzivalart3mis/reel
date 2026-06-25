import { NextResponse, type NextRequest } from 'next/server';
import { ensureUser, requireUserId } from '@/lib/auth';
import { compact, parseJsonBody, toErrorResponse } from '@/lib/api';
import { enforceRateLimit } from '@/lib/ratelimit';
import { listQuerySchema, titleCreateSchema } from '@/lib/schemas/title';
import { insertTitle, listUserTitles } from '@/lib/titles-service';
import { queryTitles } from '@/lib/query';
import { serializeTitle } from '@/lib/serialize';
import type { ImageSource } from '@/lib/constants';
import type { NewTitle } from '@/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = listQuerySchema.parse(params);

    const all = await listUserTitles(userId);
    const { titles, total, page } = queryTitles(all, query);

    return NextResponse.json({
      titles: titles.map(serializeTitle),
      total,
      page,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseJsonBody(req);
    const input = titleCreateSchema.parse(body);

    const userId = await ensureUser();
    await enforceRateLimit('write', userId);

    const status = input.status ?? 'WATCHLIST';

    // Infer the image source if the client didn't set it explicitly.
    let imageSource: ImageSource = input.imageSource ?? 'NONE';
    if (!input.imageSource && input.posterUrl) {
      imageSource = input.posterUrl.startsWith('https://image.tmdb.org/')
        ? 'TMDB'
        : 'CUSTOM';
    }

    const values = compact({
      userId,
      type: input.type,
      name: input.name,
      status,
      tmdbId: input.tmdbId,
      year: input.year,
      posterUrl: input.posterUrl,
      imageSource,
      overview: input.overview,
      runtime: input.runtime,
      totalSeasons: input.totalSeasons,
      genres: input.genres,
      rating: input.rating,
      currentSeason: input.currentSeason,
      currentEpisode: input.currentEpisode,
      favorite: input.favorite,
      notes: input.notes,
      tags: input.tags,
      watchedAt: status === 'WATCHED' ? new Date() : undefined,
    }) as NewTitle;

    const title = await insertTitle(values);
    return NextResponse.json({ title: serializeTitle(title) }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
