import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import VehiclesFilters, { VehiclesFiltersHandle } from '@/components/vehicles/VehiclesFilters';

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

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchSpy,
  useAppSelector: () => undefined,
}));

vi.mock('@/store/slices/vehiclesSlice', () => ({
  fetchVehicles: vi.fn(),
}));

vi.mock('@/components/vehicles/Vehicles.hooks', () => ({
  useVehiclesCatalogs: () => catalogsStateRef.current,
}));

type RenderResult = {
  onResetPage: ReturnType<typeof vi.fn>;
  onFiltersAppliedChange: ReturnType<typeof vi.fn>;
  onAppliedFiltersChange: ReturnType<typeof vi.fn>;
  onAppliedFiltersDisplayChange: ReturnType<typeof vi.fn>;
  ref: { current: VehiclesFiltersHandle | null };
};

const renderFilters = (): RenderResult => {
  const onResetPage = vi.fn();
  const onFiltersAppliedChange = vi.fn();
  const onAppliedFiltersChange = vi.fn();
  const onAppliedFiltersDisplayChange = vi.fn();
  const ref = { current: null as VehiclesFiltersHandle | null };
  const element = (
    <ThemeProvider theme={theme}>
      <VehiclesFilters
        ref={(instance) => {
          ref.current = instance;
        }}
        tenantSlug="tenant"
        page={0}
        rowsPerPage={10}
        onResetPage={onResetPage}
        onFiltersAppliedChange={onFiltersAppliedChange}
        onAppliedFiltersChange={onAppliedFiltersChange}
        onAppliedFiltersDisplayChange={onAppliedFiltersDisplayChange}
      />
    </ThemeProvider>
  );
  render(element);
  return {
    onResetPage,
    onFiltersAppliedChange,
    onAppliedFiltersChange,
    onAppliedFiltersDisplayChange,
    ref,
  };
};

describe('VehiclesFilters display mapping', () => {
  beforeEach(() => {
    dispatchSpy.mockClear();
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

  it('builds display labels and emits callbacks on apply', async () => {
    const user = userEvent.setup();
    const { onFiltersAppliedChange, onAppliedFiltersDisplayChange } = renderFilters();
    await user.click(screen.getByTestId('filters-section-toggle'));
    const statusSelect = document.getElementById('status');
    if (!statusSelect) throw new Error('Status select not found');
    await user.click(statusSelect);
    await user.click(screen.getByRole('option', { name: 'Activo' }));
    const yearInput = screen.getByPlaceholderText('Ej: 2022');
    await user.type(yearInput, '2024');
    await user.click(screen.getByRole('button', { name: /aplicar/i }));
    await waitFor(() => expect(onFiltersAppliedChange).toHaveBeenCalledWith(2));
    expect(onAppliedFiltersDisplayChange).toHaveBeenCalledWith({
      status: 'Estado: Activo',
      model_year: 'Año Modelo: 2024',
    });
  });

  it('clears all filters via imperative handle and emits empty display', async () => {
    const user = userEvent.setup();
    const { ref, onAppliedFiltersDisplayChange } = renderFilters();
    await user.click(screen.getByTestId('filters-section-toggle'));
    const statusSelect = document.getElementById('status');
    if (!statusSelect) throw new Error('Status select not found');
    await user.click(statusSelect);
    await user.click(screen.getByRole('option', { name: 'Inactivo' }));
    await user.click(screen.getByRole('button', { name: /aplicar/i }));
    await waitFor(() =>
      expect(onAppliedFiltersDisplayChange).toHaveBeenLastCalledWith({
        status: 'Estado: Inactivo',
      }),
    );
    await act(async () => {
      ref.current?.clearAllFilters();
    });
    await waitFor(() => expect(onAppliedFiltersDisplayChange).toHaveBeenLastCalledWith({}));
  });

  it('removes a single filter via imperative handle', async () => {
    const user = userEvent.setup();
    const { ref, onAppliedFiltersDisplayChange } = renderFilters();
    await user.click(screen.getByTestId('filters-section-toggle'));
    const statusSelect = document.getElementById('status');
    if (!statusSelect) throw new Error('Status select not found');
    await user.click(statusSelect);
    await user.click(screen.getByRole('option', { name: 'Inactivo' }));
    await user.click(screen.getByRole('button', { name: /aplicar/i }));
    await waitFor(() =>
      expect(onAppliedFiltersDisplayChange).toHaveBeenLastCalledWith({
        status: 'Estado: Inactivo',
      }),
    );
    await act(async () => {
      ref.current?.removeFilter('status');
    });
    await waitFor(() => expect(onAppliedFiltersDisplayChange).toHaveBeenLastCalledWith({}));
  });
});
