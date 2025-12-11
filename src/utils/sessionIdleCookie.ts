import { getBaseDomain } from '@/utils/env';

export type SessionIdleMeta = {
  last_activity_at: number;
  idle_timeout_minutes: number;
  expires_at: string | number;
};

const COOKIE_NAME = 'mobix_idle_meta';

function getCookieDomain(): string | null {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;

  if (env === 'staging' || env === 'production' || env === 'test') {
    const base = getBaseDomain();
    const [rawHost] = base.split(':');

    if (env === 'test') {
      return null;
    }

    return rawHost;
  }

  if (env === 'development') {
    const useNgrok = process.env.NEXT_PUBLIC_USE_NGROK === 'true';
    if (useNgrok) {
      const base = getBaseDomain();
      const [host] = base.split(':');
      return host;
    }
  }

  return null;
}

/**
 * Reads and parses the session idle cookie.
 *
 * - Returns `null` on SSR (no `document`).
 * - Returns `null` when the cookie is missing.
 * - Returns `null` when JSON is invalid or the parsed value
 *   does not have the expected basic types.
 */
export function readSessionIdleCookie(): SessionIdleMeta | null {
  if (typeof document === 'undefined') return null;

  const all = document.cookie?.split('; ') ?? [];
  const found = all.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!found) return null;

  const value = found.substring(COOKIE_NAME.length + 1);

  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as SessionIdleMeta | Record<string, unknown>;

    // Basic type validation to keep tests and behaviour consistent
    if (
      typeof parsed.last_activity_at !== 'number' ||
      typeof parsed.idle_timeout_minutes !== 'number' ||
      !(
        typeof parsed.expires_at === 'string' ||
        typeof parsed.expires_at === 'number'
      )
    ) {
      return null;
    }

    return parsed as SessionIdleMeta;
  } catch {
    return null;
  }
}

/**
 * Writes the session idle cookie with the given metadata.
 *
 * - No-ops on SSR (no `document`).
 * - Sets path, expires, SameSite and domain (when applicable).
 */
export function writeSessionIdleCookie(meta: SessionIdleMeta) {
  if (typeof document === 'undefined') return;

  const expiresMs =
    typeof meta.expires_at === 'number'
      ? meta.expires_at
      : new Date(meta.expires_at).getTime();

  const expiresDate = new Date(expiresMs);
  const serialized = encodeURIComponent(JSON.stringify(meta));

  const parts = [
    `${COOKIE_NAME}=${serialized}`,
    'path=/',
    `expires=${expiresDate.toUTCString()}`,
    'SameSite=Lax',
  ];

  const cookieDomain = getCookieDomain();
  if (cookieDomain) {
    parts.push(`domain=${cookieDomain}`);
  }

  document.cookie = parts.join('; ');
}

/**
 * Updates only the `last_activity_at` field in the cookie, if present.
 *
 * - No-ops on SSR (no `document`).
 * - No-ops when the cookie does not exist or is invalid.
 */
export function updateLastActivityInCookie(lastActivity: number) {
  if (typeof document === 'undefined') return;

  const meta = readSessionIdleCookie();
  if (!meta) return;

  writeSessionIdleCookie({
    ...meta,
    last_activity_at: lastActivity,
  });
}

/**
 * Clears the session idle cookie by setting an expired cookie value.
 *
 * - No-ops on SSR (no `document`).
 */
export function clearSessionIdleCookie() {
  if (typeof document === 'undefined') return;

  const parts = [
    `${COOKIE_NAME}=`,
    'path=/',
    'expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'SameSite=Lax',
  ];

  const cookieDomain = getCookieDomain();
  if (cookieDomain) {
    parts.push(`domain=${cookieDomain}`);
  }

  document.cookie = parts.join('; ');
}
