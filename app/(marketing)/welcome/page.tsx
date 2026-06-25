import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Clapperboard, Layers, Star, Tv } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Reel — your film & TV tracker',
};

const features = [
  {
    icon: Layers,
    title: 'One shelf for everything',
    body: 'Your watchlist and your watched log live together, poster-forward.',
  },
  {
    icon: Tv,
    title: 'Never lose your place',
    body: 'Series remember exactly where you left off — down to S2E5.',
  },
  {
    icon: Star,
    title: 'Rate what you finish',
    body: 'One to five stars, notes and tags, so your log reflects what you thought.',
  },
];

export default function WelcomePage() {
  return (
    <main className="safe-top safe-bottom relative flex min-h-dvh flex-col bg-bg">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-accent-soft to-transparent" />

      <header className="safe-x relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Logo />
        <Button asChild variant="ghost" size="sm">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </header>

      <section className="safe-x relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-muted">
          <Clapperboard className="size-4 text-accent" />
          Personal film &amp; TV tracker
        </span>
        <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Everything you mean to watch, and everything you&apos;ve seen.
        </h1>
        <p className="mt-5 max-w-xl text-balance text-lg text-text-muted">
          Add a title in seconds, keep your place in every series, and rate what
          you finish — in one quiet, cinematic shelf.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">I already have an account</Link>
          </Button>
        </div>

        <div className="mt-16 grid w-full gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-card border border-border bg-surface p-5 text-left shadow-sm"
            >
              <f.icon className="mb-3 size-6 text-accent" />
              <h2 className="text-base font-semibold text-text">{f.title}</h2>
              <p className="mt-1 text-sm text-text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="safe-x relative z-10 mx-auto w-full max-w-5xl px-4 py-6 text-center text-sm text-text-hint">
        Install Reel to your home screen for a full-screen, app-like experience.
      </footer>
    </main>
  );
}
