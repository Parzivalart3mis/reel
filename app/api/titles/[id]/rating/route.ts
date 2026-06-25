import { NextResponse, type NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { ApiError, parseJsonBody, toErrorResponse } from '@/lib/api';
import { enforceRateLimit } from '@/lib/ratelimit';
import { ratingSchema } from '@/lib/schemas/title';
import { getUserTitle, patchTitle } from '@/lib/titles-service';
import { serializeTitle } from '@/lib/serialize';
import type { NewTitle } from '@/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await enforceRateLimit('write', userId);

    const { rating } = ratingSchema.parse(await parseJsonBody(req));

    const existing = await getUserTitle(userId, id);
    if (!existing) throw new ApiError('NOT_FOUND', 'Title not found');

    const patch: Partial<NewTitle> = { rating };
    // Rating something implies you've watched it.
    if (rating !== null && existing.status !== 'WATCHED') {
      patch.status = 'WATCHED';
      if (!existing.watchedAt) patch.watchedAt = new Date();
    }

    const title = await patchTitle(userId, id, patch);
    return NextResponse.json({ title: serializeTitle(title) });
  } catch (err) {
    return toErrorResponse(err);
  }
}
