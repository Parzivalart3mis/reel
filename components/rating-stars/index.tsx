'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const;

interface RatingStarsProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: keyof typeof SIZES;
  readOnly?: boolean;
  className?: string;
}

/**
 * Five gold stars. Interactive when `onChange` is provided: clickable, and
 * operable from the keyboard (arrow keys adjust, Home clears, End maxes).
 * Stars fill left-to-right with a quick spring.
 */
export function RatingStars({
  value,
  onChange,
  size = 'md',
  readOnly = false,
  className,
}: RatingStarsProps) {
  const reduce = useReducedMotion();
  const interactive = !readOnly && typeof onChange === 'function';
  const [hover, setHover] = useState<number | null>(null);
  const current = value ?? 0;
  const shown = hover ?? current;

  const set = (next: number | null) => {
    if (!interactive || !onChange) return;
    onChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      set(Math.min(5, current + 1) || 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = current - 1;
      set(next <= 0 ? null : next);
    } else if (e.key === 'Home') {
      e.preventDefault();
      set(null);
    } else if (e.key === 'End') {
      e.preventDefault();
      set(5);
    }
  };

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role={interactive ? 'slider' : 'img'}
      aria-label={
        interactive ? 'Rating' : value ? `Rated ${value} of 5` : 'Not rated'
      }
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 5 : undefined}
      aria-valuenow={interactive ? current : undefined}
      aria-valuetext={
        interactive ? (value ? `${value} stars` : 'No rating') : undefined
      }
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={onKeyDown}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= shown;
        return (
          <button
            key={star}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            disabled={!interactive}
            className={cn(
              'rounded-full leading-none transition-transform',
              interactive && 'cursor-pointer hover:scale-110',
              !interactive && 'cursor-default',
            )}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(null)}
            onClick={() => set(value === star ? null : star)}
          >
            <motion.span
              key={`${star}-${filled}`}
              initial={filled && !reduce ? { scale: 0.6 } : { scale: 1 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 18,
                delay: filled && !reduce ? star * 0.03 : 0,
              }}
              className="block"
            >
              <Star
                className={cn(
                  SIZES[size],
                  filled
                    ? 'fill-highlight text-highlight'
                    : 'fill-transparent text-text-hint',
                )}
              />
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
