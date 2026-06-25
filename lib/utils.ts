import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format minutes as a compact human duration, e.g. 2h 14m or 47m. */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format a large minute total into hours/days for the dashboard. */
export function formatTotalRuntime(minutes: number): string {
  if (minutes <= 0) return '0h';
  const hours = minutes / 60;
  if (hours < 100) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours).toLocaleString()}h`;
}

/** SxEy badge text from a season/episode pair. */
export function formatProgress(
  season: number | null | undefined,
  episode: number | null | undefined,
): string | null {
  if (season == null && episode == null) return null;
  const s = season ?? 1;
  const e = episode ?? 1;
  return `S${s}E${e}`;
}
