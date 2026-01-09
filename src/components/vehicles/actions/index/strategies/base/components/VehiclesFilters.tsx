'use client';

import * as React from 'react';
import FiltersSection from '@/components/layout/filters/FiltersSection';
import type {
  FiltersSectionField,
  FiltersSectionValue,
  FiltersSectionValues,
  AsyncSelectOption,
} from '@/components/layout/filters/FiltersSection.types';

import { Alert, Box, Button } from '@mui/material';
import { useVehiclesCatalogs } from '../../../_shared/hooks/useVehiclesData';

import { useAppDispatch } from '@/store/hooks';
import { fetchVehicles } from '@/store/slices/vehiclesSlice';
import {
  filtersFromQueryString,
  filtersToQueryString,
  replaceUrlQuery,
  type FilterQuerySpec,
} from '@/utils/filterQuerySync';

// --- Types ---

export type VehiclesFiltersProps = {
  tenantSlug: string | null;
  page: number;
  rowsPerPage: number;
  onResetPage: () => void;
  onFiltersAppliedChange?: (count: number) => void;
  onAppliedFiltersChange?: (applied: FiltersSectionValues) => void;
  onAppliedFiltersDisplayChange?: (display: Record<string, string>) => void;
};

export type VehiclesFiltersHandle = {
  removeFilter: (fieldId: string) => void;
  clearAllFilters: () => void;
};

type VehiclesApiFilters = Partial<{
  q: string;
  status: string | string[];
  model_year: string;
  owner_id: string;
  driver_id: string;
  brand_id: string | string[];
  vehicle_class_id: string | string[];
  body_type_id: string | string[];
}>;

// --- Helpers ---

const FILTER_QUERY_SPEC: FilterQuerySpec = {
  q: { type: 'string' },
  status: { type: 'stringArray' },
  brand_id: { type: 'stringArray' },
  vehicle_class_id: { type: 'stringArray' },
  body_type_id: { type: 'stringArray' },
  model_year: { type: 'string' },
  owner_id: { type: 'asyncId' },
  driver_id: { type: 'asyncId' },
};

const INITIAL_VALUES: FiltersSectionValues = {
  q: '',
  status: [],
  brand_id: [],
  vehicle_class_id: [],
  body_type_id: [],
  model_year: '',
  owner_id: null,
  driver_id: null,
};

const normalizeStr = (x: unknown): string => String(x ?? '').trim();
const toLowerSafe = (x: unknown): string => normalizeStr(x).toLowerCase();
const toArray = (input: unknown): string[] => {
  if (Array.isArray(input)) {
    return input.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * Filter options for async select inputs.
 */
function filterPeopleOptions(
  options: Array<{ id: number; label: string; code: string | null }>,
  query: string,
): AsyncSelectOption[] {
  const q = toLowerSafe(query);
  // Transform options once
  const base = options.map((o) => ({
    label: o.label,
    value: String(o.id),
    code: o.code ?? null,
  }));

  if (!q) return base;

  return base.filter((o) => {
    const token = `${o.label} ${o.code ?? ''}`.toLowerCase();
    return token.includes(q);
  });
}

// --- Main Component ---

const VehiclesFilters = React.forwardRef<VehiclesFiltersHandle, VehiclesFiltersProps>(({
  tenantSlug,
  page,
  rowsPerPage,
  onResetPage,
  onFiltersAppliedChange,
  onAppliedFiltersChange,
  onAppliedFiltersDisplayChange,
}, ref) => {
  const dispatch = useAppDispatch();
  const [isApplying, setIsApplying] = React.useState(false);

  // 1. Get Catalogs Data
  const {
    status: catalogsStatus,
    error: catalogsError,
    hasCatalogs,
    ownersRaw,
    driversRaw,
    brandOptions,
    vehicleClassOptions,
    bodyTypeOptions,
    retry: retryCatalogs,
  } = useVehiclesCatalogs(tenantSlug);

  const isCatalogsLoading = catalogsStatus === 'loading' || catalogsStatus === 'idle';

  // 2. Memoized Load Options callbacks
  //    Now depend on stable memoized arrays from the hook
  const loadOwners = React.useCallback(
    async (input: string) => {
      if (!hasCatalogs) return [];
      return filterPeopleOptions(ownersRaw, input);
    },
    [hasCatalogs, ownersRaw]
  );

  const loadDrivers = React.useCallback(
    async (input: string) => {
      if (!hasCatalogs) return [];
      return filterPeopleOptions(driversRaw, input);
    },
    [hasCatalogs, driversRaw]
  );

  // 3. Filter Fields Configuration
  const vehicleFilterFields = React.useMemo<FiltersSectionField[]>(() => [
    {
      id: 'q',
      label: 'Buscar',
      type: 'search',
      colSpan: 2,
      placeholder: 'Buscar por placa, código o motor...',
    },
    {
      id: 'status',
      label: 'Estado',
      type: 'multi-select',
      colSpan: 1,
      placeholder: 'Selecciona uno o más',
      searchable: false,
      helperText: 'Puedes seleccionar más de uno',
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'Borrador', value: 'draft' },
        { label: 'Mantenimiento', value: 'maintenance' },
      ],
    },
    {
      id: 'brand_id',
      label: 'Marca',
      type: 'multi-select',
      colSpan: 1,
      placeholder: 'Selecciona uno o más',
      options: brandOptions,
      disabled: isCatalogsLoading || !hasCatalogs,
      loading: isCatalogsLoading,
    },
    {
      id: 'vehicle_class_id',
      label: 'Clase',
      type: 'multi-select',
      colSpan: 1,
      placeholder: 'Selecciona uno o más',
      options: vehicleClassOptions,
      disabled: isCatalogsLoading || !hasCatalogs,
      loading: isCatalogsLoading,
    },
    {
      id: 'body_type_id',
      label: 'Carrocería',
      type: 'multi-select',
      colSpan: 1,
      placeholder: 'Selecciona uno o más',
      options: bodyTypeOptions,
      disabled: isCatalogsLoading || !hasCatalogs,
      loading: isCatalogsLoading,
    },
    {
      id: 'owner_id',
      label: 'Propietario',
      type: 'async-select',
      colSpan: 1,
      placeholder: 'Buscar propietario...',
      loadOptions: loadOwners,
      minCharsToSearch: 0,
      disabled: isCatalogsLoading || !hasCatalogs,
      loading: isCatalogsLoading,
    },
    {
      id: 'driver_id',
      label: 'Conductor',
      type: 'async-select',
      colSpan: 1,
      placeholder: 'Buscar conductor...',
      loadOptions: loadDrivers,
      minCharsToSearch: 0,
      disabled: isCatalogsLoading || !hasCatalogs,
      loading: isCatalogsLoading,
    },
    {
      id: 'model_year',
      label: 'Año Modelo',
      type: 'text',
      colSpan: 1,
      placeholder: 'Ej: 2022',
    },
  ], [
    brandOptions, 
    vehicleClassOptions, 
    bodyTypeOptions, 
    loadOwners, 
    loadDrivers, 
    isCatalogsLoading, 
    hasCatalogs
  ]);

  const parsedFromQuery = React.useMemo<FiltersSectionValues>(() => {
    if (typeof window === 'undefined') return INITIAL_VALUES;
    const parsed = filtersFromQueryString(window.location.search, FILTER_QUERY_SPEC);
    return { ...INITIAL_VALUES, ...parsed };
  }, []);

  const [filterValues, setFilterValues] = React.useState<FiltersSectionValues>(parsedFromQuery);
  const [appliedFilters, setAppliedFilters] = React.useState<FiltersSectionValues>(parsedFromQuery);
  const didHydrateFromQuery = React.useRef(false);
  const applyFiltersRef = React.useRef<((vals: FiltersSectionValues) => void) | null>(null);
  const needsLabelHydrationRef = React.useRef(false);
  const hasAiQuestionParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).has('ai_question')
    : false;

  const handleFilterChange = (fieldId: string, value: FiltersSectionValue) => {
    setFilterValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  // 5. Logic to build API query params
  const buildApiFilters = React.useCallback((vals: FiltersSectionValues) => {
    const api: VehiclesApiFilters = {};

    const sanitizeIds = (arr: string[]): string[] =>
      arr
        .map((v) => Number.parseInt(v, 10))
        .filter((n) => Number.isInteger(n))
        .map(String);

    const addArrayOrString = (
      key: keyof VehiclesApiFilters,
      val: unknown,
      sanitize?: boolean,
    ) => {
      const arr = toArray(val);
      const safeArr = sanitize ? sanitizeIds(arr) : arr;
      if (!safeArr.length) return;
      api[key] = safeArr.length === 1 ? safeArr[0] : safeArr;
    };

    if (typeof vals.q === 'string' && vals.q.trim()) {
      api.q = vals.q.trim();
    }
    if (typeof vals.model_year === 'string' && vals.model_year.trim()) {
      api.model_year = vals.model_year.trim();
    }

    const owner = vals.owner_id as AsyncSelectOption | null;
    const driver = vals.driver_id as AsyncSelectOption | null;

    if (owner?.value) api.owner_id = owner.value;
    if (driver?.value) api.driver_id = driver.value;

    addArrayOrString('status', vals.status);
    addArrayOrString('brand_id', vals.brand_id, true);
    addArrayOrString('vehicle_class_id', vals.vehicle_class_id, true);
    addArrayOrString('body_type_id', vals.body_type_id, true);

    return api;
  }, []);

  // 6. Action Handlers
  const buildAppliedFiltersDisplay = React.useCallback(
    (vals: FiltersSectionValues): Record<string, string> => {
      const display: Record<string, string> = {};

      vehicleFilterFields.forEach((field) => {
        const value = vals[field.id];

        if (field.type === 'async-select') {
          const option = (value && typeof value === 'object' ? value : null) as AsyncSelectOption | null;
          if (!option) return;
          const labelValue = option.code ? `${option.label} (${option.code})` : option.label;
          display[field.id] = `${field.label}: ${labelValue}`;
          return;
        }

        if (field.type === 'multi-select') {
          const valuesArray = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value.split(',').map((v) => v.trim()).filter(Boolean)
              : [];
          valuesArray.forEach((val, idx) => {
            const match = field.options.find((opt) => opt.value === val);
            const labelValue = match?.label ?? val;
            const key = valuesArray.length > 1 ? `${field.id}::${idx}` : field.id;
            display[key] = `${field.label}: ${labelValue}`;
          });
          return;
        }

        const raw = typeof value === 'string' ? value.trim() : '';
        if (!raw) return;

        if (field.type === 'select') {
          const match = field.options.find((opt) => opt.value === raw);
          const labelValue = match?.label ?? raw;
          display[field.id] = `${field.label}: ${labelValue}`;
          return;
        }

        if (field.type === 'text' || field.type === 'search' || field.type === 'custom') {
          display[field.id] = `${field.label}: ${raw}`;
        }
      });

      return display;
    },
    [vehicleFilterFields],
  );

  const applyFilters = React.useCallback((nextValues: FiltersSectionValues) => {
    if (catalogsStatus === 'failed') return;

    setIsApplying(true);
    setFilterValues(nextValues);
    setAppliedFilters(nextValues);
    onResetPage();

    const apiFilters = buildApiFilters(nextValues);
    const count = Object.keys(apiFilters).length;
    const display = buildAppliedFiltersDisplay(nextValues);

    onFiltersAppliedChange?.(count);
    onAppliedFiltersChange?.(nextValues);
    onAppliedFiltersDisplayChange?.(display);
    const query = filtersToQueryString(nextValues, FILTER_QUERY_SPEC);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    Object.keys(FILTER_QUERY_SPEC).forEach((k) => params.delete(k));
    if (query) {
      new URLSearchParams(query).forEach((val, key) => params.set(key, val));
    }
    replaceUrlQuery(params.toString());
  }, [buildApiFilters, buildAppliedFiltersDisplay, catalogsStatus, onAppliedFiltersChange, onAppliedFiltersDisplayChange, onFiltersAppliedChange, onResetPage]);

  React.useEffect(() => {
    applyFiltersRef.current = applyFilters;
  }, [applyFilters]);

  const handleApplyFilters = () => applyFilters(filterValues);

  const handleClearFilters = () => {
    applyFilters({ ...INITIAL_VALUES });
  };

  // 7. Effect: Fetch data when applied filters or page changes
  React.useEffect(() => {
    if (!tenantSlug) return;
    if (hasAiQuestionParam) return;

    const filters = buildApiFilters(appliedFilters);
    const hasFilters = Object.keys(filters).length > 0;

    const promise = dispatch(
      fetchVehicles({
        tenantSlug,
        params: {
          page: { number: page + 1, size: rowsPerPage },
          ...(hasFilters ? { filters } : {}),
        },
      }),
    );

    // Handle loading state locally for the "Applying..." feedback
    promise.finally(() => setIsApplying(false));

    // Cleanup not strictly necessary for this thunk unless it supports abortion, 
    // but good practice if needed.
  }, [dispatch, tenantSlug, page, rowsPerPage, appliedFilters, buildApiFilters, hasAiQuestionParam]);

  const clearValueForField = React.useCallback(
    (fieldId: string): FiltersSectionValue => {
      const field = vehicleFilterFields.find((f) => f.id === fieldId);
      if (!field) return '';

      if (field.type === 'async-select') return null;
      if (field.type === 'multi-select') return [];
      return '';
    },
    [vehicleFilterFields],
  );

  const handleRemoveFilter = React.useCallback(
    (fieldId: string) => {
      const [baseId, idxRaw] = fieldId.split('::');
      if (idxRaw && Array.isArray(filterValues[baseId])) {
        const idx = Number(idxRaw);
        const current = Array.isArray(filterValues[baseId]) ? [...(filterValues[baseId] as string[])] : [];
        if (!Number.isNaN(idx)) {
          current.splice(idx, 1);
          const nextValues = { ...filterValues, [baseId]: current };
          applyFilters(nextValues);
          return;
        }
      }

      const nextValues = { ...filterValues, [fieldId]: clearValueForField(fieldId) };
      applyFilters(nextValues);
    },
    [applyFilters, clearValueForField, filterValues],
  );

  React.useEffect(() => {
    applyFiltersRef.current = applyFilters;
  }, [applyFilters]);

  React.useEffect(() => {
    if (didHydrateFromQuery.current) return;
    didHydrateFromQuery.current = true;
    const hasQueryFilters = filtersToQueryString(parsedFromQuery, FILTER_QUERY_SPEC).length > 0;
    if (hasQueryFilters) {
      if (catalogsStatus !== 'succeeded') {
        needsLabelHydrationRef.current = true;
      }
      applyFiltersRef.current?.(parsedFromQuery);
      return;
    }
    setFilterValues(parsedFromQuery);
    setAppliedFilters(parsedFromQuery);
  }, [catalogsStatus, parsedFromQuery]);

  React.useEffect(() => {
    if (!needsLabelHydrationRef.current) return;
    if (catalogsStatus !== 'succeeded') return;
    if (!applyFiltersRef.current) return;
    if (!appliedFilters || Object.keys(appliedFilters).length === 0) {
      needsLabelHydrationRef.current = false;
      return;
    }
    applyFiltersRef.current(appliedFilters);
    needsLabelHydrationRef.current = false;
  }, [appliedFilters, catalogsStatus]);

  React.useImperativeHandle(ref, () => ({
    removeFilter: handleRemoveFilter,
    clearAllFilters: handleClearFilters,
  }));

  return (
    <>
      {catalogsStatus === 'failed' && (
        <Box mb={2}>
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={retryCatalogs}>
                Reintentar
              </Button>
            }
          >
            No se pudieron cargar los catálogos para filtros.
            {catalogsError?.message && ` (${catalogsError.message})`}
          </Alert>
        </Box>
      )}

      <FiltersSection
        title="Filtros"
        fields={vehicleFilterFields}
        values={filterValues}
        onFieldChange={handleFilterChange}
        columns={3}
        onClear={handleClearFilters}
        onApply={handleApplyFilters}
        clearLabel="Restablecer"
        applyLabel="Aplicar"
        isApplying={isApplying}
        collapsedRows={1}
        enableRowToggle
      />
    </>
  );

});

VehiclesFilters.displayName = 'VehiclesFilters';

export default VehiclesFilters;
