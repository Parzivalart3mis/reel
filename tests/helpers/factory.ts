import type { Title } from '@/db/schema';

let counter = 0;

/** Build a full Title with sensible defaults for pure-function tests. */
export function makeTitle(partial: Partial<Title> = {}): Title {
  counter += 1;
  const now = new Date('2026-06-01T00:00:00.000Z');
  return {
    id: `t${counter}`,
    userId: 'user_a',
    type: 'FILM',
    status: 'WATCHLIST',
    name: `Title ${counter}`,
    year: 2024,
    tmdbId: null,
    posterUrl: null,
    imageSource: 'NONE',
    overview: null,
    runtime: null,
    totalSeasons: null,
    genres: [],
    rating: null,
    currentSeason: null,
    currentEpisode: null,
    favorite: false,
    notes: null,
    tags: [],
    watchedAt: null,
    addedAt: now,
    updatedAt: now,
    ...partial,
  };
}
