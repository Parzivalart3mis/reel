'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InitialsTile } from '@/components/initials-tile';
import { api, RequestError } from '@/lib/client';
import { TITLE_TYPE_LABEL, type TitleType } from '@/lib/constants';
import type { TmdbSearchResult } from '@/lib/tmdb';

interface TmdbSearchProps {
  type?: TitleType | 'ALL';
  onPick: (result: TmdbSearchResult) => void;
}

export function TmdbSearch({ type = 'ALL', onPick }: TmdbSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const { results } = await api.searchTmdb(
          q,
          type === 'ALL' ? undefined : type,
        );
        if (id === reqId.current) {
          setResults(results);
          setError(null);
        }
      } catch (err) {
        if (id === reqId.current) {
          setError(
            err instanceof RequestError
              ? err.message
              : 'Search failed. Enter details manually below.',
          );
          setResults([]);
        }
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query, type]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-hint" />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-text-hint" />
        )}
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies & series…"
          className="pl-9 [&::-webkit-search-cancel-button]:appearance-none"
          aria-label="Search the movie database"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
        />
      </div>

      {error && <p className="text-sm text-text-muted">{error}</p>}

      {results.length > 0 && (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {results.map((r) => (
            <li key={`${r.type}-${r.tmdbId}`}>
              <button
                type="button"
                onClick={() => onPick(r)}
                className="flex w-full items-center gap-3 rounded-input p-2 text-left transition-colors hover:bg-surface-2 focus:bg-surface-2 focus:outline-none"
              >
                <span className="relative h-16 w-11 shrink-0 overflow-hidden rounded">
                  {r.posterUrl ? (
                    <Image
                      src={r.posterUrl}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <InitialsTile name={r.name} type={r.type} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium text-text">
                    {r.name}
                  </span>
                  <span className="tabular mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                    {r.year ?? '—'}
                    <Badge variant="muted">{TITLE_TYPE_LABEL[r.type]}</Badge>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
