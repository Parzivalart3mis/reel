'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RatingStars } from '@/components/rating-stars';
import { Poster } from '@/components/poster';
import { TmdbSearch } from '@/components/tmdb-search/tmdb-search';
import { api, RequestError } from '@/lib/client';
import {
  STATUS_LABEL,
  TITLE_TYPE,
  TITLE_TYPE_LABEL,
  WATCH_STATUS,
  type ImageSource,
} from '@/lib/constants';
import { titleCreateSchema } from '@/lib/schemas/title';
import type { TmdbSearchResult } from '@/lib/tmdb';

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(300),
  type: z.enum(TITLE_TYPE),
  status: z.enum(WATCH_STATUS),
  year: z.string().trim().optional(),
  runtime: z.string().trim().optional(),
  totalSeasons: z.string().trim().optional(),
  posterUrl: z.string().trim().optional(),
  overview: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  currentSeason: z.string().trim().optional(),
  currentEpisode: z.string().trim().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const numOrUndef = (s: string | undefined): number | undefined => {
  if (!s || !s.trim()) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export function AddTitleSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const tmdbId = useRef<number | null>(null);
  const tmdbPoster = useRef<string | null>(null);
  const genres = useRef<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', type: 'FILM', status: 'WATCHLIST' },
  });

  const type = watch('type');
  const status = watch('status');
  const posterUrl = watch('posterUrl');
  const name = watch('name');

  const resetAll = () => {
    reset({ name: '', type: 'FILM', status: 'WATCHLIST' });
    setRating(null);
    tmdbId.current = null;
    tmdbPoster.current = null;
    genres.current = [];
  };

  const close = (next: boolean) => {
    if (!next) resetAll();
    onOpenChange(next);
  };

  async function handlePick(result: TmdbSearchResult) {
    tmdbId.current = result.tmdbId;
    tmdbPoster.current = result.posterUrl;
    setValue('name', result.name, { shouldValidate: true });
    setValue('type', result.type);
    setValue('year', result.year ? String(result.year) : '');
    setValue('posterUrl', result.posterUrl ?? '');
    try {
      const details = await api.tmdbDetails(result.tmdbId, result.type);
      genres.current = details.genres;
      if (details.overview) setValue('overview', details.overview);
      if (details.runtime != null) setValue('runtime', String(details.runtime));
      if (details.totalSeasons != null)
        setValue('totalSeasons', String(details.totalSeasons));
      if (details.posterUrl) {
        tmdbPoster.current = details.posterUrl;
        setValue('posterUrl', details.posterUrl);
      }
    } catch {
      // Details are best-effort; the search result already filled the basics.
    }
  }

  function imageSourceFor(value: string | undefined): ImageSource {
    const v = value?.trim();
    if (!v) return 'NONE';
    if (v === tmdbPoster.current || v.startsWith('https://image.tmdb.org/'))
      return 'TMDB';
    return 'CUSTOM';
  }

  const onSubmit = handleSubmit(async (values) => {
    const poster = values.posterUrl?.trim();
    const isSeries = values.type === 'SERIES';
    const tracksProgress =
      isSeries && (values.status === 'WATCHING' || values.status === 'ON_HOLD');

    const payload = {
      type: values.type,
      name: values.name,
      status: values.status,
      tmdbId: tmdbId.current ?? undefined,
      year: numOrUndef(values.year),
      posterUrl: poster || undefined,
      imageSource: imageSourceFor(poster),
      overview: values.overview?.trim() || undefined,
      runtime: isSeries ? undefined : numOrUndef(values.runtime),
      totalSeasons: isSeries ? numOrUndef(values.totalSeasons) : undefined,
      genres: genres.current,
      rating: values.status === 'WATCHED' ? (rating ?? undefined) : undefined,
      currentSeason: tracksProgress
        ? (numOrUndef(values.currentSeason) ?? 1)
        : undefined,
      currentEpisode: tracksProgress
        ? (numOrUndef(values.currentEpisode) ?? 1)
        : undefined,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 15)
        : undefined,
      notes: values.notes?.trim() || undefined,
    };

    const parsed = titleCreateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Check the form');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTitle(parsed.data);
      toast.success(`Added ${values.name}`);
      close(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof RequestError ? err.message : 'Could not add title',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Sheet open={open} onOpenChange={close} title="Add a title">
      <form onSubmit={onSubmit} className="space-y-5">
        <TmdbSearch type="ALL" onPick={handlePick} />

        <div className="flex gap-4">
          <div className="w-24 shrink-0">
            <Poster
              name={name || 'New title'}
              type={type}
              posterUrl={posterUrl?.trim() ? posterUrl.trim() : null}
              imageSource={imageSourceFor(posterUrl)}
            />
          </div>
          <div className="flex-1 space-y-3">
            <Field label="Name" error={errors.name?.message}>
              <Input {...register('name')} placeholder="Title name" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TITLE_TYPE.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TITLE_TYPE_LABEL[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field label="Year">
                <Input
                  {...register('year')}
                  inputMode="numeric"
                  placeholder="2024"
                />
              </Field>
            </div>
          </div>
        </div>

        <Field label="Status">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WATCH_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {status === 'WATCHED' && (
          <Field label="Your rating">
            <RatingStars value={rating} onChange={setRating} />
          </Field>
        )}

        {type === 'SERIES' &&
          (status === 'WATCHING' || status === 'ON_HOLD') && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Season">
                <Input
                  {...register('currentSeason')}
                  inputMode="numeric"
                  placeholder="1"
                />
              </Field>
              <Field label="Episode">
                <Input
                  {...register('currentEpisode')}
                  inputMode="numeric"
                  placeholder="1"
                />
              </Field>
            </div>
          )}

        <div className="grid grid-cols-2 gap-3">
          {type === 'SERIES' ? (
            <Field label="Total seasons">
              <Input {...register('totalSeasons')} inputMode="numeric" />
            </Field>
          ) : (
            <Field label="Runtime (min)">
              <Input {...register('runtime')} inputMode="numeric" />
            </Field>
          )}
          <Field label="Tags (comma-separated)">
            <Input {...register('tags')} placeholder="epic, rewatch" />
          </Field>
        </div>

        <Field label="Poster URL (optional)">
          <Input
            {...register('posterUrl')}
            placeholder="https://… or leave blank"
          />
        </Field>

        <Field label="Synopsis">
          <Textarea {...register('overview')} rows={3} />
        </Field>

        <Field label="Notes">
          <Textarea {...register('notes')} rows={2} />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Add title
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
