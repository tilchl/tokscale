import type { Metadata } from 'next';
import { requireOrgVerifiedPageSession } from '@/lib/auth/pageGuard';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings - Token Usage',
  description: 'Manage your account settings and API tokens',
};

export default async function SettingsPage() {
  await requireOrgVerifiedPageSession('/settings');

  return <SettingsClient />;
}
