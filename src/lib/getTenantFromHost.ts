import { headers } from 'next/headers';
import { resolveTenantHost } from '@/utils/tenantHost';

export async function getTenantFromHost(): Promise<string | null> {
  const h = await headers();
  const host = h.get('host') || '';

  const { tenantSlug } = resolveTenantHost(host);
  return tenantSlug;
}
