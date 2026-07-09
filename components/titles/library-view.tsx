'use client';

import { useMemo, useRef, useState } from 'react';
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
import { TypeToggle } from '@/components/titles/type-toggle';
import {
  SORT_LABEL,
  SORT_OPTIONS,
  STATUS_LABEL,
  TITLE_TYPE,
  WATCH_STATUS,
  type SortOption,
  type TitleType,
  type WatchStatus,
} from '@/lib/constants';
import { openAddTitle } from '@/lib/events';
import type { TitleDTO } from '@/lib/serialize';
import { cn, swipeDirection } from '@/lib/utils';

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
  const [type, setType] = useState<TitleType>('FILM');
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
      if (t.type !== type) return false;
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

  // Swipe left/right to flip between the Movies and Series tabs.
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches.length === 1 ? e.touches[0] : undefined;
    touchStart.current = t ? { x: t.clientX, y: t.clientY } : null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;
    const dir = swipeDirection(t.clientX - start.x, t.clientY - start.y);
    if (!dir) return;
    setType((cur) => {
      const i = TITLE_TYPE.indexOf(cur);
      const clamped = Math.min(
        TITLE_TYPE.length - 1,
        Math.max(0, dir === 'next' ? i + 1 : i - 1),
      );
      return TITLE_TYPE[clamped] ?? cur;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <TypeToggle value={type} onChange={setType} />
      </div>

      {titles.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="Add your first title to start building your shelf."
        />
      ) : (
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

            <div className="flex items-center gap-2">
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as StatusFilter)}
              >
                <SelectTrigger
                  className="h-9 min-w-0 flex-1 text-xs sm:max-w-[150px]"
                  aria-label="Filter by status"
                >
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

              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortOption)}
              >
                <SelectTrigger
                  className="h-9 min-w-0 flex-1 text-xs sm:max-w-[170px]"
                  aria-label="Sort by"
                >
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
                  <SelectTrigger
                    className="h-9 min-w-0 flex-1 text-xs sm:max-w-[120px]"
                    aria-label="Filter by tag"
                  >
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
                className="size-9 shrink-0"
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

          <div
            className="touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
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
        </div>
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
