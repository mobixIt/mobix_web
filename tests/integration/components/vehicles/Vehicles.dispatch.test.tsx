import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import Vehicles from '@/components/vehicles';
import * as vehiclesSliceModule from '@/store/slices/vehiclesSlice';
import * as permissionedTableModule from '@/hooks/usePermissionedTable';
import type { Vehicle } from '@/types/vehicles/api';
import type { PaginationMeta } from '@/hooks/usePaginatedIndex';

type TestAuthMe = { id: number };

type TestRootState = {
  auth: { me: TestAuthMe };
  permissions: Record<string, unknown>;
  vehicles: Record<string, unknown>;
};

type DeleteIds = (string | number)[];

interface MobixTableTestProps {
  rows?: unknown[];
  totalCount?: number;
  paginationMode?: string;
  page?: number;
  rowsPerPage?: number;
  onDeleteClick?: (selectedIds: DeleteIds) => void;
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

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: TestRootState) => unknown) =>
    selector({
      auth: { me: { id: 101 } },
      permissions: {},
      vehicles: {},
    }),
}));

vi.mock('@/store/slices/vehiclesSlice', () => {
  const fetchVehicles = vi.fn((args: unknown) => ({
    type: 'vehicles/fetchVehicles',
    payload: args,
  }));

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
    (state: unknown, tenantSlug: string): PaginationMeta | null => {
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
    fetchVehicles,
    selectVehicles,
    selectVehiclesStatus,
    selectVehiclesPagination,
  };
});

vi.mock('@/store/slices/permissionsSlice', () => ({
  selectAllowedAttributesForSubjectAndAction: vi.fn(() => () => ['plate', 'status']),
}));

vi.mock('@/store/slices/authSlice', () => ({
  selectCurrentPerson: (state: TestRootState) => state.auth.me,
}));

vi.mock('@/lib/getTenantSlugFromHost', () => ({
  getTenantSlugFromHost: () => 'coolitoral',
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
  table?: React.ReactNode;
}

vi.mock('@/components/layout/index-page/IndexPageLayout', () => ({
  IndexPageLayout: ({ header, statsCards, table }: IndexPageLayoutProps) => (
    <div data-testid="index-page-layout">
      <div data-testid="index-page-header">{header}</div>
      <div data-testid="index-page-stats">{statsCards}</div>
      <div data-testid="index-page-table">{table}</div>
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
        Listado de vehículos
      </div>
    );
  },
}));

vi.mock('@/components/layout/stats-cards/StatsCardsSection', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="stats-cards-section">{children}</div>
  ),
}));

vi.mock('@/components/stats/StatsCard', () => ({
  __esModule: true,
  default: ({ title, value }: { title: string; value: number }) => (
    <div data-testid={`stats-card-${title}`}>{value}</div>
  ),
}));

describe('Vehicles component integration between dispatch, pagination and MobixTable props', () => {
  beforeEach(() => {
    dispatchMock.mockClear();
    lastTableProps = null;
    vi.clearAllMocks();
  });

  it('dispatches fetchVehicles on mount with tenantSlug and default pagination values', () => {
    const vehiclesSliceMock = vi.mocked(vehiclesSliceModule);

    render(<Vehicles />);

    expect(vehiclesSliceMock.fetchVehicles).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledTimes(1);

    const firstCallArgs = vehiclesSliceMock.fetchVehicles.mock.calls[0][0];
    expect(firstCallArgs).toEqual({
      tenantSlug: 'coolitoral',
      params: {
        page: {
          number: 1,
          size: 10,
        },
      },
    });
  });

  it('passes computed rows and pagination props into MobixTable when data is ready', () => {
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

    const paginationMeta: PaginationMeta = {
      page: 1,
      per_page: 10,
      pages: 1,
      count: 2,
      prev: null,
      next: null,
    };

    vehiclesSliceMock.selectVehiclesPagination.mockReturnValueOnce(paginationMeta);

    render(<Vehicles />);

    expect(lastTableProps).not.toBeNull();
    expect(lastTableProps?.rows).toBeDefined();
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
});
