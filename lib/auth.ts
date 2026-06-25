import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { ApiError } from '@/lib/api';

/**
 * Returns the authenticated Clerk userId or throws an ApiError(UNAUTHORIZED).
 * Use in route handlers; the middleware already gates access, this is the
 * authorization anchor every query is scoped by.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new ApiError('UNAUTHORIZED', 'You must be signed in');
  }
  return userId;
}

/**
 * Ensures a row exists in `users` for the current Clerk user (lazy upsert on
 * first write). Returns the userId. Safe to call repeatedly.
 */
export async function ensureUser(): Promise<string> {
  const userId = await requireUserId();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (existing.length > 0) return userId;

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    `${userId}@users.reel.local`;

  await db.insert(users).values({ id: userId, email }).onConflictDoNothing();
  return userId;
}
