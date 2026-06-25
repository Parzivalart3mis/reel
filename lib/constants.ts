export const TITLE_TYPE = ['FILM', 'SERIES'] as const;
export type TitleType = (typeof TITLE_TYPE)[number];

export const WATCH_STATUS = [
  'WATCHLIST',
  'WATCHING',
  'WATCHED',
  'ON_HOLD',
  'DROPPED',
] as const;
export type WatchStatus = (typeof WATCH_STATUS)[number];

export const IMAGE_SOURCE = ['TMDB', 'CUSTOM', 'NONE'] as const;
export type ImageSource = (typeof IMAGE_SOURCE)[number];

export const TITLE_TYPE_LABEL: Record<TitleType, string> = {
  FILM: 'Film',
  SERIES: 'Series',
};

export const STATUS_LABEL: Record<WatchStatus, string> = {
  WATCHLIST: 'Watchlist',
  WATCHING: 'Watching',
  WATCHED: 'Watched',
  ON_HOLD: 'On hold',
  DROPPED: 'Dropped',
};

/** Badge variant per status, used by the status pill. */
export const STATUS_BADGE: Record<
  WatchStatus,
  'soft' | 'success' | 'warning' | 'muted'
> = {
  WATCHLIST: 'soft',
  WATCHING: 'soft',
  WATCHED: 'success',
  ON_HOLD: 'warning',
  DROPPED: 'muted',
};

export const SORT_OPTIONS = ['updated', 'rating', 'year', 'name'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABEL: Record<SortOption, string> = {
  updated: 'Recently updated',
  rating: 'Rating',
  year: 'Year',
  name: 'Name',
};

export const PAGE_SIZE = 40;

// Field limits (mirrored by the Zod schemas).
export const LIMITS = {
  name: 300,
  notes: 4000,
  tag: 30,
  tagsMax: 15,
  posterUrl: 2048,
  seasonEpisode: 9999,
  yearMin: 1870,
  yearMax: 2100,
} as const;
