import { describe, it, expect } from 'vitest';
import {
  selectVehicles,
  selectVehiclesStatus,
  selectVehiclesError,
  selectVehiclesPagination,
} from '@/store/slices/vehiclesSlice';
import type { RootState } from '@/store/store';

describe('vehiclesSlice selectors', () => {
  it('returns defaults when tenant is missing', () => {
    const state = { vehicles: { byTenant: {} } } as unknown as RootState;

    expect(selectVehicles(state, 'coolitoral')).toEqual([]);
    expect(selectVehiclesStatus(state, 'coolitoral')).toBe('idle');
    expect(selectVehiclesError(state, 'coolitoral')).toBeNull();
    expect(selectVehiclesPagination(state, 'coolitoral')).toBeNull();
  });

  it('returns tenant values when present', () => {
    const state = {
      vehicles: {
        byTenant: {
          coolitoral: {
            items: [{ id: 'v1' }],
            status: 'succeeded',
            error: 'x',
            lastFetchedAt: 't',
            pagination: { page: 1, per_page: 10, pages: 1, count: 0, prev: null, next: null },
            lastPage: 1,
            lastPageSize: 10,
            lastFiltersSig: '[]',
          },
        },
      },
    } as unknown as RootState;

    expect(selectVehicles(state, 'coolitoral')).toHaveLength(1);
    expect(selectVehiclesStatus(state, 'coolitoral')).toBe('succeeded');
    expect(selectVehiclesError(state, 'coolitoral')).toBe('x');
    expect(selectVehiclesPagination(state, 'coolitoral')?.page).toBe(1);
  });
});
