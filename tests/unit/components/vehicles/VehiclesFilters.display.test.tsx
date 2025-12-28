import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import VehiclesFilters, { VehiclesFiltersHandle } from '@/components/vehicles/VehiclesFilters';

type CatalogOption = { id: number; label: string; code: string | null };
type CatalogState = {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: { message?: string } | null;
  hasCatalogs: boolean;
  ownersRaw: CatalogOption[];
  driversRaw: CatalogOption[];
  brandOptions: Array<{ label: string; value: string }>;
  vehicleClassOptions: Array<{ label: string; value: string }>;
  bodyTypeOptions: Array<{ label: string; value: string }>;
  retry: () => void;
};

const dispatchSpy = vi.fn(() => Promise.resolve());
const catalogsStateRef: { current: CatalogState } = {
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

const renderFilters = () => {
  const onResetPage = vi.fn();
  const onFiltersAppliedChange = vi.fn();
  const onAppliedFiltersChange = vi.fn();
  const onAppliedFiltersDisplayChange = vi.fn();
  const ref: { current: VehiclesFiltersHandle | null } = { current: null };
  render(
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
    </ThemeProvider>,
  );
  return { onFiltersAppliedChange, onAppliedFiltersDisplayChange, ref };
};

describe('VehiclesFilters display mapping', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
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

  it('emits descriptive labels when applying filters', async () => {
    const user = userEvent.setup();
    const { onFiltersAppliedChange, onAppliedFiltersDisplayChange } = renderFilters();
    await user.click(screen.getByTestId('filters-section-toggle'));
    const statusSelect = document.getElementById('status');
    expect(statusSelect).not.toBeNull();
    await user.click(statusSelect as HTMLElement);
    await user.click(screen.getByRole('option', { name: 'Activo' }));
    await user.click(screen.getByRole('button', { name: /listo/i }));
    const yearInput = screen.getByPlaceholderText('Ej: 2022');
    await user.type(yearInput, '2024');
    await user.click(screen.getByRole('button', { name: /aplicar/i }));
    await waitFor(() => expect(onFiltersAppliedChange).toHaveBeenCalledWith(2));
    expect(onAppliedFiltersDisplayChange).toHaveBeenCalledWith({
      status: 'Estado: Activo',
      model_year: 'Año Modelo: 2024',
    });
  });

  it('clears filters with the imperative handle and emits empty display', async () => {
    const user = userEvent.setup();
    const { ref, onAppliedFiltersDisplayChange } = renderFilters();
    await user.click(screen.getByTestId('filters-section-toggle'));
    const statusSelect = document.getElementById('status');
    expect(statusSelect).not.toBeNull();
    await user.click(statusSelect as HTMLElement);
    await user.click(screen.getByRole('option', { name: 'Inactivo' }));
    await user.click(screen.getByRole('button', { name: /listo/i }));
    await user.click(screen.getByRole('button', { name: /aplicar/i }));
    await waitFor(() => {
      const lastCall = onAppliedFiltersDisplayChange.mock.calls.at(-1)?.[0] as Record<string, string>;
      expect(Object.values(lastCall)).toContain('Estado: Inactivo');
    });
    await act(async () => {
      ref.current?.clearAllFilters();
    });
    await waitFor(() => expect(onAppliedFiltersDisplayChange).toHaveBeenLastCalledWith({}));
  });

  it('removes a single filter with the imperative handle', async () => {
    const user = userEvent.setup();
    const { ref, onAppliedFiltersDisplayChange } = renderFilters();
    await user.click(screen.getByTestId('filters-section-toggle'));
    const statusSelect = document.getElementById('status');
    expect(statusSelect).not.toBeNull();
    await user.click(statusSelect as HTMLElement);
    await user.click(screen.getByRole('option', { name: 'Inactivo' }));
    await user.click(screen.getByRole('button', { name: /listo/i }));
    await user.click(screen.getByRole('button', { name: /aplicar/i }));
    await waitFor(() => {
      const lastCall = onAppliedFiltersDisplayChange.mock.calls.at(-1)?.[0] as Record<string, string>;
      expect(Object.values(lastCall)).toContain('Estado: Inactivo');
    });
    await act(async () => {
      ref.current?.removeFilter('status');
    });
    await waitFor(() => expect(onAppliedFiltersDisplayChange).toHaveBeenLastCalledWith({}));
  });
});
