'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { Poster } from '@/components/poster';
import { RatingStars } from '@/components/rating-stars';
import { SeriesProgressBadge } from '@/components/series-progress';
import { Card } from '@/components/ui/card';
import { formatTotalRuntime } from '@/lib/utils';
import type { Stats } from '@/lib/stats';
import type { TitleDTO } from '@/lib/serialize';

function CountUp({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const ref = useRef<number>(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const duration = 700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      ref.current = value * eased;
      setDisplay(ref.current);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);

  return <span className="tabular">{display.toFixed(decimals)}</span>;
}

function StatCard({
  label,
  value,
  decimals,
  suffix,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-2xl font-semibold text-text">
        <CountUp value={value} decimals={decimals ?? 0} />
        {suffix}
      </div>
      <div className="mt-1 text-sm text-text-muted">{label}</div>
    </Card>
  );
}

export function Dashboard({
  stats,
  watching,
  recent,
}: {
  stats: Stats;
  watching: TitleDTO[];
  recent: TitleDTO[];
}) {
  const totalHours = stats.totalRuntimeMinutes / 60;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Dashboard
        </h1>
        <p className="text-sm text-text-muted">
          Your film and TV life at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="On watchlist" value={stats.watchlistCount} />
        <StatCard label="Watching" value={stats.watchingCount} />
        <StatCard label="Watched" value={stats.watchedCount} />
        <StatCard
          label="Average rating"
          value={stats.averageRating}
          decimals={1}
        />
        <StatCard
          label="Hours watched"
          value={totalHours}
          decimals={totalHours < 100 ? 1 : 0}
          suffix="h"
        />
        <StatCard label="Watched this year" value={stats.watchedThisYear} />
      </div>

      <Shelf
        title="Currently watching"
        empty="Nothing in progress. Start a series and your place is saved here."
        items={watching}
        render={(t) => (
          <ShelfItem
            title={t}
            meta={
              t.type === 'SERIES' &&
              (t.currentSeason != null || t.currentEpisode != null) ? (
                <SeriesProgressBadge
                  season={t.currentSeason}
                  episode={t.currentEpisode}
                />
              ) : (
                <span className="text-xs text-text-muted">In progress</span>
              )
            }
          />
        )}
      />

      <Shelf
        title="Recently watched"
        empty="Nothing watched yet. Rate something you finished."
        items={recent}
        render={(t) => (
          <ShelfItem
            title={t}
            meta={
              t.rating != null ? (
                <RatingStars value={t.rating} size="sm" readOnly />
              ) : (
                <span className="text-xs text-text-muted">Watched</span>
              )
            }
          />
        )}
      />

      <p className="tabular text-xs text-text-hint">
        {stats.filmCount} films · {stats.seriesCount} series ·{' '}
        {formatTotalRuntime(stats.totalRuntimeMinutes)} watched
      </p>
    </div>
  );
}

function Shelf({
  title,
  empty,
  items,
  render,
}: {
  title: string;
  empty: string;
  items: TitleDTO[];
  render: (t: TitleDTO) => React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-card border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-text-muted">
          {empty}
        </p>
      ) : (
        <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
          {items.map((t) => (
            <div key={t.id} className="w-32 shrink-0 sm:w-36">
              {render(t)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ShelfItem({
  title,
  meta,
}: {
  title: TitleDTO;
  meta: React.ReactNode;
}) {
  return (
    <Link href={`/titles/${title.id}`} className="group block">
      <div className="overflow-hidden rounded-poster shadow-poster transition-shadow group-hover:shadow-poster-lift">
        <Poster
          name={title.name}
          type={title.type}
          posterUrl={title.posterUrl}
          imageSource={title.imageSource}
          sizes="144px"
        />
      </div>
      <h3 className="mt-2 line-clamp-1 text-sm font-medium text-text">
        {title.name}
      </h3>
      <div className="mt-0.5">{meta}</div>
    </Link>
  );
}
