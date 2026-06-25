import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { IMAGE_SOURCE, TITLE_TYPE, WATCH_STATUS } from '@/lib/constants';

export { IMAGE_SOURCE, TITLE_TYPE, WATCH_STATUS };
export type { ImageSource, TitleType, WatchStatus } from '@/lib/constants';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Clerk userId
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const titles = sqliteTable(
  'titles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: text('type', { enum: TITLE_TYPE }).notNull(),
    status: text('status', { enum: WATCH_STATUS })
      .notNull()
      .default('WATCHLIST'),
    name: text('name').notNull(),
    year: integer('year'), // release / first-air year

    // metadata (cached from TMDB on add; all overridable)
    tmdbId: integer('tmdb_id'),
    posterUrl: text('poster_url'), // null => initials tile
    imageSource: text('image_source', { enum: IMAGE_SOURCE })
      .notNull()
      .default('NONE'),
    overview: text('overview'),
    runtime: integer('runtime'), // minutes (films)
    totalSeasons: integer('total_seasons'), // series, from TMDB
    genres: text('genres', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default([]),

    // user data
    rating: integer('rating'), // 1..5, set when watched
    currentSeason: integer('current_season'), // series "where I left off"
    currentEpisode: integer('current_episode'),
    favorite: integer('favorite', { mode: 'boolean' }).notNull().default(false),
    notes: text('notes'),
    tags: text('tags', { mode: 'json' })
      .$type<string[]>()
      .notNull()
      .default([]),

    watchedAt: integer('watched_at', { mode: 'timestamp_ms' }),
    addedAt: integer('added_at', { mode: 'timestamp_ms' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => ({
    userStatusIdx: index('titles_user_status_idx').on(t.userId, t.status),
    userTypeIdx: index('titles_user_type_idx').on(t.userId, t.type),
    userUpdatedIdx: index('titles_user_updated_idx').on(t.userId, t.updatedAt),
  }),
);

export type Title = typeof titles.$inferSelect;
export type NewTitle = typeof titles.$inferInsert;
export type User = typeof users.$inferSelect;
