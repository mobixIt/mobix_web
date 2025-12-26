'use client';

import * as React from 'react';
import { Alert } from '@mui/material';
import { IndexPageLayout } from '@/components/layout/index-page/IndexPageLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectVehicles,
  selectVehiclesStatus,
  selectVehiclesPagination,
} from '@/store/slices/vehiclesSlice';
import {
  selectAllowedAttributesForSubjectAndAction,
  selectPermissionsReady,
} from '@/store/slices/permissionsSlice';
import { selectCurrentPerson } from '@/store/slices/authSlice';
import { getTenantSlugFromHost } from '@/lib/getTenantSlugFromHost';

import PageHeaderSection from '@/components/layout/page-header/PageHeaderSection';
import { MobixTable } from '@/components/mobix/table';

import { fetchVehiclesStats, selectVehiclesStatsError } from '@/store/slices/vehiclesStatsSlice';
import { TableSkeletonContainer } from '@/components/mobix/table/TableSkeleton.styled';
import { TableSkeleton } from '@/components/mobix/table/TableSkeleton';

import {
  ALL_VEHICLE_COLUMNS,
  mapVehiclesToRows,
  type VehicleRow,
  type VehicleLike,
} from '../../Vehicles.tableConfig';
import VehiclesStatsCards from '../../VehiclesStatsCards';
import VehiclesFilters, { VehiclesFiltersHandle } from '../../VehiclesFilters';

import { usePermissionedTable } from '@/hooks/usePermissionedTable';
import { useHasPermission } from '@/hooks/useHasPermission';

const DEFAULT_PAGE_SIZE = 10;

const BaseVehicles: React.FC = () => {
  const dispatch = useAppDispatch();

  const tenantSlug =
    typeof window !== 'undefined'
      ? getTenantSlugFromHost(window.location.hostname)
      : null;

  const currentPerson = useAppSelector(selectCurrentPerson);
  const currentUserId = React.useMemo<number | null>(
    () => (currentPerson ? currentPerson.id : null),
    [currentPerson],
  );

  const vehicles = useAppSelector((state) =>
    tenantSlug ? selectVehicles(state, tenantSlug) : [],
  ) as VehicleLike[];

  const status = useAppSelector((state) =>
    tenantSlug ? selectVehiclesStatus(state, tenantSlug) : 'idle',
  );

  const paginationMeta = useAppSelector((state) =>
    tenantSlug ? selectVehiclesPagination(state, tenantSlug) : null,
  );

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const [activeFiltersCount, setActiveFiltersCount] = React.useState(0);
  const [activeFiltersDisplay, setActiveFiltersDisplay] = React.useState<Record<string, string>>({});
  const filtersRef = React.useRef<VehiclesFiltersHandle>(null);
  const [aiQuestion, setAiQuestion] = React.useState('');

  const totalCount =
    paginationMeta?.count != null ? paginationMeta.count : vehicles.length;

  const allowedVehicleAttributes = useAppSelector(
    selectAllowedAttributesForSubjectAndAction(tenantSlug, 'vehicle', 'read'),
  );

  const permissionsReady = useAppSelector(selectPermissionsReady);
  const canCreateVehicle = useHasPermission('vehicle:create');
  const canSeeVehicleStats = useHasPermission('vehicle:stats');

  const rows: VehicleRow[] = mapVehiclesToRows(vehicles);

  const {
    columns: vehicleColumns,
    defaultVisibleColumnIds,
    columnVisibilityStorageKey,
    isReady: permissionedTableReady,
  } = usePermissionedTable<VehicleRow>({
    tableId: 'vehicles',
    tenantSlug,
    userId: currentUserId,
    allowedAttributes: allowedVehicleAttributes,
    allColumns: ALL_VEHICLE_COLUMNS,
    minimalSafeFields: ['plate', 'model_year', 'status'],
    alwaysVisibleFields: ['status'],
  });

  React.useEffect(() => {
    if (!permissionsReady) return;
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem('vehicles-table-columns');
    } catch {
      return;
    }
  }, [permissionsReady]);

  const shouldRenderStats = Boolean(tenantSlug) && permissionsReady && canSeeVehicleStats;

  const vehiclesStatsError = useAppSelector((state) =>
    tenantSlug ? selectVehiclesStatsError(state, tenantSlug) : null,
  );

  const statsErrorStatus = vehiclesStatsError?.status ?? null;

  React.useEffect(() => {
    if (!tenantSlug) return;
    if (!permissionsReady) return;
    if (!canSeeVehicleStats) return;

    void dispatch(fetchVehiclesStats({ tenantSlug }));
  }, [dispatch, tenantSlug, permissionsReady, canSeeVehicleStats]);

  React.useEffect(() => {
    if (statsErrorStatus !== 401) return;
    if (typeof window === 'undefined') return;

    window.location.assign('/login');
  }, [statsErrorStatus]);

  const header = (
    <PageHeaderSection
      title="Vehículos"
      subtitle="Administración central de la flota"
      actionLabel="Crear nuevo vehículo"
      actionIconPosition="left"
      testId="vehicles-header"
      showActionButton={permissionsReady && canCreateVehicle}
    />
  );

  let table: React.ReactNode;

  const isVehiclesLoading = status === 'loading' || status === 'idle';
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);

  React.useEffect(() => {
    if (!permissionedTableReady) return;
    if (status === 'succeeded' || status === 'failed') {
      setHasLoadedOnce(true);
    }
  }, [permissionedTableReady, status]);

  const shouldShowToolbarSkeleton =
    !permissionedTableReady || (!hasLoadedOnce && isVehiclesLoading);

  if (!permissionedTableReady) {
    table = (
      <TableSkeletonContainer>
        <TableSkeleton />
      </TableSkeletonContainer>
    );
  } else if (status === 'failed') {
    table = <Alert severity="error">No se pudo cargar la lista de vehículos.</Alert>;
  } else {
    table = (
      <MobixTable<VehicleRow>
        rows={rows}
        columns={vehicleColumns}
        loading={isVehiclesLoading}
        keepPreviousData
        enableSelection
        enablePagination
        paginationMode="server"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(newPage: number) => setPage(newPage)}
        onRowsPerPageChange={(value: number) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        pageSizeOptions={[10, 25, 50]}
        enableColumnVisibility
        columnVisibilityStorageKey={columnVisibilityStorageKey}
        initialVisibleColumnIds={defaultVisibleColumnIds}
        itemNameSingular="vehículo"
        itemNamePlural="vehículos"
        enableDelete
        onDeleteClick={(selectedIds) => {
          const idsAsString = selectedIds.map((id) => String(id));
          alert(`Eliminar vehículos: ${idsAsString.join(', ')}`);
        }}
        onRowClick={(row: VehicleRow) => {
          alert(`Vehículo seleccionado: ${row.plate}`);
        }}
        emptyStateContent={<div>No hay vehículos registrados</div>}
      />
    );
  }

  return (
    <div data-testid="vehicles-page">
      <IndexPageLayout
        header={header}
        statsCards={shouldRenderStats ? <VehiclesStatsCards tenantSlug={tenantSlug} /> : null}
        filters={
          <VehiclesFilters
            ref={filtersRef}
            tenantSlug={tenantSlug}
            page={page}
            rowsPerPage={rowsPerPage}
            onResetPage={() => setPage(0)}
            onFiltersAppliedChange={setActiveFiltersCount}
            onAppliedFiltersDisplayChange={setActiveFiltersDisplay}
          />
        }
        table={table}
        activeFiltersCount={activeFiltersCount}
        activeFiltersDisplay={activeFiltersDisplay}
        onRemoveFilter={(id) => filtersRef.current?.removeFilter(id)}
        onClearAllFilters={() => filtersRef.current?.clearAllFilters()}
        isLoading={shouldShowToolbarSkeleton}
        aiValue={aiQuestion}
        onAiChange={setAiQuestion}
        onSendQuestion={(value) => {
          // TODO: wire AI query handler when backend is ready
          console.log('AI question from toolbar:', value);
        }}
        showAiAssistant={true}
      />
    </div>
  );
};

export default BaseVehicles;
