import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { titles, type NewTitle, type Title } from '@/db/schema';
import { ApiError } from '@/lib/api';

/** All of a user's titles (unsorted; callers apply query logic). */
export async function listUserTitles(userId: string): Promise<Title[]> {
  return db.select().from(titles).where(eq(titles.userId, userId));
}

/** A single title scoped to the owner — the authorization boundary. */
export async function getUserTitle(
  userId: string,
  id: string,
): Promise<Title | undefined> {
  const rows = await db
    .select()
    .from(titles)
    .where(and(eq(titles.userId, userId), eq(titles.id, id)))
    .limit(1);
  return rows[0];
}

export async function insertTitle(values: NewTitle): Promise<Title> {
  const rows = await db.insert(titles).values(values).returning();
  const row = rows[0];
  if (!row) throw new ApiError('INTERNAL', 'Failed to create title');
  return row;
}

/** Owner-scoped update. Throws NOT_FOUND if the row isn't the user's. */
export async function patchTitle(
  userId: string,
  id: string,
  patch: Partial<NewTitle>,
): Promise<Title> {
  const rows = await db
    .update(titles)
    .set(patch)
    .where(and(eq(titles.userId, userId), eq(titles.id, id)))
    .returning();
  const row = rows[0];
  if (!row) throw new ApiError('NOT_FOUND', 'Title not found');
  return row;
}

export async function removeTitle(userId: string, id: string): Promise<void> {
  const rows = await db
    .delete(titles)
    .where(and(eq(titles.userId, userId), eq(titles.id, id)))
    .returning({ id: titles.id });
  if (rows.length === 0) {
    throw new ApiError('NOT_FOUND', 'Title not found');
  }
}
