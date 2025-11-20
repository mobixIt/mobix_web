import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { buildTenantUrl } from '@/utils/tenantUrl';

function setEnv(vars: Record<string, string | undefined>) {
  for (const key of Object.keys(vars)) {
    const value = vars[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

const ORIGINAL_ENV = { ...process.env };

describe('buildTenantUrl', () => {
  const tenantSlug = 'coolitoral';

  beforeEach(() => {
    setEnv(ORIGINAL_ENV);
  });

  afterAll(() => {
    setEnv(ORIGINAL_ENV);
  });

  it('builds URL using default base domain when environment is not set', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: undefined,
      NEXT_PUBLIC_USE_NGROK: undefined,
    });

    const url = buildTenantUrl(tenantSlug);

    expect(url).toBe('http://coolitoral.localhost:4567');
  });

  it('builds URL for development without ngrok', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'development',
      NEXT_PUBLIC_USE_NGROK: 'false',
    });

    const url = buildTenantUrl(tenantSlug);

    expect(url).toBe('http://coolitoral.localhost:4567');
  });

  it('builds URL for development with ngrok enabled', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'development',
      NEXT_PUBLIC_USE_NGROK: 'true',
    });

    const url = buildTenantUrl(tenantSlug);

    expect(url).toBe('http://coolitoral.local.mobix.fyi');
  });

  it('builds URL for test environment', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'test',
    });

    const url = buildTenantUrl(tenantSlug);

    expect(url).toBe('http://coolitoral.localhost:4567');
  });

  it('builds URL for staging environment', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'staging',
    });

    const url = buildTenantUrl(tenantSlug);

    expect(url).toBe('http://coolitoral.mobix.fyi');
  });

  it('builds URL for production environment', () => {
    setEnv({
      NEXT_PUBLIC_ENVIRONMENT: 'production',
    });

    const url = buildTenantUrl(tenantSlug);

    expect(url).toBe('http://coolitoral.mobix.lat');
  });
});