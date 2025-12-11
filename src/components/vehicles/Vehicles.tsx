'use client';

import * as React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { IndexPageLayout } from '@/components/layout/index-page/IndexPageLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchVehicles,
  selectVehicles,
  selectVehiclesStatus,
  selectVehiclesPagination,
} from '@/store/slices/vehiclesSlice';
import {
  selectAllowedAttributesForSubjectAndAction,
} from '@/store/slices/permissionsSlice';

import {
  selectCurrentPerson,
} from '@/store/slices/authSlice';

import { getTenantSlugFromHost } from '@/lib/getTenantSlugFromHost';

import PageHeaderSection from '@/components/layout/page-header/PageHeaderSection';
import { MobixTable } from '@/components/mobix/table';

import StatsCardsSection from '@/components/layout/stats-cards/StatsCardsSection';
import StatsCard from '@/components/stats/StatsCard';

import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimelineIcon from '@mui/icons-material/Timeline';

import {
  ALL_VEHICLE_COLUMNS,
  mapVehiclesToRows,
  type VehicleRow,
  type VehicleLike,
} from './Vehicles.tableConfig';

import { usePermissionedTable } from '@/hooks/usePermissionedTable';

const DEFAULT_PAGE_SIZE = 10;

const Vehicles: React.FC = () => {
  const dispatch = useAppDispatch();

  const tenantSlug =
    typeof window !== 'undefined'
      ? getTenantSlugFromHost(window.location.hostname)
      : null;

  // Current user info from auth slice
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

  // Pagination meta coming from API (via Redux slice)
  const paginationMeta = useAppSelector((state) =>
    tenantSlug ? selectVehiclesPagination(state, tenantSlug) : null,
  );

  // Local pagination state (0-based for MUI TablePagination)
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] =
    React.useState<number>(DEFAULT_PAGE_SIZE);

  // Derive total count from meta (fallback to client length if needed)
  const totalCount =
    paginationMeta?.count != null
      ? paginationMeta.count
      : vehicles.length;

  const allowedVehicleAttributes = useAppSelector(
    selectAllowedAttributesForSubjectAndAction(
      tenantSlug,
      'vehicle',
      'read',
    ),
  );

  React.useEffect(() => {
    if (!tenantSlug) return;

    void dispatch(
      fetchVehicles({
        tenantSlug,
        params: {
          page: {
            number: page + 1,
            size: rowsPerPage,
          },
        },
      }),
    );
  }, [dispatch, tenantSlug, page, rowsPerPage]);

  const rows: VehicleRow[] = mapVehiclesToRows(vehicles);

  const {
    columns: vehicleColumns,
    defaultVisibleColumnIds,
    columnVisibilityStorageKey,
    permissionsReady,
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
      // Ignore storage errors (private mode, etc.)
    }
  }, [permissionsReady]);

  const header = (
    <PageHeaderSection
      title="Vehículos"
      subtitle="Administración central de la flota"
      actionLabel="Crear nuevo vehículo"
      actionIconPosition="left"
      testId="vehicles-header"
    />
  );

  let table: React.ReactNode;

  const isVehiclesLoading =
    status === 'loading' || status === 'idle';

  if (!permissionedTableReady) {
    table = (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  } else if (status === 'failed') {
    table = (
      <Alert severity="error">
        No se pudo cargar la lista de vehículos.
      </Alert>
    );
  } else {
    table = (
      <MobixTable<VehicleRow>
        title="Listado de vehículos"
        rows={rows}
        columns={vehicleColumns}
        loading={isVehiclesLoading}
        enableSelection
        enablePagination
        paginationMode="server"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(newPage: number) => {
          setPage(newPage);
        }}
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
        statsCards={
          <StatsCardsSection>
            <StatsCard
              title="Total vehículos"
              value={totalCount}
              helperText="Flota registrada"
              variant="secondary"
              icon={<DirectionsBusIcon />}
            />

            <StatsCard
              title="Activos"
              value={98}
              helperText="En operación"
              variant="success"
              icon={<CheckCircleIcon />}
            />

            <StatsCard
              title="Inactivos"
              value={30}
              helperText="Fuera de servicio"
              variant="warning"
              icon={<CancelIcon />}
            />

            <StatsCard
              title="Nuevos este mes"
              value={6}
              helperText="+2 vs mes anterior"
              variant="primary"
              icon={<TimelineIcon />}
            />
          </StatsCardsSection>
        }
        table={table}
      />
    </div>
  );
};

export default Vehicles;
