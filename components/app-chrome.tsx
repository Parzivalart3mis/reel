'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Film, LayoutDashboard, Plus, Search, Sparkles } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { AddTitleSheet } from '@/components/titles/add-title-sheet';
import { WatchTonightSheet } from '@/components/watch-tonight/watch-tonight-sheet';
import { CommandPalette } from '@/components/command-palette/command-palette';
import {
  REEL_EVENTS,
  openAddTitle,
  openCommandPalette,
  openWatchTonight,
} from '@/lib/events';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Library', icon: Film },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const [watchOpen, setWatchOpen] = useState(false);

  useEffect(() => {
    const onAdd = () => setAddOpen(true);
    const onWatch = () => setWatchOpen(true);
    window.addEventListener(REEL_EVENTS.addTitle, onAdd);
    window.addEventListener(REEL_EVENTS.watchTonight, onWatch);
    return () => {
      window.removeEventListener(REEL_EVENTS.addTitle, onAdd);
      window.removeEventListener(REEL_EVENTS.watchTonight, onWatch);
    };
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="safe-top bg-bg/80 sticky top-0 z-40 border-b border-border backdrop-blur-md">
        <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" aria-label="Reel home">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-input px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-surface-2 text-text'
                      : 'text-text-muted hover:text-text',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 text-text-muted sm:inline-flex"
              onClick={openCommandPalette}
              aria-label="Search"
            >
              <Search className="size-4" />
              <kbd className="rounded border border-border px-1.5 text-xs">
                ⌘K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={openCommandPalette}
              aria-label="Search"
            >
              <Search className="size-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={openWatchTonight}
              aria-label="Watch tonight"
            >
              <Sparkles className="size-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="hidden md:inline-flex"
              onClick={openAddTitle}
              aria-label="Add a title"
            >
              <Plus className="size-5" />
            </Button>

            <ThemeToggle />

            <div className="ml-1">
              <UserButton
                afterSignOutUrl="/welcome"
                appearance={{ elements: { avatarBox: 'h-8 w-8' } }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="safe-x mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-12">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="safe-bottom bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2.5 text-xs',
                isActive(item.href) ? 'text-accent' : 'text-text-muted',
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={openAddTitle}
            className="flex flex-col items-center gap-0.5 py-2.5 text-xs text-text-muted"
          >
            <Plus className="size-5" />
            Add
          </button>
          <button
            type="button"
            onClick={openWatchTonight}
            className="flex flex-col items-center gap-0.5 py-2.5 text-xs text-text-muted"
          >
            <Sparkles className="size-5" />
            Tonight
          </button>
        </div>
      </nav>

      <AddTitleSheet open={addOpen} onOpenChange={setAddOpen} />
      <WatchTonightSheet open={watchOpen} onOpenChange={setWatchOpen} />
      <CommandPalette />
    </div>
  );
}
