import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useVehiclesCatalogs } from '@/components/vehicles/actions/index/_shared/hooks/useVehiclesData';

type RootState = Record<string, unknown>;

type VehiclesCatalogsData = {
  owners?: unknown[];
  drivers?: unknown[];
  brands?: Array<{ id: number | string; label: string }>;
  vehicle_classes?: Array<{ id: number | string; label: string }>;
  body_types?: Array<{ id: number | string; label: string }>;
};

type ThunkArg = { tenantSlug: string; force?: boolean };
type MockAction = { type: string; payload: ThunkArg };

const dispatchMock = vi.fn<(action: MockAction) => unknown>();

const useAppDispatchMock = vi.fn(() => dispatchMock);
const useAppSelectorMock = vi.fn(
  <TSelected,>(selector: (state: RootState) => TSelected) => selector({}),
);

const fetchVehiclesCatalogsMock = vi.fn((payload: ThunkArg): MockAction => ({
  type: 'vehiclesCatalogs/fetchVehiclesCatalogs',
  payload,
}));

const selectVehiclesCatalogsStatusMock = vi.fn(() => 'idle');
const selectVehiclesCatalogsErrorMock = vi.fn(() => null);
const selectVehiclesCatalogsDataMock = vi.fn((): VehiclesCatalogsData | null => null);

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => useAppDispatchMock(),
  useAppSelector: <TSelected,>(selector: (state: RootState) => TSelected) =>
    useAppSelectorMock(selector),
}));

vi.mock('@/store/slices/vehiclesCatalogsSlice', () => ({
  fetchVehiclesCatalogs: (payload: ThunkArg) => fetchVehiclesCatalogsMock(payload),
  selectVehiclesCatalogsData: () => selectVehiclesCatalogsDataMock(),
  selectVehiclesCatalogsError: () => selectVehiclesCatalogsErrorMock(),
  selectVehiclesCatalogsStatus: () => selectVehiclesCatalogsStatusMock(),
}));

describe('useVehiclesCatalogs', () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    useAppDispatchMock.mockClear();
    useAppSelectorMock.mockClear();

    fetchVehiclesCatalogsMock.mockClear();
    selectVehiclesCatalogsStatusMock.mockClear();
    selectVehiclesCatalogsErrorMock.mockClear();
    selectVehiclesCatalogsDataMock.mockClear();

    selectVehiclesCatalogsStatusMock.mockReturnValue('idle');
    selectVehiclesCatalogsErrorMock.mockReturnValue(null);
    selectVehiclesCatalogsDataMock.mockReturnValue(null);
  });

  it('returns safe defaults and does not fetch when tenantSlug is null', () => {
    const { result } = renderHook(() => useVehiclesCatalogs(null));

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.hasCatalogs).toBe(false);

    expect(result.current.ownersRaw).toEqual([]);
    expect(result.current.driversRaw).toEqual([]);
    expect(result.current.brandOptions).toEqual([]);
    expect(result.current.vehicleClassOptions).toEqual([]);
    expect(result.current.bodyTypeOptions).toEqual([]);

    expect(selectVehiclesCatalogsStatusMock).toHaveBeenCalledTimes(0);
    expect(selectVehiclesCatalogsErrorMock).toHaveBeenCalledTimes(0);
    expect(selectVehiclesCatalogsDataMock).toHaveBeenCalledTimes(0);

    expect(fetchVehiclesCatalogsMock).toHaveBeenCalledTimes(0);
    expect(dispatchMock).toHaveBeenCalledTimes(0);
  });

  it('dispatches fetchVehiclesCatalogs once on mount when status is idle and tenantSlug is present', () => {
    const { result } = renderHook(() => useVehiclesCatalogs('coolitoral'));

    expect(result.current.status).toBe('idle');
    expect(fetchVehiclesCatalogsMock).toHaveBeenCalledTimes(1);
    expect(fetchVehiclesCatalogsMock).toHaveBeenCalledWith({ tenantSlug: 'coolitoral' });
    expect(dispatchMock).toHaveBeenCalledTimes(1);

    const dispatched = dispatchMock.mock.calls[0]?.[0];
    expect(dispatched).toEqual({
      type: 'vehiclesCatalogs/fetchVehiclesCatalogs',
      payload: { tenantSlug: 'coolitoral' },
    });
  });

  it('does not dispatch fetchVehiclesCatalogs when status is not idle', () => {
    selectVehiclesCatalogsStatusMock.mockReturnValue('loading');

    renderHook(() => useVehiclesCatalogs('coolitoral'));

    expect(fetchVehiclesCatalogsMock).toHaveBeenCalledTimes(0);
    expect(dispatchMock).toHaveBeenCalledTimes(0);
  });

  it('maps catalogs into string-valued options and exposes ownersRaw/driversRaw when data exists', () => {
    const owners = [{ id: 1 }];
    const drivers = [{ id: 2 }];
    const data: VehiclesCatalogsData = {
      owners,
      drivers,
      brands: [{ id: 10, label: 'Volvo' }],
      vehicle_classes: [{ id: 20, label: 'Bus' }],
      body_types: [{ id: 30, label: 'Urbano' }],
    };

    selectVehiclesCatalogsStatusMock.mockReturnValue('succeeded');
    selectVehiclesCatalogsDataMock.mockReturnValue(data);

    const { result } = renderHook(() => useVehiclesCatalogs('coolitoral'));

    expect(result.current.hasCatalogs).toBe(true);
    expect(result.current.ownersRaw).toBe(owners);
    expect(result.current.driversRaw).toBe(drivers);

    expect(result.current.brandOptions).toEqual([{ label: 'Volvo', value: '10' }]);
    expect(result.current.vehicleClassOptions).toEqual([{ label: 'Bus', value: '20' }]);
    expect(result.current.bodyTypeOptions).toEqual([{ label: 'Urbano', value: '30' }]);
  });

  it('keeps memoized references stable across rerenders when data array references do not change', () => {
    const owners = [{ id: 1 }];
    const drivers = [{ id: 2 }];
    const data: VehiclesCatalogsData = { owners, drivers };

    selectVehiclesCatalogsStatusMock.mockReturnValue('succeeded');
    selectVehiclesCatalogsDataMock.mockReturnValue(data);

    const { result, rerender } = renderHook(({ tenantSlug }) => useVehiclesCatalogs(tenantSlug), {
      initialProps: { tenantSlug: 'coolitoral' as string | null },
    });

    const ownersRef1 = result.current.ownersRaw;
    const driversRef1 = result.current.driversRaw;

    rerender({ tenantSlug: 'coolitoral' });

    expect(result.current.ownersRaw).toBe(ownersRef1);
    expect(result.current.driversRaw).toBe(driversRef1);
  });

  it('retry dispatches fetchVehiclesCatalogs with force=true when tenantSlug is present', () => {
    selectVehiclesCatalogsStatusMock.mockReturnValue('succeeded');

    const { result } = renderHook(() => useVehiclesCatalogs('coolitoral'));

    fetchVehiclesCatalogsMock.mockClear();
    dispatchMock.mockClear();

    act(() => {
      result.current.retry();
    });

    expect(fetchVehiclesCatalogsMock).toHaveBeenCalledTimes(1);
    expect(fetchVehiclesCatalogsMock).toHaveBeenCalledWith({ tenantSlug: 'coolitoral', force: true });
    expect(dispatchMock).toHaveBeenCalledTimes(1);

    const dispatched = dispatchMock.mock.calls[0]?.[0];
    expect(dispatched).toEqual({
      type: 'vehiclesCatalogs/fetchVehiclesCatalogs',
      payload: { tenantSlug: 'coolitoral', force: true },
    });
  });

  it('retry does nothing when tenantSlug is null', () => {
    const { result } = renderHook(() => useVehiclesCatalogs(null));

    act(() => {
      result.current.retry();
    });

    expect(fetchVehiclesCatalogsMock).toHaveBeenCalledTimes(0);
    expect(dispatchMock).toHaveBeenCalledTimes(0);
  });
});
