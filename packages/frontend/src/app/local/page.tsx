import type { Metadata } from 'next';
import { requireOrgVerifiedPageSession } from '@/lib/auth/pageGuard';
import LocalClient from './LocalClient';

export const metadata: Metadata = {
  title: 'Local Data - Token Usage',
  description: 'View your local AI token usage data',
};

export default async function LocalViewerPage() {
  await requireOrgVerifiedPageSession('/local');

  return <LocalClient />;
}
