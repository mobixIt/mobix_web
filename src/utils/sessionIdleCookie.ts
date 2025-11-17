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

export function readSessionIdleCookie(): SessionIdleMeta | null {
  if (typeof document === 'undefined') return null;

  const all = document.cookie?.split('; ') ?? [];
  const found = all.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!found) return null;

  const value = found.substring(COOKIE_NAME.length + 1);
  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded) as SessionIdleMeta;

    if (
      typeof parsed.last_activity_at === 'number' &&
      typeof parsed.idle_timeout_minutes === 'number' &&
      (typeof parsed.expires_at === 'string' || typeof parsed.expires_at === 'number')
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

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

export function updateLastActivityInCookie(lastActivity: number) {
  const meta = readSessionIdleCookie();
  if (!meta) return;

  writeSessionIdleCookie({
    ...meta,
    last_activity_at: lastActivity,
  });
}

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
