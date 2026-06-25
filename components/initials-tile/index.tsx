import { Clapperboard, Tv } from 'lucide-react';
import { colorForKey, getInitials } from '@/lib/initials';
import type { TitleType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface InitialsTileProps {
  name: string;
  type?: TitleType | undefined;
  className?: string | undefined;
}

/** Poster fallback: a deterministic gradient tile with the title's initials. */
export function InitialsTile({ name, type, className }: InitialsTileProps) {
  const { from, to, foreground } = colorForKey(name);
  const initials = getInitials(name);
  const Icon = type === 'SERIES' ? Tv : Clapperboard;

  return (
    <div
      className={cn(
        'flex aspect-[2/3] flex-col items-center justify-center gap-2 rounded-poster',
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(150deg, ${from}, ${to})`,
        color: foreground,
      }}
      aria-hidden="true"
    >
      <Icon className="size-6 opacity-70" />
      <span className="tabular text-2xl font-semibold tracking-tight">
        {initials}
      </span>
    </div>
  );
}
