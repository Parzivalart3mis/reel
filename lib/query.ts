import type { Title } from '@/db/schema';
import type { SortOption } from '@/lib/constants';
import { PAGE_SIZE } from '@/lib/constants';
import type { ListQuery } from '@/lib/schemas/title';

/** Filter a user's titles by the supplied query (text, type, status, tag). */
export function filterTitles(items: Title[], q: ListQuery): Title[] {
  const needle = q.q?.trim().toLowerCase();
  const tag = q.tag?.trim().toLowerCase();

  return items.filter((t) => {
    if (q.type && t.type !== q.type) return false;
    if (q.status && t.status !== q.status) return false;
    if (q.favorite && !t.favorite) return false;
    if (needle && !t.name.toLowerCase().includes(needle)) return false;
    if (tag && !t.tags.some((x) => x.toLowerCase() === tag)) return false;
    return true;
  });
}

function nullsLast(
  a: number | null,
  b: number | null,
  dir: 'asc' | 'desc',
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return dir === 'asc' ? a - b : b - a;
}

/** Stable sort of titles by the requested key. Does not mutate the input. */
export function sortTitles(items: Title[], sort: SortOption): Title[] {
  const copy = [...items];
  switch (sort) {
    case 'rating':
      return copy.sort(
        (a, b) =>
          nullsLast(a.rating, b.rating, 'desc') ||
          b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    case 'year':
      return copy.sort(
        (a, b) =>
          nullsLast(a.year, b.year, 'desc') || a.name.localeCompare(b.name),
      );
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'updated':
    default:
      return copy.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}

export function paginate<T>(
  items: T[],
  page: number,
  size: number = PAGE_SIZE,
): { items: T[]; total: number; page: number } {
  const total = items.length;
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * size;
  return { items: items.slice(start, start + size), total, page: safePage };
}

/** Full pipeline: filter → sort → paginate. */
export function queryTitles(
  items: Title[],
  q: ListQuery,
): { titles: Title[]; total: number; page: number } {
  const filtered = filterTitles(items, q);
  const sorted = sortTitles(filtered, q.sort ?? 'updated');
  const { items: pageItems, total, page } = paginate(sorted, q.page ?? 1);
  return { titles: pageItems, total, page };
}
