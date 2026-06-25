'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps['theme']) ?? 'system'}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface group-[.toaster]:text-text group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-card',
          description: 'group-[.toast]:text-text-muted',
          actionButton: 'group-[.toast]:bg-accent group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-surface-2 group-[.toast]:text-text-muted',
        },
      }}
      {...props}
    />
  );
}
