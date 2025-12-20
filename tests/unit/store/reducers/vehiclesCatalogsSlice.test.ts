import { describe, it, expect } from 'vitest';
import reducer, {
  clearVehiclesCatalogs,
  invalidateVehiclesCatalogsCache,
  type VehiclesCatalogsState
} from '@/store/slices/vehiclesCatalogsSlice';

describe('vehiclesCatalogsSlice reducers', () => {
  it('clears all tenants when clearVehiclesCatalogs receives undefined', () => {
    const prev = {
      byTenant: {
        coolitoral: { data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] }, status: 'succeeded', error: null, lastFetchedAt: 'x' },
        demo: { data: null, status: 'idle', error: null, lastFetchedAt: null },
      },
    };

    const next = reducer(prev as VehiclesCatalogsState, clearVehiclesCatalogs(undefined));
    expect(Object.keys(next.byTenant)).toHaveLength(0);
  });

  it('clears a single tenant when clearVehiclesCatalogs receives tenantSlug', () => {
    const prev = {
      byTenant: {
        coolitoral: { data: null, status: 'idle', error: null, lastFetchedAt: null },
        demo: { data: null, status: 'idle', error: null, lastFetchedAt: null },
      },
    };

    const next = reducer(prev as VehiclesCatalogsState, clearVehiclesCatalogs('coolitoral'));
    expect(next.byTenant.coolitoral).toBeUndefined();
    expect(next.byTenant.demo).toBeDefined();
  });

  it('invalidates all tenants when invalidateVehiclesCatalogsCache receives undefined', () => {
    const prev = {
      byTenant: {
        coolitoral: { data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] }, status: 'succeeded', error: { message: 'x', status: 500 }, lastFetchedAt: 'x' },
        demo: { data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] }, status: 'failed', error: { message: 'y' }, lastFetchedAt: 'y' },
      },
    };

    const next = reducer(prev as VehiclesCatalogsState, invalidateVehiclesCatalogsCache(undefined));

    expect(next.byTenant.coolitoral.data).toBeNull();
    expect(next.byTenant.coolitoral.status).toBe('idle');
    expect(next.byTenant.coolitoral.error).toBeNull();
    expect(next.byTenant.coolitoral.lastFetchedAt).toBeNull();

    expect(next.byTenant.demo.data).toBeNull();
    expect(next.byTenant.demo.status).toBe('idle');
    expect(next.byTenant.demo.error).toBeNull();
    expect(next.byTenant.demo.lastFetchedAt).toBeNull();
  });

  it('invalidates one tenant when invalidateVehiclesCatalogsCache receives tenantSlug', () => {
    const prev = {
      byTenant: {
        coolitoral: { data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] }, status: 'succeeded', error: null, lastFetchedAt: 'x' },
        demo: { data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] }, status: 'succeeded', error: null, lastFetchedAt: 'y' },
      },
    };

    const next = reducer(prev as VehiclesCatalogsState, invalidateVehiclesCatalogsCache('coolitoral'));

    expect(next.byTenant.coolitoral.data).toBeNull();
    expect(next.byTenant.coolitoral.status).toBe('idle');
    expect(next.byTenant.coolitoral.error).toBeNull();
    expect(next.byTenant.coolitoral.lastFetchedAt).toBeNull();

    expect(next.byTenant.demo.data).not.toBeNull();
    expect(next.byTenant.demo.status).toBe('succeeded');
    expect(next.byTenant.demo.lastFetchedAt).toBe('y');
  });
});
