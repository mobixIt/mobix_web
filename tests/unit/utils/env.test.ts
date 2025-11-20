import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getBaseDomain } from '@/utils/env';

function setEnv(vars: Record<string, string | undefined>) {
  for (const key of Object.keys(vars)) {
    if (vars[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = vars[key]!;
    }
  }
}

describe('getBaseDomain', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    setEnv(originalEnv);
  });

  afterEach(() => {
    setEnv(originalEnv);
  });

  it('returns localhost:4567 by default', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: undefined,
      NEXT_PUBLIC_USE_NGROK: undefined,
    });

    expect(getBaseDomain()).toBe('localhost:4567');
  });

  it('returns localhost:4567 for environment=test', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'test',
    });

    expect(getBaseDomain()).toBe('localhost:4567');
  });

  it('returns mobix.fyi for environment=staging', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'staging',
    });

    expect(getBaseDomain()).toBe('mobix.fyi');
  });

  it('returns mobix.lat for environment=production', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'production',
    });

    expect(getBaseDomain()).toBe('mobix.lat');
  });

  describe('development environment', () => {
    it('returns local.mobix.fyi when NEXT_PUBLIC_USE_NGROK=true', () => {
      setEnv({
        NEXT_PUBLIC_ENVIRONMENT: 'development',
        NEXT_PUBLIC_USE_NGROK: 'true',
      });

      expect(getBaseDomain()).toBe('local.mobix.fyi');
    });

    it('returns localhost:4567 when NEXT_PUBLIC_USE_NGROK=false', () => {
      setEnv({
        NEXT_PUBLIC_ENVIRONMENT: 'development',
        NEXT_PUBLIC_USE_NGROK: 'false',
      });

      expect(getBaseDomain()).toBe('localhost:4567');
    });

    it('returns localhost:4567 when NEXT_PUBLIC_USE_NGROK is undefined', () => {
      setEnv({
        NEXT_PUBLIC_ENVIRONMENT: 'development',
        NEXT_PUBLIC_USE_NGROK: undefined,
      });

      expect(getBaseDomain()).toBe('localhost:4567');
    });
  });
});
