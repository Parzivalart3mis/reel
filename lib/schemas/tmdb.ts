import { z } from 'zod';
import { TITLE_TYPE } from '@/lib/constants';

export const tmdbSearchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(200),
    type: z.enum(TITLE_TYPE).optional(),
  })
  .strict();

export const tmdbDetailsQuerySchema = z
  .object({
    tmdbId: z.coerce.number().int().positive(),
    type: z.enum(TITLE_TYPE),
  })
  .strict();

export const imgQuerySchema = z
  .object({
    u: z.string().trim().url().max(2048),
  })
  .strict();

export const recommendSchema = z
  .object({
    mood: z.string().trim().max(60).optional(),
    maxRuntime: z.number().int().min(1).max(1000).optional(),
  })
  .strict();

export type RecommendInput = z.infer<typeof recommendSchema>;
