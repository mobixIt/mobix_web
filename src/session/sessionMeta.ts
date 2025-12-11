export type RawSessionMeta = {
  last_activity_at: number;
  idle_timeout_minutes?: number | null;
  expires_at?: string | number | null;
};

export type NormalizedSessionMeta = {
  last_activity_at: number;
  idle_timeout_minutes: number;
  expires_at: string | number;
  expiresAtMs: number;
  idleTimeoutMs: number;
};

export type NormalizedSessionMetaForRefresh = {
  lastActivity: number;
  idleMinutes: number;
  idleMs: number;
  expiresAtMs: number;
};

const DEFAULT_IDLE_MINUTES = 30;
const DEFAULT_REFRESH_IDLE_MINUTES = 28;

/**
 * Normalizes the idle timeout minutes for general session usage (login, cookie).
 *
 * - If value is a positive number → use it.
 * - Otherwise → fallback to DEFAULT_IDLE_MINUTES.
 */
export function normalizeIdleMinutes(value: unknown): number {
  if (typeof value === 'number' && value > 0) return value;
  return DEFAULT_IDLE_MINUTES;
}

/**
 * Normalizes the idle timeout minutes specifically for refresh flows.
 *
 * - If value is a positive number → use it.
 * - Otherwise → fallback to DEFAULT_REFRESH_IDLE_MINUTES.
 */
export function normalizeIdleMinutesForRefresh(
  value: unknown,
): number {
  if (typeof value === 'number' && value > 0) return value;
  return DEFAULT_REFRESH_IDLE_MINUTES;
}

/**
 * Normalizes expires_at into a millisecond timestamp.
 *
 * Rules:
 * - If expires_at is a finite number → treat it as ms and return it.
 * - If expires_at is a valid date string → parse and return ms.
 * - Otherwise → fallback to now + idleMinutes window.
 */
export function normalizeExpiresAt(
  expires_at: string | number | null | undefined,
  idleMinutes: number,
): number {
  if (typeof expires_at === 'number' && Number.isFinite(expires_at)) {
    return expires_at;
  }

  if (typeof expires_at === 'string') {
    const ms = new Date(expires_at).getTime();
    if (Number.isFinite(ms)) {
      return ms;
    }
  }

  // Fallback: now + idle window
  return Date.now() + idleMinutes * 60_000;
}

/**
 * Produces a normalized session meta shape for general usage:
 *
 * - Guarantees idle_timeout_minutes is a positive number (with default).
 * - Guarantees expires_at is present (number or ISO string).
 * - Guarantees expiresAtMs and idleTimeoutMs are finite numbers.
 */
export function normalizeSessionMeta(
  raw: RawSessionMeta,
  options?: { defaultIdleMinutes?: number },
): NormalizedSessionMeta {
  const defaultIdle =
    typeof options?.defaultIdleMinutes === 'number'
      ? options.defaultIdleMinutes
      : DEFAULT_IDLE_MINUTES;

  const safeIdleMinutes =
    typeof raw.idle_timeout_minutes === 'number' &&
    raw.idle_timeout_minutes > 0
      ? raw.idle_timeout_minutes
      : defaultIdle;

  // If expires_at is missing or invalid, fallback to now + idle window.
  const rawExpires =
    raw.expires_at ??
    new Date(Date.now() + safeIdleMinutes * 60_000).toISOString();

  let expiresAt: string | number = rawExpires;
  let expiresAtMs =
    typeof rawExpires === 'number'
      ? rawExpires
      : new Date(rawExpires).getTime();

  if (!Number.isFinite(expiresAtMs)) {
    // If parsing failed, re-fallback explicitly
    expiresAtMs = Date.now() + safeIdleMinutes * 60_000;
    expiresAt = expiresAtMs;
  }

  return {
    last_activity_at: raw.last_activity_at,
    idle_timeout_minutes: safeIdleMinutes,
    expires_at: expiresAt,
    expiresAtMs,
    idleTimeoutMs: safeIdleMinutes * 60_000,
  };
}

/**
 * Produces a normalized meta specifically for token refresh flows.
 *
 * - Uses a slightly shorter default idle window (DEFAULT_REFRESH_IDLE_MINUTES).
 * - Ensures expiresAtMs is always finite, with fallback based on idleMinutes.
 */
export function normalizeSessionMetaForRefresh(
  raw: RawSessionMeta,
): NormalizedSessionMetaForRefresh {
  const idleMinutes = normalizeIdleMinutesForRefresh(
    raw.idle_timeout_minutes,
  );

  const expiresAtMs = normalizeExpiresAt(raw.expires_at, idleMinutes);

  return {
    lastActivity: raw.last_activity_at,
    idleMinutes,
    idleMs: idleMinutes * 60_000,
    expiresAtMs,
  };
}
