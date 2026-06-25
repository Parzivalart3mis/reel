import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ApiError } from '@/lib/api';

vi.mock('@/lib/auth', () => ({
  requireUserId: vi.fn(async () => 'user_a'),
  ensureUser: vi.fn(async () => 'user_a'),
}));

const searchTitles = vi.fn();
const getDetails = vi.fn();
vi.mock('@/lib/tmdb', () => ({
  searchTitles: (...args: unknown[]) => searchTitles(...args),
  getDetails: (...args: unknown[]) => getDetails(...args),
  tmdbConfigured: () => true,
}));

import { GET as searchRoute } from '@/app/api/tmdb/search/route';
import { GET as detailsRoute } from '@/app/api/tmdb/details/route';

beforeEach(() => {
  searchTitles.mockReset();
  getDetails.mockReset();
});

describe('GET /api/tmdb/search', () => {
  it('returns results for a query', async () => {
    searchTitles.mockResolvedValue([
      { tmdbId: 1, type: 'FILM', name: 'Dune', year: 2024, posterUrl: null },
    ]);
    const res = await searchRoute(
      new NextRequest('http://localhost/api/tmdb/search?q=dune'),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { results: unknown[] };
    expect(json.results).toHaveLength(1);
  });

  it('handles a no-results case', async () => {
    searchTitles.mockResolvedValue([]);
    const res = await searchRoute(
      new NextRequest('http://localhost/api/tmdb/search?q=zzzznotreal'),
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { results: unknown[] }).results).toEqual([]);
  });

  it('surfaces an upstream network failure as 502', async () => {
    searchTitles.mockRejectedValue(
      new ApiError('UPSTREAM', 'Could not reach the film database'),
    );
    const res = await searchRoute(
      new NextRequest('http://localhost/api/tmdb/search?q=dune'),
    );
    expect(res.status).toBe(502);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('UPSTREAM');
  });

  it('rejects a missing query with 400', async () => {
    const res = await searchRoute(
      new NextRequest('http://localhost/api/tmdb/search'),
    );
    expect(res.status).toBe(400);
  });
});

describe('GET /api/tmdb/details', () => {
  it('returns details for a tmdbId', async () => {
    getDetails.mockResolvedValue({
      name: 'Dune',
      year: 2024,
      posterUrl: null,
      overview: 'x',
      runtime: 166,
      totalSeasons: null,
      genres: ['Sci-Fi'],
    });
    const res = await detailsRoute(
      new NextRequest('http://localhost/api/tmdb/details?tmdbId=1&type=FILM'),
    );
    expect(res.status).toBe(200);
    expect(((await res.json()) as { name: string }).name).toBe('Dune');
  });

  it('rejects an invalid type', async () => {
    const res = await detailsRoute(
      new NextRequest('http://localhost/api/tmdb/details?tmdbId=1&type=BOOK'),
    );
    expect(res.status).toBe(400);
  });
});
