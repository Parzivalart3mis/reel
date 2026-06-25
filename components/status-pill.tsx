'use client';

import { motion } from 'framer-motion';
import { STATUS_LABEL, type WatchStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STYLES: Record<WatchStatus, string> = {
  WATCHLIST: 'bg-accent-soft text-accent',
  WATCHING: 'bg-accent-soft text-accent',
  WATCHED: 'bg-success/15 text-success',
  ON_HOLD: 'bg-warning/15 text-warning',
  DROPPED: 'bg-surface-2 text-text-muted',
};

/** Status pill that crossfades + pulses (1.05) when the status changes. */
export function StatusPill({
  status,
  className,
}: {
  status: WatchStatus;
  className?: string;
}) {
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.92, opacity: 0.5 }}
      animate={{ scale: [1.05, 1], opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-chip px-2 py-0.5 text-xs font-medium',
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </motion.span>
  );
}
