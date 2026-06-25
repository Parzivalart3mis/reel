'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Heart, Loader2, Pencil, Trash2 } from 'lucide-react';
import { Poster } from '@/components/poster';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RatingStars } from '@/components/rating-stars';
import {
  SeriesProgressBadge,
  SeriesProgressStepper,
} from '@/components/series-progress';
import { StatusPill } from '@/components/status-pill';
import { EditDetailsSheet } from '@/components/titles/edit-details-sheet';
import { api, RequestError } from '@/lib/client';
import { STATUS_LABEL, TITLE_TYPE_LABEL, WATCH_STATUS } from '@/lib/constants';
import { formatRuntime } from '@/lib/utils';
import type { TitleDTO } from '@/lib/serialize';

export function TitleDetail({ initial }: { initial: TitleDTO }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [notes, setNotes] = useState(initial.notes ?? '');
  const [tags, setTags] = useState(initial.tags.join(', '));
  const [busy, setBusy] = useState(false);

  const isSeries = title.type === 'SERIES';
  const notesDirty = (title.notes ?? '') !== notes;
  const tagsDirty =
    title.tags.join(', ') !==
    tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .join(', ');

  async function run(
    fn: () => Promise<{ title: TitleDTO }>,
    successMsg?: string,
  ) {
    setBusy(true);
    try {
      const { title: updated } = await fn();
      setTitle(updated);
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error(
        err instanceof RequestError ? err.message : 'Something went wrong',
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes() {
    await run(() => api.updateTitle(title.id, { notes: notes.trim() || null }));
    toast.success('Notes saved');
  }

  async function saveTags() {
    const parsed = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 15);
    await run(() => api.updateTitle(title.id, { tags: parsed }));
    setTags(parsed.join(', '));
    toast.success('Tags saved');
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await api.deleteTitle(title.id);
      toast.success(`Deleted ${title.name}`);
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof RequestError ? err.message : 'Could not delete',
      );
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft className="size-4" />
        Library
      </Link>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="mx-auto w-44 md:mx-0 md:w-full">
          <div className="overflow-hidden rounded-poster shadow-poster">
            <Poster
              name={title.name}
              type={title.type}
              posterUrl={title.posterUrl}
              imageSource={title.imageSource}
              priority
              sizes="260px"
            />
          </div>
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-4" />
            Edit details
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-text">
                {title.name}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                aria-label={
                  title.favorite ? 'Remove favorite' : 'Mark as favorite'
                }
                aria-pressed={title.favorite}
                disabled={busy}
                onClick={() =>
                  run(() =>
                    api.updateTitle(title.id, { favorite: !title.favorite }),
                  )
                }
              >
                <Heart className={cnHeart(title.favorite)} />
              </Button>
            </div>
            <div className="tabular mt-2 flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <Badge variant="muted">{TITLE_TYPE_LABEL[title.type]}</Badge>
              {title.year != null && <span>{title.year}</span>}
              {!isSeries && title.runtime != null && (
                <span>· {formatRuntime(title.runtime)}</span>
              )}
              {isSeries && title.totalSeasons != null && (
                <span>
                  · {title.totalSeasons} season
                  {title.totalSeasons === 1 ? '' : 's'}
                </span>
              )}
              {isSeries &&
                (title.currentSeason != null ||
                  title.currentEpisode != null) && (
                  <SeriesProgressBadge
                    season={title.currentSeason}
                    episode={title.currentEpisode}
                  />
                )}
            </div>
            {title.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {title.genres.map((g) => (
                  <Badge key={g} variant="outline">
                    {g}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={title.status}
                  onValueChange={(v) => run(() => api.setStatus(title.id, v))}
                >
                  <SelectTrigger className="w-[150px]">
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
                <StatusPill status={title.status} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Your rating</Label>
              <RatingStars
                value={title.rating}
                onChange={(v) => run(() => api.setRating(title.id, v))}
              />
            </div>
          </div>

          {isSeries && (
            <div className="space-y-2">
              <Label>Where you left off</Label>
              <SeriesProgressStepper
                season={title.currentSeason}
                episode={title.currentEpisode}
                disabled={busy}
                onChange={(season, episode) =>
                  run(() => api.setProgress(title.id, season, episode))
                }
              />
            </div>
          )}

          {title.overview && (
            <div className="space-y-1.5">
              <Label>Synopsis</Label>
              <p className="text-sm leading-relaxed text-text-muted">
                {title.overview}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              rows={3}
              placeholder="Private notes about this title"
              onChange={(e) => setNotes(e.target.value)}
            />
            {notesDirty && (
              <Button size="sm" onClick={saveNotes} disabled={busy}>
                Save notes
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              placeholder="comma, separated, tags"
              onChange={(e) => setTags(e.target.value)}
            />
            {tagsDirty && (
              <Button size="sm" onClick={saveTags} disabled={busy}>
                Save tags
              </Button>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <Button
              variant="ghost"
              className="hover:bg-error/10 text-error hover:text-error"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete title
            </Button>
          </div>
        </div>
      </div>

      <EditDetailsSheet
        title={title}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(t) => {
          setTitle(t);
          toast.success('Details updated');
        }}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this title?</DialogTitle>
            <DialogDescription>
              {title.name} will be removed from your library. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cnHeart(favorite: boolean): string {
  return favorite ? 'size-5 fill-highlight text-highlight' : 'size-5';
}
