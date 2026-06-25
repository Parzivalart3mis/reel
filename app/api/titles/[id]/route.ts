import { NextResponse, type NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { compact, parseJsonBody, toErrorResponse, ApiError } from '@/lib/api';
import { enforceRateLimit } from '@/lib/ratelimit';
import { titleUpdateSchema } from '@/lib/schemas/title';
import { getUserTitle, patchTitle, removeTitle } from '@/lib/titles-service';
import { serializeTitle } from '@/lib/serialize';
import type { NewTitle } from '@/db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const title = await getUserTitle(userId, id);
    if (!title) throw new ApiError('NOT_FOUND', 'Title not found');
    return NextResponse.json({ title: serializeTitle(title) });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await enforceRateLimit('write', userId);

    const body = await parseJsonBody(req);
    const input = titleUpdateSchema.parse(body);

    const existing = await getUserTitle(userId, id);
    if (!existing) throw new ApiError('NOT_FOUND', 'Title not found');

    const patch = compact({ ...input }) as Partial<NewTitle>;

    // Stamp watchedAt only when first crossing into WATCHED.
    if (input.status === 'WATCHED' && existing.status !== 'WATCHED') {
      patch.watchedAt = new Date();
    }

    const title = await patchTitle(userId, id, patch);
    return NextResponse.json({ title: serializeTitle(title) });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await enforceRateLimit('write', userId);
    await removeTitle(userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
