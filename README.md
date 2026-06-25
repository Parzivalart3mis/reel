# Reel 🎬

Your film and TV watchlist and watched log — one cinematic, poster-forward shelf that remembers your place in every series. Installs to the iPhone home screen as a real PWA.

**Quick start:**

```bash
pnpm install
cp .env.example .env.local   # add your keys (see docs)
pnpm db:push && pnpm db:seed
pnpm dev
```

Full documentation — setup, env vars, the free TMDB key, scripts, architecture diagram, iPhone install steps, and how to remove the optional AI panel — lives in **[docs/README.md](docs/README.md)**.

Built with Next.js 15 · React 19 · Tailwind · Drizzle + Turso · Clerk · TMDB · Framer Motion.
