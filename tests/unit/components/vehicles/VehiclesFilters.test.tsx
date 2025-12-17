import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';

import VehiclesFilters from '@/components/vehicles/VehiclesFilters';

import type {
  FiltersSectionValues,
  FiltersSectionValue,
  AsyncSelectOption,
} from '@/components/layout/filters/FiltersSection';

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

const dispatchSpy = vi.fn();

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchSpy,
}));

const fetchVehiclesSpy = vi.fn((args: FetchVehiclesArgs) => ({
  type: 'vehicles/fetchVehicles',
  payload: args,
}));

vi.mock('@/store/slices/vehiclesSlice', () => ({
  fetchVehicles: (args: FetchVehiclesArgs) => fetchVehiclesSpy(args),
}));

const captureFiltersSectionProps = vi.fn<(props: FiltersSectionProps) => void>();

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

function getLastFiltersSectionProps(): FiltersSectionProps {
  const calls = captureFiltersSectionProps.mock.calls;
  if (calls.length === 0) throw new Error('FiltersSection was not rendered');
  return calls[calls.length - 1][0];
}

function lastDispatchedFetchVehiclesArgs(): FetchVehiclesArgs {
  const lastCall = fetchVehiclesSpy.mock.calls.at(-1);
  if (!lastCall) throw new Error('fetchVehicles was not called');
  return lastCall[0] as FetchVehiclesArgs;
}

async function waitForFiltersValues(predicate: (values: FiltersSectionValues) => boolean) {
  await waitFor(() => {
    expect(predicate(getLastFiltersSectionProps().values)).toBe(true);
  });
}

describe('VehiclesFilters', () => {
  beforeEach(() => {
    dispatchSpy.mockClear();
    fetchVehiclesSpy.mockClear();
    captureFiltersSectionProps.mockClear();
  });

  it('applies normalized filters, resets page, updates applied filters count, and dispatches request including filters', async () => {
    const onResetPage = vi.fn();
    const onFiltersAppliedChange = vi.fn();

    render(
      <VehiclesFilters
        tenantSlug="coolitoral"
        page={2}
        rowsPerPage={25}
        onResetPage={onResetPage}
        onFiltersAppliedChange={onFiltersAppliedChange}
      />,
    );

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    const owner: AsyncSelectOption = { label: 'Ana Rodríguez (Propietario)', value: '201' };
    const driver: AsyncSelectOption = { label: 'Juan Pérez (Conductor)', value: '101' };

    await act(async () => {
      const props = getLastFiltersSectionProps();
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
      getLastFiltersSectionProps().onApply();
    });

    expect(onResetPage).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(onFiltersAppliedChange).toHaveBeenCalledWith(8);
    });

    await waitFor(() => {
      const args = lastDispatchedFetchVehiclesArgs();
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

  it('clears filters, resets page, updates applied filters count to zero, and dispatches request without filters', async () => {
    const onResetPage = vi.fn();
    const onFiltersAppliedChange = vi.fn();

    render(
      <VehiclesFilters
        tenantSlug="coolitoral"
        page={0}
        rowsPerPage={10}
        onResetPage={onResetPage}
        onFiltersAppliedChange={onFiltersAppliedChange}
      />,
    );

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    await act(async () => {
      const props = getLastFiltersSectionProps();
      props.onFieldChange('q', 'BUS-999');
      props.onFieldChange('status', 'inactive');
    });

    await waitForFiltersValues((values) => values.q === 'BUS-999' && values.status === 'inactive');

    await act(async () => {
      getLastFiltersSectionProps().onApply();
    });

    await waitFor(() => {
      expect(onFiltersAppliedChange).toHaveBeenCalledWith(2);
    });

    await act(async () => {
      getLastFiltersSectionProps().onClear();
    });

    await waitFor(() => {
      expect(onFiltersAppliedChange).toHaveBeenCalledWith(0);
    });

    await waitFor(() => {
      const args = lastDispatchedFetchVehiclesArgs();
      expect(args.tenantSlug).toBe('coolitoral');
      expect(args.params.page).toEqual({ number: 1, size: 10 });
      expect(args.params.filters).toBeUndefined();
    });
  });

  it('ignores invalid async-select values and does not include owner_id/driver_id in filters when not an option object', async () => {
    const onResetPage = vi.fn();
    const onFiltersAppliedChange = vi.fn();

    render(
      <VehiclesFilters
        tenantSlug="coolitoral"
        page={0}
        rowsPerPage={10}
        onResetPage={onResetPage}
        onFiltersAppliedChange={onFiltersAppliedChange}
      />,
    );

    await waitFor(() => {
      expect(captureFiltersSectionProps).toHaveBeenCalled();
    });

    await act(async () => {
      const props = getLastFiltersSectionProps();
      props.onFieldChange('owner_id', '201');
      props.onFieldChange('driver_id', '101');
      props.onFieldChange('q', 'X');
    });

    await waitForFiltersValues((values) => values.q === 'X');

    await act(async () => {
      getLastFiltersSectionProps().onApply();
    });

    await waitFor(() => {
      const args = lastDispatchedFetchVehiclesArgs();
      expect(args.params.filters).toEqual({ q: 'X' });
    });
  });
});
