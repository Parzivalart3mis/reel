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

  return <LibraryView titles={dtos} />;
}
