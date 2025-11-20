import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  readSessionIdleCookie,
  writeSessionIdleCookie,
  updateLastActivityInCookie,
  clearSessionIdleCookie,
  type SessionIdleMeta,
} from '@/utils/sessionIdleCookie';

vi.mock('@/utils/env', () => ({
  getBaseDomain: vi.fn(() => 'mobix.fyi'),
}));

describe('sessionIdleCookie utils', () => {
  const COOKIE_NAME = 'mobix_idle_meta';
  let cookieStore = '';

  function resetCookies() {
    cookieStore = '';
  }

  function setEnv(vars: Record<string, string | undefined>) {
    for (const key of Object.keys(vars)) {
      if (vars[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = vars[key]!;
      }
    }
  }

  beforeEach(() => {
    cookieStore = '';

    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() {
        return cookieStore;
      },
      set(value: string) {
        cookieStore = value;
      },
    });

    resetCookies();
    vi.clearAllMocks();
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'test',
      NEXT_PUBLIC_USE_NGROK: undefined,
    });
  });

  describe('readSessionIdleCookie', () => {
    it('returns null when document is undefined (SSR)', () => {
      const currentDocument = globalThis.document;
      // @ts-expect-error forcing document to be undefined to simulate SSR
      delete globalThis.document;

      const result = readSessionIdleCookie();

      expect(result).toBeNull();

      globalThis.document = currentDocument;
    });

    it('returns null when cookie is not present', () => {
      resetCookies();
      expect(document.cookie).not.toContain(COOKIE_NAME);

      const result = readSessionIdleCookie();

      expect(result).toBeNull();
    });

    it('returns parsed meta when cookie is valid', () => {
      const meta: SessionIdleMeta = {
        last_activity_at: 1234567890,
        idle_timeout_minutes: 30,
        expires_at: '2025-01-01T00:00:00.000Z',
      };

      const value = encodeURIComponent(JSON.stringify(meta));
      document.cookie = `${COOKIE_NAME}=${value}; path=/`;

      const result = readSessionIdleCookie();

      expect(result).toEqual(meta);
    });

    it('returns null when cookie value is invalid JSON', () => {
      document.cookie = `${COOKIE_NAME}=not-json; path=/`;

      const result = readSessionIdleCookie();

      expect(result).toBeNull();
    });

    it('returns null when cookie value does not have the expected types', () => {
      const meta = {
        last_activity_at: 'not-a-number',
        idle_timeout_minutes: '30',
        expires_at: 123,
      };

      const value = encodeURIComponent(JSON.stringify(meta));
      document.cookie = `${COOKIE_NAME}=${value}; path=/`;

      const result = readSessionIdleCookie();

      expect(result).toBeNull();
    });
  });

  describe('writeSessionIdleCookie', () => {
    it('does nothing when document is undefined', () => {
      const currentDocument = globalThis.document;
      // @ts-expect-error force document to be undefined
      delete globalThis.document;

      const meta: SessionIdleMeta = {
        last_activity_at: 1,
        idle_timeout_minutes: 10,
        expires_at: Date.now() + 1000,
      };

      expect(() => writeSessionIdleCookie(meta)).not.toThrow();

      globalThis.document = currentDocument;
    });

    it('writes a cookie with the correct name and serialized value', () => {
      const meta: SessionIdleMeta = {
        last_activity_at: 111,
        idle_timeout_minutes: 15,
        expires_at: '2025-01-01T00:00:00.000Z',
      };

      writeSessionIdleCookie(meta);

      expect(document.cookie).toContain(`${COOKIE_NAME}=`);
      expect(document.cookie).toContain('path=/');
      expect(document.cookie).toContain('SameSite=Lax');

      const encodedPart = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${COOKIE_NAME}=`))!
        .substring(COOKIE_NAME.length + 1);

      const decoded = JSON.parse(decodeURIComponent(encodedPart));
      expect(decoded).toEqual(meta);
    });

    it('adds domain in staging/production environments', () => {
      setEnv({
        NEXT_PUBLIC_ENVIRONMENT: 'staging',
      });

      const meta: SessionIdleMeta = {
        last_activity_at: 222,
        idle_timeout_minutes: 20,
        expires_at: Date.now() + 5000,
      };

      writeSessionIdleCookie(meta);

      expect(document.cookie).toContain('domain=mobix.fyi');
    });

    it('does not set domain in test environment', () => {
      setEnv({
        NEXT_PUBLIC_ENVIRONMENT: 'test',
      });

      const meta: SessionIdleMeta = {
        last_activity_at: 333,
        idle_timeout_minutes: 25,
        expires_at: Date.now() + 5000,
      };

      writeSessionIdleCookie(meta);

      expect(document.cookie).not.toContain('domain=');
    });

    it('sets domain for development when NEXT_PUBLIC_USE_NGROK=true', () => {
      setEnv({
        NEXT_PUBLIC_ENVIRONMENT: 'development',
        NEXT_PUBLIC_USE_NGROK: 'true',
      });

      const meta: SessionIdleMeta = {
        last_activity_at: 444,
        idle_timeout_minutes: 30,
        expires_at: Date.now() + 5000,
      };

      writeSessionIdleCookie(meta);

      expect(document.cookie).toContain('domain=mobix.fyi');
    });
  });

  describe('updateLastActivityInCookie', () => {
    it('does nothing when cookie does not exist', () => {
      resetCookies();
      expect(document.cookie).not.toContain(COOKIE_NAME);

      updateLastActivityInCookie(999999);

      expect(document.cookie).not.toContain(COOKIE_NAME);
    });

    it('updates last_activity_at while preserving the rest of the meta', () => {
      const originalMeta: SessionIdleMeta = {
        last_activity_at: 100,
        idle_timeout_minutes: 15,
        expires_at: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeURIComponent(JSON.stringify(originalMeta));
      document.cookie = `${COOKIE_NAME}=${encoded}; path=/`;

      const newLastActivity = 999999;

      updateLastActivityInCookie(newLastActivity);

      const result = readSessionIdleCookie();
      expect(result).not.toBeNull();
      expect(result!.last_activity_at).toBe(newLastActivity);
      expect(result!.idle_timeout_minutes).toBe(
        originalMeta.idle_timeout_minutes,
      );
      expect(result!.expires_at).toBe(originalMeta.expires_at);
    });
  });

  describe('clearSessionIdleCookie', () => {
    it('writes a cookie with empty value and past expiration', () => {
      document.cookie = `${COOKIE_NAME}=somevalue; path=/`;

      clearSessionIdleCookie();

      expect(document.cookie).toContain(`${COOKIE_NAME}=`);
      expect(document.cookie).toContain(
        'expires=Thu, 01 Jan 1970 00:00:00 GMT',
      );
      expect(document.cookie).toContain('SameSite=Lax');
    });

    it('includes domain when getCookieDomain resolves a host', () => {
      setEnv({
        NEXT_PUBLIC_ENVIRONMENT: 'staging',
      });

      clearSessionIdleCookie();

      expect(document.cookie).toContain('domain=mobix.fyi');
    });
  });
});
