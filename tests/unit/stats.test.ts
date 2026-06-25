import { describe, expect, it } from 'vitest';
import { computeStats } from '@/lib/stats';
import { makeTitle } from '../helpers/factory';

describe('computeStats', () => {
  const now = new Date('2026-06-24T12:00:00.000Z');

  it('returns zeroed stats for an empty library', () => {
    const s = computeStats([], now);
    expect(s.watchlistCount).toBe(0);
    expect(s.averageRating).toBe(0);
    expect(s.totalRuntimeMinutes).toBe(0);
    expect(s.watchedThisYear).toBe(0);
  });

  it('counts statuses and types', () => {
    const titles = [
      makeTitle({ status: 'WATCHLIST', type: 'FILM' }),
      makeTitle({ status: 'WATCHLIST', type: 'SERIES' }),
      makeTitle({ status: 'WATCHING', type: 'SERIES' }),
      makeTitle({ status: 'WATCHED', type: 'FILM' }),
    ];
    const s = computeStats(titles, now);
    expect(s.watchlistCount).toBe(2);
    expect(s.watchingCount).toBe(1);
    expect(s.watchedCount).toBe(1);
    expect(s.filmCount).toBe(2);
    expect(s.seriesCount).toBe(2);
  });

  it('averages ratings across rated titles only, rounded to 1 decimal', () => {
    const titles = [
      makeTitle({ status: 'WATCHED', rating: 5 }),
      makeTitle({ status: 'WATCHED', rating: 4 }),
      makeTitle({ status: 'WATCHED', rating: 2 }),
      makeTitle({ status: 'WATCHLIST', rating: null }),
    ];
    // (5 + 4 + 2) / 3 = 3.666… -> 3.7
    expect(computeStats(titles, now).averageRating).toBe(3.7);
  });

  it('sums runtime only for watched films', () => {
    const titles = [
      makeTitle({ status: 'WATCHED', runtime: 120 }),
      makeTitle({ status: 'WATCHED', runtime: 90 }),
      makeTitle({ status: 'WATCHLIST', runtime: 200 }), // not watched -> excluded
    ];
    expect(computeStats(titles, now).totalRuntimeMinutes).toBe(210);
  });

  it('counts titles watched in the current year', () => {
    const titles = [
      makeTitle({
        status: 'WATCHED',
        watchedAt: new Date('2026-02-01T00:00:00.000Z'),
      }),
      makeTitle({
        status: 'WATCHED',
        watchedAt: new Date('2025-12-31T00:00:00.000Z'),
      }),
      makeTitle({ status: 'WATCHED', watchedAt: null }),
    ];
    expect(computeStats(titles, now).watchedThisYear).toBe(1);
  });
});
