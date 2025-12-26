import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import reducer, {
  fetchVehicles,
  type VehiclesState,
} from '@/store/slices/vehiclesSlice';
import { fetchVehiclesFromApi } from '@/services/vehiclesService';
import { normalizeApiError } from '@/errors/normalizeApiError';
import type { Vehicle } from '@/types/vehicles/api';

vi.mock('@/services/vehiclesService', () => ({
  fetchVehiclesFromApi: vi.fn(),
}));

vi.mock('@/errors/normalizeApiError', () => ({
  normalizeApiError: vi.fn(),
}));

const mockedFetchVehiclesFromApi = vi.mocked(fetchVehiclesFromApi);
const mockedNormalizeApiError = vi.mocked(normalizeApiError);

type TestRootState = {
  vehicles: VehiclesState;
};

function makeStore() {
  return configureStore<TestRootState>({
    reducer: {
      vehicles: reducer,
    },
  });
}

describe('fetchVehicles thunk', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('writes loading state on pending and writes items, pagination, lastPage, lastPageSize and lastFiltersSig on fulfilled', async () => {
    const mockVehicle1 = {
      id: 1,
      plate: 'V1',
      brand: { id: 100, label: 'B1' } as unknown as Vehicle['brand'],
      model_year: 2020,
      status: 'active',
    } as unknown as Vehicle;

    const mockVehicle2 = {
      id: 2,
      plate: 'V2',
      brand: null,
      model_year: 2021,
      status: 'inactive',
    } as unknown as Vehicle;

    mockedFetchVehiclesFromApi.mockResolvedValue({
      data: [mockVehicle1, mockVehicle2],
      meta: {
        pagination: { page: 1, per_page: 10, pages: 1, count: 2, prev: null, next: null },
      },
    });

    const store = makeStore();

    const p = store.dispatch(
      fetchVehicles({
        tenantSlug: 'coolitoral',
        params: { page: { number: 1, size: 10 }, filters: { status: 'active' } },
      }) as unknown as UnknownAction,
    );

    const pendingState = store.getState().vehicles.byTenant.coolitoral;
    expect(pendingState?.status).toBe('loading');
    expect(pendingState?.error).toBeNull();

    await p;

    const finalState = store.getState().vehicles.byTenant.coolitoral;

    expect(finalState?.status).toBe('succeeded');
    expect(finalState?.items).toHaveLength(2);
    expect(finalState?.items[0].plate).toBe('V1');
    expect(finalState?.pagination?.page).toBe(1);
    expect(finalState?.lastFetchedAt).toBe('2025-01-01T00:00:00.000Z');
    expect(finalState?.lastPage).toBe(1);
    expect(finalState?.lastPageSize).toBe(10);
    expect(finalState?.lastFiltersSig).toBe(JSON.stringify({
      filters: JSON.stringify([['status', 'active']]),
      ai: '',
    }));

    expect(mockedFetchVehiclesFromApi).toHaveBeenCalledTimes(1);
    expect(mockedFetchVehiclesFromApi).toHaveBeenCalledWith('coolitoral', {
      page: { number: 1, size: 10 },
      filters: { status: 'active' },
    });
  });

  it('writes failed status and error message when rejectWithValue is used', async () => {
    mockedFetchVehiclesFromApi.mockRejectedValue(new Error('boom'));
    
    mockedNormalizeApiError.mockReturnValue({
      message: 'Failed to load vehicles list',
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
    });

    const store = makeStore();
    
    await store.dispatch(
      fetchVehicles({
        tenantSlug: 'coolitoral',
        params: { page: { number: 1, size: 10 } },
      }) as unknown as UnknownAction,
    );

    const tenantState = store.getState().vehicles.byTenant.coolitoral;
    expect(tenantState?.status).toBe('failed');
    expect(tenantState?.error).toBe('Failed to load vehicles list');
  });

  it('does not call API again when cache is valid for same page, size and filters', async () => {
    mockedFetchVehiclesFromApi.mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, per_page: 10, pages: 1, count: 0, prev: null, next: null } },
    });

    const store = makeStore();

    await store.dispatch(
      fetchVehicles({
        tenantSlug: 'coolitoral',
        params: { page: { number: 1, size: 10 }, filters: { status: 'active' } },
      }) as unknown as UnknownAction,
    );

    await store.dispatch(
      fetchVehicles({
        tenantSlug: 'coolitoral',
        params: { page: { number: 1, size: 10 }, filters: { status: 'active' } },
      }) as unknown as UnknownAction,
    );

    expect(mockedFetchVehiclesFromApi).toHaveBeenCalledTimes(1);
  });

  it('calls API again when cache TTL has expired', async () => {
    mockedFetchVehiclesFromApi.mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, per_page: 10, pages: 1, count: 0, prev: null, next: null } },
    });

    const store = makeStore();

    await store.dispatch(
      fetchVehicles({
        tenantSlug: 'coolitoral',
        params: { page: { number: 1, size: 10 } },
      }) as unknown as UnknownAction,
    );

    vi.advanceTimersByTime(3601000);

    await store.dispatch(
      fetchVehicles({
        tenantSlug: 'coolitoral',
        params: { page: { number: 1, size: 10 } },
      }) as unknown as UnknownAction,
    );

    expect(mockedFetchVehiclesFromApi).toHaveBeenCalledTimes(2);
  });
});
