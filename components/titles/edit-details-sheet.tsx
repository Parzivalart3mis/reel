'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api, RequestError } from '@/lib/client';
import type { ImageSource } from '@/lib/constants';
import type { TitleDTO } from '@/lib/serialize';

export function EditDetailsSheet({
  title,
  open,
  onOpenChange,
  onSaved,
}: {
  title: TitleDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (title: TitleDTO) => void;
}) {
  const isSeries = title.type === 'SERIES';
  const [name, setName] = useState(title.name);
  const [year, setYear] = useState(
    title.year != null ? String(title.year) : '',
  );
  const [posterUrl, setPosterUrl] = useState(title.posterUrl ?? '');
  const [overview, setOverview] = useState(title.overview ?? '');
  const [runtime, setRuntime] = useState(
    title.runtime != null ? String(title.runtime) : '',
  );
  const [totalSeasons, setTotalSeasons] = useState(
    title.totalSeasons != null ? String(title.totalSeasons) : '',
  );
  const [saving, setSaving] = useState(false);

  const num = (s: string): number | null => {
    if (!s.trim()) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  async function save() {
    const poster = posterUrl.trim();
    let imageSource: ImageSource = 'NONE';
    if (poster) {
      imageSource =
        poster === title.posterUrl ||
        poster.startsWith('https://image.tmdb.org/')
          ? title.imageSource === 'TMDB'
            ? 'TMDB'
            : poster.startsWith('https://image.tmdb.org/')
              ? 'TMDB'
              : 'CUSTOM'
          : 'CUSTOM';
    }

    setSaving(true);
    try {
      const { title: updated } = await api.updateTitle(title.id, {
        name: name.trim(),
        year: num(year),
        posterUrl: poster || null,
        imageSource,
        overview: overview.trim() || null,
        runtime: isSeries ? null : num(runtime),
        totalSeasons: isSeries ? num(totalSeasons) : null,
      });
      onSaved(updated);
      onOpenChange(false);
    } catch (err) {
      const { toast } = await import('sonner');
      toast.error(
        err instanceof RequestError ? err.message : 'Could not save changes',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Edit details">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input
              value={year}
              inputMode="numeric"
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          {isSeries ? (
            <div className="space-y-1.5">
              <Label>Total seasons</Label>
              <Input
                value={totalSeasons}
                inputMode="numeric"
                onChange={(e) => setTotalSeasons(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Runtime (min)</Label>
              <Input
                value={runtime}
                inputMode="numeric"
                onChange={(e) => setRuntime(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Poster URL</Label>
          <Input
            value={posterUrl}
            placeholder="https://… or leave blank"
            onChange={(e) => setPosterUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Synopsis</Label>
          <Textarea
            value={overview}
            rows={4}
            onChange={(e) => setOverview(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
