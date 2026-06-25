import { describe, expect, it } from 'vitest';
import { filterTitles, paginate, queryTitles, sortTitles } from '@/lib/query';
import type { ListQuery } from '@/lib/schemas/title';
import { makeTitle } from '../helpers/factory';

const base: ListQuery = {};

describe('filterTitles', () => {
  const titles = [
    makeTitle({
      name: 'Dune',
      type: 'FILM',
      status: 'WATCHED',
      tags: ['epic'],
    }),
    makeTitle({ name: 'Severance', type: 'SERIES', status: 'WATCHING' }),
    makeTitle({
      name: 'Past Lives',
      type: 'FILM',
      status: 'WATCHLIST',
      favorite: true,
    }),
  ];

  it('filters by type', () => {
    expect(filterTitles(titles, { ...base, type: 'SERIES' })).toHaveLength(1);
  });

  it('filters by status', () => {
    expect(filterTitles(titles, { ...base, status: 'WATCHED' })).toHaveLength(
      1,
    );
  });

  it('filters by favorite', () => {
    const r = filterTitles(titles, { ...base, favorite: true });
    expect(r).toHaveLength(1);
    expect(r[0]?.name).toBe('Past Lives');
  });

  it('searches by name case-insensitively', () => {
    const r = filterTitles(titles, { ...base, q: 'dune' });
    expect(r).toHaveLength(1);
    expect(r[0]?.name).toBe('Dune');
  });

  it('filters by tag case-insensitively', () => {
    expect(filterTitles(titles, { ...base, tag: 'EPIC' })).toHaveLength(1);
  });

  it('combines filters', () => {
    expect(
      filterTitles(titles, { ...base, type: 'FILM', status: 'WATCHLIST' }),
    ).toHaveLength(1);
  });
});

describe('sortTitles', () => {
  it('sorts by rating desc, nulls last', () => {
    const titles = [
      makeTitle({ name: 'A', rating: 3 }),
      makeTitle({ name: 'B', rating: null }),
      makeTitle({ name: 'C', rating: 5 }),
    ];
    expect(sortTitles(titles, 'rating').map((t) => t.name)).toEqual([
      'C',
      'A',
      'B',
    ]);
  });

  it('sorts by year desc, nulls last', () => {
    const titles = [
      makeTitle({ name: 'A', year: 2010 }),
      makeTitle({ name: 'B', year: null }),
      makeTitle({ name: 'C', year: 2024 }),
    ];
    expect(sortTitles(titles, 'year').map((t) => t.name)).toEqual([
      'C',
      'A',
      'B',
    ]);
  });

  it('sorts by name asc', () => {
    const titles = [
      makeTitle({ name: 'Zodiac' }),
      makeTitle({ name: 'Amelie' }),
    ];
    expect(sortTitles(titles, 'name').map((t) => t.name)).toEqual([
      'Amelie',
      'Zodiac',
    ]);
  });

  it('sorts by updatedAt desc by default', () => {
    const titles = [
      makeTitle({ name: 'old', updatedAt: new Date('2026-01-01') }),
      makeTitle({ name: 'new', updatedAt: new Date('2026-06-01') }),
    ];
    expect(sortTitles(titles, 'updated').map((t) => t.name)).toEqual([
      'new',
      'old',
    ]);
  });

  it('does not mutate the input array', () => {
    const titles = [makeTitle({ name: 'B' }), makeTitle({ name: 'A' })];
    const before = titles.map((t) => t.name);
    sortTitles(titles, 'name');
    expect(titles.map((t) => t.name)).toEqual(before);
  });
});

describe('paginate', () => {
  it('slices to the requested page', () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    const { items: page, total, page: p } = paginate(items, 2, 4);
    expect(page).toEqual([4, 5, 6, 7]);
    expect(total).toBe(10);
    expect(p).toBe(2);
  });

  it('clamps invalid pages to 1', () => {
    expect(paginate([1, 2, 3], 0, 2).page).toBe(1);
  });
});

describe('queryTitles', () => {
  it('filters, sorts and paginates together', () => {
    const titles = [
      makeTitle({ name: 'Dune', type: 'FILM', rating: 5 }),
      makeTitle({ name: 'Severance', type: 'SERIES', rating: 4 }),
      makeTitle({ name: 'Past Lives', type: 'FILM', rating: 3 }),
    ];
    const { titles: result, total } = queryTitles(titles, {
      type: 'FILM',
      sort: 'rating',
    });
    expect(total).toBe(2);
    expect(result.map((t) => t.name)).toEqual(['Dune', 'Past Lives']);
  });
});
