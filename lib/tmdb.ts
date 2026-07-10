import { ApiError } from '@/lib/api';
import type { TitleType } from '@/lib/constants';

const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export interface TmdbSearchResult {
  tmdbId: number;
  type: TitleType;
  name: string;
  year: number | null;
  posterUrl: string | null;
  overview: string | null;
}

export interface TmdbDetails {
  name: string;
  year: number | null;
  posterUrl: string | null;
  overview: string | null;
  runtime: number | null;
  totalSeasons: number | null;
  genres: string[];
  originalLanguage: string | null;
}

export function tmdbConfigured(): boolean {
  return Boolean(process.env.TMDB_API_KEY);
}

/**
 * Heuristic: a title is anime when it's animated and originally Japanese.
 * Used to auto-suggest an `anime` tag on add.
 */
export function isAnimeTitle(
  genres: string[],
  originalLanguage: string | null,
): boolean {
  return originalLanguage === 'ja' && genres.includes('Animation');
}

function authFor(key: string): { headers: HeadersInit; query: string } {
  // v4 read-access tokens are JWTs (contain dots); v3 keys are plain.
  if (key.includes('.')) {
    return { headers: { Authorization: `Bearer ${key}` }, query: '' };
  }
  return { headers: {}, query: `&api_key=${encodeURIComponent(key)}` };
}

async function tmdbFetch<T>(path: string, revalidate: number): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new ApiError('CONFIG', 'TMDB is not configured');
  }
  const { headers, query } = authFor(key);
  const sep = path.includes('?') ? '' : '?';
  const url = `${TMDB_BASE}${path}${sep}${query}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { accept: 'application/json', ...headers },
      next: { revalidate },
    });
  } catch {
    throw new ApiError('UPSTREAM', 'Could not reach the movie database');
  }
  if (!res.ok) {
    throw new ApiError('UPSTREAM', `Movie database error (${res.status})`);
  }
  return (await res.json()) as T;
}

function yearFrom(date: string | null | undefined): number | null {
  if (!date) return null;
  const y = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

function posterFrom(path: string | null | undefined): string | null {
  return path ? `${TMDB_POSTER_BASE}${path}` : null;
}

interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  overview?: string | null;
  media_type?: string;
}

interface SearchResponse {
  results?: TmdbMovie[];
}

/** Search films and/or series, normalised to our result shape. */
export async function searchTitles(
  q: string,
  type?: TitleType,
): Promise<TmdbSearchResult[]> {
  const query = encodeURIComponent(q);

  const mapMovie = (m: TmdbMovie): TmdbSearchResult => ({
    tmdbId: m.id,
    type: 'FILM',
    name: m.title ?? m.name ?? 'Untitled',
    year: yearFrom(m.release_date),
    posterUrl: posterFrom(m.poster_path),
    overview: m.overview ?? null,
  });
  const mapTv = (m: TmdbMovie): TmdbSearchResult => ({
    tmdbId: m.id,
    type: 'SERIES',
    name: m.name ?? m.title ?? 'Untitled',
    year: yearFrom(m.first_air_date),
    posterUrl: posterFrom(m.poster_path),
    overview: m.overview ?? null,
  });

  if (type === 'FILM') {
    const data = await tmdbFetch<SearchResponse>(
      `/search/movie?query=${query}&include_adult=false`,
      3600,
    );
    return (data.results ?? []).map(mapMovie);
  }
  if (type === 'SERIES') {
    const data = await tmdbFetch<SearchResponse>(
      `/search/tv?query=${query}&include_adult=false`,
      3600,
    );
    return (data.results ?? []).map(mapTv);
  }

  // Mixed search across both media kinds.
  const data = await tmdbFetch<SearchResponse>(
    `/search/multi?query=${query}&include_adult=false`,
    3600,
  );
  return (data.results ?? [])
    .filter((m) => m.media_type === 'movie' || m.media_type === 'tv')
    .map((m) => (m.media_type === 'tv' ? mapTv(m) : mapMovie(m)));
}

interface TmdbGenre {
  id: number;
  name: string;
}
interface MovieDetails {
  title?: string;
  overview?: string | null;
  release_date?: string;
  runtime?: number | null;
  poster_path?: string | null;
  genres?: TmdbGenre[];
  original_language?: string | null;
}
interface TvDetails {
  name?: string;
  overview?: string | null;
  first_air_date?: string;
  number_of_seasons?: number | null;
  episode_run_time?: number[];
  poster_path?: string | null;
  genres?: TmdbGenre[];
  original_language?: string | null;
}

/** Fetch full details for a single TMDB title. */
export async function getDetails(
  tmdbId: number,
  type: TitleType,
): Promise<TmdbDetails> {
  if (type === 'FILM') {
    const d = await tmdbFetch<MovieDetails>(`/movie/${tmdbId}`, 86400);
    return {
      name: d.title ?? 'Untitled',
      year: yearFrom(d.release_date),
      posterUrl: posterFrom(d.poster_path),
      overview: d.overview ?? null,
      runtime: d.runtime ?? null,
      totalSeasons: null,
      genres: (d.genres ?? []).map((g) => g.name),
      originalLanguage: d.original_language ?? null,
    };
  }
  const d = await tmdbFetch<TvDetails>(`/tv/${tmdbId}`, 86400);
  return {
    name: d.name ?? 'Untitled',
    year: yearFrom(d.first_air_date),
    posterUrl: posterFrom(d.poster_path),
    overview: d.overview ?? null,
    runtime: d.episode_run_time?.[0] ?? null,
    totalSeasons: d.number_of_seasons ?? null,
    genres: (d.genres ?? []).map((g) => g.name),
    originalLanguage: d.original_language ?? null,
  };
}
