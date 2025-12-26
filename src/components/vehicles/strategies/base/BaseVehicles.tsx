'use client';

import * as React from 'react';
import { Alert, Box } from '@mui/material';
import { IndexPageLayout } from '@/components/layout/index-page/IndexPageLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectVehicles,
  selectVehiclesStatus,
  selectVehiclesPagination,
  selectVehiclesAiMeta,
  fetchVehicles,
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

const AI_FILTER_LABELS: Record<string, string> = {
  status: 'Estado',
  date: 'Fecha',
  brand: 'Marca',
  brand_id: 'Marca',
  vehicle_class: 'Clase',
  vehicle_class_id: 'Clase',
  color: 'Color',
  capacity_total_gt: 'Capacidad Total (>)',
  capacity_total_lt: 'Capacidad Total (<)',
  model_year: 'Año Modelo',
  owner_id: 'Propietario',
  driver_id: 'Conductor',
  q: 'Buscar',
};

const capitalizeValue = (value: string) => {
  if (!value) return value;
  return value
    .split(' ')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ''))
    .join(' ');
};

const extractFirstNumber = (text?: string | null): string | null => {
  if (!text) return null;
  const match = text.match(/(\d+(?:[\\.,]\\d+)?)/);
  if (!match) return null;
  return match[1].replace(',', '.');
};

export const mapAiFiltersDisplay = (
  appliedFilters: Record<string, unknown> | null | undefined,
  aiQuestion?: string | null,
) => {
  const display: Record<string, string> = {};

  Object.entries(appliedFilters ?? {}).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    const normalized = String(value).trim();
    if (!normalized) return;

    const fallbackLabel = key.replace(/_/g, ' ');
    const label =
      AI_FILTER_LABELS[key] ??
      `${fallbackLabel.charAt(0).toUpperCase()}${fallbackLabel.slice(1)}`;

    let formattedValue = normalized;

    if ((key === 'capacity_total_gt' || key === 'capacity_total_lt') && normalized === '0') {
      const fromQuestion = extractFirstNumber(aiQuestion);
      if (fromQuestion) {
        formattedValue = fromQuestion;
      } else {
        return;
      }
    }

    display[key] = `${label}: ${capitalizeValue(formattedValue)}`;
  });

  return display;
};

export const buildAiQuestionFromFilters = (filters: Record<string, unknown>) => {
  const segments = Object.entries(filters)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim())
    .map(([key, value]) => {
      const fallbackLabel = key.replace(/_/g, ' ');
      const label =
        AI_FILTER_LABELS[key] ??
        `${fallbackLabel.charAt(0).toUpperCase()}${fallbackLabel.slice(1)}`;
      return `${label.toLowerCase()} ${String(value).trim()}`;
    });

  if (!segments.length) return '';
  return `vehículos ${segments.join(' ')}`.trim();
};

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
  const aiMeta = useAppSelector((state) =>
    tenantSlug ? selectVehiclesAiMeta(state, tenantSlug) : null,
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
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiAppliedFiltersOverride, setAiAppliedFiltersOverride] =
    React.useState<Record<string, unknown> | null>(null);
  const lastAiRequestSig = React.useRef<string | null>(null);

  const totalCount =
    paginationMeta?.count != null ? paginationMeta.count : vehicles.length;

  const allowedVehicleAttributes = useAppSelector(
    selectAllowedAttributesForSubjectAndAction(tenantSlug, 'vehicle', 'read'),
  );

  const permissionsReady = useAppSelector(selectPermissionsReady);
  const canCreateVehicle = useHasPermission('vehicle:create');
  const canSeeVehicleStats = useHasPermission('vehicle:stats');
  const isAiActive = Boolean(aiMeta?.aiActive);
  const aiAppliedFilters = aiMeta?.aiAppliedFilters ?? {};
  const effectiveAiAppliedFilters = aiAppliedFiltersOverride ?? aiAppliedFilters;
  const aiExplanation = aiMeta?.aiExplanation ?? null;
  const aiQuestionFromStore = aiMeta?.aiQuestion ?? null;
  const isAiLoading = aiLoading || (isAiActive && status === 'loading');

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

  const mapAiErrorMessage = React.useCallback((code?: string, fallback?: string) => {
    const messages: Record<string, string> = {
      DATE_NOT_ALLOWED: 'La fecha solicitada no está permitida para la búsqueda IA.',
      NO_IDS: 'La consulta IA no devolvió IDs válidos.',
      TOO_MANY_IDS: 'La consulta IA devolvió demasiados resultados.',
      UNSAFE_SQL: 'La consulta fue bloqueada por considerarse insegura.',
      LLM_ERROR: 'El asistente IA tuvo un problema al procesar tu consulta.',
      AI_INDEX_ERROR: 'No se pudo consultar el índice IA en este momento.',
    };
    if (code && messages[code]) return messages[code];
    return fallback ?? 'No se pudo completar la búsqueda con IA.';
  }, []);

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

  const aiFiltersDisplay = React.useMemo(
    () => mapAiFiltersDisplay(effectiveAiAppliedFilters, aiQuestion),
    [aiQuestion, effectiveAiAppliedFilters],
  );

  const activeFiltersLabel = 'Filtros activos:';
  const displayedFilters = isAiActive ? aiFiltersDisplay : activeFiltersDisplay;
  const displayedFiltersCount = Object.keys(displayedFilters).length;

  const handleSendAiQuestion = React.useCallback(
    (value: string) => {
      if (!tenantSlug) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      setPage(0);
      setAiQuestion(trimmed);
      setAiError(null);
      setAiAppliedFiltersOverride(null);
      const sig = `${trimmed}|${0}|${rowsPerPage}`;
      lastAiRequestSig.current = sig;
      setAiLoading(true);
      void dispatch(
        fetchVehicles({
          tenantSlug,
          params: {
            page: { number: 1, size: rowsPerPage },
            ai_question: trimmed,
          },
        }),
      )
        .unwrap()
        .catch((err) => {
          setAiError(mapAiErrorMessage(err?.code, err?.message));
        })
        .finally(() => setAiLoading(false));
    },
    [dispatch, mapAiErrorMessage, rowsPerPage, tenantSlug],
  );

  const handleClearAi = React.useCallback(() => {
    if (!tenantSlug) return;
    setAiQuestion('');
    setAiError(null);
    setAiAppliedFiltersOverride(null);
    lastAiRequestSig.current = null;
    setAiLoading(true);
    void dispatch(
      fetchVehicles({
        tenantSlug,
        params: {
          page: { number: page + 1, size: rowsPerPage },
        },
      }),
    )
      .unwrap()
      .catch((err) => setAiError(mapAiErrorMessage(err?.code, err?.message)))
      .finally(() => setAiLoading(false));
  }, [dispatch, mapAiErrorMessage, page, rowsPerPage, tenantSlug]);

  const handleRemoveAiFilter = React.useCallback(
    (filterId: string) => {
      const currentFilters = effectiveAiAppliedFilters ?? {};
      const nextFilters = Object.entries(currentFilters).reduce<Record<string, unknown>>(
        (acc, [key, value]) => {
          if (key === filterId) return acc;
          acc[key] = value;
          return acc;
        },
        {},
      );

      const filtered = Object.fromEntries(
        Object.entries(nextFilters).filter(([, value]) => value !== null && value !== undefined && String(value).trim()),
      );

      const hasFilters = Object.keys(filtered).length > 0;
      if (!hasFilters) {
        handleClearAi();
        return;
      }

      const nextQuestion = buildAiQuestionFromFilters(filtered);
      setAiAppliedFiltersOverride(filtered);
      setAiQuestion(nextQuestion);
      setAiError(null);
      setPage(0);

      const sig = `${nextQuestion}|${0}|${rowsPerPage}`;
      lastAiRequestSig.current = sig;
      setAiLoading(true);

      void dispatch(
        fetchVehicles({
          tenantSlug,
          params: {
            page: { number: 1, size: rowsPerPage },
            ai_question: nextQuestion,
          },
        }),
      )
        .unwrap()
        .catch((err) => {
          setAiError(mapAiErrorMessage(err?.code, err?.message));
        })
        .finally(() => setAiLoading(false));
    },
    [
      dispatch,
      effectiveAiAppliedFilters,
      handleClearAi,
      mapAiErrorMessage,
      rowsPerPage,
      tenantSlug,
    ],
  );

  React.useEffect(() => {
    if (!tenantSlug) return;
    if (!isAiActive || !aiQuestionFromStore) return;
    if (aiAppliedFiltersOverride) return;

    const sig = `${aiQuestionFromStore}|${page}|${rowsPerPage}`;
    if (lastAiRequestSig.current === sig) return;

    lastAiRequestSig.current = sig;
    setAiError(null);
    setAiLoading(true);
    void dispatch(
      fetchVehicles({
        tenantSlug,
        params: {
          page: { number: page + 1, size: rowsPerPage },
          ai_question: aiQuestionFromStore,
        },
      }),
    )
      .unwrap()
      .catch((err) => setAiError(mapAiErrorMessage(err?.code, err?.message)))
      .finally(() => setAiLoading(false));
  }, [
    aiQuestionFromStore,
    dispatch,
    isAiActive,
    mapAiErrorMessage,
    page,
    rowsPerPage,
    tenantSlug,
  ]);

  React.useEffect(() => {
    if (!isAiActive) {
      lastAiRequestSig.current = null;
    }
  }, [isAiActive]);

  React.useEffect(() => {
    if (!isAiActive) {
      setAiAppliedFiltersOverride(null);
      return;
    }
    setAiAppliedFiltersOverride(null);
  }, [aiAppliedFilters, isAiActive]);

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
        loading={isVehiclesLoading || isAiLoading}
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
      {aiError ? (
        <Box mb={2}>
          <Alert severity="warning">{aiError}</Alert>
        </Box>
      ) : null}
      <IndexPageLayout
        header={header}
        statsCards={shouldRenderStats ? <VehiclesStatsCards tenantSlug={tenantSlug} /> : null}
        filters={
          !isAiActive && !isAiLoading ? (
            <VehiclesFilters
              ref={filtersRef}
              tenantSlug={tenantSlug}
              page={page}
              rowsPerPage={rowsPerPage}
              onResetPage={() => setPage(0)}
              onFiltersAppliedChange={setActiveFiltersCount}
              onAppliedFiltersDisplayChange={setActiveFiltersDisplay}
            />
          ) : null
        }
        table={table}
        activeFiltersCount={isAiActive ? displayedFiltersCount : activeFiltersCount}
        activeFiltersDisplay={displayedFilters}
        onRemoveFilter={
          isAiActive
            ? (id) => handleRemoveAiFilter(id)
            : (id) => filtersRef.current?.removeFilter(id)
        }
        onClearAllFilters={isAiActive ? handleClearAi : () => filtersRef.current?.clearAllFilters()}
        isLoading={shouldShowToolbarSkeleton}
        aiValue={aiQuestion}
        onAiChange={setAiQuestion}
        onSendQuestion={handleSendAiQuestion}
        aiIsLoading={isAiLoading}
        showAiAssistant
        activeFiltersLabel={activeFiltersLabel}
        showFiltersToggle
      />
    </div>
  );
};

export default BaseVehicles;
