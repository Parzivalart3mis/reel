import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getUserTitle } from '@/lib/titles-service';
import { serializeTitle } from '@/lib/serialize';
import { TitleDetail } from '@/components/titles/title-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { userId } = await auth();
  if (!userId) return { title: 'Title' };
  const { id } = await params;
  const title = await getUserTitle(userId, id);
  return { title: title?.name ?? 'Title' };
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/welcome');

  const { id } = await params;
  const title = await getUserTitle(userId, id);
  if (!title) notFound();

  return <TitleDetail initial={serializeTitle(title)} />;
}
