import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { listUserTitles } from '@/lib/titles-service';
import { serializeTitle } from '@/lib/serialize';
import { LibraryView } from '@/components/titles/library-view';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  const { userId } = await auth();
  if (!userId) redirect('/welcome');

  const titles = await listUserTitles(userId);
  const dtos = titles.map(serializeTitle);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Library
        </h1>
        <p className="text-sm text-text-muted">
          Everything you mean to watch and everything you&apos;ve seen.
        </p>
      </div>
      <LibraryView titles={dtos} />
    </div>
  );
}
