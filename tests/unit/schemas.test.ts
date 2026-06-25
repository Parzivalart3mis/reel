import { describe, expect, it } from 'vitest';
import {
  httpUrlSchema,
  listQuerySchema,
  progressSchema,
  ratingSchema,
  statusSchema,
  titleCreateSchema,
  titleUpdateSchema,
} from '@/lib/schemas/title';
import { recommendSchema, tmdbSearchQuerySchema } from '@/lib/schemas/tmdb';

describe('titleCreateSchema', () => {
  it('accepts a minimal valid title', () => {
    const r = titleCreateSchema.safeParse({ type: 'FILM', name: 'Dune' });
    expect(r.success).toBe(true);
  });

  it('rejects unknown keys (strict)', () => {
    const r = titleCreateSchema.safeParse({
      type: 'FILM',
      name: 'Dune',
      hacked: true,
    });
    expect(r.success).toBe(false);
  });

  it('requires a non-empty name within 300 chars', () => {
    expect(titleCreateSchema.safeParse({ type: 'FILM', name: '' }).success).toBe(
      false,
    );
    expect(
      titleCreateSchema.safeParse({ type: 'FILM', name: 'x'.repeat(301) })
        .success,
    ).toBe(false);
  });

  it('rejects an invalid type and status', () => {
    expect(
      titleCreateSchema.safeParse({ type: 'BOOK', name: 'x' }).success,
    ).toBe(false);
    expect(
      titleCreateSchema.safeParse({ type: 'FILM', name: 'x', status: 'NOPE' })
        .success,
    ).toBe(false);
  });

  it('caps rating to 1..5 integers', () => {
    expect(
      titleCreateSchema.safeParse({ type: 'FILM', name: 'x', rating: 6 })
        .success,
    ).toBe(false);
    expect(
      titleCreateSchema.safeParse({ type: 'FILM', name: 'x', rating: 3 })
        .success,
    ).toBe(true);
  });

  it('caps tags at 15 and 30 chars each', () => {
    expect(
      titleCreateSchema.safeParse({
        type: 'FILM',
        name: 'x',
        tags: Array.from({ length: 16 }, () => 'a'),
      }).success,
    ).toBe(false);
    expect(
      titleCreateSchema.safeParse({
        type: 'FILM',
        name: 'x',
        tags: ['a'.repeat(31)],
      }).success,
    ).toBe(false);
  });

  it('bounds season/episode to 0..9999', () => {
    expect(
      titleCreateSchema.safeParse({
        type: 'SERIES',
        name: 'x',
        currentEpisode: 10000,
      }).success,
    ).toBe(false);
  });

  it('rejects non-http poster URLs', () => {
    expect(
      titleCreateSchema.safeParse({
        type: 'FILM',
        name: 'x',
        posterUrl: 'javascript:alert(1)',
      }).success,
    ).toBe(false);
  });
});

describe('titleUpdateSchema', () => {
  it('is fully partial', () => {
    expect(titleUpdateSchema.safeParse({}).success).toBe(true);
    expect(titleUpdateSchema.safeParse({ favorite: true }).success).toBe(true);
  });

  it('rejects unknown keys', () => {
    expect(titleUpdateSchema.safeParse({ nope: 1 }).success).toBe(false);
  });
});

describe('httpUrlSchema', () => {
  it('accepts http/https', () => {
    expect(httpUrlSchema.safeParse('https://x.com/a.jpg').success).toBe(true);
    expect(httpUrlSchema.safeParse('http://x.com/a.jpg').success).toBe(true);
  });
  it('rejects other schemes', () => {
    expect(httpUrlSchema.safeParse('ftp://x.com/a').success).toBe(false);
    expect(httpUrlSchema.safeParse('data:image/png;base64,xxx').success).toBe(
      false,
    );
  });
});

describe('action schemas', () => {
  it('ratingSchema accepts 1..5 or null', () => {
    expect(ratingSchema.safeParse({ rating: 4 }).success).toBe(true);
    expect(ratingSchema.safeParse({ rating: null }).success).toBe(true);
    expect(ratingSchema.safeParse({ rating: 0 }).success).toBe(false);
  });

  it('statusSchema validates the enum', () => {
    expect(statusSchema.safeParse({ status: 'WATCHED' }).success).toBe(true);
    expect(statusSchema.safeParse({ status: 'x' }).success).toBe(false);
  });

  it('progressSchema requires season and episode', () => {
    expect(progressSchema.safeParse({ season: 2, episode: 5 }).success).toBe(
      true,
    );
    expect(progressSchema.safeParse({ season: 2 }).success).toBe(false);
  });
});

describe('query + tmdb schemas', () => {
  it('coerces page and favorite from strings', () => {
    const r = listQuerySchema.safeParse({ page: '2', favorite: 'true' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.favorite).toBe(true);
    }
  });

  it('treats favorite=false as false', () => {
    const r = listQuerySchema.safeParse({ favorite: 'false' });
    expect(r.success && r.data.favorite).toBe(false);
  });

  it('tmdbSearchQuerySchema requires q', () => {
    expect(tmdbSearchQuerySchema.safeParse({ q: 'dune' }).success).toBe(true);
    expect(tmdbSearchQuerySchema.safeParse({ q: '' }).success).toBe(false);
  });

  it('recommendSchema bounds runtime and rejects unknown keys', () => {
    expect(recommendSchema.safeParse({ mood: 'light' }).success).toBe(true);
    expect(recommendSchema.safeParse({ maxRuntime: 0 }).success).toBe(false);
    expect(recommendSchema.safeParse({ x: 1 }).success).toBe(false);
  });
});
