import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { listUserTitles } from '@/lib/titles-service';
import { computeStats } from '@/lib/stats';
import { toErrorResponse } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await requireUserId();
    const titles = await listUserTitles(userId);
    return NextResponse.json(computeStats(titles));
  } catch (err) {
    return toErrorResponse(err);
  }
}
