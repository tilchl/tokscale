import type { Metadata } from 'next';
import { requireOrgVerifiedPageSession } from '@/lib/auth/pageGuard';
import DeviceClient from './DeviceClient';

export const metadata: Metadata = {
  title: 'Device Authorization - Token Usage',
  description: 'Authorize your device to sync token usage data',
};

export default async function DevicePage() {
  await requireOrgVerifiedPageSession('/device');

  return <DeviceClient />;
}
