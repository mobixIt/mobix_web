import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import type { ThunkDispatch } from 'redux-thunk';

import vehiclesStatsReducer, { fetchVehiclesStats } from '@/store/slices/vehiclesStatsSlice';
import type { RootState } from '@/store/store';
import type { VehiclesStatsResponse } from '@/services/vehiclesStatsService';

vi.mock('@/services/vehiclesStatsService', async () => {
  return {
    fetchVehiclesStatsFromApi: vi.fn(),
  };
});

import { fetchVehiclesStatsFromApi } from '@/services/vehiclesStatsService';

describe('vehicles stats thunk integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('stores data and meta and sets status succeeded when api resolves', async () => {
    const apiResponse: VehiclesStatsResponse = {
      data: {
        total: 10,
        active: 7,
        inactive: 3,
        new_this_month: 2,
        total_prev_month: 8,
        delta_total_vs_prev_month: 2,
        delta_total_pct_vs_prev_month: 25.0,
        active_pct_of_total: 70.0,
        inactive_pct_of_total: 30.0,
        new_prev_month: 1,
        delta_new_vs_prev_month: 1,
      },
      meta: {
        as_of: '2026-01-31T23:59:59-05:00',
        timezone: 'America/Bogota',
        computed_at: '2026-02-01T00:00:00-05:00',
        warnings: [],
      },
    };

    vi.mocked(fetchVehiclesStatsFromApi).mockResolvedValue(apiResponse);

    const store = configureStore({
      reducer: { vehiclesStats: vehiclesStatsReducer },
    });

    const dispatch = store.dispatch as unknown as ThunkDispatch<RootState, unknown, UnknownAction>;

    await dispatch(fetchVehiclesStats({ tenantSlug: 'tenant-a' }));

    const tenantState = store.getState().vehiclesStats.byTenant['tenant-a'];

    expect(tenantState.status).toBe('succeeded');
    expect(tenantState.data?.total).toBe(10);
    expect(tenantState.meta?.timezone).toBe('America/Bogota');
    expect(tenantState.lastFetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('stores failed status and normalized error when api rejects', async () => {
    const error = new Error('network down');

    vi.mocked(fetchVehiclesStatsFromApi).mockRejectedValue(error);

    const store = configureStore({
      reducer: { vehiclesStats: vehiclesStatsReducer },
    });

    const dispatch = store.dispatch as unknown as ThunkDispatch<RootState, unknown, UnknownAction>;

    await dispatch(fetchVehiclesStats({ tenantSlug: 'tenant-a' }));

    const tenantState = store.getState().vehiclesStats.byTenant['tenant-a'];

    expect(tenantState.status).toBe('failed');
    expect(tenantState.error?.message).toBeTruthy();
  });
});
