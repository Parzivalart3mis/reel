import Anthropic from '@anthropic-ai/sdk';
import type { Title } from '@/db/schema';

// The spec calls for "the latest Sonnet"; that is Sonnet 4.6.
const MODEL = 'claude-sonnet-4-6';

export function recommendConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

interface ContextItem {
  name: string;
  type: string;
  genres: string[];
  runtime: number | null;
  progress?: string | undefined;
  rating?: number | undefined;
}

interface RecommendContext {
  watchlist: ContextItem[];
  watching: ContextItem[];
  loved: ContextItem[];
}

/** Assemble a compact, notes-free context from the user's library. */
export function buildContext(titles: Title[]): RecommendContext {
  const watchlist = titles
    .filter((t) => t.status === 'WATCHLIST')
    .slice(0, 60)
    .map((t) => ({
      name: t.name,
      type: t.type,
      genres: t.genres,
      runtime: t.runtime,
    }));

  const watching = titles
    .filter((t) => t.status === 'WATCHING')
    .slice(0, 20)
    .map((t) => ({
      name: t.name,
      type: t.type,
      genres: t.genres,
      runtime: t.runtime,
      progress:
        t.currentSeason != null
          ? `S${t.currentSeason}E${t.currentEpisode ?? 1}`
          : undefined,
    }));

  const loved = titles
    .filter((t) => t.status === 'WATCHED' && (t.rating ?? 0) >= 4)
    .slice(0, 40)
    .map((t) => ({
      name: t.name,
      type: t.type,
      genres: t.genres,
      runtime: t.runtime,
      rating: t.rating ?? undefined,
    }));

  return { watchlist, watching, loved };
}

const SYSTEM_PROMPT = `You are Reel's "Watch Tonight" assistant. You help a single user beat backlog paralysis by picking something to start tonight.

Rules:
- Recommend only titles from the user's Watchlist or currently-Watching list. Only if none of those fit the filters may you suggest something else, and say so plainly.
- Suggest one to three titles, no more.
- For each pick, give exactly one short sentence of reasoning tied to the user's tastes (their highly-rated titles, genres, or where they left off in a series).
- Respect the mood and max-runtime constraints when given.
- Be calm and plain. No exclamation marks, no markdown headings, no preamble. Lead each pick with the title name.`;

function buildUserMessage(
  ctx: RecommendContext,
  mood: string | undefined,
  maxRuntime: number | undefined,
): string {
  const lines: string[] = [];
  lines.push('Here is my library.');
  lines.push('');
  lines.push('Watchlist:');
  for (const t of ctx.watchlist) {
    lines.push(
      `- ${t.name} (${t.type}${t.runtime ? `, ${t.runtime}m` : ''}) — ${t.genres.join(', ') || 'no genres'}`,
    );
  }
  lines.push('');
  lines.push('Currently watching:');
  for (const t of ctx.watching) {
    lines.push(
      `- ${t.name} (${t.type}${t.progress ? `, at ${t.progress}` : ''}) — ${t.genres.join(', ') || 'no genres'}`,
    );
  }
  lines.push('');
  lines.push('Titles I rated highly:');
  for (const t of ctx.loved) {
    lines.push(`- ${t.name} (${t.rating}/5) — ${t.genres.join(', ') || ''}`);
  }
  lines.push('');
  const filters: string[] = [];
  if (mood) filters.push(`mood: ${mood}`);
  if (maxRuntime) filters.push(`max runtime: ${maxRuntime} minutes`);
  lines.push(
    filters.length
      ? `What should I watch tonight? Filters — ${filters.join(', ')}.`
      : 'What should I watch tonight?',
  );
  return lines.join('\n');
}

export interface RecommendOptions {
  titles: Title[];
  mood?: string;
  maxRuntime?: number;
}

/** Stream the recommendation back as plain UTF-8 text deltas. */
export function streamRecommendation(
  opts: RecommendOptions,
): ReadableStream<Uint8Array> {
  const { titles, mood, maxRuntime } = opts;
  const ctx = buildContext(titles);
  const userMessage = buildUserMessage(ctx, mood, maxRuntime);
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const anthropic = new Anthropic();
        const stream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        });
        stream.on('text', (delta) => {
          controller.enqueue(encoder.encode(delta));
        });
        await stream.finalMessage();
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
