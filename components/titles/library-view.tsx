'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart, Plus, Search } from 'lucide-react';
import { PosterCard } from '@/components/titles/poster-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { gridContainer, reducedContainer } from '@/components/motion/variants';
import {
  SORT_LABEL,
  SORT_OPTIONS,
  STATUS_LABEL,
  TITLE_TYPE_LABEL,
  WATCH_STATUS,
  type SortOption,
  type TitleType,
  type WatchStatus,
} from '@/lib/constants';
import { openAddTitle } from '@/lib/events';
import type { TitleDTO } from '@/lib/serialize';
import { cn } from '@/lib/utils';

type TypeFilter = 'ALL' | TitleType;
type StatusFilter = 'ALL' | WatchStatus;

function sortValue(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return b - a;
}

export function LibraryView({ titles }: { titles: TitleDTO[] }) {
  const reduce = useReducedMotion();
  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeFilter>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [sort, setSort] = useState<SortOption>('updated');
  const [favOnly, setFavOnly] = useState(false);
  const [tag, setTag] = useState<string>('ALL');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of titles) t.tags.forEach((x) => set.add(x));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [titles]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const result = titles.filter((t) => {
      if (type !== 'ALL' && t.type !== type) return false;
      if (status !== 'ALL' && t.status !== status) return false;
      if (favOnly && !t.favorite) return false;
      if (tag !== 'ALL' && !t.tags.includes(tag)) return false;
      if (needle && !t.name.toLowerCase().includes(needle)) return false;
      return true;
    });
    const sorted = [...result];
    switch (sort) {
      case 'rating':
        sorted.sort(
          (a, b) => sortValue(a.rating, b.rating) || b.updatedAt - a.updatedAt,
        );
        break;
      case 'year':
        sorted.sort(
          (a, b) => sortValue(a.year, b.year) || a.name.localeCompare(b.name),
        );
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return sorted;
  }, [titles, q, type, status, favOnly, tag, sort]);

  const filterKey = `${type}-${status}-${sort}-${favOnly}-${tag}-${q}`;

  if (titles.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        body="Add your first title to start building your shelf."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-hint" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your library"
            className="pl-9"
            aria-label="Search titles"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-input border border-border bg-surface p-0.5">
            {(['ALL', 'FILM', 'SERIES'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'rounded-chip px-3 py-1.5 text-sm font-medium transition-colors',
                  type === t
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text',
                )}
              >
                {t === 'ALL' ? 'All' : TITLE_TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <Select
            value={status}
            onValueChange={(v) => setStatus(v as StatusFilter)}
          >
            <SelectTrigger className="w-[150px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {WATCH_STATUS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[170px]" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {SORT_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allTags.length > 0 && (
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger className="w-[130px]" aria-label="Filter by tag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All tags</SelectItem>
                {allTags.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            type="button"
            variant={favOnly ? 'default' : 'outline'}
            size="icon"
            aria-pressed={favOnly}
            aria-label="Show favorites only"
            onClick={() => setFavOnly((v) => !v)}
          >
            <Heart className={cn('size-4', favOnly && 'fill-current')} />
          </Button>
        </div>

        <p className="tabular text-sm text-text-muted">
          {filtered.length} {filtered.length === 1 ? 'title' : 'titles'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          body="Try a different search or clear your filters."
          hideAdd
        />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filterKey}
            variants={reduce ? reducedContainer : gridContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {filtered.map((t, i) => (
              <PosterCard key={t.id} title={t} priority={i < 5} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function EmptyState({
  title,
  body,
  hideAdd = false,
}: {
  title: string;
  body: string;
  hideAdd?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-text-muted">{body}</p>
      {!hideAdd && (
        <Button className="mt-5" onClick={openAddTitle}>
          <Plus className="size-4" />
          Add a title
        </Button>
      )}
    </div>
  );
}
