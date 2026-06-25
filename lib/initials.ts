/**
 * Deterministic helpers for the poster fallback tile: stable initials and a
 * stable accent colour derived from the title name. Pure + unit-tested.
 */

/** Stable non-negative 32-bit hash (djb2). */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // Coerce to unsigned 32-bit.
  return hash >>> 0;
}

/** Up to two uppercase initials from a title name. */
export function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w));
  if (words.length === 0) return '?';
  if (words.length === 1) {
    return (words[0] ?? '').slice(0, 2).toUpperCase();
  }
  const first = words[0]?.[0] ?? '';
  const last = words[words.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}

export interface TileColor {
  /** Background gradient stops + readable foreground, all CSS colour strings. */
  from: string;
  to: string;
  foreground: string;
  hue: number;
}

/** Deterministic gradient + foreground for a given key (the title name). */
export function colorForKey(key: string): TileColor {
  const hue = hashString(key) % 360;
  const from = `hsl(${hue} 52% 38%)`;
  const to = `hsl(${(hue + 28) % 360} 56% 26%)`;
  return { from, to, foreground: 'hsl(0 0% 100% / 0.92)', hue };
}
