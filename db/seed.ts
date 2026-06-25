import { eq } from 'drizzle-orm';
import { db } from './index';
import { titles, users, type NewTitle } from './schema';

const DEMO_USER_ID = 'user_demo_reel';
const DEMO_EMAIL = 'demo@reel.local';

const tmdb = (path: string) => `https://image.tmdb.org/t/p/w500${path}`;

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

const seedTitles: NewTitle[] = [
  {
    userId: DEMO_USER_ID,
    type: 'FILM',
    status: 'WATCHED',
    name: 'Dune: Part Two',
    year: 2024,
    tmdbId: 693134,
    posterUrl: tmdb('/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'),
    imageSource: 'TMDB',
    overview:
      'Paul Atreides unites with the Fremen to wage war against House Harkonnen and avenge his family.',
    runtime: 166,
    genres: ['Science Fiction', 'Adventure'],
    rating: 5,
    favorite: true,
    notes: 'The IMAX sequences are unreal. Rewatch before any sequel.',
    tags: ['epic', 'rewatch'],
    watchedAt: daysAgo(20),
  },
  {
    userId: DEMO_USER_ID,
    type: 'FILM',
    status: 'WATCHED',
    name: 'Past Lives',
    year: 2023,
    tmdbId: 666277,
    posterUrl: tmdb('/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg'),
    imageSource: 'TMDB',
    overview:
      'Two childhood friends reunite in New York decades later for one fateful week.',
    runtime: 105,
    genres: ['Romance', 'Drama'],
    rating: 4,
    favorite: false,
    notes: 'Quiet and devastating.',
    tags: ['slow-burn'],
    watchedAt: daysAgo(75),
  },
  {
    userId: DEMO_USER_ID,
    type: 'SERIES',
    status: 'WATCHING',
    name: 'Severance',
    year: 2022,
    tmdbId: 95396,
    posterUrl: tmdb('/lFf6LLrQjYldcZItzOkGmMMigP7.jpg'),
    imageSource: 'TMDB',
    overview:
      'Employees undergo a procedure that severs their work and personal memories.',
    totalSeasons: 2,
    genres: ['Mystery', 'Sci-Fi & Fantasy', 'Drama'],
    currentSeason: 2,
    currentEpisode: 5,
    favorite: true,
    tags: ['mind-bending'],
  },
  {
    userId: DEMO_USER_ID,
    type: 'SERIES',
    status: 'ON_HOLD',
    name: 'The Bear',
    year: 2022,
    tmdbId: 136315,
    posterUrl: tmdb('/zPyW5UvFn3MQjkBVKZQ5gPmkpk7.jpg'),
    imageSource: 'TMDB',
    overview:
      'A young chef returns home to run his family sandwich shop in Chicago.',
    totalSeasons: 3,
    genres: ['Comedy', 'Drama'],
    currentSeason: 1,
    currentEpisode: 3,
    tags: ['intense'],
  },
  {
    userId: DEMO_USER_ID,
    type: 'SERIES',
    status: 'WATCHLIST',
    name: 'Shogun',
    year: 2024,
    tmdbId: 119051,
    posterUrl: tmdb('/7O4iVfOMQmdCSxPOFwtemU76Cqr.jpg'),
    imageSource: 'TMDB',
    overview:
      'In feudal Japan, a stranded English pilot becomes entangled in a power struggle.',
    totalSeasons: 1,
    genres: ['Drama', 'War & Politics'],
    tags: ['period'],
  },
  {
    userId: DEMO_USER_ID,
    type: 'FILM',
    status: 'WATCHLIST',
    name: 'The Brutalist',
    year: 2024,
    tmdbId: 549509,
    posterUrl: null,
    imageSource: 'NONE',
    overview:
      'A visionary architect emigrates to America to rebuild his life and legacy.',
    runtime: 215,
    genres: ['Drama', 'History'],
    tags: ['oscars'],
  },
  {
    userId: DEMO_USER_ID,
    type: 'FILM',
    status: 'WATCHLIST',
    name: 'Saturday Matinee',
    year: 2021,
    posterUrl: 'https://picsum.photos/seed/reel-matinee/400/600',
    imageSource: 'CUSTOM',
    overview: 'A local indie pick with a custom poster override.',
    runtime: 92,
    genres: ['Indie'],
    tags: ['festival'],
  },
  {
    userId: DEMO_USER_ID,
    type: 'SERIES',
    status: 'DROPPED',
    name: 'Emily in Paris',
    year: 2020,
    tmdbId: 95479,
    posterUrl: tmdb('/jbf1tSL5Sb1tT4cyR4V3aZIQrqA.jpg'),
    imageSource: 'TMDB',
    overview:
      'A Chicago marketing exec moves to Paris for a job and a culture clash.',
    totalSeasons: 4,
    genres: ['Comedy', 'Drama'],
    currentSeason: 1,
    currentEpisode: 2,
    rating: 2,
    tags: ['background'],
  },
];

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding demo data…');

  await db
    .insert(users)
    .values({ id: DEMO_USER_ID, email: DEMO_EMAIL })
    .onConflictDoNothing();

  // Reset the demo user's titles for an idempotent seed.
  await db.delete(titles).where(eq(titles.userId, DEMO_USER_ID));
  await db.insert(titles).values(seedTitles);

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${seedTitles.length} titles for ${DEMO_EMAIL} (${DEMO_USER_ID}).`,
  );
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
