import type { Variants, Transition } from 'framer-motion';

/** Spring used for bottom sheets per the spec. */
export const sheetSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
};

/** Poster grid: 50ms stagger fade-in. */
export const gridContainer: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const gridItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Command palette scale + fade. */
export const paletteVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.16 } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12 } },
};

/** Reduced-motion fallback: opacity only, no transforms. */
export const reducedGridItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export const reducedContainer: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.02 } },
};
