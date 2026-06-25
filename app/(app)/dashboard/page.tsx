import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { listUserTitles } from '@/lib/titles-service';
import { computeStats } from '@/lib/stats';
import { serializeTitle } from '@/lib/serialize';
import { Dashboard } from '@/components/dashboard/dashboard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/welcome');

  const titles = await listUserTitles(userId);
  const stats = computeStats(titles);

  const watching = titles
    .filter((t) => t.status === 'WATCHING')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 12)
    .map(serializeTitle);

  const recent = titles
    .filter((t) => t.status === 'WATCHED')
    .sort(
      (a, b) =>
        (b.watchedAt?.getTime() ?? 0) - (a.watchedAt?.getTime() ?? 0) ||
        b.updatedAt.getTime() - a.updatedAt.getTime(),
    )
    .slice(0, 12)
    .map(serializeTitle);

  return <Dashboard stats={stats} watching={watching} recent={recent} />;
}
