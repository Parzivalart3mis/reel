import type { Title } from '@/db/schema';

export interface Stats {
  watchlistCount: number;
  watchingCount: number;
  watchedCount: number;
  filmCount: number;
  seriesCount: number;
  averageRating: number; // 0 when no rated titles
  totalRuntimeMinutes: number;
  watchedThisYear: number;
}

/**
 * Pure dashboard aggregation over a user's titles. Average rating is across
 * rated titles only; total runtime sums films plus a per-episode estimate is
 * intentionally excluded (we only store film runtime reliably).
 */
export function computeStats(titles: Title[], now: Date = new Date()): Stats {
  const year = now.getFullYear();

  let watchlistCount = 0;
  let watchingCount = 0;
  let watchedCount = 0;
  let filmCount = 0;
  let seriesCount = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let totalRuntimeMinutes = 0;
  let watchedThisYear = 0;

  for (const t of titles) {
    if (t.type === 'FILM') filmCount += 1;
    else seriesCount += 1;

    if (t.status === 'WATCHLIST') watchlistCount += 1;
    else if (t.status === 'WATCHING') watchingCount += 1;
    else if (t.status === 'WATCHED') watchedCount += 1;

    if (typeof t.rating === 'number') {
      ratingSum += t.rating;
      ratingCount += 1;
    }

    if (t.status === 'WATCHED' && typeof t.runtime === 'number') {
      totalRuntimeMinutes += t.runtime;
    }

    if (
      t.status === 'WATCHED' &&
      t.watchedAt &&
      t.watchedAt.getFullYear() === year
    ) {
      watchedThisYear += 1;
    }
  }

  const averageRating =
    ratingCount === 0 ? 0 : Math.round((ratingSum / ratingCount) * 10) / 10;

  return {
    watchlistCount,
    watchingCount,
    watchedCount,
    filmCount,
    seriesCount,
    averageRating,
    totalRuntimeMinutes,
    watchedThisYear,
  };
}
