'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Poster } from '@/components/poster';
import { StatusPill } from '@/components/status-pill';
import { RatingStars } from '@/components/rating-stars';
import { SeriesProgressBadge } from '@/components/series-progress';
import { gridItem, reducedGridItem } from '@/components/motion/variants';
import type { TitleDTO } from '@/lib/serialize';
import { cn } from '@/lib/utils';

export function PosterCard({
  title,
  priority = false,
}: {
  title: TitleDTO;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const showProgress =
    title.type === 'SERIES' &&
    (title.status === 'WATCHING' || title.status === 'ON_HOLD') &&
    (title.currentSeason != null || title.currentEpisode != null);

  return (
    <motion.div variants={reduce ? reducedGridItem : gridItem} layout>
      <Link
        href={`/titles/${title.id}`}
        className="group block focus:outline-none"
        aria-label={`${title.name}${title.year ? `, ${title.year}` : ''}`}
      >
        <div
          className={cn(
            'relative transition-transform duration-200',
            'group-hover:-translate-y-0.5 group-active:scale-[0.98]',
          )}
        >
          <div className="overflow-hidden rounded-poster shadow-poster transition-shadow group-hover:shadow-poster-lift">
            <Poster
              name={title.name}
              type={title.type}
              posterUrl={title.posterUrl}
              imageSource={title.imageSource}
              priority={priority}
            />
          </div>

          {title.favorite && (
            <span className="absolute right-2 top-2 rounded-full bg-black/45 p-1.5 backdrop-blur-sm">
              <Heart className="size-3.5 fill-highlight text-highlight" />
            </span>
          )}

          {showProgress && (
            <span className="absolute bottom-2 left-2">
              <SeriesProgressBadge
                season={title.currentSeason}
                episode={title.currentEpisode}
              />
            </span>
          )}
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-medium text-text">
              {title.name}
            </h3>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="tabular text-xs text-text-muted">
              {title.year ?? '—'}
            </span>
            <StatusPill status={title.status} />
          </div>
          {title.status === 'WATCHED' && title.rating != null && (
            <RatingStars value={title.rating} size="sm" readOnly />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
