import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

import Vehicles from '@/components/vehicles';

import * as vehiclesSliceModule from '@/store/slices/vehiclesSlice';
import * as vehiclesStatsSliceModule from '@/store/slices/vehiclesStatsSlice';
import * as permissionedTableModule from '@/hooks/usePermissionedTable';

import type { Vehicle } from '@/types/vehicles/api';
import type { PaginationMeta } from '@/hooks/usePaginatedIndex';

type TestAuthMe = { id: number };

type VehiclesStatsError = { message: string; status?: number };

type TestRootState = {
  auth: { me: TestAuthMe };
  permissions: Record<string, unknown>;
  vehicles: Record<string, unknown>;
  vehiclesStats: {
    byTenant: Record<
      string,
      {
        data: unknown;
        meta: unknown;
        status: string;
        error: VehiclesStatsError | null;
        lastFetchedAt: string | null;
      }
    >;
  };
};

type DeleteIds = (string | number)[];

interface MobixTableTestProps {
  rows?: unknown[];
  totalCount?: number;
  paginationMode?: string;
  page?: number;
  rowsPerPage?: number;
  onDeleteClick?: (selectedIds: DeleteIds) => void;
  onRowsPerPageChange?: (value: number) => void;
  onPageChange?: (page: number) => void;
  [key: string]: unknown;
}

type UsePermissionedTableReturn = {
  columns: unknown[];
  defaultVisibleColumnIds: string[];
  columnVisibilityStorageKey: string;
  permissionsReady: boolean;
  isReady: boolean;
};

const dispatchMock = vi.fn();
let lastTableProps: MobixTableTestProps | null = null;

/**
 * Store hooks
 */
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: TestRootState) => unknown) =>
    selector({
      auth: { me: { id: 101 } },
      permissions: {},
      vehicles: {},
      vehiclesStats: { byTenant: {} },
    }),
}));

/**
 * Vehicles slice selectors (no thunk is dispatched anymore in Vehicles.tsx)
 */
vi.mock('@/store/slices/vehiclesSlice', () => {
  const selectVehicles = vi.fn((state: unknown, tenantSlug: string): Vehicle[] => {
    void state;
    void tenantSlug;
    return [];
  });

  const selectVehiclesStatus = vi.fn((state: unknown, tenantSlug: string): string => {
    void state;
    void tenantSlug;
    return 'idle';
  });

  const selectVehiclesPagination = vi.fn((state: unknown, tenantSlug: string): PaginationMeta | null => {
    void state;
    void tenantSlug;
    return {
      page: 1,
      per_page: 10,
      pages: 1,
      count: 0,
      prev: null,
      next: null,
    };
  });

  return {
    __esModule: true,
    selectVehicles,
    selectVehiclesStatus,
    selectVehiclesPagination,
  };
});

/**
 * Permissions slice selectors used by Vehicles.tsx
 */
vi.mock('@/store/slices/permissionsSlice', async () => {
  const actual = await vi.importActual<typeof import('@/store/slices/permissionsSlice')>(
    '@/store/slices/permissionsSlice',
  );

  return {
    __esModule: true,
    ...actual,
    selectAllowedAttributesForSubjectAndAction: vi.fn(() => () => ['plate', 'status']),
    selectPermissionsReady: vi.fn(() => true),
  };
});

vi.mock('@/store/slices/authSlice', () => ({
  selectCurrentPerson: (state: TestRootState) => state.auth.me,
}));

vi.mock('@/lib/getTenantSlugFromHost', () => ({
  getTenantSlugFromHost: () => 'coolitoral',
}));

/**
 * Permission gates in Vehicles.tsx
 * - canSeeVehicleStats => controls dispatch(fetchVehiclesStats)
 * - canCreateVehicle  => controls action button visibility (not asserted here)
 */
vi.mock('@/hooks/useHasPermission', () => ({
  useHasPermission: (perm: string) => {
    if (perm === 'vehicle:stats') return true;
    if (perm === 'vehicle:create') return true;
    return false;
  },
}));

vi.mock('@/hooks/usePermissionedTable', () => {
  const usePermissionedTable = vi.fn((): UsePermissionedTableReturn => ({
    columns: [],
    defaultVisibleColumnIds: [],
    columnVisibilityStorageKey: 'vehicles-table-columns',
    permissionsReady: true,
    isReady: true,
  }));

  return {
    __esModule: true,
    usePermissionedTable,
  };
});

/**
 * Vehicles stats slice (THIS is the only dispatch in the component)
 */
vi.mock('@/store/slices/vehiclesStatsSlice', () => {
  const fetchVehiclesStats = vi.fn((args: unknown) => ({
    type: 'vehiclesStats/fetchVehiclesStats',
    payload: args,
  }));

  const selectVehiclesStatsError = vi.fn((_state: unknown, _tenantSlug: string) => {
    void _state;
    void _tenantSlug;
    return null as VehiclesStatsError | null;
  });

  return {
    __esModule: true,
    fetchVehiclesStats,
    selectVehiclesStatsError,
  };
});

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');

  type DivLikeProps = React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    'data-testid'?: string;
  };

  return {
    __esModule: true,
    ...actual,
    Box: (props: DivLikeProps) => <div data-testid="mui-box" {...props} />,
    CircularProgress: (props: DivLikeProps) => <div data-testid="circular-progress" {...props} />,
    Alert: (props: DivLikeProps) => <div data-testid="alert" {...props} />,
  };
});

interface IndexPageLayoutProps {
  header: React.ReactNode;
  statsCards?: React.ReactNode;
  filters?: React.ReactNode;
  table?: React.ReactNode;
  activeFiltersCount?: number;
  totalCountText?: React.ReactNode;
}

vi.mock('@/components/layout/index-page/IndexPageLayout', () => ({
  IndexPageLayout: ({
    header,
    statsCards,
    filters,
    table,
    activeFiltersCount,
    totalCountText,
  }: IndexPageLayoutProps) => (
    <div data-testid="index-page-layout">
      <div data-testid="index-page-header">{header}</div>
      <div data-testid="index-page-stats">{statsCards}</div>
      <div data-testid="index-page-filters">{filters}</div>
      <div data-testid="index-page-table">{table}</div>
      <div data-testid="index-page-active-filters-count">{String(activeFiltersCount ?? 0)}</div>
      <div data-testid="index-page-total-count-text">{totalCountText}</div>
    </div>
  ),
}));

vi.mock('@/components/layout/page-header/PageHeaderSection', () => ({
  __esModule: true,
  default: ({ title, testId }: { title: string; testId?: string }) => (
    <h1 data-testid={testId ? `${testId}-title` : 'page-header-title'}>{title}</h1>
  ),
}));

vi.mock('@/components/mobix/table', () => ({
  MobixTable: (props: MobixTableTestProps) => {
    lastTableProps = props;
    return (
      <div data-testid="mobix-table" data-rows-count={props.rows?.length ?? 0}>
        Vehicles table
      </div>
    );
  },
}));

vi.mock('@/components/vehicles/VehiclesStatsCards', () => ({
  __esModule: true,
  default: ({ tenantSlug }: { tenantSlug: string }) => (
    <div data-testid="vehicles-stats-cards">{tenantSlug}</div>
  ),
}));

vi.mock('@/components/vehicles/VehiclesFilters', () => ({
  __esModule: true,
  default: () => <div data-testid="vehicles-filters" />,
}));

describe('Vehicles component integration between dispatch, pagination and MobixTable props', () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    lastTableProps = null;
    vi.clearAllMocks();

    // Make table ready by default in EVERY test (prevents cross-test contamination).
    vi.mocked(permissionedTableModule.usePermissionedTable).mockReset();
    vi.mocked(permissionedTableModule.usePermissionedTable).mockReturnValue({
      columns: [],
      defaultVisibleColumnIds: [],
      columnVisibilityStorageKey: 'vehicles-table-columns',
      permissionsReady: true,
      isReady: true,
    });
  });

  it('dispatches fetchVehiclesStats on mount when tenantSlug is available and permissions allow stats', () => {
    const statsSliceMock = vi.mocked(vehiclesStatsSliceModule);

    render(<Vehicles />);

    expect(statsSliceMock.fetchVehiclesStats).toHaveBeenCalledTimes(1);
    expect(statsSliceMock.fetchVehiclesStats).toHaveBeenCalledWith({ tenantSlug: 'coolitoral' });

    expect(dispatchMock).toHaveBeenCalledTimes(1);

    // Optional: verify dispatch received the action
    expect(dispatchMock.mock.calls[0][0]).toEqual({
      type: 'vehiclesStats/fetchVehiclesStats',
      payload: { tenantSlug: 'coolitoral' },
    });
  });

  it('passes computed rows and pagination props into MobixTable when table is ready and status is not failed', () => {
    const vehiclesSliceMock = vi.mocked(vehiclesSliceModule);

    const testVehicles: Vehicle[] = [
      {
        id: 1,
        plate: 'AAA111',
        model_year: 2020,
        status: 'active',
        engine_number: '',
        chassis_number: '',
        color: '',
        seated_capacity: 0,
        standing_capacity: 0,
        property_card: '',
        brand: null,
        vehicle_class: null,
        body_type: null,
      },
      {
        id: 2,
        plate: 'BBB222',
        model_year: 2021,
        status: 'inactive',
        engine_number: '',
        chassis_number: '',
        color: '',
        seated_capacity: 0,
        standing_capacity: 0,
        property_card: '',
        brand: null,
        vehicle_class: null,
        body_type: null,
      },
    ];

    vehiclesSliceMock.selectVehicles.mockReturnValueOnce(testVehicles);
    vehiclesSliceMock.selectVehiclesStatus.mockReturnValueOnce('succeeded');

    vehiclesSliceMock.selectVehiclesPagination.mockReturnValueOnce({
      page: 1,
      per_page: 10,
      pages: 1,
      count: 2,
      prev: null,
      next: null,
    });

    render(<Vehicles />);

    expect(lastTableProps).not.toBeNull();
    expect((lastTableProps?.rows ?? []).length).toBe(2);
    expect(lastTableProps?.totalCount).toBe(2);
    expect(lastTableProps?.paginationMode).toBe('server');
    expect(lastTableProps?.page).toBe(0);
    expect(lastTableProps?.rowsPerPage).toBe(10);
  });

  it('maps delete callback ids to strings before invoking the alert action', () => {
    render(<Vehicles />);

    const ids: DeleteIds = [1, '2', 3];
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    lastTableProps?.onDeleteClick?.(ids);

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0][0]).toBe('Eliminar vehículos: 1, 2, 3');

    alertSpy.mockRestore();
  });

  it('uses loading fallback behavior when permissioned table is not ready', () => {
    const usePermissionedTableMock = vi.mocked(permissionedTableModule.usePermissionedTable);

    usePermissionedTableMock.mockReturnValueOnce({
      columns: [],
      defaultVisibleColumnIds: [],
      columnVisibilityStorageKey: 'vehicles-table-columns',
      permissionsReady: false,
      isReady: false,
    });

    render(<Vehicles />);

    expect(lastTableProps).toBeNull();
  });

  it('redirects to /login when vehicles stats error is 401', () => {
    const statsSliceMock = vi.mocked(vehiclesStatsSliceModule);

    statsSliceMock.selectVehiclesStatsError.mockReturnValueOnce({
      message: 'Unauthorized',
      status: 401,
    });

    // JSDOM: window.location.assign is not configurable -> cannot spyOn it.
    const originalLocation = window.location;

    const assignMock = vi.fn();

    // Replace window.location entirely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = {
      ...originalLocation,
      assign: assignMock,
    };

    render(<Vehicles />);

    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith('/login');

    // Restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = originalLocation;
  });
});
