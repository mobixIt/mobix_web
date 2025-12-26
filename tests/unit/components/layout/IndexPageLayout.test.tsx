import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/theme';
import { IndexPageLayout } from '@/components/layout/index-page/IndexPageLayout';

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe('IndexPageLayout', () => {
  it('renders toolbar when filters are provided', () => {
    renderWithTheme(<IndexPageLayout filters={<div>Filters</div>} />);
    expect(screen.getByTestId('index-page-toolbar')).toBeVisible();
  });

  it('does not render chips when no display entries are provided', () => {
    renderWithTheme(<IndexPageLayout filters={<div>Filters</div>} activeFiltersDisplay={{}} />);
    expect(screen.queryByTestId('active-filters-chips')).toBeNull();
  });

  it('renders chips passed through to toolbar', () => {
    renderWithTheme(
      <IndexPageLayout
        filters={<div>Filters</div>}
        activeFiltersDisplay={{ status: 'Estado: Inactivo', year: 'Año: 2024' }}
        activeFiltersLabel="Filtros IA:"
      />,
    );
    expect(screen.getByText('Filtros IA:')).toBeVisible();
    expect(screen.getByText('Estado: Inactivo')).toBeVisible();
    expect(screen.getByText('Año: 2024')).toBeVisible();
  });

  it('invokes onRemoveFilter when chip delete is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveFilter = vi.fn();
    renderWithTheme(
      <IndexPageLayout
        filters={<div>Filters</div>}
        activeFiltersDisplay={{ status: 'Estado: Activo' }}
        onRemoveFilter={onRemoveFilter}
      />,
    );
    const chip = screen.getByTestId('active-filter-chip-status');
    const deleteIcon = chip.querySelector('svg');
    if (!deleteIcon) throw new Error('Delete icon not found on chip');
    await user.click(deleteIcon);
    expect(onRemoveFilter).toHaveBeenCalledWith('status');
  });

  it('invokes onClearAllFilters when clear is clicked', async () => {
    const user = userEvent.setup();
    const onClearAllFilters = vi.fn();
    renderWithTheme(
      <IndexPageLayout
        filters={<div>Filters</div>}
        activeFiltersDisplay={{ status: 'Estado: Activo' }}
        onClearAllFilters={onClearAllFilters}
      />,
    );
    await user.click(screen.getByTestId('clear-all-filters'));
    expect(onClearAllFilters).toHaveBeenCalledTimes(1);
  });

  it('keeps the filters toggle visible when filters content is not rendered but display entries exist', () => {
    renderWithTheme(<IndexPageLayout activeFiltersDisplay={{ ai: 'IA' }} />);
    expect(screen.getByRole('button', { name: /filtros/i })).toBeVisible();
    expect(screen.getByTestId('active-filters-chips')).toBeVisible();
  });

  it('hides chips when loading is true', () => {
    renderWithTheme(
      <IndexPageLayout
        filters={<div>Filters</div>}
        activeFiltersDisplay={{ status: 'Estado: Activo' }}
        isLoading
      />,
    );
    expect(screen.queryByTestId('active-filters-chips')).toBeNull();
  });

  it('keeps filters toggle visible and functional', async () => {
    const user = userEvent.setup();
    renderWithTheme(<IndexPageLayout filters={<div>FiltersContent</div>} />);
    const toggle = screen.getByRole('button', { name: /filtros/i });
    await user.click(toggle);
    expect(screen.getByTestId('index-page-filters')).toBeVisible();
  });
});
