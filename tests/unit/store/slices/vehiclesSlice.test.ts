import { describe, it, expect, beforeEach, vi } from 'vitest';
import vehiclesReducer, {
  fetchVehicles,
  clearVehicles,
  invalidateVehiclesCache,
  selectVehicles,
  selectVehiclesStatus,
  selectVehiclesError,
  selectVehiclesPagination,
  shouldFetchVehicles,
  type VehiclesState,
  type TenantVehiclesState,
} from '@/store/slices/vehiclesSlice';
import type { RootState } from '@/store/store';
import type { Vehicle } from '@/types/vehicles/api';
import type { PaginationMeta } from '@/hooks/usePaginatedIndex';

function buildRootState(partial: Partial<RootState>): RootState {
  return {
    ...(partial as RootState),
  };
}

function buildVehiclesState(partial: Partial<VehiclesState>): VehiclesState {
  return {
    byTenant: {},
    ...partial,
  };
}

function buildTenantState(partial: Partial<TenantVehiclesState> = {}): TenantVehiclesState {
  return {
    items: [],
    status: 'idle',
    error: null,
    lastFetchedAt: null,
    pagination: null,
    lastPage: null,
    lastPageSize: null,
    ...partial,
  };
}

describe('vehiclesSlice reducer', () => {
  let initialState: VehiclesState;

  beforeEach(() => {
    initialState = {
      byTenant: {},
    };
  });

  it('returns initial state when called with undefined state', () => {
    const state = vehiclesReducer(undefined, { type: '@@INIT' });
    expect(state.byTenant).toEqual({});
  });

  it('clearVehicles clears all tenants when payload is undefined', () => {
    const state: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({ items: [{} as Vehicle] }),
        'tenant-b': buildTenantState({ items: [{} as Vehicle] }),
      },
    };

    const nextState = vehiclesReducer(state, clearVehicles(undefined));

    expect(nextState.byTenant).toEqual({});
  });

  it('clearVehicles clears only the specified tenant', () => {
    const state: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({ items: [{} as Vehicle] }),
        'tenant-b': buildTenantState({ items: [{} as Vehicle] }),
      },
    };

    const nextState = vehiclesReducer(state, clearVehicles('tenant-a'));

    expect(Object.keys(nextState.byTenant)).toEqual(['tenant-b']);
    expect(nextState.byTenant['tenant-b'].items).toHaveLength(1);
  });

  it('invalidateVehiclesCache resets lastFetchedAt for all tenants when payload is undefined', () => {
    const state: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({ lastFetchedAt: new Date().toISOString() }),
        'tenant-b': buildTenantState({ lastFetchedAt: new Date().toISOString() }),
      },
    };

    const nextState = vehiclesReducer(state, invalidateVehiclesCache(undefined));

    expect(nextState.byTenant['tenant-a'].lastFetchedAt).toBeNull();
    expect(nextState.byTenant['tenant-b'].lastFetchedAt).toBeNull();
  });

  it('invalidateVehiclesCache resets lastFetchedAt only for specified tenant', () => {
    const now = new Date().toISOString();
    const state: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({ lastFetchedAt: now }),
        'tenant-b': buildTenantState({ lastFetchedAt: now }),
      },
    };

    const nextState = vehiclesReducer(state, invalidateVehiclesCache('tenant-a'));

    expect(nextState.byTenant['tenant-a'].lastFetchedAt).toBeNull();
    expect(nextState.byTenant['tenant-b'].lastFetchedAt).toBe(now);
  });

  it('handles fetchVehicles.pending by initializing tenant state and setting loading', () => {
    const action = fetchVehicles.pending('req-1', { tenantSlug: 'tenant-a' });

    const nextState = vehiclesReducer(initialState, action);

    expect(nextState.byTenant['tenant-a']).toBeDefined();
    expect(nextState.byTenant['tenant-a'].status).toBe('loading');
    expect(nextState.byTenant['tenant-a'].error).toBeNull();
  });

  it('handles fetchVehicles.pending by clearing previous error', () => {
    const state: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          status: 'failed',
          error: 'Previous error',
        }),
      },
    };

    const action = fetchVehicles.pending('req-2', { tenantSlug: 'tenant-a' });

    const nextState = vehiclesReducer(state, action);

    expect(nextState.byTenant['tenant-a'].status).toBe('loading');
    expect(nextState.byTenant['tenant-a'].error).toBeNull();
  });

  it('handles fetchVehicles.fulfilled and stores items, pagination and timestamps', () => {
    const state: VehiclesState = {
      byTenant: {},
    };

    const items: Vehicle[] = [
      { id: 1 } as unknown as Vehicle,
      { id: 2 } as unknown as Vehicle,
    ];

    const pagination: PaginationMeta = {
      page: 2,
      per_page: 25,
      count: 50,
      pages: 2,
      prev: 1,
      next: null,
    };

    const action = fetchVehicles.fulfilled(
      { items, pagination },
      'req-3',
      { tenantSlug: 'tenant-a', params: { page: { number: 2, size: 25 } } },
    );

    const before = Date.now();
    const nextState = vehiclesReducer(state, action);
    const after = Date.now();

    const tenantState = nextState.byTenant['tenant-a'];

    expect(tenantState.status).toBe('succeeded');
    expect(tenantState.items).toEqual(items);
    expect(tenantState.pagination).toEqual(pagination);
    expect(tenantState.lastPage).toBe(2);
    expect(tenantState.lastPageSize).toBe(25);
    expect(tenantState.lastFetchedAt).not.toBeNull();

    const timestamp = new Date(tenantState.lastFetchedAt as string).getTime();
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it('uses pagination page and per_page when params are not provided in fulfilled', () => {
    const initial: VehiclesState = {
      byTenant: {
        'tenant-b': buildTenantState({
          lastPage: 5,
          lastPageSize: 50,
        }),
      },
    };

    const pagination: PaginationMeta = {
      page: 3,
      per_page: 15,
      count: 45,
      pages: 3,
      prev: 2,
      next: null,
    };

    const action = fetchVehicles.fulfilled(
      { items: [], pagination },
      'req-4',
      { tenantSlug: 'tenant-b' },
    );

    const nextState = vehiclesReducer(initial, action);
    const tenantState = nextState.byTenant['tenant-b'];

    expect(tenantState.lastPage).toBe(3);
    expect(tenantState.lastPageSize).toBe(15);
  });

  it('falls back to defaults when neither params nor pagination provide page or per_page', () => {
    const initial: VehiclesState = {
      byTenant: {
        'tenant-c': buildTenantState({
          lastPage: null,
          lastPageSize: null,
        }),
      },
    };

    const action = fetchVehicles.fulfilled(
      { items: [], pagination: null },
      'req-5',
      { tenantSlug: 'tenant-c' },
    );

    const nextState = vehiclesReducer(initial, action);
    const tenantState = nextState.byTenant['tenant-c'];

    expect(tenantState.lastPage).toBe(1);
    expect(tenantState.lastPageSize).toBe(10);
  });

  it('handles fetchVehicles.rejected with payload and sets error state', () => {
    const state: VehiclesState = {
      byTenant: {},
    };

    const errorPayload = { message: 'Request failed', status: 500 };

    const action = fetchVehicles.rejected(
      new Error('Network error'),
      'req-6',
      { tenantSlug: 'tenant-a' },
      errorPayload,
    );

    const nextState = vehiclesReducer(state, action);
    const tenantState = nextState.byTenant['tenant-a'];

    expect(tenantState.status).toBe('failed');
    expect(tenantState.error).toBe('Request failed');
  });

  it('ignores fetchVehicles.rejected when payload is undefined', () => {
    const state: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          status: 'succeeded',
          error: null,
        }),
      },
    };

    const action = fetchVehicles.rejected(
      new Error('Network error'),
      'req-7',
      { tenantSlug: 'tenant-a' },
    );

    const nextState = vehiclesReducer(state, action);

    expect(nextState.byTenant['tenant-a'].status).toBe('succeeded');
    expect(nextState.byTenant['tenant-a'].error).toBeNull();
  });
});

describe('shouldFetchVehicles (cache and TTL)', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('returns true when tenantSlug is missing', () => {
    const state = buildRootState(
      buildVehiclesState({
        byTenant: {},
      }) as unknown as RootState,
    );

    const result = shouldFetchVehicles(
      { tenantSlug: '' as string, params: undefined },
      state,
    );

    expect(result).toBe(true);
  });

  it('returns true when tenant state does not exist', () => {
    const vehiclesState: VehiclesState = {
      byTenant: {},
    };

    const state = buildRootState({
      vehicles: vehiclesState,
    } as RootState);

    const result = shouldFetchVehicles(
      { tenantSlug: 'tenant-missing', params: { page: { number: 1, size: 10 } } },
      state,
    );

    expect(result).toBe(true);
  });

  it('returns true when lastFetchedAt is null', () => {
    const vehiclesState: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          lastFetchedAt: null,
          lastPage: 1,
          lastPageSize: 10,
        }),
      },
    };

    const state = buildRootState({
      vehicles: vehiclesState,
    } as RootState);

    const result = shouldFetchVehicles(
      { tenantSlug: 'tenant-a', params: { page: { number: 1, size: 10 } } },
      state,
    );

    expect(result).toBe(true);
  });

  it('returns true when requested page differs from cached page', () => {
    const vehiclesState: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          lastFetchedAt: new Date().toISOString(),
          lastPage: 1,
          lastPageSize: 10,
        }),
      },
    };

    const state = buildRootState({
      vehicles: vehiclesState,
    } as RootState);

    const result = shouldFetchVehicles(
      { tenantSlug: 'tenant-a', params: { page: { number: 2, size: 10 } } },
      state,
    );

    expect(result).toBe(true);
  });

  it('returns true when requested size differs from cached size', () => {
    const vehiclesState: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          lastFetchedAt: new Date().toISOString(),
          lastPage: 1,
          lastPageSize: 10,
        }),
      },
    };

    const state = buildRootState({
      vehicles: vehiclesState,
    } as RootState);

    const result = shouldFetchVehicles(
      { tenantSlug: 'tenant-a', params: { page: { number: 1, size: 20 } } },
      state,
    );

    expect(result).toBe(true);
  });

  it('returns false when page and size match and TTL has not expired', () => {
    const recent = new Date(Date.now() - 5_000).toISOString();

    const vehiclesState: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          lastFetchedAt: recent,
          lastPage: 1,
          lastPageSize: 10,
        }),
      },
    };

    const state = buildRootState({
      vehicles: vehiclesState,
    } as RootState);

    const result = shouldFetchVehicles(
      { tenantSlug: 'tenant-a', params: { page: { number: 1, size: 10 } } },
      state,
    );

    expect(result).toBe(false);
  });

  it('returns true when TTL has expired for matching page and size', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const vehiclesState: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          lastFetchedAt: twoHoursAgo,
          lastPage: 1,
          lastPageSize: 10,
        }),
      },
    };

    const state = buildRootState({
      vehicles: vehiclesState,
    } as RootState);

    const result = shouldFetchVehicles(
      { tenantSlug: 'tenant-a', params: { page: { number: 1, size: 10 } } },
      state,
    );

    expect(result).toBe(true);
  });

  it('returns true when lastFetchedAt cannot be parsed as a valid date', () => {
    const vehiclesState: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          lastFetchedAt: 'invalid-date',
          lastPage: 1,
          lastPageSize: 10,
        }),
      },
    };

    const state = buildRootState({
      vehicles: vehiclesState,
    } as RootState);

    const result = shouldFetchVehicles(
      { tenantSlug: 'tenant-a', params: { page: { number: 1, size: 10 } } },
      state,
    );

    expect(result).toBe(true);
  });
});

describe('vehiclesSlice selectors', () => {
  it('selectVehicles returns items for tenant or empty array by default', () => {
    const tenants: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({
          items: [
            { id: 1 } as unknown as Vehicle,
            { id: 2 } as unknown as Vehicle,
          ],
        }),
      },
    };

    const state = buildRootState({
      vehicles: tenants,
    } as RootState);

    const itemsA = selectVehicles(state, 'tenant-a');
    const itemsB = selectVehicles(state, 'tenant-b');

    expect(itemsA).toHaveLength(2);
    expect(itemsB).toEqual([]);
  });

  it('selectVehiclesStatus returns status for tenant or idle by default', () => {
    const tenants: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({ status: 'succeeded' }),
      },
    };

    const state = buildRootState({
      vehicles: tenants,
    } as RootState);

    expect(selectVehiclesStatus(state, 'tenant-a')).toBe('succeeded');
    expect(selectVehiclesStatus(state, 'tenant-b')).toBe('idle');
  });

  it('selectVehiclesError returns error message for tenant or null by default', () => {
    const tenants: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({ error: 'Something went wrong' }),
      },
    };

    const state = buildRootState({
      vehicles: tenants,
    } as RootState);

    expect(selectVehiclesError(state, 'tenant-a')).toBe('Something went wrong');
    expect(selectVehiclesError(state, 'tenant-b')).toBeNull();
  });

  it('selectVehiclesPagination returns pagination for tenant or null by default', () => {
    const pagination: PaginationMeta = {
      page: 1,
      per_page: 10,
      count: 100,
      pages: 10,
      prev: null,
      next: 2,
    };

    const tenants: VehiclesState = {
      byTenant: {
        'tenant-a': buildTenantState({ pagination }),
      },
    };

    const state = buildRootState({
      vehicles: tenants,
    } as RootState);

    expect(selectVehiclesPagination(state, 'tenant-a')).toEqual(pagination);
    expect(selectVehiclesPagination(state, 'tenant-b')).toBeNull();
  });
});
