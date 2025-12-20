import { describe, it, expect } from 'vitest';
import { shouldFetchVehiclesCatalogs } from '@/store/slices/vehiclesCatalogsSlice';
import type { RootState } from '@/store/store';

function stateForTenant(input: Partial<RootState['vehiclesCatalogs']['byTenant'][string]>): RootState {
  return {
    vehiclesCatalogs: {
      byTenant: {
        coolitoral: {
          data: null,
          status: 'idle',
          error: null,
          lastFetchedAt: null,
          ...input,
        },
      },
    },
  } as unknown as RootState;
}

describe('shouldFetchVehiclesCatalogs', () => {
  it('returns true when tenantSlug is empty', () => {
    const state = stateForTenant({});
    expect(shouldFetchVehiclesCatalogs({ tenantSlug: '' }, state)).toBe(true);
  });

  it('returns true when tenant state does not exist yet', () => {
    const state = { vehiclesCatalogs: { byTenant: {} } } as unknown as RootState;
    expect(shouldFetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }, state)).toBe(true);
  });

  it('returns true when force is true', () => {
    const state = stateForTenant({ data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] }, status: 'succeeded' });
    expect(shouldFetchVehiclesCatalogs({ tenantSlug: 'coolitoral', force: true }, state)).toBe(true);
  });

  it('returns false when tenant status is loading', () => {
    const state = stateForTenant({ status: 'loading', data: null });
    expect(shouldFetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }, state)).toBe(false);
  });

  it('returns true when tenant data is null and not loading', () => {
    const state = stateForTenant({ status: 'idle', data: null });
    expect(shouldFetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }, state)).toBe(true);
  });

  it('returns false when tenant data is already present and not forced', () => {
    const state = stateForTenant({
      status: 'succeeded',
      data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] },
    });
    expect(shouldFetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }, state)).toBe(false);
  });
});
