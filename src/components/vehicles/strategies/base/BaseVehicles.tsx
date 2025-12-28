'use client';

import * as React from 'react';
import { Alert } from '@mui/material';
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
import detectPastQuestion from '@/lib/openai/detectPastQuestion';

const DEFAULT_PAGE_SIZE = 10;

const AI_FILTER_LABELS: Record<string, string> = {
  status: 'Estado',
  date: 'Fecha',
  brand: 'Marca',
  brand_id: 'Marca',
  vehicle_class: 'Clase',
  vehicle_class_id: 'Clase',
  body_type: 'Carrocería',
  body_type_id: 'Carrocería',
  color: 'Color',
  capacity_total_gt: 'Capacidad Total (>)',
  capacity_total_lt: 'Capacidad Total (<)',
  seated_capacity_gt: 'Capacidad Sentados (>)',
  seated_capacity_lt: 'Capacidad Sentados (<)',
  standing_capacity_gt: 'Capacidad De pie (>)',
  standing_capacity_lt: 'Capacidad De pie (<)',
  model_year: 'Año Modelo',
  owner_id: 'Propietario',
  driver_id: 'Conductor',
  q: 'Buscar',
};

const AI_STATUS_VALUE_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  inactive: 'Inactivo',
  maintenance: 'Mantenimiento',
  activas: 'Activas',
  activos: 'Activos',
  inactiva: 'Inactiva',
  inactivas: 'Inactivas',
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

const isAbortError = (err: unknown) => {
  const anyErr = err as { name?: string; message?: string };
  const msg = typeof anyErr?.message === 'string' ? anyErr.message : '';
  return anyErr?.name === 'ConditionError' || msg.includes('condition callback returning false');
};

export const mapAiFiltersDisplay = (
  appliedFilters: Record<string, unknown> | null | undefined,
  aiQuestion?: string | null,
) => {
  const display: Record<string, string> = {};

  const dropNestedValues = (values: string[]) => {
    const seen = new Set<string>();
    return values.filter((val) => {
      const low = val.toLowerCase();
      if (seen.has(low)) return false;
      seen.add(low);
      return true;
    });
  };

  Object.entries(appliedFilters ?? {}).forEach(([key, value]) => {
    const values = dropNestedValues(toValueArray(value));
    if (!values.length) return;

    const fallbackLabel = key.replace(/_/g, ' ');
    const label =
      AI_FILTER_LABELS[key] ??
      `${fallbackLabel.charAt(0).toUpperCase()}${fallbackLabel.slice(1)}`;

    values.forEach((raw, idx) => {
      let formattedValue = raw;

      if (key === 'status' && AI_STATUS_VALUE_LABELS[raw]) {
        formattedValue = AI_STATUS_VALUE_LABELS[raw];
      }

      if (
        (key === 'capacity_total_gt' || key === 'capacity_total_lt' || key === 'seated_capacity_gt' || key === 'seated_capacity_lt' || key === 'standing_capacity_gt' || key === 'standing_capacity_lt') &&
        raw === '0'
      ) {
        const fromQuestion = extractFirstNumber(aiQuestion);
        if (fromQuestion) {
          formattedValue = fromQuestion;
        } else {
          return;
        }
      }

      const chipKey = values.length > 1 ? `${key}::${idx}` : key;
      display[chipKey] = `${label}: ${capitalizeValue(formattedValue)}`;
    });
  });

  return display;
};

function toValueArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((v) => (v == null ? '' : String(v).trim()))
      .filter((v) => v.length > 0);
  }
  if (input == null) return [];
  const asString = String(input).trim();
  if (!asString) return [];
  return asString
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export const buildAiQuestionFromFilters = (filters: Record<string, unknown>) => {
  const segments = Object.entries(filters)
    .map(([key, value]) => {
      const values = toValueArray(value);
      if (!values.length) return null;
      const fallbackLabel = key.replace(/_/g, ' ');
      const label =
        AI_FILTER_LABELS[key] ??
        `${fallbackLabel.charAt(0).toUpperCase()}${fallbackLabel.slice(1)}`;
      const joined =
        key === 'status'
          ? values
              .map((v) => (AI_STATUS_VALUE_LABELS[v] ?? v).toLowerCase())
              .join(' o ')
          : values.join(' o ');
      return `${label.toLowerCase()} ${joined}`;
    })
    .filter(Boolean) as string[];

  if (!segments.length) return '';
  return `vehículos ${segments.join(' ')}`.trim();
};

const BaseVehicles: React.FC = () => {
  const dispatch = useAppDispatch();

  const FILTER_QUERY_KEYS = React.useMemo(
    () => ['q', 'status', 'brand_id', 'vehicle_class_id', 'body_type_id', 'model_year', 'owner_id', 'driver_id'],
    [],
  );

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
  const hydratedAiFromQuery = React.useRef(false);

  const totalCount =
    paginationMeta?.count != null ? paginationMeta.count : vehicles.length;

  const allowedVehicleAttributes = useAppSelector(
    selectAllowedAttributesForSubjectAndAction(tenantSlug, 'vehicle', 'read'),
  );

  const permissionsReady = useAppSelector(selectPermissionsReady);
  const canCreateVehicle = useHasPermission('vehicle:create');
  const canSeeVehicleStats = useHasPermission('vehicle:stats');
  const isAiActive = Boolean(aiMeta?.aiActive);
  const aiAppliedFiltersFromStore = aiMeta?.aiAppliedFilters;
  const aiAppliedFilters = React.useMemo(
    () => aiAppliedFiltersFromStore ?? {},
    [aiAppliedFiltersFromStore],
  );
  const effectiveAiAppliedFilters = aiAppliedFiltersOverride ?? aiAppliedFilters;
  const [aiIsPastQuestion, setAiIsPastQuestion] = React.useState(false);
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

  const showAiNoResultsBanner =
    isAiActive &&
    !isAiLoading &&
    !aiError &&
    hasLoadedOnce &&
    (displayedFiltersCount === 0 || vehicles.length === 0);

  const aiHistoricalSuggestion = React.useMemo(() => {
    if (!isAiActive || !aiQuestion || !aiIsPastQuestion) return undefined;
    return {
      title: 'Consulta histórica detectada',
      body: 'Podemos abrir el reporte histórico y graficar tendencias para tu consulta.',
      actions: {
        primaryLabel: 'Abrir reporte',
        secondaryLabel: 'Ver analytics',
        onPrimary: () => {},
        onSecondary: () => {},
      },
    };
  }, [aiIsPastQuestion, aiQuestion, isAiActive]);

  const [fallbackRows, setFallbackRows] = React.useState<VehicleRow[]>([]);
  const [fallbackTotalCount, setFallbackTotalCount] = React.useState<number | null>(null);

  const isAiActiveRef = React.useRef(isAiActive);
  const vehiclesLengthRef = React.useRef(vehicles.length);
  const rowsRef = React.useRef(rows);
  const totalCountRef = React.useRef(totalCount);

  React.useEffect(() => {
    isAiActiveRef.current = isAiActive;
  }, [isAiActive]);

  React.useEffect(() => {
    vehiclesLengthRef.current = vehicles.length;
  }, [vehicles.length]);

  React.useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  React.useEffect(() => {
    totalCountRef.current = totalCount;
  }, [totalCount]);

  const handleSendAiQuestion = React.useCallback(
    async (value: string) => {
      if (!tenantSlug) return;
      const trimmed = value.trim();
      if (!trimmed) return;
      if (aiLoading) return;

      const isAiActiveSnapshot = isAiActiveRef.current;
      const vehiclesLength = vehiclesLengthRef.current;

      if (!isAiActiveSnapshot && vehiclesLength > 0) {
        setFallbackRows(rowsRef.current);
        setFallbackTotalCount(totalCountRef.current);
      }

      const past = await detectPastQuestion(trimmed);
      if (past.isPast) {
        setAiIsPastQuestion(true);
        setAiQuestion(trimmed);
        setAiError(null);
        setAiAppliedFiltersOverride(null);
        return;
      }
      setAiIsPastQuestion(false);

      const sig = `${trimmed}|${0}|${rowsPerPage}`;
      if (lastAiRequestSig.current === sig) {
        return;
      }
      setPage(0);
      setAiQuestion(trimmed);
      setAiError(null);
      setAiAppliedFiltersOverride(null);
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        FILTER_QUERY_KEYS.forEach((k) => params.delete(k));
        params.set('ai_question', trimmed);
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      }
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
          if (isAbortError(err)) return;
          const anyErr = err as { code?: string; message?: string };
          setAiError(mapAiErrorMessage(anyErr?.code, anyErr?.message));
        })
        .finally(() => setAiLoading(false));
    },
    [aiLoading, dispatch, mapAiErrorMessage, rowsPerPage, tenantSlug],
  );

  const handleClearAi = React.useCallback(() => {
    if (!tenantSlug) return;
    setAiQuestion('');
    setAiError(null);
    setAiAppliedFiltersOverride(null);
    setAiIsPastQuestion(false);
    lastAiRequestSig.current = null;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('ai_question');
      FILTER_QUERY_KEYS.forEach((k) => params.delete(k));
      window.history.replaceState({}, '', params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname);
    }
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
      if (!tenantSlug) return;
      const currentFilters = effectiveAiAppliedFilters ?? {};
      const [targetKey, targetIdxRaw] = filterId.includes('::') ? filterId.split('::') : [filterId, null];
      const targetIdx = targetIdxRaw != null ? Number(targetIdxRaw) : null;

      const nextFilters = Object.entries(currentFilters).reduce<Record<string, unknown>>(
        (acc, [key, value]) => {
          if (!targetIdxRaw && key === filterId) return acc;

          if (targetIdxRaw && key === targetKey) {
            const values = toValueArray(value);
            if (Number.isInteger(targetIdx)) {
              const filteredValues = values.filter((_, i) => i !== targetIdx);
              if (filteredValues.length) {
                acc[key] = filteredValues;
              }
              return acc;
            }
          }

          acc[key] = value;
          return acc;
        },
        {},
      );

      const filtered = Object.fromEntries(
        Object.entries(nextFilters).filter(([, val]) => {
          const values = toValueArray(val);
          return values.length > 0;
        }),
      );

      const isSame = JSON.stringify(filtered) === JSON.stringify(currentFilters);
      if (isSame) return;

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

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        FILTER_QUERY_KEYS.forEach((k) => params.delete(k));
        params.set('ai_question', nextQuestion);
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      }

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
      .catch((err) => {
        if (isAbortError(err)) return;
        const anyErr = err as { code?: string; message?: string };
        setAiError(mapAiErrorMessage(anyErr?.code, anyErr?.message));
      })
      .finally(() => setAiLoading(false));
  }, [
    aiAppliedFiltersOverride,
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

  React.useEffect(() => {
    if (hydratedAiFromQuery.current) return;
    if (!tenantSlug) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const aiQ = params.get('ai_question');
    if (!aiQ) return;
    hydratedAiFromQuery.current = true;
    setAiQuestion(aiQ);
    setAiError(null);
    setAiAppliedFiltersOverride(null);
    lastAiRequestSig.current = `${aiQ}|0|${rowsPerPage}`;
    setAiLoading(true);
    void dispatch(
      fetchVehicles({
        tenantSlug,
        params: {
          page: { number: 1, size: rowsPerPage },
          ai_question: aiQ,
        },
      }),
    )
      .unwrap()
      .catch((err) => {
        if (isAbortError(err)) return;
        const anyErr = err as { code?: string; message?: string };
        setAiError(mapAiErrorMessage(anyErr?.code, anyErr?.message));
      })
      .finally(() => setAiLoading(false));
  }, [dispatch, mapAiErrorMessage, rowsPerPage, tenantSlug]);

  const shouldShowToolbarSkeleton =
    !permissionedTableReady || (!hasLoadedOnce && isVehiclesLoading);

  const effectiveRows = isAiActive && rows.length === 0 && fallbackRows.length > 0 ? fallbackRows : rows;
  const effectiveTotalCount =
    isAiActive && rows.length === 0 && fallbackTotalCount !== null ? fallbackTotalCount : totalCount;

  if (!permissionedTableReady) {
    table = (
      <TableSkeletonContainer>
        <TableSkeleton />
      </TableSkeletonContainer>
    );
  } else if (status === 'failed') {
    table = <Alert severity="error">No se pudo cargar la lista de vehículos.</Alert>;
  } else {
    const tableContent = (
      <MobixTable<VehicleRow>
        rows={effectiveRows}
        columns={vehicleColumns}
        loading={isVehiclesLoading || isAiLoading}
        keepPreviousData
        enableSelection
        enablePagination
        paginationMode="server"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={effectiveTotalCount}
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

    table = tableContent;
  }

  return (
    <div data-testid="vehicles-page">
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
        aiHistoricalSuggestion={aiHistoricalSuggestion}
        aiNoResults={
          showAiNoResultsBanner
            ? {
                show: true,
                onRetry: () => handleSendAiQuestion(aiQuestion),
                onClear: handleClearAi,
              }
            : undefined
        }
        aiErrorState={
          isAiActive && aiError
            ? {
                show: true,
                message: aiError,
                hint: 'Revisa tu conexión o intenta con otra frase.',
                note: 'Mostrando los últimos resultados mientras reintentas.',
                onRetry: () => handleSendAiQuestion(aiQuestion),
                onClear: handleClearAi,
              }
            : undefined
        }
      />
    </div>
  );
};

export default BaseVehicles;
