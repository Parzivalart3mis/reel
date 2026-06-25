import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TMDB_POSTER_BASE,
  getDetails,
  searchTitles,
  tmdbConfigured,
} from '@/lib/tmdb';
import { ApiError } from '@/lib/api';

const ok = (data: unknown) =>
  Promise.resolve({ ok: true, status: 200, json: async () => data } as Response);

const fetchMock = vi.fn();

beforeEach(() => {
  process.env.TMDB_API_KEY = 'plainkey';
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('tmdbConfigured', () => {
  it('reflects the env var', () => {
    expect(tmdbConfigured()).toBe(true);
    delete process.env.TMDB_API_KEY;
    expect(tmdbConfigured()).toBe(false);
  });
});

describe('searchTitles', () => {
  it('maps movie results', async () => {
    fetchMock.mockReturnValueOnce(
      ok({
        results: [
          {
            id: 1,
            title: 'Dune',
            release_date: '2024-03-01',
            poster_path: '/p.jpg',
            overview: 'sand',
          },
        ],
      }),
    );
    const r = await searchTitles('dune', 'FILM');
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/search/movie');
    expect(r[0]).toEqual({
      tmdbId: 1,
      type: 'FILM',
      name: 'Dune',
      year: 2024,
      posterUrl: `${TMDB_POSTER_BASE}/p.jpg`,
      overview: 'sand',
    });
  });

  it('maps series results with null posters', async () => {
    fetchMock.mockReturnValueOnce(
      ok({
        results: [
          { id: 2, name: 'Severance', first_air_date: '2022-02-01', poster_path: null },
        ],
      }),
    );
    const r = await searchTitles('sev', 'SERIES');
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/search/tv');
    expect(r[0]?.type).toBe('SERIES');
    expect(r[0]?.year).toBe(2022);
    expect(r[0]?.posterUrl).toBeNull();
  });

  it('filters person results from a multi search', async () => {
    fetchMock.mockReturnValueOnce(
      ok({
        results: [
          { id: 1, media_type: 'movie', title: 'A', release_date: '2020-01-01' },
          { id: 2, media_type: 'tv', name: 'B', first_air_date: '2021-01-01' },
          { id: 3, media_type: 'person', name: 'Someone' },
        ],
      }),
    );
    const r = await searchTitles('x');
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/search/multi');
    expect(r).toHaveLength(2);
    expect(r.map((x) => x.type)).toEqual(['FILM', 'SERIES']);
  });
});

describe('getDetails', () => {
  it('returns film details', async () => {
    fetchMock.mockReturnValueOnce(
      ok({
        title: 'Dune',
        release_date: '2024-03-01',
        runtime: 166,
        poster_path: '/p.jpg',
        genres: [{ id: 1, name: 'Sci-Fi' }],
      }),
    );
    const d = await getDetails(1, 'FILM');
    expect(d).toMatchObject({
      name: 'Dune',
      year: 2024,
      runtime: 166,
      totalSeasons: null,
      genres: ['Sci-Fi'],
    });
  });

  it('returns series details with episode runtime', async () => {
    fetchMock.mockReturnValueOnce(
      ok({
        name: 'Severance',
        first_air_date: '2022-02-01',
        number_of_seasons: 2,
        episode_run_time: [50],
        genres: [{ id: 1, name: 'Mystery' }],
      }),
    );
    const d = await getDetails(2, 'SERIES');
    expect(d.totalSeasons).toBe(2);
    expect(d.runtime).toBe(50);
  });
});

describe('error handling', () => {
  it('throws CONFIG without a key', async () => {
    delete process.env.TMDB_API_KEY;
    await expect(searchTitles('x', 'FILM')).rejects.toBeInstanceOf(ApiError);
  });

  it('throws UPSTREAM on a network failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));
    await expect(searchTitles('x', 'FILM')).rejects.toMatchObject({
      code: 'UPSTREAM',
    });
  });

  it('throws UPSTREAM on a non-ok response', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    await expect(getDetails(1, 'FILM')).rejects.toMatchObject({
      code: 'UPSTREAM',
    });
  });
});
