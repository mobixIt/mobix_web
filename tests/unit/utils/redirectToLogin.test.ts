import { describe, it, expect } from 'vitest';

import { getBaseHost } from '@/utils/redirectToLogin';

describe('getBaseHost', () => {
  it('dev: sobusa.localhost → localhost with port', () => {
    const result = getBaseHost('sobusa.localhost');
    expect(result).toEqual({ host: 'localhost', usePort: true });
  });

  it('dev: plain localhost → localhost with port', () => {
    const result = getBaseHost('localhost');
    expect(result).toEqual({ host: 'localhost', usePort: true });
  });

  it('local multi-tenant: sobusa.local.mobix.fyi → www.local.mobix.fyi without port', () => {
    const result = getBaseHost('sobusa.local.mobix.fyi');
    expect(result).toEqual({ host: 'www.local.mobix.fyi', usePort: false });
  });

  it('local multi-tenant: www.local.mobix.fyi → unchanged without port', () => {
    const result = getBaseHost('www.local.mobix.fyi');
    expect(result).toEqual({ host: 'www.local.mobix.fyi', usePort: false });
  });

  it('staging: sobusa.mobix.fyi → www.mobix.fyi without port', () => {
    const result = getBaseHost('sobusa.mobix.fyi');
    expect(result).toEqual({ host: 'www.mobix.fyi', usePort: false });
  });

  it('staging: www.mobix.fyi → unchanged without port', () => {
    const result = getBaseHost('www.mobix.fyi');
    expect(result).toEqual({ host: 'www.mobix.fyi', usePort: false });
  });

  it('prod: sobusa.mobix.lat → www.mobix.lat without port', () => {
    const result = getBaseHost('sobusa.mobix.lat');
    expect(result).toEqual({ host: 'www.mobix.lat', usePort: false });
  });

  it('prod: www.mobix.lat → unchanged without port', () => {
    const result = getBaseHost('www.mobix.lat');
    expect(result).toEqual({ host: 'www.mobix.lat', usePort: false });
  });
});
