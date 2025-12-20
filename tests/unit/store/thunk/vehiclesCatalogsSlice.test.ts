import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import reducer, {
  fetchVehiclesCatalogs,
  type VehiclesCatalogsState,
} from '@/store/slices/vehiclesCatalogsSlice';
import { resolveCatalogs } from '@/services/catalogsService';
import { normalizeApiError } from '@/errors/normalizeApiError';

vi.mock('@/services/catalogsService', () => ({
  resolveCatalogs: vi.fn(),
}));

vi.mock('@/errors/normalizeApiError', () => ({
  normalizeApiError: vi.fn(),
}));

const mockedResolveCatalogs = vi.mocked(resolveCatalogs);
const mockedNormalizeApiError = vi.mocked(normalizeApiError);

function makeStore() {
  return configureStore({
    reducer: {
      vehiclesCatalogs: reducer,
    },
  });
}

type TestRootState = {
  vehiclesCatalogs: VehiclesCatalogsState;
};

describe('fetchVehiclesCatalogs thunk', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('writes loading state on pending and writes payload on fulfilled with lastFetchedAt', async () => {
    mockedResolveCatalogs.mockResolvedValue({
      data: {
        brands: [{ id: 10, label: 'Chevrolet', code: 'CHEV' }],
        vehicle_classes: [],
        body_types: [],
        owners: [{ id: 201, label: 'Ana Rodríguez', code: 'ANA' }],
        drivers: [{ id: 301, label: 'Juan Conductor', code: 'JC' }],
      },
    });

    const store = makeStore();

    const promise = store.dispatch(
      fetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }) as unknown as UnknownAction
    );

    const pendingState = (store.getState() as TestRootState).vehiclesCatalogs.byTenant.coolitoral;
    expect(pendingState).toBeDefined();
    expect(pendingState.status).toBe('loading');
    expect(pendingState.error).toBeNull();

    await promise;

    const finalState = (store.getState() as TestRootState).vehiclesCatalogs.byTenant.coolitoral;
    expect(finalState.status).toBe('succeeded');
    expect(finalState.error).toBeNull();
    expect(finalState.lastFetchedAt).toBe('2025-01-01T00:00:00.000Z');
    
    expect(finalState.data?.brands).toHaveLength(1);
    expect(finalState.data?.owners).toHaveLength(1);

    expect(mockedResolveCatalogs).toHaveBeenCalledTimes(1);
    expect(mockedResolveCatalogs).toHaveBeenCalledWith('coolitoral', [
      'brands',
      'vehicle_classes',
      'body_types',
      'owners',
      'drivers',
    ]);
  });

  it('writes failed state and normalized error when resolveCatalogs throws', async () => {
    mockedResolveCatalogs.mockRejectedValue(new Error('boom'));
    
    mockedNormalizeApiError.mockReturnValue({
      message: 'Failed to load vehicles catalogs',
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
    });

    const store = makeStore();
    
    await store.dispatch(
      fetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }) as unknown as UnknownAction
    );

    const tenantState = (store.getState() as TestRootState).vehiclesCatalogs.byTenant.coolitoral;
    expect(tenantState.status).toBe('failed');
    expect(tenantState.data).toBeNull();
    
    expect(tenantState.error).toEqual({ 
      message: 'Failed to load vehicles catalogs', 
      status: 503 
    });

    expect(mockedNormalizeApiError).toHaveBeenCalledTimes(1);
  });

  it('does not call resolveCatalogs again when tenant already has data and force is not set', async () => {
    mockedResolveCatalogs.mockResolvedValue({
      data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] },
    });

    const store = makeStore();

    await store.dispatch(
      fetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }) as unknown as UnknownAction
    );
    
    const callsAfterFirst = mockedResolveCatalogs.mock.calls.length;

    await store.dispatch(
      fetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }) as unknown as UnknownAction
    );

    const callsAfterSecond = mockedResolveCatalogs.mock.calls.length;

    expect(callsAfterFirst).toBe(1);
    expect(callsAfterSecond).toBe(1);
  });

  it('calls resolveCatalogs again when force is true even if data already exists', async () => {
    mockedResolveCatalogs.mockResolvedValue({
      data: { brands: [], vehicle_classes: [], body_types: [], owners: [], drivers: [] },
    });

    const store = makeStore();

    await store.dispatch(
      fetchVehiclesCatalogs({ tenantSlug: 'coolitoral' }) as unknown as UnknownAction
    );
    await store.dispatch(
      fetchVehiclesCatalogs({ tenantSlug: 'coolitoral', force: true }) as unknown as UnknownAction
    );

    expect(mockedResolveCatalogs).toHaveBeenCalledTimes(2);
  });
});
