import { normalizeHostname, extractTenantSlugFromHostname } from '@/utils/tenantHost';

export function getTenantSlugFromHost(hostname: string): string | null {
  const normalized = normalizeHostname(hostname);
  return extractTenantSlugFromHostname(normalized);
}
