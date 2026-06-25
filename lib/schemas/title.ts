import { z } from 'zod';
import {
  IMAGE_SOURCE,
  LIMITS,
  TITLE_TYPE,
  WATCH_STATUS,
} from '@/lib/constants';

/** Accept only http/https URLs (used for custom poster overrides). */
export const httpUrlSchema = z
  .string()
  .trim()
  .max(LIMITS.posterUrl)
  .url('Enter a valid URL')
  .refine((value) => {
    try {
      const { protocol } = new URL(value);
      return protocol === 'http:' || protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Only http and https URLs are allowed');

const tagSchema = z.string().trim().min(1).max(LIMITS.tag);
const tagsSchema = z.array(tagSchema).max(LIMITS.tagsMax);
const genresSchema = z.array(z.string().trim().min(1).max(60)).max(40);

const yearSchema = z.number().int().min(LIMITS.yearMin).max(LIMITS.yearMax);

const seasonEpisode = z.number().int().min(0).max(LIMITS.seasonEpisode);
const ratingValue = z.number().int().min(1).max(5);

/** Fields a client may set when creating a title. */
export const titleCreateSchema = z
  .object({
    type: z.enum(TITLE_TYPE),
    name: z.string().trim().min(1).max(LIMITS.name),
    status: z.enum(WATCH_STATUS).optional(),
    tmdbId: z.number().int().positive().nullable().optional(),
    year: yearSchema.nullable().optional(),
    posterUrl: httpUrlSchema.nullable().optional(),
    imageSource: z.enum(IMAGE_SOURCE).optional(),
    overview: z.string().max(8000).nullable().optional(),
    runtime: z.number().int().min(0).max(100000).nullable().optional(),
    totalSeasons: z
      .number()
      .int()
      .min(0)
      .max(LIMITS.seasonEpisode)
      .nullable()
      .optional(),
    genres: genresSchema.optional(),
    rating: ratingValue.nullable().optional(),
    currentSeason: seasonEpisode.nullable().optional(),
    currentEpisode: seasonEpisode.nullable().optional(),
    favorite: z.boolean().optional(),
    notes: z.string().max(LIMITS.notes).nullable().optional(),
    tags: tagsSchema.optional(),
  })
  .strict();

/** Partial update — every field optional, unknown keys rejected. */
export const titleUpdateSchema = z
  .object({
    type: z.enum(TITLE_TYPE),
    status: z.enum(WATCH_STATUS),
    name: z.string().trim().min(1).max(LIMITS.name),
    tmdbId: z.number().int().positive().nullable(),
    year: yearSchema.nullable(),
    posterUrl: httpUrlSchema.nullable(),
    imageSource: z.enum(IMAGE_SOURCE),
    overview: z.string().max(8000).nullable(),
    runtime: z.number().int().min(0).max(100000).nullable(),
    totalSeasons: z.number().int().min(0).max(LIMITS.seasonEpisode).nullable(),
    genres: genresSchema,
    rating: ratingValue.nullable(),
    currentSeason: seasonEpisode.nullable(),
    currentEpisode: seasonEpisode.nullable(),
    favorite: z.boolean(),
    notes: z.string().max(LIMITS.notes).nullable(),
    tags: tagsSchema,
  })
  .strict()
  .partial();

export const ratingSchema = z
  .object({ rating: ratingValue.nullable() })
  .strict();

export const statusSchema = z.object({ status: z.enum(WATCH_STATUS) }).strict();

export const progressSchema = z
  .object({ season: seasonEpisode, episode: seasonEpisode })
  .strict();

export const listQuerySchema = z
  .object({
    q: z.string().trim().max(200).optional(),
    type: z.enum(TITLE_TYPE).optional(),
    status: z.enum(WATCH_STATUS).optional(),
    tag: z.string().trim().max(LIMITS.tag).optional(),
    favorite: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    sort: z.enum(['updated', 'rating', 'year', 'name']).optional(),
    page: z.coerce.number().int().min(1).max(10000).optional(),
  })
  .strict();

export type TitleCreateInput = z.infer<typeof titleCreateSchema>;
export type TitleUpdateInput = z.infer<typeof titleUpdateSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
