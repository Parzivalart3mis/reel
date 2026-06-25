'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MOODS = ['light', 'tense', 'funny', 'thoughtful', 'cozy'] as const;
const RUNTIMES: { label: string; value: number | null }[] = [
  { label: 'Any length', value: null },
  { label: 'Under 90m', value: 90 },
  { label: 'Under 100m', value: 100 },
  { label: 'Under 120m', value: 120 },
];

export function WatchTonightSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [mood, setMood] = useState<string | null>(null);
  const [maxRuntime, setMaxRuntime] = useState<number | null>(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function suggest() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...(mood ? { mood } : {}),
          ...(maxRuntime ? { maxRuntime } : {}),
        }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? 'Could not get a suggestion');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setResult(text);
      }
    } catch {
      setError('Could not reach the suggestion service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Watch tonight"
      description="A pick or two from your own backlog to start tonight."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-text">Mood</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <Chip
                key={m}
                active={mood === m}
                onClick={() => setMood(mood === m ? null : m)}
              >
                {m}
              </Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-text">Max runtime</p>
          <div className="flex flex-wrap gap-2">
            {RUNTIMES.map((r) => (
              <Chip
                key={r.label}
                active={maxRuntime === r.value}
                onClick={() => setMaxRuntime(r.value)}
              >
                {r.label}
              </Chip>
            ))}
          </div>
        </div>

        <Button onClick={suggest} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Suggest
        </Button>

        {error && (
          <p className="bg-error/10 rounded-input px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        {result && (
          <div className="whitespace-pre-wrap rounded-card border border-border bg-surface-2 p-4 text-sm leading-relaxed text-text">
            {result}
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-chip border px-3 py-1.5 text-sm capitalize transition-colors',
        active
          ? 'border-accent bg-accent-soft text-accent'
          : 'border-border text-text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  );
}
