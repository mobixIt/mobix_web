export function getTenantSlugFromHost(hostname: string): string | null {
  if (!hostname) return null;

  const parts = hostname.split('.');
  if (parts.length < 2) {
    return null;
  }

  const subdomain = parts[0].toLowerCase();

  if (subdomain === 'www') {
    return null;
  }

  return subdomain;
}