import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act, screen } from '@testing-library/react';

import VehiclesFilters from '@/components/vehicles/VehiclesFilters';
import type {
  FiltersSectionValues,
  FiltersSectionValue,
  AsyncSelectOption,
} from '@/components/layout/filters/FiltersSection.types';

type VehiclesFiltersProps = React.ComponentProps<typeof VehiclesFilters>;

type FiltersSectionProps = {
  title: string;
  fields: unknown[];
  values: FiltersSectionValues;
  onFieldChange: (fieldId: string, value: FiltersSectionValue) => void;
  columns: number;
  onClear: () => void;
  onApply: () => void;
  clearLabel: string;
  applyLabel: string;
  isApplying: boolean;
  collapsedRows: number;
  enableRowToggle: boolean;
};

type FetchVehiclesArgs = {
  tenantSlug: string;
  params: {
    page: { number: number; size: number };
    filters?: Record<string, string>;
  };
};

type CatalogsHookState = {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: { message?: string } | null;
  hasCatalogs: boolean;
  ownersRaw: Array<{ id: number; label: string; code: string | null }>;
  driversRaw: Array<{ id: number; label: string; code: string | null }>;
  brandOptions: Array<{ label: string; value: string }>;
  vehicleClassOptions: Array<{ label: string; value: string }>;
  bodyTypeOptions: Array<{ label: string; value: string }>;
  retry: () => void;
};

const dispatchSpy = vi.fn(() => Promise.resolve());

const fetchVehiclesSpy = vi.fn((args: FetchVehiclesArgs) => ({
  type: 'vehicles/fetchVehicles',
  payload: args,
}));

const catalogsStateRef: { current: CatalogsHookState } = {
  current: {
    status: 'succeeded',
    error: null,
    hasCatalogs: true,
    ownersRaw: [],
    driversRaw: [],
    brandOptions: [],
    vehicleClassOptions: [],
    bodyTypeOptions: [],
    retry: vi.fn(),
  },
};

const captureFiltersSectionProps = vi.fn<(props: FiltersSectionProps) => void>();

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchSpy,
}));

vi.mock('@/store/slices/vehiclesSlice', () => ({
  fetchVehicles: (args: FetchVehiclesArgs) => fetchVehiclesSpy(args),
}));

vi.mock('@/components/vehicles/Vehicles.hooks', () => ({
  useVehiclesCatalogs: () => catalogsStateRef.current,
}));

vi.mock('@/components/layout/filters/FiltersSection', () => {
  const MockedFiltersSection: React.FC<FiltersSectionProps> = (props) => {
    captureFiltersSectionProps(props);
    return <div data-testid="filters-section-mock" />;
  };

  return {
    __esModule: true,
    default: MockedFiltersSection,
  };
});

function renderVehiclesFilters(
  overrideProps: Partial<VehiclesFiltersProps> = {},
) {
  const onResetPage = vi.fn();
  const onFiltersAppliedChange = vi.fn();

  const props: VehiclesFiltersProps = {
    tenantSlug: 'coolitoral',
    page: 0,
    rowsPerPage: 10,
    onResetPage,
    onFiltersAppliedChange,
    ...overrideProps,
  };

  render(<VehiclesFilters {...props} />);

  return { props, onResetPage, onFiltersAppliedChange };
}

function lastFiltersSectionProps(): FiltersSectionProps {
  const calls = captureFiltersSectionProps.mock.calls;
  if (calls.length === 0) throw new Error('FiltersSection was not rendered');
  return calls[calls.length - 1]?.[0] as FiltersSectionProps;
}

function lastFetchVehiclesArgs(): FetchVehiclesArgs {
  const calls = fetchVehiclesSpy.mock.calls;
  if (calls.length === 0) throw new Error('fetchVehicles was not called');
  return calls[calls.length - 1]?.[0] as FetchVehiclesArgs;
}

async function waitForFiltersValues(
  predicate: (values: FiltersSectionValues) => boolean,
) {
  await waitFor(() => {
    expect(predicate(lastFiltersSectionProps().values)).toBe(true);
  });
}

describe('VehiclesFilters', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    vi.clearAllMocks();

    dispatchSpy.mockImplementation(() => Promise.resolve());

    catalogsStateRef.current = {
      status: 'succeeded',
      error: null,
      hasCatalogs: true,
      ownersRaw: [],
      driversRaw: [],
      brandOptions: [],
      vehicleClassOptions: [],
      bodyTypeOptions: [],
      retry: vi.fn(),
    };
  });

  it('dispatches fetchVehicles on mount with page params and without filters when appliedFilters are empty', async () => {
    renderVehiclesFilters({ page: 2, rowsPerPage: 25 });

    await waitFor(() => {
      expect(fetchVehiclesSpy).toHaveBeenCalled();
    });

    const args = lastFetchVehiclesArgs();

    expect(args.tenantSlug).toBe('coolitoral');
    expect(args.params.page).toEqual({ number: 3, size: 25 });
    expect(args.params.filters).toBeUndefined();
  });

  it('applies normalized filters, resets page, reports applied filters count, and dispatches request including filters', async () => {
    const { onResetPage, onFiltersAppliedChange } = renderVehiclesFilters({
      page: 2,
      rowsPerPage: 25,
    });

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    const owner: AsyncSelectOption = { label: 'Ana Rodríguez', value: '201' };
    const driver: AsyncSelectOption = { label: 'Juan Pérez', value: '101' };

    await act(async () => {
      const props = lastFiltersSectionProps();
      props.onFieldChange('q', '   ABC-123   ');
      props.onFieldChange('status', 'active');
      props.onFieldChange('model_year', '  2022 ');
      props.onFieldChange('brand_id', '10');
      props.onFieldChange('vehicle_class_id', '20');
      props.onFieldChange('body_type_id', '30');
      props.onFieldChange('owner_id', owner);
      props.onFieldChange('driver_id', driver);
    });

    await waitForFiltersValues((values) => values.q === '   ABC-123   ');

    await act(async () => {
      lastFiltersSectionProps().onApply();
    });

    expect(onResetPage).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(onFiltersAppliedChange).toHaveBeenCalledWith(8);
    });

    await waitFor(() => {
      const args = lastFetchVehiclesArgs();

      expect(args.tenantSlug).toBe('coolitoral');
      expect(args.params.page).toEqual({ number: 3, size: 25 });

      expect(args.params.filters).toEqual({
        q: 'ABC-123',
        status: 'active',
        model_year: '2022',
        brand_id: '10',
        vehicle_class_id: '20',
        body_type_id: '30',
        owner_id: '201',
        driver_id: '101',
      });
    });
  });

  it('clears filters, resets page, reports zero applied filters, and dispatches request without filters', async () => {
    const { onResetPage, onFiltersAppliedChange } = renderVehiclesFilters({
      page: 0,
      rowsPerPage: 10,
    });

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    await act(async () => {
      const props = lastFiltersSectionProps();
      props.onFieldChange('q', 'BUS-999');
      props.onFieldChange('status', 'inactive');
    });

    await waitForFiltersValues((values) => values.q === 'BUS-999');

    await act(async () => {
      lastFiltersSectionProps().onApply();
    });

    await waitFor(() => {
      expect(onFiltersAppliedChange).toHaveBeenCalled();
    });

    await act(async () => {
      lastFiltersSectionProps().onClear();
    });

    expect(onResetPage).toHaveBeenCalled();

    await waitFor(() => {
      expect(onFiltersAppliedChange).toHaveBeenCalledWith(0);
    });

    await waitFor(() => {
      const args = lastFetchVehiclesArgs();

      expect(args.tenantSlug).toBe('coolitoral');
      expect(args.params.page).toEqual({ number: 1, size: 10 });
      expect(args.params.filters).toBeUndefined();
    });
  });

  it('ignores invalid async-select runtime values and omits owner_id and driver_id from filters', async () => {
    renderVehiclesFilters({ page: 0, rowsPerPage: 10 });

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    await act(async () => {
      const props = lastFiltersSectionProps();
      props.onFieldChange('owner_id', '201');
      props.onFieldChange('driver_id', '101');
      props.onFieldChange('q', 'X');
      props.onFieldChange('model_year', '2022');
    });

    await waitForFiltersValues((values) => values.q === 'X');

    await act(async () => {
      lastFiltersSectionProps().onApply();
    });

    await waitFor(() => {
      const args = lastFetchVehiclesArgs();
      expect(args.params.filters).toEqual({ q: 'X', model_year: '2022' });
    });
  });

  it('blocks apply and avoids reporting filters when catalogsStatus is failed', async () => {
    const { onResetPage, onFiltersAppliedChange } = renderVehiclesFilters();

    catalogsStateRef.current = {
      ...catalogsStateRef.current,
      status: 'failed',
      error: { message: 'boom' },
      retry: vi.fn(),
    };

    await act(async () => {
      renderVehiclesFilters();
    });

    await waitFor(() => {
      expect(screen.getAllByText(/No se pudieron cargar los catálogos para filtros/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/\(boom\)/i).length).toBeGreaterThan(0);
    });

    fetchVehiclesSpy.mockClear();

    await act(async () => {
      lastFiltersSectionProps().onApply();
    });

    expect(onResetPage).toHaveBeenCalledTimes(0);
    expect(onFiltersAppliedChange).toHaveBeenCalledTimes(0);
  });

  it('calls retryCatalogs when clicking reintentar in the warning alert', async () => {
    const retry = vi.fn();
    catalogsStateRef.current = {
      ...catalogsStateRef.current,
      status: 'failed',
      error: { message: 'boom' },
      retry,
    };

    renderVehiclesFilters();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByRole('button', { name: /Reintentar/i }).click();
    });

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('sets isApplying true on apply and eventually sets it back to false after dispatch promise settles', async () => {
    let resolveDispatch: () => void;
    const dispatchPromise = new Promise<void>((resolve) => {
      resolveDispatch = resolve;
    });

    dispatchSpy.mockReturnValue(dispatchPromise);

    render(
      <VehiclesFilters
        tenantSlug="coolitoral"
        page={0}
        rowsPerPage={10}
        onResetPage={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    await act(async () => {
      const props = lastFiltersSectionProps();
      props.onFieldChange('q', 'ABC');
      props.onApply();
    });

    await waitFor(() => {
      expect(lastFiltersSectionProps().isApplying).toBe(true);
    });

    await act(async () => {
      if (resolveDispatch) resolveDispatch();
      await dispatchPromise; 
    });

    await waitFor(() => {
      expect(lastFiltersSectionProps().isApplying).toBe(false);
    });
  });

  it('does not dispatch when tenantSlug is null', async () => {
    renderVehiclesFilters({ tenantSlug: null });

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    expect(fetchVehiclesSpy).toHaveBeenCalledTimes(0);
    expect(dispatchSpy).toHaveBeenCalledTimes(0);
  });

  it('preserves ai_question query param when applying filters', async () => {
    window.history.replaceState({}, '', '/vehicles?ai_question=buse%20activa');

    renderVehiclesFilters();
    const props = lastFiltersSectionProps();

    await act(async () => {
      props.onFieldChange('status', ['active']);
    });

    await waitFor(() => {
      const current = lastFiltersSectionProps().values.status as string[];
      expect(current).toEqual(['active']);
    });

    await act(async () => {
      lastFiltersSectionProps().onApply();
    });

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get('ai_question')).toBe('buse activa');
      expect(params.get('status')).toBe('active');
    });
  });

  it('keeps ai_question in url when clearing filters', async () => {
    window.history.replaceState({}, '', '/vehicles?ai_question=buses');

    renderVehiclesFilters();
    const props = lastFiltersSectionProps();

    await act(async () => {
      props.onFieldChange('status', ['inactive']);
    });

    await waitFor(() => {
      const current = lastFiltersSectionProps().values.status as string[];
      expect(current).toEqual(['inactive']);
    });

    await act(async () => {
      lastFiltersSectionProps().onApply();
    });

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get('status')).toBe('inactive');
    });

    await act(async () => {
      lastFiltersSectionProps().onClear();
    });

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get('ai_question')).toBe('buses');
      expect(params.get('status')).toBeNull();
    });
  });
});
