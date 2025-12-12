import { describe, it, expect, vi } from 'vitest';
import {
  normalizeSessionMeta,
  normalizeSessionMetaForRefresh,
  type RawSessionMeta,
} from '@/session/sessionMeta';

describe('sessionMeta normalization', () => {
  it('normalizeSessionMeta returns finite expiresAtMs and idleTimeoutMs when expires_at is an ISO string and idle_timeout_minutes is valid', () => {
    const nowMs = Date.now();
    const raw: RawSessionMeta = {
      last_activity_at: nowMs - 5_000,
      idle_timeout_minutes: 10,
      expires_at: new Date(nowMs + 60_000).toISOString(),
    };

    const meta = normalizeSessionMeta(raw);

    expect(meta.last_activity_at).toBe(raw.last_activity_at);
    expect(meta.idle_timeout_minutes).toBe(10);
    expect(meta.idleTimeoutMs).toBe(10 * 60_000);
    expect(Number.isFinite(meta.expiresAtMs)).toBe(true);
    expect(meta.expiresAtMs).toBeGreaterThan(nowMs);
  });

  it('normalizeSessionMeta uses default idle minutes when idle_timeout_minutes is nullish or invalid', () => {
    const nowMs = Date.now();
    const raw: RawSessionMeta = {
      last_activity_at: nowMs,
      idle_timeout_minutes: null,
      expires_at: new Date(nowMs + 10_000).toISOString(),
    };

    const meta = normalizeSessionMeta(raw);

    expect(meta.idle_timeout_minutes).toBeGreaterThan(0);
    expect(meta.idleTimeoutMs).toBe(meta.idle_timeout_minutes * 60_000);
    expect(Number.isFinite(meta.expiresAtMs)).toBe(true);
  });

  it('normalizeSessionMeta sets expires_at fallback when expires_at is nullish and keeps values finite', () => {
    vi.useFakeTimers();
    const frozenNowMs = new Date('2025-01-01T00:00:00.000Z').getTime();
    vi.setSystemTime(frozenNowMs);

    const raw: RawSessionMeta = {
      last_activity_at: frozenNowMs,
      idle_timeout_minutes: 30,
      expires_at: null,
    };

    const meta = normalizeSessionMeta(raw);

    expect(typeof meta.expires_at === 'string' || typeof meta.expires_at === 'number').toBe(true);
    expect(Number.isFinite(meta.expiresAtMs)).toBe(true);
    expect(meta.idleTimeoutMs).toBe(30 * 60_000);

    vi.useRealTimers();
  });

  it('normalizeSessionMetaForRefresh returns refresh-default idle minutes when idle_timeout_minutes is missing', () => {
    const nowMs = Date.now();
    const raw: RawSessionMeta = {
      last_activity_at: nowMs,
      expires_at: nowMs + 60_000,
    };

    const meta = normalizeSessionMetaForRefresh(raw);

    expect(meta.lastActivity).toBe(nowMs);
    expect(meta.idleMinutes).toBeGreaterThan(0);
    expect(meta.idleMs).toBe(meta.idleMinutes * 60_000);
    expect(meta.expiresAtMs).toBe(nowMs + 60_000);
  });

  it('normalizeSessionMetaForRefresh falls back to now + idle window when expires_at is an invalid string', () => {
    vi.useFakeTimers();
    const frozenNowMs = new Date('2025-01-01T00:00:00.000Z').getTime();
    vi.setSystemTime(frozenNowMs);

    const raw: RawSessionMeta = {
      last_activity_at: frozenNowMs,
      idle_timeout_minutes: 5,
      expires_at: 'not-a-date',
    };

    const meta = normalizeSessionMetaForRefresh(raw);

    expect(Number.isFinite(meta.expiresAtMs)).toBe(true);
    expect(Number.isNaN(meta.expiresAtMs)).toBe(false);
    expect(meta.expiresAtMs).toBe(frozenNowMs + meta.idleMinutes * 60_000);

    vi.useRealTimers();
  });
});
