'use client';

import * as React from 'react';
import FiltersSection, {
  type FiltersSectionField,
  type FiltersSectionValue,
  type FiltersSectionValues,
  type AsyncSelectOption,
} from '@/components/layout/filters/FiltersSection';

import { useAppDispatch } from '@/store/hooks';
import { fetchVehicles } from '@/store/slices/vehiclesSlice';

type VehiclesFiltersProps = {
  tenantSlug: string | null;
  page: number;
  rowsPerPage: number;
  onResetPage: () => void;
  onFiltersAppliedChange?: (count: number) => void;
};

// TODO: reemplazar por datos reales (Concepts: brand / vehicle_class / body_type)
const BRAND_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Chevrolet', value: '10' },
  { label: 'Toyota', value: '11' },
];

const VEHICLE_CLASS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Bus', value: '20' },
  { label: 'Micro', value: '21' },
];

const BODY_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Urbano', value: '30' },
  { label: 'Intermunicipal', value: '31' },
];

const mockSearchPeople = async (
  role: 'owner' | 'driver',
  query: string,
): Promise<AsyncSelectOption[]> => {
  await new Promise((r) => setTimeout(r, 250));

  const q = query.toLowerCase();
  const seed =
    role === 'driver'
      ? [
          { label: 'Juan Pérez (Conductor)', value: '101' },
          { label: 'María Gómez (Conductor)', value: '102' },
          { label: 'Carlos Ruiz (Conductor)', value: '103' },
        ]
      : [
          { label: 'Ana Rodríguez (Propietario)', value: '201' },
          { label: 'Pedro Martínez (Propietario)', value: '202' },
          { label: 'Laura Díaz (Propietario)', value: '203' },
        ];

  return seed.filter((x) => x.label.toLowerCase().includes(q));
};

const vehicleFilterFields: FiltersSectionField[] = [
  {
    id: 'q',
    label: 'Buscar',
    type: 'search',
    colSpan: 2,
    placeholder: 'Buscar por placa, VIN o motor...',
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

  // Row 2 (primarios)
  {
    id: 'brand_id',
    label: 'Marca',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todas',
    options: BRAND_OPTIONS,
  },
  {
    id: 'vehicle_class_id',
    label: 'Clase',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todas',
    options: VEHICLE_CLASS_OPTIONS,
  },
  {
    id: 'body_type_id',
    label: 'Carrocería',
    type: 'select',
    colSpan: 1,
    placeholder: 'Todas',
    options: BODY_TYPE_OPTIONS,
  },

  // Avanzados (ocultos tras "Más filtros")
  {
    id: 'owner_id',
    label: 'Propietario',
    type: 'async-select',
    colSpan: 1,
    placeholder: 'Buscar propietario...',
    loadOptions: (input) => mockSearchPeople('owner', input),
    minCharsToSearch: 2,
    debounceMs: 300,
  },
  {
    id: 'driver_id',
    label: 'Conductor',
    type: 'async-select',
    colSpan: 1,
    placeholder: 'Buscar conductor...',
    loadOptions: (input) => mockSearchPeople('driver', input),
    minCharsToSearch: 2,
    debounceMs: 300,
  },
  {
    id: 'model_year',
    label: 'Año Modelo',
    type: 'text',
    colSpan: 1,
    placeholder: 'Ej: 2022',
  },
];

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

export default function VehiclesFilters({
  tenantSlug,
  page,
  rowsPerPage,
  onResetPage,
  onFiltersAppliedChange,
}: VehiclesFiltersProps) {
  const dispatch = useAppDispatch();

  const [filterValues, setFilterValues] = React.useState<FiltersSectionValues>({
    q: '',
    status: '',
    brand_id: '',
    vehicle_class_id: '',
    body_type_id: '',
    model_year: '',
    owner_id: null,
    driver_id: null,
  });

  const [appliedFilters, setAppliedFilters] = React.useState<FiltersSectionValues>({});

  const handleFilterChange = (fieldId: string, value: FiltersSectionValue) => {
    setFilterValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const buildApiFilters = React.useCallback((vals: FiltersSectionValues) => {
    const api: VehiclesApiFilters = {};

    const q = typeof vals.q === 'string' ? vals.q.trim() : '';
    const status = typeof vals.status === 'string' ? vals.status : '';
    const modelYear = typeof vals.model_year === 'string' ? vals.model_year.trim() : '';

    const brandId = typeof vals.brand_id === 'string' ? vals.brand_id : '';
    const vehicleClassId =
      typeof vals.vehicle_class_id === 'string' ? vals.vehicle_class_id : '';
    const bodyTypeId = typeof vals.body_type_id === 'string' ? vals.body_type_id : '';

    const owner = vals.owner_id && typeof vals.owner_id === 'object' ? vals.owner_id : null;
    const driver = vals.driver_id && typeof vals.driver_id === 'object' ? vals.driver_id : null;

    if (q) api.q = q;
    if (status) api.status = status;
    if (modelYear) api.model_year = modelYear;

    if (brandId) api.brand_id = brandId;
    if (vehicleClassId) api.vehicle_class_id = vehicleClassId;
    if (bodyTypeId) api.body_type_id = bodyTypeId;

    if (owner?.value) api.owner_id = owner.value;
    if (driver?.value) api.driver_id = driver.value;

    return api;
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters(filterValues);
    onResetPage();
    const apiFilters = buildApiFilters(filterValues);
    onFiltersAppliedChange?.(Object.keys(apiFilters).length);
  };

  const handleClearFilters = () => {
    setFilterValues({
      q: '',
      status: '',
      brand_id: '',
      vehicle_class_id: '',
      body_type_id: '',
      model_year: '',
      owner_id: null,
      driver_id: null,
    });
    setAppliedFilters({});
    onResetPage();
    onFiltersAppliedChange?.(0);
  };

  React.useEffect(() => {
    if (!tenantSlug) return;

    const filters = buildApiFilters(appliedFilters);

    void dispatch(
      fetchVehicles({
        tenantSlug,
        params: {
          page: { number: page + 1, size: rowsPerPage },
          ...(Object.keys(filters).length ? { filters } : {}),
        },
      }),
    );
  }, [dispatch, tenantSlug, page, rowsPerPage, appliedFilters, buildApiFilters]);

  return (
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
      collapsedRows={1}
      enableRowToggle
    />
  );
}