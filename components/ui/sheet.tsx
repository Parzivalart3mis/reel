'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sheetSpring } from '@/components/motion/variants';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Visually hide the title (still announced to screen readers). */
  hideTitle?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Bottom sheet (default) or right-anchored drawer on desktop. */
  side?: 'bottom' | 'right';
}

export function Sheet({
  open,
  onOpenChange,
  title,
  hideTitle = false,
  description,
  children,
  className,
  side = 'bottom',
}: SheetProps) {
  const reduce = useReducedMotion();

  const motionProps =
    side === 'right'
      ? {
          initial: reduce ? { opacity: 0 } : { x: '100%' },
          animate: reduce ? { opacity: 1 } : { x: 0 },
          exit: reduce ? { opacity: 0 } : { x: '100%' },
        }
      : {
          initial: reduce ? { opacity: 0 } : { y: '100%' },
          animate: reduce ? { opacity: 1 } : { y: 0 },
          exit: reduce ? { opacity: 0 } : { y: '100%' },
        };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                {...motionProps}
                transition={sheetSpring}
                className={cn(
                  'fixed z-50 flex flex-col border-border bg-surface shadow-sheet',
                  side === 'right'
                    ? 'safe-top safe-bottom inset-y-0 right-0 w-full max-w-md border-l'
                    : 'sheet-max-h safe-top safe-bottom inset-x-0 bottom-0 rounded-t-card border-t sm:inset-x-auto sm:left-1/2 sm:max-w-lg sm:-translate-x-1/2',
                  className,
                )}
              >
                {side === 'bottom' && (
                  <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border" />
                )}
                <div className="safe-x flex items-start justify-between gap-4 pb-2 pt-4">
                  <div className="min-w-0 space-y-1">
                    {hideTitle ? (
                      <VisuallyHidden asChild>
                        <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
                      </VisuallyHidden>
                    ) : (
                      <DialogPrimitive.Title className="text-xl font-semibold text-text">
                        {title}
                      </DialogPrimitive.Title>
                    )}
                    {description ? (
                      <DialogPrimitive.Description className="text-sm text-text-muted">
                        {description}
                      </DialogPrimitive.Description>
                    ) : (
                      <VisuallyHidden asChild>
                        <DialogPrimitive.Description>
                          {title}
                        </DialogPrimitive.Description>
                      </VisuallyHidden>
                    )}
                  </div>
                  <DialogPrimitive.Close
                    className="-mr-1 rounded-chip p-1 text-text-muted transition-colors hover:bg-surface-2 hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </DialogPrimitive.Close>
                </div>
                <div className="safe-x min-h-0 flex-1 overflow-y-auto pb-6 pt-2">
                  {children}
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
