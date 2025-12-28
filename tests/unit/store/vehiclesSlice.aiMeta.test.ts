import { describe, expect, it } from 'vitest';
import reducer, {
  clearVehicles,
  fetchVehicles,
  selectVehiclesAiMeta,
  type VehiclesState,
} from '@/store/slices/vehiclesSlice';
import type { Vehicle } from '@/types/vehicles/api';
import type { RootState } from '@/store/store';

const baseVehicle: Vehicle = {
  id: 1,
  plate: 'ABC123',
  model_year: 2024,
  engine_number: null,
  chassis_number: null,
  color: null,
  seated_capacity: null,
  standing_capacity: null,
  property_card: null,
  status: 'active',
  brand: null,
  vehicle_class: null,
  body_type: null,
};

const initialState: VehiclesState = { byTenant: {} };

describe('vehiclesSlice AI metadata', () => {
  it('sets aiActive and metadata on fulfilled', () => {
    const action = fetchVehicles.fulfilled(
      {
        items: [baseVehicle],
        pagination: null,
        aiActive: true,
        aiQuestion: 'buses',
        aiExplanation: 'explicacion',
        aiAppliedFilters: { brand: 'Hino' },
      },
      'request-1',
      { tenantSlug: 't1', params: { ai_question: 'buses' } },
    );

    const state = reducer(initialState, action);

    expect(state.byTenant.t1.aiActive).toBe(true);
    expect(state.byTenant.t1.aiQuestion).toBe('buses');
    expect(state.byTenant.t1.aiAppliedFilters).toEqual({ brand: 'Hino' });
    expect(state.byTenant.t1.status).toBe('succeeded');
  });

  it('clears AI metadata on rejected', () => {
    const rejected = fetchVehicles.rejected(
      new Error('fail'),
      'request-2',
      { tenantSlug: 't1' },
      { message: 'fail', code: 'X' },
    );

    const state = reducer(initialState, rejected);

    expect(state.byTenant.t1.aiActive).toBe(false);
    expect(state.byTenant.t1.aiQuestion).toBeNull();
    expect(state.byTenant.t1.aiAppliedFilters).toBeNull();
    expect(state.byTenant.t1.status).toBe('failed');
  });

  it('selectVehiclesAiMeta returns safe values without tenant', () => {
    const meta = selectVehiclesAiMeta({ vehicles: initialState } as RootState, 'unknown');

    expect(meta).toEqual({
      aiActive: false,
      aiQuestion: null,
      aiExplanation: null,
      aiAppliedFilters: null,
      errorCode: null,
    });
  });

  it('clearVehicles removes the tenant state', () => {
    const fulfilled = fetchVehicles.fulfilled(
      {
        items: [baseVehicle],
        pagination: null,
        aiActive: true,
        aiQuestion: 'buses',
        aiExplanation: null,
        aiAppliedFilters: { brand: 'Hino' },
      },
      'request-3',
      { tenantSlug: 't1', params: { ai_question: 'buses' } },
    );

    const populated = reducer(initialState, fulfilled);
    const cleared = reducer(populated, clearVehicles('t1'));

    expect(cleared.byTenant.t1).toBeUndefined();
  });
});
