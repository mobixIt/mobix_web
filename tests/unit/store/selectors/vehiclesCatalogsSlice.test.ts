import { describe, it, expect } from 'vitest';
import {
  selectVehiclesCatalogsState,
  selectVehiclesCatalogsData,
  selectVehiclesCatalogsStatus,
  selectVehiclesCatalogsError,
} from '@/store/slices/vehiclesCatalogsSlice';
import type { RootState } from '@/store/store';

describe('vehiclesCatalogsSlice selectors', () => {
  it('returns default tenant state when tenant is missing', () => {
    const state = { vehiclesCatalogs: { byTenant: {} } } as unknown as RootState;

    const tenantState = selectVehiclesCatalogsState(state, 'coolitoral');
    expect(tenantState.status).toBe('idle');
    expect(tenantState.data).toBeNull();
    expect(tenantState.error).toBeNull();
    expect(tenantState.lastFetchedAt).toBeNull();
  });

  it('returns tenant data when present', () => {
    const state = {
      vehiclesCatalogs: {
        byTenant: {
          coolitoral: {
            data: { brands: [{ id: 1, label: 'X', code: null }], vehicle_classes: [], body_types: [], owners: [], drivers: [] },
            status: 'succeeded',
            error: null,
            lastFetchedAt: 't',
          },
        },
      },
    } as unknown as RootState;

    expect(selectVehiclesCatalogsData(state, 'coolitoral')?.brands).toHaveLength(1);
    expect(selectVehiclesCatalogsStatus(state, 'coolitoral')).toBe('succeeded');
    expect(selectVehiclesCatalogsError(state, 'coolitoral')).toBeNull();
  });
});
