'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  TITLE_TYPE,
  TITLE_TYPE_LABEL_PLURAL,
  type TitleType,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Movies | Series segmented toggle with a sliding active pill (shared-layout
 * animation). Single-select; respects reduced motion.
 */
export function TypeToggle({
  value,
  onChange,
}: {
  value: TitleType;
  onChange: (type: TitleType) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      role="radiogroup"
      aria-label="Show movies or series"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1"
    >
      {TITLE_TYPE.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(t)}
            className={cn(
              'relative rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              active ? 'text-white' : 'text-text-muted hover:text-text',
            )}
          >
            {active && (
              <motion.span
                layoutId="library-type-pill"
                className="absolute inset-0 rounded-full bg-accent shadow-sm"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 30 }
                }
              />
            )}
            <span className="relative z-10">{TITLE_TYPE_LABEL_PLURAL[t]}</span>
          </button>
        );
      })}
    </div>
  );
}
