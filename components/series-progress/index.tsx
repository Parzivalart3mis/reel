'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

/** A single number that slides on the Y axis when it changes. */
function NumberFlip({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span
      className={cn('tabular relative inline-grid', className)}
      style={{ minWidth: '1ch' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="col-start-1 row-start-1"
          initial={reduce ? { opacity: 0 } : { y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: -10, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface BadgeProps {
  season: number | null;
  episode: number | null;
  className?: string;
}

/** Compact S#E# badge shown on series cards and headers. */
export function SeriesProgressBadge({
  season,
  episode,
  className,
}: BadgeProps) {
  const s = season ?? 1;
  const e = episode ?? 1;
  return (
    <span
      className={cn(
        'tabular inline-flex items-center rounded-chip bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent',
        className,
      )}
      aria-label={`Season ${s}, episode ${e}`}
    >
      S{s}E
      <NumberFlip value={e} />
    </span>
  );
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
  disabled,
}: {
  label: string;
  value: number;
  onDec: () => void;
  onInc: () => void;
  disabled?: boolean | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-input border border-border bg-surface px-3 py-2">
      <span className="text-sm text-text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={disabled || value <= 1}
          onClick={onDec}
          className="flex size-8 items-center justify-center rounded-full border border-border text-text transition-colors hover:bg-surface-2 disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-7 text-center text-lg font-semibold text-text">
          <NumberFlip value={value} />
        </span>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={disabled}
          onClick={onInc}
          className="flex size-8 items-center justify-center rounded-full border border-border text-text transition-colors hover:bg-surface-2 disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

interface StepperProps {
  season: number | null;
  episode: number | null;
  onChange: (season: number, episode: number) => void;
  disabled?: boolean;
}

/** Season + episode steppers with a one-tap "Next episode" bump. */
export function SeriesProgressStepper({
  season,
  episode,
  onChange,
  disabled,
}: StepperProps) {
  const s = season ?? 1;
  const e = episode ?? 1;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Stepper
          label="Season"
          value={s}
          disabled={disabled}
          onDec={() => onChange(Math.max(1, s - 1), e)}
          onInc={() => onChange(s + 1, e)}
        />
        <Stepper
          label="Episode"
          value={e}
          disabled={disabled}
          onDec={() => onChange(s, Math.max(1, e - 1))}
          onInc={() => onChange(s, e + 1)}
        />
      </div>
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => onChange(s, e + 1)}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-input bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        <SkipForward className="size-4" />
        Next episode
      </motion.button>
    </div>
  );
}
