'use client';

import Image from 'next/image';
import { useState } from 'react';
import { InitialsTile } from '@/components/initials-tile';
import type { ImageSource, TitleType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PosterProps {
  name: string;
  type: TitleType;
  posterUrl: string | null;
  imageSource: ImageSource;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Renders a poster from TMDB (trusted CDN, via next/image) or a custom URL
 * (through the SSRF-guarded /api/img proxy). Any load failure or a missing URL
 * falls back silently to a generated initials tile.
 */
export function Poster({
  name,
  type,
  posterUrl,
  imageSource,
  sizes = '(max-width: 768px) 45vw, 220px',
  priority = false,
  className,
}: PosterProps) {
  const [errored, setErrored] = useState(false);

  if (!posterUrl || imageSource === 'NONE' || errored) {
    return <InitialsTile name={name} type={type} className={className} />;
  }

  const isTmdb =
    imageSource === 'TMDB' || posterUrl.startsWith('https://image.tmdb.org/');
  const src = isTmdb
    ? posterUrl
    : `/api/img?u=${encodeURIComponent(posterUrl)}`;

  return (
    <div
      className={cn(
        'relative aspect-[2/3] overflow-hidden rounded-poster bg-surface-2',
        className,
      )}
    >
      {isTmdb ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        // Proxied custom poster — not a Next remotePattern, so a plain img.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
