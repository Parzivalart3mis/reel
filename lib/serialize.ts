import type { Title } from '@/db/schema';
import type { ImageSource, TitleType, WatchStatus } from '@/lib/constants';

/** Client-facing title shape: dates are epoch-ms numbers, not Date objects. */
export interface TitleDTO {
  id: string;
  userId: string;
  type: TitleType;
  status: WatchStatus;
  name: string;
  year: number | null;
  tmdbId: number | null;
  posterUrl: string | null;
  imageSource: ImageSource;
  overview: string | null;
  runtime: number | null;
  totalSeasons: number | null;
  genres: string[];
  rating: number | null;
  currentSeason: number | null;
  currentEpisode: number | null;
  favorite: boolean;
  notes: string | null;
  tags: string[];
  watchedAt: number | null;
  addedAt: number;
  updatedAt: number;
}

export function serializeTitle(t: Title): TitleDTO {
  return {
    id: t.id,
    userId: t.userId,
    type: t.type,
    status: t.status,
    name: t.name,
    year: t.year,
    tmdbId: t.tmdbId,
    posterUrl: t.posterUrl,
    imageSource: t.imageSource,
    overview: t.overview,
    runtime: t.runtime,
    totalSeasons: t.totalSeasons,
    genres: t.genres,
    rating: t.rating,
    currentSeason: t.currentSeason,
    currentEpisode: t.currentEpisode,
    favorite: t.favorite,
    notes: t.notes,
    tags: t.tags,
    watchedAt: t.watchedAt ? t.watchedAt.getTime() : null,
    addedAt: t.addedAt.getTime(),
    updatedAt: t.updatedAt.getTime(),
  };
}
