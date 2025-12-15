import { describe, it, expect } from 'vitest';
import { shouldFetchVehiclesStats } from '@/store/slices/vehiclesStatsSlice';
import type { RootState } from '@/store/store';

type VehiclesStatsTenantState = {
  data: unknown;
  meta: unknown;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: unknown;
  lastFetchedAt: string | null;
};

type VehiclesStatsSliceState = {
  byTenant: Record<string, VehiclesStatsTenantState>;
};

type MinimalRootState = {
  vehiclesStats: VehiclesStatsSliceState;
};

const buildRootState = (state: MinimalRootState): RootState => state as unknown as RootState;

describe('shouldFetchVehiclesStats', () => {
  it('returns true when tenant state does not exist', () => {
    const state = buildRootState({ vehiclesStats: { byTenant: {} } });
    expect(shouldFetchVehiclesStats({ tenantSlug: 'tenant-a' }, state)).toBe(true);
  });

  it('returns false when tenant request is already loading and force is false', () => {
    const state = buildRootState({
      vehiclesStats: {
        byTenant: {
          'tenant-a': {
            data: null,
            meta: null,
            status: 'loading',
            error: null,
            lastFetchedAt: null,
          },
        },
      },
    });

    expect(shouldFetchVehiclesStats({ tenantSlug: 'tenant-a' }, state)).toBe(false);
  });

  it('returns true when force is true even if lastFetchedAt exists', () => {
    const state = buildRootState({
      vehiclesStats: {
        byTenant: {
          'tenant-a': {
            data: null,
            meta: null,
            status: 'succeeded',
            error: null,
            lastFetchedAt: '2026-01-01T00:00:00.000Z',
          },
        },
      },
    });

    expect(shouldFetchVehiclesStats({ tenantSlug: 'tenant-a', force: true }, state)).toBe(true);
  });

  it('returns true when lastFetchedAt is null and not loading', () => {
    const state = buildRootState({
      vehiclesStats: {
        byTenant: {
          'tenant-a': {
            data: null,
            meta: null,
            status: 'failed',
            error: null,
            lastFetchedAt: null,
          },
        },
      },
    });

    expect(shouldFetchVehiclesStats({ tenantSlug: 'tenant-a' }, state)).toBe(true);
  });
});
