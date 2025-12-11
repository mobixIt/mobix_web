import {
  LOCAL_MULTI_TENANT_DOMAIN,
  STAGING_DOMAIN,
  PRODUCTION_DOMAIN,
  LOCALHOST_RAW_HOSTS,
} from '@/config/domains';

export type BaseHostResolution = {
  /** Hostname to redirect or build URLs against (e.g., "www.mobix.fyi"). */
  host: string;

  /**
   * Whether the port from the original request should be preserved.
   * - true → keep existing port (e.g., localhost:4567)
   * - false → do not include port
   */
  usePort: boolean;
};

export type TenantHostResolution = BaseHostResolution & {
  /**
   * Normalized hostname (lowercase, trimmed, port removed).
   * Example: "Foo.LOCALHOST:4567" → "foo.localhost"
   */
  hostname: string;

  /**
   * Extracted tenant slug.
   * Returns:
   * - string → when hostname corresponds to a tenant (e.g., "tenant.domain.com")
   * - null → when the hostname does not encode a tenant
   */
  tenantSlug: string | null;
};

/**
 * Normalizes a hostname for further processing.
 *
 * Normalization rules:
 * - Converts to lowercase.
 * - Removes leading/trailing whitespace.
 * - Strips port numbers (e.g., `"foo.localhost:4567"` → `"foo.localhost"`).
 *
 * This function does **not** validate DNS formats; it only prepares the string.
 *
 * @param hostname - A raw hostname value, which may be undefined or include a port.
 * @returns A normalized hostname without port, or an empty string if invalid.
 */
export function normalizeHostname(hostname: string | null | undefined): string {
  if (!hostname) return '';
  return hostname.toLowerCase().trim().split(':')[0];
}

/**
 * Extracts a tenant slug from a normalized hostname.
 *
 * Extraction rules:
 * - `"localhost"` and `"127.0.0.1"` → no tenant.
 * - `"<tenant>.localhost"` → returns `"tenant"`.
 * - `"<tenant>.<domain>"` → returns `"tenant"` unless the subdomain is `"www"`.
 * - In `test` or Playwright environments, a bare hostname (e.g., `"tenant"`)
 *   is treated as a valid tenant slug for convenience in E2E flows.
 *
 * @param normalizedHost - A hostname that has already been normalized.
 * @returns A tenant slug or null when no tenant is encoded in the hostname.
 */
export function extractTenantSlugFromHostname(normalizedHost: string): string | null {
  if (!normalizedHost) return null;

  // localhost without tenants: localhost, 127.0.0.1
  if (LOCALHOST_RAW_HOSTS.has(normalizedHost)) {
    return null;
  }

  // tenant.localhost → tenant
  if (normalizedHost.endsWith('.localhost')) {
    return normalizedHost.replace('.localhost', '');
  }

  // tenant.domain.com → tenant (except www.domain.com)
  const parts = normalizedHost.split('.');
  if (parts.length >= 2) {
    const sub = parts[0];
    if (sub === 'www') return null;
    return sub;
  }

  // Allow bare hostnames in tests: "tenant"
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return normalizedHost;
  }

  return null;
}

/**
 * Resolves the canonical base host for login redirects and URL construction.
 *
 * This function preserves the compatibility of the original `getBaseHost`
 * logic while centralizing domain rules for all environments.
 *
 * Resolution logic:
 * - Local multi-tenant domains:
 *     `<tenant>.local.mobix.fyi` → `www.local.mobix.fyi` (no port)
 * - Raw localhost hosts:
 *     `"localhost"` or `"127.0.0.1"` → keep port
 * - `<tenant>.localhost`:
 *     Always normalize redirects to `"localhost"` with port preserved.
 * - Staging:
 *     `<tenant>.mobix.fyi` → `www.mobix.fyi`
 * - Production:
 *     `<tenant>.mobix.lat` → `www.mobix.lat`
 * - Fallback:
 *     Returns the host unchanged.
 *
 * @param normalizedHost - The hostname after normalization (no port).
 * @returns A `BaseHostResolution` structure describing the canonical redirect host.
 */
export function resolveBaseHost(normalizedHost: string): BaseHostResolution {
  // Local multi-tenant: <tenant>.local.mobix.fyi → www.local.mobix.fyi
  if (normalizedHost.endsWith(`.${LOCAL_MULTI_TENANT_DOMAIN}`)) {
    return { host: `www.${LOCAL_MULTI_TENANT_DOMAIN}`, usePort: false };
  }

  // Raw localhost hosts: keep port
  if (LOCALHOST_RAW_HOSTS.has(normalizedHost)) {
    return { host: normalizedHost, usePort: true };
  }

  // tenant.localhost → normalize to localhost (port preserved)
  if (normalizedHost.endsWith('.localhost')) {
    return { host: 'localhost', usePort: true };
  }

  // Staging domains
  if (normalizedHost.endsWith(`.${STAGING_DOMAIN}`)) {
    return { host: `www.${STAGING_DOMAIN}`, usePort: false };
  }

  // Production domains
  if (normalizedHost.endsWith(`.${PRODUCTION_DOMAIN}`)) {
    return { host: `www.${PRODUCTION_DOMAIN}`, usePort: false };
  }

  // Fallback: return the value verbatim
  return { host: normalizedHost, usePort: false };
}

/**
 * Resolves all tenant-related information from a raw hostname.
 *
 * This is the primary utility function consumed by:
 * - Server-side tenant detection
 * - Frontend login redirection
 * - URL generation helpers
 *
 * Combines:
 * - Hostname normalization
 * - Tenant slug extraction
 * - Base host resolution
 *
 * Example:
 * ```ts
 * resolveTenantHost("acme.mobix.fyi");
 * // {
 * //   hostname: "acme.mobix.fyi",
 * //   tenantSlug: "acme",
 * //   host: "www.mobix.fyi",
 * //   usePort: false
 * // }
 * ```
 *
 * @param hostname - Raw hostname from headers, environment, or window.location.
 * @returns A structured resolution containing normalized host, tenant slug, and redirect rules.
 */
export function resolveTenantHost(hostname: string | null | undefined): TenantHostResolution {
  const normalizedHost = normalizeHostname(hostname);
  const tenantSlug = extractTenantSlugFromHostname(normalizedHost);
  const baseHost = resolveBaseHost(normalizedHost);

  return {
    hostname: normalizedHost,
    tenantSlug,
    ...baseHost,
  };
}
