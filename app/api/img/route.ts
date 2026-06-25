import { type NextRequest } from 'next/server';
import { toErrorResponse } from '@/lib/api';
import { imgQuerySchema } from '@/lib/schemas/tmdb';
import { proxyImage } from '@/lib/img-proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public route (no auth) that streams custom poster URLs through the SSRF
 * guard. TMDB posters do NOT use this — they load directly via next/image.
 */
export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { u } = imgQuerySchema.parse(params);

    const { data, contentType } = await proxyImage(u);

    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=86400, immutable',
        'x-content-type-options': 'nosniff',
        'content-disposition': 'inline',
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
