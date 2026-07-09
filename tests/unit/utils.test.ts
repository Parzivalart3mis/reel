import { describe, expect, it } from 'vitest';
import {
  cn,
  formatProgress,
  formatRuntime,
  formatTotalRuntime,
  swipeDirection,
} from '@/lib/utils';

describe('cn', () => {
  it('merges and dedupes tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', false && 'hidden', 'font-medium')).toBe(
      'text-sm font-medium',
    );
  });
});

describe('formatRuntime', () => {
  it('formats hours and minutes', () => {
    expect(formatRuntime(134)).toBe('2h 14m');
    expect(formatRuntime(120)).toBe('2h');
    expect(formatRuntime(47)).toBe('47m');
  });
  it('handles empty values', () => {
    expect(formatRuntime(null)).toBe('—');
    expect(formatRuntime(0)).toBe('—');
    expect(formatRuntime(undefined)).toBe('—');
  });
});

describe('formatTotalRuntime', () => {
  it('formats small totals with one decimal', () => {
    expect(formatTotalRuntime(90)).toBe('1.5h');
    expect(formatTotalRuntime(0)).toBe('0h');
  });
  it('rounds large totals', () => {
    expect(formatTotalRuntime(6600)).toBe('110h');
  });
});

describe('formatProgress', () => {
  it('builds SxEy', () => {
    expect(formatProgress(2, 5)).toBe('S2E5');
    expect(formatProgress(null, null)).toBeNull();
    expect(formatProgress(1, null)).toBe('S1E1');
  });
});

describe('swipeDirection', () => {
  it('detects a leftward swipe as next', () => {
    expect(swipeDirection(-100, 10)).toBe('next');
  });
  it('detects a rightward swipe as prev', () => {
    expect(swipeDirection(100, -10)).toBe('prev');
  });
  it('ignores gestures below the distance threshold', () => {
    expect(swipeDirection(-40, 0)).toBeNull();
    expect(swipeDirection(0, 0)).toBeNull();
  });
  it('ignores vertical-dominant gestures (scrolling)', () => {
    expect(swipeDirection(-100, -140)).toBeNull();
    expect(swipeDirection(70, 200)).toBeNull();
  });
  it('honors a custom threshold', () => {
    expect(swipeDirection(-50, 0, 40)).toBe('next');
    expect(swipeDirection(-50, 0, 80)).toBeNull();
  });
});
