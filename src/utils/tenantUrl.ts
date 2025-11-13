import { getBaseDomain } from './env';

export function buildTenantUrl(tenantSlug: string) {
  const baseDomain = getBaseDomain();
  return `http://${tenantSlug}.${baseDomain}`;
}