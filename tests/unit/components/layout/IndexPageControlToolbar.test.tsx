import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndexPageControlToolbar from '@/components/layout/index-page/IndexPageControlToolbar';

const renderToolbar = (
  overrides: Partial<React.ComponentProps<typeof IndexPageControlToolbar>> = {},
) => {
  const onToggleStats = vi.fn();
  const onToggleFilters = vi.fn();
  const onRemoveFilter = vi.fn();
  const onClearAllFilters = vi.fn();
  const element = (
    <IndexPageControlToolbar
      showStats
      showFilters
      showStatsToggle
      showFiltersToggle
      activeFiltersDisplay={{}}
      onToggleStats={onToggleStats}
      onToggleFilters={onToggleFilters}
      onRemoveFilter={onRemoveFilter}
      onClearAllFilters={onClearAllFilters}
      {...overrides}
    />
  );
  return { element, onToggleStats, onToggleFilters, onRemoveFilter, onClearAllFilters };
};

describe('IndexPageControlToolbar', () => {
  it('renders both toggle buttons', () => {
    const { element } = renderToolbar();
    render(element);
    expect(screen.getByRole('button', { name: /estadísticas/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /filtros/i })).toBeVisible();
  });

  it('does not render chips when activeFiltersDisplay is empty', () => {
    const { element } = renderToolbar({ activeFiltersDisplay: {} });
    render(element);
    expect(screen.queryByTestId('active-filters-chips')).toBeNull();
  });

  it('renders chips with default label when display entries exist', () => {
    const { element } = renderToolbar({
      activeFiltersDisplay: { status: 'Estado: Inactivo', year: 'Año: 2024' },
    });
    render(element);
    expect(screen.getByTestId('active-filters-chips')).toBeVisible();
    expect(screen.getByText('Filtros activos:')).toBeVisible();
    expect(screen.getByText('Estado: Inactivo')).toBeVisible();
    expect(screen.getByText('Año: 2024')).toBeVisible();
  });

  it('renders chips with custom label', () => {
    const { element } = renderToolbar({
      activeFiltersLabel: 'Filtros IA:',
      activeFiltersDisplay: { status: 'Estado: Activo' },
    });
    render(element);
    expect(screen.getByText('Filtros IA:')).toBeVisible();
    expect(screen.getByText('Estado: Activo')).toBeVisible();
  });

  it('invokes removal handler when chip delete icon is clicked', async () => {
    const user = userEvent.setup();
    const { element, onRemoveFilter } = renderToolbar({
      activeFiltersDisplay: { status: 'Estado: Inactivo' },
    });
    render(element);
    const chip = screen.getByTestId('active-filter-chip-status');
    const deleteIcon = chip.querySelector('svg');
    if (!deleteIcon) throw new Error('Delete icon not found on chip');
    await user.click(deleteIcon);
    expect(onRemoveFilter).toHaveBeenCalledWith('status');
  });

  it('invokes clear handler when clear filters is clicked', async () => {
    const user = userEvent.setup();
    const { element, onClearAllFilters } = renderToolbar({
      activeFiltersDisplay: { status: 'Estado: Inactivo' },
    });
    render(element);
    await user.click(screen.getByTestId('clear-all-filters'));
    expect(onClearAllFilters).toHaveBeenCalledTimes(1);
  });

  it('hides chips while loading', () => {
    const { element } = renderToolbar({
      activeFiltersDisplay: { status: 'Estado: Inactivo' },
      isLoading: true,
    });
    render(element);
    expect(screen.queryByTestId('active-filters-chips')).toBeNull();
  });

  it('keeps single filters button when rerendering with different props', () => {
    const first = renderToolbar({ showStats: false, showFilters: true });
    const rendered = render(first.element);
    expect(screen.getAllByRole('button', { name: /filtros/i })).toHaveLength(1);
    const second = renderToolbar({ showStats: true, showFilters: false });
    rendered.rerender(second.element);
    expect(screen.getAllByRole('button', { name: /filtros/i })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /filtros/i })).toBeVisible();
  });
});
