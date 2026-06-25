import { describe, expect, it } from 'vitest';
import { colorForKey, getInitials, hashString } from '@/lib/initials';

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('Dune')).toBe(hashString('Dune'));
  });

  it('differs for different inputs', () => {
    expect(hashString('Dune')).not.toBe(hashString('Severance'));
  });

  it('returns a non-negative 32-bit integer', () => {
    const h = hashString('The Bear');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});

describe('getInitials', () => {
  it('takes first letters of two words', () => {
    expect(getInitials('Past Lives')).toBe('PL');
  });

  it('uses up to two letters of a single word', () => {
    expect(getInitials('Severance')).toBe('SE');
  });

  it('uses first and last word for 3+ words', () => {
    expect(getInitials('The Lord of the Rings')).toBe('TR');
  });

  it('handles empty / symbol-only names', () => {
    expect(getInitials('   ')).toBe('?');
    expect(getInitials('!!!')).toBe('?');
  });

  it('uppercases', () => {
    expect(getInitials('past lives')).toBe('PL');
  });
});

describe('colorForKey', () => {
  it('is deterministic for the same key', () => {
    expect(colorForKey('Dune')).toEqual(colorForKey('Dune'));
  });

  it('produces an in-range hue', () => {
    const { hue } = colorForKey('Severance');
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });

  it('returns gradient stops and a foreground', () => {
    const c = colorForKey('The Brutalist');
    expect(c.from).toMatch(/^hsl\(/);
    expect(c.to).toMatch(/^hsl\(/);
    expect(c.foreground).toMatch(/^hsl\(/);
  });
});
