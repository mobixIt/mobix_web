import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shouldFetchVehicles } from '@/store/slices/vehiclesSlice';
import type { RootState } from '@/store/store';

function makeState(input?: Partial<RootState['vehicles']['byTenant'][string]>): RootState {
  return {
    vehicles: {
      byTenant: {
        coolitoral: {
          items: [],
          status: 'idle',
          error: null,
          lastFetchedAt: null,
          pagination: null,
          lastPage: null,
          lastPageSize: null,
          lastFiltersSig: null,
          ...(input ?? {}),
        },
      },
    },
  } as unknown as RootState;
}

describe('shouldFetchVehicles', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true when tenantSlug is empty', () => {
    const state = makeState();
    expect(shouldFetchVehicles({ tenantSlug: '' }, state)).toBe(true);
  });

  it('returns true when tenant state does not exist', () => {
    const state = { vehicles: { byTenant: {} } } as unknown as RootState;
    expect(shouldFetchVehicles({ tenantSlug: 'coolitoral' }, state)).toBe(true);
  });

  it('returns true when lastFetchedAt is missing', () => {
    const state = makeState({ lastFetchedAt: null, lastPage: 1, lastPageSize: 10, lastFiltersSig: '[]' });
    expect(shouldFetchVehicles({ tenantSlug: 'coolitoral', params: { page: { number: 1, size: 10 } } }, state)).toBe(true);
  });

  it('returns true when lastFetchedAt is invalid', () => {
    const state = makeState({ lastFetchedAt: 'not-a-date', lastPage: 1, lastPageSize: 10, lastFiltersSig: '[]' });
    expect(shouldFetchVehicles({ tenantSlug: 'coolitoral', params: { page: { number: 1, size: 10 } } }, state)).toBe(true);
  });

  it('returns true when requested page differs from cached page', () => {
    const state = makeState({ lastFetchedAt: '2025-01-01T00:00:00.000Z', lastPage: 1, lastPageSize: 10, lastFiltersSig: '[]' });
    expect(shouldFetchVehicles({ tenantSlug: 'coolitoral', params: { page: { number: 2, size: 10 } } }, state)).toBe(true);
  });

  it('returns true when requested size differs from cached size', () => {
    const state = makeState({ lastFetchedAt: '2025-01-01T00:00:00.000Z', lastPage: 1, lastPageSize: 10, lastFiltersSig: '[]' });
    expect(shouldFetchVehicles({ tenantSlug: 'coolitoral', params: { page: { number: 1, size: 25 } } }, state)).toBe(true);
  });

  it('returns true when filters signature differs from cached signature', () => {
    const cachedSig = JSON.stringify({ filters: JSON.stringify([['status', 'active']]), ai: '' });
    const state = makeState({ lastFetchedAt: '2025-01-01T00:00:00.000Z', lastPage: 1, lastPageSize: 10, lastFiltersSig: cachedSig });
    expect(shouldFetchVehicles({ tenantSlug: 'coolitoral', params: { page: { number: 1, size: 10 }, filters: { status: 'inactive' } } }, state)).toBe(true);
  });

  it('returns false when cache is still valid for same page, size and filters', () => {
    const cachedSig = JSON.stringify({ filters: JSON.stringify([['status', 'active']]), ai: '' });
    const state = makeState({
      lastFetchedAt: '2025-01-01T00:00:00.000Z',
      lastPage: 1,
      lastPageSize: 10,
      lastFiltersSig: cachedSig,
    });

    expect(
      shouldFetchVehicles({ tenantSlug: 'coolitoral', params: { page: { number: 1, size: 10 }, filters: { status: 'active' } } }, state),
    ).toBe(false);
  });

  it('returns true when cache TTL is expired', () => {    
    const state = makeState({
      lastFetchedAt: '2025-01-01T00:00:00.000Z',
      lastPage: 1,
      lastPageSize: 10,
      lastFiltersSig: '[]',
    });

    vi.setSystemTime(new Date('2025-01-01T01:00:01.000Z'));

    expect(shouldFetchVehicles({ tenantSlug: 'coolitoral', params: { page: { number: 1, size: 10 } } }, state)).toBe(true);
  });
});
