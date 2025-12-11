export function getTenantSlugFromHost(hostname: string): string | null {
  if (!hostname) return null;

  // Normalize
  const lower = hostname.toLowerCase().trim();

  // 1. Playwright sometimes resolves only "localhost" — fallback not allowed
  if (lower === 'localhost' || lower === '127.0.0.1') {
    return null;
  }

  // 2. Allow tenant.localhost → tenant
  if (lower.endsWith('.localhost')) {
    return lower.replace('.localhost', '');
  }

  // 3. For real domains: tenant.domain.com → tenant
  const parts = lower.split('.');
  if (parts.length >= 2) {
    const sub = parts[0];
    if (sub === 'www') return null;
    return sub;
  }

  // 4. Edge-case: hostname may arrive as "tenant" in E2E — allow only in test
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return lower;
  }

  return null;
}