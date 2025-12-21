import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';

import Vehicles from '@/components/vehicles';
import * as vehiclesSliceModule from '@/store/slices/vehiclesSlice';
import * as permissionsSliceModule from '@/store/slices/permissionsSlice';
import * as vehiclesStatsSliceModule from '@/store/slices/vehiclesStatsSlice';
import * as permissionedTableModule from '@/hooks/usePermissionedTable';
import * as hasPermissionModule from '@/hooks/useHasPermission';

import type { Vehicle } from '@/types/vehicles/api';
import type { PaginationMeta } from '@/hooks/usePaginatedIndex';

type TestAuthMe = { id: number };

type TestRootState = {
  auth: { me: TestAuthMe };
  permissions: Record<string, unknown>;
  vehicles: Record<string, unknown>;
  vehiclesStats: { byTenant: Record<string, unknown> };
};

const dispatchMock = vi.fn();

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

vi.mock('@/store/slices/vehiclesSlice', () => {
  const selectVehicles = vi.fn(
    (state: unknown, tenantSlug: string): Vehicle[] => {
      void state;
      void tenantSlug;
      return [];
    },
  );

  const selectVehiclesStatus = vi.fn(
    (state: unknown, tenantSlug: string): string => {
      void state;
      void tenantSlug;
      return 'idle';
    },
  );

  const selectVehiclesPagination = vi.fn(
    (state: unknown, tenantSlug: string): PaginationMeta => {
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
    },
  );

  return {
    __esModule: true,
    selectVehicles,
    selectVehiclesStatus,
    selectVehiclesPagination,
  };
});

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

vi.mock('@/hooks/useHasPermission', () => ({
  __esModule: true,
  useHasPermission: vi.fn((permissionKey: string) => {
    // default: allow create, deny stats (tests can override)
    if (permissionKey === 'vehicle:create') return true;
    if (permissionKey === 'vehicle:stats') return false;
    return false;
  }),
}));

type UsePermissionedTableReturn = {
  columns: unknown[];
  defaultVisibleColumnIds: string[];
  columnVisibilityStorageKey: string;
  isReady: boolean;
};

vi.mock('@/hooks/usePermissionedTable', () => {
  const usePermissionedTable = vi.fn((): UsePermissionedTableReturn => ({
    columns: [],
    defaultVisibleColumnIds: [],
    columnVisibilityStorageKey: 'vehicles-table-columns',
    isReady: true,
  }));

  return {
    __esModule: true,
    usePermissionedTable,
  };
});

vi.mock('@/store/slices/vehiclesStatsSlice', () => {
  const fetchVehiclesStats = vi.fn((args: unknown) => ({
    type: 'vehiclesStats/fetchVehiclesStats',
    payload: args,
  }));

  const selectVehiclesStatsError = vi.fn(() => null);

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
    CircularProgress: (props: DivLikeProps) => (
      <div data-testid="circular-progress" {...props} />
    ),
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

let lastLayoutProps: IndexPageLayoutProps | null = null;

vi.mock('@/components/layout/index-page/IndexPageLayout', () => ({
  IndexPageLayout: (props: IndexPageLayoutProps) => {
    lastLayoutProps = props;
    return (
      <div data-testid="index-page-layout">
        <div data-testid="index-page-header">{props.header}</div>
        <div data-testid="index-page-stats">{props.statsCards}</div>
        <div data-testid="index-page-filters">{props.filters}</div>
        <div data-testid="index-page-table">{props.table}</div>
      </div>
    );
  },
}));

vi.mock('@/components/layout/page-header/PageHeaderSection', () => ({
  __esModule: true,
  default: ({ title, testId }: { title: string; testId?: string }) => (
    <h1 data-testid={testId ? `${testId}-title` : 'page-header-title'}>{title}</h1>
  ),
}));

type DeleteIds = (string | number)[];

interface MobixTableTestProps {
  rows?: unknown[];
  totalCount?: number;
  paginationMode?: string;
  page?: number;
  rowsPerPage?: number;
  loading?: boolean;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newSize: number) => void;
  onDeleteClick?: (selectedIds: DeleteIds) => void;
  [key: string]: unknown;
}

let lastTableProps: MobixTableTestProps | null = null;

vi.mock('@/components/mobix/table', () => ({
  MobixTable: (props: MobixTableTestProps) => {
    lastTableProps = props;
    return (
      <div
        data-testid="mobix-table"
        data-rows-count={props.rows?.length ?? 0}
      >
        Vehicles table
      </div>
    );
  },
}));

type VehiclesFiltersProps = {
  tenantSlug: string | null;
  page: number;
  rowsPerPage: number;
  onResetPage: () => void;
  onFiltersAppliedChange?: (count: number) => void;
};

let lastFiltersProps: VehiclesFiltersProps | null = null;

vi.mock('@/components/vehicles/VehiclesFilters', () => ({
  __esModule: true,
  default: (props: VehiclesFiltersProps) => {
    lastFiltersProps = props;
    return <div data-testid="vehicles-filters" />;
  },
}));

vi.mock('@/components/vehicles/VehiclesStatsCards', () => ({
  __esModule: true,
  default: ({ tenantSlug }: { tenantSlug: string }) => (
    <div data-testid="vehicles-stats-cards">{tenantSlug}</div>
  ),
}));

function renderVehicles() {
  return render(
    <ThemeProvider theme={theme}>
      <Vehicles />
    </ThemeProvider>,
  );
}

describe('Vehicles integration (dispatch + permissions + pagination + layout wiring)', () => {
  let originalLocation: Location;

  beforeEach(() => {
    dispatchMock.mockClear();
    lastTableProps = null;
    lastFiltersProps = null;
    lastLayoutProps = null;

    // Reset mocks
    vi.mocked(vehiclesSliceModule.selectVehicles).mockReset();
    vi.mocked(vehiclesSliceModule.selectVehiclesStatus).mockReset();
    vi.mocked(vehiclesSliceModule.selectVehiclesPagination).mockReset();

    vi.mocked(permissionsSliceModule.selectPermissionsReady).mockReset();
    vi.mocked(vehiclesStatsSliceModule.selectVehiclesStatsError).mockReset();
    vi.mocked(vehiclesStatsSliceModule.fetchVehiclesStats).mockClear();

    vi.mocked(permissionedTableModule.usePermissionedTable).mockReset();
    vi.mocked(hasPermissionModule.useHasPermission).mockReset();

    // Defaults
    vi.mocked(vehiclesSliceModule.selectVehicles).mockReturnValue([]);
    vi.mocked(vehiclesSliceModule.selectVehiclesStatus).mockReturnValue('idle');
    vi.mocked(vehiclesSliceModule.selectVehiclesPagination).mockReturnValue({
      page: 1,
      per_page: 10,
      pages: 1,
      count: 0,
      prev: null,
      next: null,
    });

    vi.mocked(permissionsSliceModule.selectPermissionsReady).mockReturnValue(true);

    vi.mocked(permissionedTableModule.usePermissionedTable).mockReturnValueOnce({
      columns: [],
      defaultVisibleColumnIds: [],
      columnVisibilityStorageKey: 'vehicles-table-columns',
      permissionsReady: true,
      isReady: false,
    });

    vi.mocked(hasPermissionModule.useHasPermission).mockImplementation((permissionKey: string) => {
      if (permissionKey === 'vehicle:create') return true;
      if (permissionKey === 'vehicle:stats') return false;
      return false;
    });

    vi.mocked(vehiclesStatsSliceModule.selectVehiclesStatsError).mockImplementation(() => null);

    // Mock window.location.assign safely
    originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, assign: vi.fn() },
      writable: true,
    });

    vi.mocked(permissionedTableModule.usePermissionedTable).mockReset();
    vi.mocked(permissionedTableModule.usePermissionedTable).mockReturnValue({
      columns: [],
      defaultVisibleColumnIds: [],
      columnVisibilityStorageKey: 'vehicles-table-columns',
      permissionsReady: true,
      isReady: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('wires tenantSlug + page + rowsPerPage into VehiclesFilters (no fetchVehicles dispatch in Vehicles)', () => {
    renderVehicles();

    expect(lastFiltersProps).not.toBeNull();
    expect(lastFiltersProps?.tenantSlug).toBe('coolitoral');
    expect(lastFiltersProps?.page).toBe(0);
    expect(lastFiltersProps?.rowsPerPage).toBe(10);
    expect(typeof lastFiltersProps?.onResetPage).toBe('function');
    expect(typeof lastFiltersProps?.onFiltersAppliedChange).toBe('function');
  });

  it('renders MobixTable when permissioned table is ready and status is not failed', () => {
    const testVehicles = [
      { id: 1, plate: 'AAA111', model_year: '2020', status: 'active' },
      { id: 2, plate: 'BBB222', model_year: '2021', status: 'inactive' },
    ] as unknown as Vehicle[];

    vi.mocked(vehiclesSliceModule.selectVehicles).mockReturnValueOnce(testVehicles);
    vi.mocked(vehiclesSliceModule.selectVehiclesStatus).mockReturnValueOnce('succeeded');
    vi.mocked(vehiclesSliceModule.selectVehiclesPagination).mockReturnValueOnce({
      page: 1,
      per_page: 10,
      pages: 1,
      count: 2,
      prev: null,
      next: null,
    });

    renderVehicles();

    expect(lastTableProps).not.toBeNull();
    expect(lastTableProps?.paginationMode).toBe('server');
    expect(lastTableProps?.page).toBe(0);
    expect(lastTableProps?.rowsPerPage).toBe(10);
    expect(lastTableProps?.totalCount).toBe(2);
    expect(Array.isArray(lastTableProps?.rows)).toBe(true);
    expect((lastTableProps?.rows ?? []).length).toBe(2);
  });

  it('shows loading fallback when permissioned table is not ready', () => {
    vi.mocked(permissionedTableModule.usePermissionedTable).mockReturnValue({
      columns: [],
      defaultVisibleColumnIds: [],
      columnVisibilityStorageKey: 'vehicles-table-columns',
      permissionsReady: true,
      isReady: false,
    });

    const { getByTestId } = renderVehicles();

    expect(getByTestId('driver-assignments-skeleton')).toBeInTheDocument();
    // MobixTable should not render in this branch
    expect(lastTableProps).toBeNull();
  });

  it('shows error alert when vehicles status is failed', () => {
    vi.mocked(vehiclesSliceModule.selectVehiclesStatus).mockReturnValueOnce('failed');

    renderVehicles();

    expect(lastTableProps).toBeNull();
  });

  it('maps delete callback ids to strings before invoking the alert action', () => {
    vi.mocked(vehiclesSliceModule.selectVehiclesStatus).mockReturnValueOnce('succeeded');

    renderVehicles();

    const ids: DeleteIds = [1, '2', 3];
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

    lastTableProps?.onDeleteClick?.(ids);

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy.mock.calls[0][0]).toBe('Eliminar vehículos: 1, 2, 3');

    alertSpy.mockRestore();
  });

  it('resets page to 0 when rowsPerPage changes', () => {
    vi.mocked(vehiclesSliceModule.selectVehiclesStatus).mockReturnValueOnce('succeeded');

    renderVehicles();

    expect(lastTableProps?.page).toBe(0);
    expect(lastTableProps?.rowsPerPage).toBe(10);

    act(() => {
      lastTableProps?.onPageChange?.(2);
    });

    expect(lastTableProps?.page).toBe(2);

    act(() => {
      lastTableProps?.onRowsPerPageChange?.(25);
    });

    // Contract: onRowsPerPageChange sets rowsPerPage and resets page to 0
    expect(lastTableProps?.rowsPerPage).toBe(25);
    expect(lastTableProps?.page).toBe(0);
  });

  it('updates activeFiltersCount in layout when VehiclesFilters reports applied filters', () => {
    renderVehicles();

    expect(lastLayoutProps?.activeFiltersCount).toBe(0);

    act(() => {
      lastFiltersProps?.onFiltersAppliedChange?.(3);
    });

    expect(lastLayoutProps?.activeFiltersCount).toBe(3);
  });

  it('dispatches fetchVehiclesStats when tenantSlug + permissionsReady + vehicle:stats permission are true', () => {
    vi.mocked(permissionsSliceModule.selectPermissionsReady).mockReturnValueOnce(true);
    vi.mocked(hasPermissionModule.useHasPermission).mockImplementation((permissionKey: string) => {
      if (permissionKey === 'vehicle:create') return true;
      if (permissionKey === 'vehicle:stats') return true;
      return false;
    });

    renderVehicles();

    expect(vehiclesStatsSliceModule.fetchVehiclesStats).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);

    const action = dispatchMock.mock.calls[0][0];
    expect(action).toEqual({
      type: 'vehiclesStats/fetchVehiclesStats',
      payload: { tenantSlug: 'coolitoral' },
    });
  });

  it('redirects to /login when vehicles stats error status is 401', () => {
    vi.mocked(hasPermissionModule.useHasPermission).mockImplementation((permissionKey: string) => {
      if (permissionKey === 'vehicle:create') return true;
      if (permissionKey === 'vehicle:stats') return true;
      return false;
    });

    vi.mocked(vehiclesStatsSliceModule.selectVehiclesStatsError).mockImplementation(
      (): { message: string; status?: number } => ({ message: 'Unauthorized', status: 401 }),
    );

    renderVehicles();

    expect((window.location.assign as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
    expect((window.location.assign as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      '/login',
    );
  });
});
