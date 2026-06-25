import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Auth is mocked: a mutable userId stands in for the Clerk session.
let currentUserId = 'user_a';
vi.mock('@/lib/auth', () => ({
  requireUserId: vi.fn(async () => currentUserId),
  ensureUser: vi.fn(async () => currentUserId),
}));

import { db } from '@/db';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { titles, users } from '@/db/schema';
import { GET as listTitles, POST as createTitle } from '@/app/api/titles/route';
import {
  DELETE as deleteTitle,
  GET as getTitle,
  PATCH as patchTitle,
} from '@/app/api/titles/[id]/route';
import { POST as setRating } from '@/app/api/titles/[id]/rating/route';
import { POST as setStatus } from '@/app/api/titles/[id]/status/route';
import { POST as setProgress } from '@/app/api/titles/[id]/progress/route';

beforeAll(async () => {
  await migrate(db, { migrationsFolder: './db/migrations' });
  await db
    .insert(users)
    .values([
      { id: 'user_a', email: 'a@reel.test' },
      { id: 'user_b', email: 'b@reel.test' },
    ])
    .onConflictDoNothing();
});

afterEach(async () => {
  await db.delete(titles);
  currentUserId = 'user_a';
});

const jsonReq = (url: string, method: string, body?: unknown) =>
  new NextRequest(url, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
    headers: { 'content-type': 'application/json' },
  });

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

async function createSample(overrides: Record<string, unknown> = {}) {
  const res = await createTitle(
    jsonReq('http://localhost/api/titles', 'POST', {
      type: 'FILM',
      name: 'Dune',
      ...overrides,
    }),
  );
  const json = (await res.json()) as { title: { id: string } };
  return { res, title: json.title };
}

describe('titles CRUD', () => {
  it('creates and lists a title', async () => {
    const { res, title } = await createSample();
    expect(res.status).toBe(201);
    expect(title.id).toBeTruthy();

    const listRes = await listTitles(
      new NextRequest('http://localhost/api/titles'),
    );
    const list = (await listRes.json()) as { titles: unknown[]; total: number };
    expect(list.total).toBe(1);
    expect(list.titles).toHaveLength(1);
  });

  it('rejects unknown keys with a 400', async () => {
    const res = await createTitle(
      jsonReq('http://localhost/api/titles', 'POST', {
        type: 'FILM',
        name: 'x',
        hacked: true,
      }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { code: string } };
    expect(json.error.code).toBe('VALIDATION');
  });

  it('patches a title', async () => {
    const { title } = await createSample();
    const res = await patchTitle(
      jsonReq(`http://localhost/api/titles/${title.id}`, 'PATCH', {
        favorite: true,
        notes: 'great',
      }),
      ctx(title.id),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      title: { favorite: boolean; notes: string };
    };
    expect(json.title.favorite).toBe(true);
    expect(json.title.notes).toBe('great');
  });

  it('deletes a title', async () => {
    const { title } = await createSample();
    const del = await deleteTitle(
      jsonReq(`http://localhost/api/titles/${title.id}`, 'DELETE'),
      ctx(title.id),
    );
    expect(del.status).toBe(200);
    const get = await getTitle(
      new NextRequest(`http://localhost/api/titles/${title.id}`),
      ctx(title.id),
    );
    expect(get.status).toBe(404);
  });
});

describe('status side-effects', () => {
  it('rating a title moves it to WATCHED and stamps watchedAt', async () => {
    const { title } = await createSample({ status: 'WATCHLIST' });
    const res = await setRating(
      jsonReq(`http://localhost/api/titles/${title.id}/rating`, 'POST', {
        rating: 4,
      }),
      ctx(title.id),
    );
    const json = (await res.json()) as {
      title: { rating: number; status: string; watchedAt: number | null };
    };
    expect(json.title.rating).toBe(4);
    expect(json.title.status).toBe('WATCHED');
    expect(json.title.watchedAt).toBeTypeOf('number');
  });

  it('setting status to WATCHED stamps watchedAt', async () => {
    const { title } = await createSample();
    const res = await setStatus(
      jsonReq(`http://localhost/api/titles/${title.id}/status`, 'POST', {
        status: 'WATCHED',
      }),
      ctx(title.id),
    );
    const json = (await res.json()) as {
      title: { watchedAt: number | null };
    };
    expect(json.title.watchedAt).toBeTypeOf('number');
  });

  it('recording progress sets status to WATCHING', async () => {
    const { title } = await createSample({ type: 'SERIES' });
    const res = await setProgress(
      jsonReq(`http://localhost/api/titles/${title.id}/progress`, 'POST', {
        season: 2,
        episode: 5,
      }),
      ctx(title.id),
    );
    const json = (await res.json()) as {
      title: { status: string; currentSeason: number; currentEpisode: number };
    };
    expect(json.title.status).toBe('WATCHING');
    expect(json.title.currentSeason).toBe(2);
    expect(json.title.currentEpisode).toBe(5);
  });
});

describe('cross-user isolation', () => {
  it('user B cannot read, patch, or delete user A’s title', async () => {
    currentUserId = 'user_a';
    const { title } = await createSample();

    currentUserId = 'user_b';

    const get = await getTitle(
      new NextRequest(`http://localhost/api/titles/${title.id}`),
      ctx(title.id),
    );
    expect(get.status).toBe(404);

    const patch = await patchTitle(
      jsonReq(`http://localhost/api/titles/${title.id}`, 'PATCH', {
        favorite: true,
      }),
      ctx(title.id),
    );
    expect(patch.status).toBe(404);

    const del = await deleteTitle(
      jsonReq(`http://localhost/api/titles/${title.id}`, 'DELETE'),
      ctx(title.id),
    );
    expect(del.status).toBe(404);

    const list = await listTitles(
      new NextRequest('http://localhost/api/titles'),
    );
    const json = (await list.json()) as { total: number };
    expect(json.total).toBe(0);

    // And user A still sees it.
    currentUserId = 'user_a';
    const listA = await listTitles(
      new NextRequest('http://localhost/api/titles'),
    );
    expect(((await listA.json()) as { total: number }).total).toBe(1);
  });
});
