import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-chip border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-white',
        soft: 'border-transparent bg-accent-soft text-accent',
        outline: 'border-border text-text-muted',
        gold: 'bg-highlight/15 border-transparent text-highlight',
        success: 'bg-success/15 border-transparent text-success',
        warning: 'bg-warning/15 border-transparent text-warning',
        muted: 'border-transparent bg-surface-2 text-text-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
