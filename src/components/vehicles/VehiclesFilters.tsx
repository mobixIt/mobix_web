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
import { useVehiclesCatalogs } from './Vehicles.hooks';

import { useAppDispatch } from '@/store/hooks';
import { fetchVehicles } from '@/store/slices/vehiclesSlice';

// --- Types ---

type VehiclesFiltersProps = {
  tenantSlug: string | null;
  page: number;
  rowsPerPage: number;
  onResetPage: () => void;
  onFiltersAppliedChange?: (count: number) => void;
};

type VehiclesApiFilters = Partial<{
  q: string;
  status: string;
  model_year: string;
  owner_id: string;
  driver_id: string;
  brand_id: string;
  vehicle_class_id: string;
  body_type_id: string;
}>;

// --- Helpers ---

const normalizeStr = (x: unknown): string => String(x ?? '').trim();
const toLowerSafe = (x: unknown): string => normalizeStr(x).toLowerCase();

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

export default function VehiclesFilters({
  tenantSlug,
  page,
  rowsPerPage,
  onResetPage,
  onFiltersAppliedChange,
}: VehiclesFiltersProps) {
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
      type: 'select',
      colSpan: 1,
      placeholder: 'Todos',
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'Borrador', value: 'draft' },
      ],
    },
    {
      id: 'brand_id',
      label: 'Marca',
      type: 'select',
      colSpan: 1,
      placeholder: 'Todas',
      options: brandOptions,
      disabled: isCatalogsLoading || !hasCatalogs,
      loading: isCatalogsLoading,
    },
    {
      id: 'vehicle_class_id',
      label: 'Clase',
      type: 'select',
      colSpan: 1,
      placeholder: 'Todas',
      options: vehicleClassOptions,
      disabled: isCatalogsLoading || !hasCatalogs,
      loading: isCatalogsLoading,
    },
    {
      id: 'body_type_id',
      label: 'Carrocería',
      type: 'select',
      colSpan: 1,
      placeholder: 'Todas',
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

  // 4. State Management
  const initialValues: FiltersSectionValues = {
    q: '',
    status: '',
    brand_id: '',
    vehicle_class_id: '',
    body_type_id: '',
    model_year: '',
    owner_id: null,
    driver_id: null,
  };

  const [filterValues, setFilterValues] = React.useState<FiltersSectionValues>(initialValues);
  const [appliedFilters, setAppliedFilters] = React.useState<FiltersSectionValues>({});

  const handleFilterChange = (fieldId: string, value: FiltersSectionValue) => {
    setFilterValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  // 5. Logic to build API query params
  const buildApiFilters = React.useCallback((vals: FiltersSectionValues) => {
    const api: VehiclesApiFilters = {};

    const addIfPresent = (key: keyof VehiclesApiFilters, value: unknown) => {
      if (typeof value === 'string' && value.trim()) {
        api[key] = value.trim();
      }
    };

    addIfPresent('q', vals.q);
    addIfPresent('status', vals.status);
    addIfPresent('model_year', vals.model_year);
    addIfPresent('brand_id', vals.brand_id);
    addIfPresent('vehicle_class_id', vals.vehicle_class_id);
    addIfPresent('body_type_id', vals.body_type_id);

    // Handle async-select objects
    const owner = vals.owner_id as AsyncSelectOption | null;
    const driver = vals.driver_id as AsyncSelectOption | null;

    if (owner?.value) api.owner_id = owner.value;
    if (driver?.value) api.driver_id = driver.value;

    return api;
  }, []);

  // 6. Action Handlers
  const handleApplyFilters = () => {
    if (catalogsStatus === 'failed') return;

    setIsApplying(true);
    setAppliedFilters(filterValues);
    onResetPage();
    
    const count = Object.keys(buildApiFilters(filterValues)).length;
    onFiltersAppliedChange?.(count);
  };

  const handleClearFilters = () => {
    setFilterValues(initialValues);
    setAppliedFilters({});
    onResetPage();
    onFiltersAppliedChange?.(0);
  };

  // 7. Effect: Fetch data when applied filters or page changes
  React.useEffect(() => {
    if (!tenantSlug) return;

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
  }, [dispatch, tenantSlug, page, rowsPerPage, appliedFilters, buildApiFilters]);

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
}