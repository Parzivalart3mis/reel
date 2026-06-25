'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Command } from 'cmdk';
import { Film, LayoutDashboard, Plus, Search, Tv } from 'lucide-react';
import { api } from '@/lib/client';
import { REEL_EVENTS, openAddTitle } from '@/lib/events';
import { paletteVariants } from '@/components/motion/variants';
import { STATUS_LABEL } from '@/lib/constants';
import type { TitleDTO } from '@/lib/serialize';

export function CommandPalette() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [titles, setTitles] = useState<TitleDTO[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const { titles } = await api.listTitles('sort=updated');
      setTitles(titles);
    } catch {
      setTitles([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(REEL_EVENTS.commandPalette, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(REEL_EVENTS.commandPalette, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open && !loaded) void load();
  }, [open, loaded, load]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                {...(reduce
                  ? {
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      exit: { opacity: 0 },
                    }
                  : {
                      variants: paletteVariants,
                      initial: 'hidden',
                      animate: 'show',
                      exit: 'exit',
                    })}
                className="safe-top fixed left-1/2 top-[12vh] z-50 w-[min(92vw,640px)] -translate-x-1/2 overflow-hidden rounded-card border border-border bg-surface shadow-2xl"
              >
                <VisuallyHidden asChild>
                  <DialogPrimitive.Title>Search Reel</DialogPrimitive.Title>
                </VisuallyHidden>
                <Command
                  label="Search Reel"
                  className="[&_[cmdk-input-wrapper]]:flex [&_[cmdk-input-wrapper]]:items-center"
                >
                  <div className="flex items-center gap-2 border-b border-border px-4">
                    <Search className="size-4 text-text-hint" />
                    <Command.Input
                      placeholder="Search titles or jump to…"
                      className="h-12 w-full bg-transparent text-base text-text outline-none placeholder:text-text-hint"
                    />
                  </div>
                  <Command.List className="max-h-[50vh] overflow-y-auto p-2">
                    <Command.Empty className="px-3 py-6 text-center text-sm text-text-muted">
                      {loaded ? 'No results.' : 'Loading…'}
                    </Command.Empty>

                    <Command.Group
                      heading="Go to"
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-text-muted"
                    >
                      <PaletteItem
                        onSelect={() => {
                          setOpen(false);
                          openAddTitle();
                        }}
                      >
                        <Plus className="size-4 text-accent" />
                        Add a title
                      </PaletteItem>
                      <PaletteItem onSelect={() => go('/')}>
                        <Film className="size-4 text-text-muted" />
                        Library
                      </PaletteItem>
                      <PaletteItem onSelect={() => go('/dashboard')}>
                        <LayoutDashboard className="size-4 text-text-muted" />
                        Dashboard
                      </PaletteItem>
                    </Command.Group>

                    {titles.length > 0 && (
                      <Command.Group
                        heading="Titles"
                        className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-text-muted"
                      >
                        {titles.map((t) => (
                          <PaletteItem
                            key={t.id}
                            value={`${t.name} ${t.year ?? ''}`}
                            onSelect={() => go(`/titles/${t.id}`)}
                          >
                            {t.type === 'SERIES' ? (
                              <Tv className="size-4 text-text-muted" />
                            ) : (
                              <Film className="size-4 text-text-muted" />
                            )}
                            <span className="flex-1 truncate">{t.name}</span>
                            <span className="tabular text-xs text-text-hint">
                              {STATUS_LABEL[t.status]}
                              {t.year ? ` · ${t.year}` : ''}
                            </span>
                          </PaletteItem>
                        ))}
                      </Command.Group>
                    )}
                  </Command.List>
                </Command>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

function PaletteItem({
  children,
  onSelect,
  value,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  value?: string | undefined;
}) {
  return (
    <Command.Item
      {...(value !== undefined ? { value } : {})}
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-chip p-2 text-sm text-text data-[selected=true]:bg-surface-2"
    >
      {children}
    </Command.Item>
  );
}
