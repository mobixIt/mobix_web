import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IndexPageLayout } from '@/components/layout/index-page/IndexPageLayout';

type RenderParams = {
  header?: React.ReactNode;
  statsCards?: React.ReactNode;
  filters?: React.ReactNode;
  table?: React.ReactNode;
  activeFiltersCount?: number;
  totalCountText?: React.ReactNode;
};

function renderIndexPageLayout(params: RenderParams) {
  return render(
    <IndexPageLayout
      header={params.header}
      statsCards={params.statsCards}
      filters={params.filters}
      table={params.table}
      activeFiltersCount={params.activeFiltersCount}
      totalCountText={params.totalCountText}
    />,
  );
}

function getStatsToggleButton() {
  return screen.getByRole('button', { name: /estadísticas/i });
}

function getFiltersToggleButton() {
  return screen.getByRole('button', { name: /filtros/i });
}

describe('IndexPageLayout', () => {
  it('renders the root container with the expected test id', () => {
    renderIndexPageLayout({});
    expect(screen.getByTestId('index-page-layout')).toBeVisible();
  });

  it('renders header section only when header is provided', () => {
    const { rerender } = renderIndexPageLayout({ header: <div>Header</div> });

    expect(screen.getByTestId('index-page-header')).toBeVisible();
    expect(screen.getByText('Header')).toBeVisible();

    rerender(<IndexPageLayout />);
    expect(screen.queryByTestId('index-page-header')).toBeNull();
  });

  it('renders table section only when table is provided', () => {
    const { rerender } = renderIndexPageLayout({ table: <div>Table</div> });

    expect(screen.getByTestId('index-page-table')).toBeVisible();
    expect(screen.getByText('Table')).toBeVisible();

    rerender(<IndexPageLayout />);
    expect(screen.queryByTestId('index-page-table')).toBeNull();
  });

  it('does not render toolbar when neither statsCards nor filters are provided', () => {
    renderIndexPageLayout({});
    expect(screen.queryByTestId('index-page-toolbar')).toBeNull();
  });

  it('renders toolbar when statsCards is provided', () => {
    renderIndexPageLayout({ statsCards: <div>Stats</div> });
    expect(screen.getByTestId('index-page-toolbar')).toBeVisible();
    expect(getStatsToggleButton()).toBeVisible();
  });

  it('renders toolbar when filters is provided', () => {
    renderIndexPageLayout({ filters: <div>Filters</div> });
    expect(screen.getByTestId('index-page-toolbar')).toBeVisible();
    expect(getFiltersToggleButton()).toBeVisible();
  });

  it('keeps stats section hidden by default and shows it after clicking the stats toggle', async () => {
    const user = userEvent.setup();

    renderIndexPageLayout({ statsCards: <div>StatsContent</div> });

    expect(screen.queryByTestId('index-page-cards')).toBeNull();

    await user.click(getStatsToggleButton());

    expect(screen.getByTestId('index-page-cards')).toBeVisible();
    expect(screen.getByText('StatsContent')).toBeVisible();
  });

  it('keeps filters section hidden by default and shows it after clicking the filters toggle', async () => {
    const user = userEvent.setup();

    renderIndexPageLayout({ filters: <div>FiltersContent</div> });

    const filtersSectionBeforeToggle = screen.getByTestId('index-page-filters');
    expect(filtersSectionBeforeToggle).toBeInTheDocument();
    expect(filtersSectionBeforeToggle).not.toBeVisible();

    await user.click(getFiltersToggleButton());

    const filtersSectionAfterToggle = screen.getByTestId('index-page-filters');
    expect(filtersSectionAfterToggle).toBeVisible();
    expect(screen.getByText('FiltersContent')).toBeVisible();
  });
  
  it('hides stats section and unmounts it when toggled off', async () => {
    const user = userEvent.setup();

    renderIndexPageLayout({ statsCards: <div>StatsContent</div> });

    await user.click(getStatsToggleButton());
    expect(screen.getByTestId('index-page-cards')).toBeVisible();

    await user.click(getStatsToggleButton());

    expect(screen.queryByTestId('index-page-cards')).toBeNull();
    expect(screen.queryByText('StatsContent')).toBeNull();
  });

  it('hides filters section when toggled off while keeping filters mounted in the DOM', async () => {
    const user = userEvent.setup();

    renderIndexPageLayout({ filters: <div>FiltersContent</div> });

    await user.click(getFiltersToggleButton());
    expect(screen.getByTestId('index-page-filters')).toBeVisible();

    await user.click(getFiltersToggleButton());

    const filtersSection = screen.getByTestId('index-page-filters');
    expect(filtersSection).toBeInTheDocument();
  });

  it('closes stats section automatically when statsCards disappears', async () => {
    const user = userEvent.setup();

    const { rerender } = renderIndexPageLayout({ statsCards: <div>StatsContent</div> });

    await user.click(getStatsToggleButton());
    expect(screen.getByTestId('index-page-cards')).toBeVisible();

    rerender(<IndexPageLayout statsCards={undefined} />);
    expect(screen.queryByTestId('index-page-cards')).toBeNull();
    expect(screen.queryByRole('button', { name: /estadísticas/i })).toBeNull();
  });

  it('closes filters section automatically when filters disappears', async () => {
    const user = userEvent.setup();

    const { rerender } = renderIndexPageLayout({ filters: <div>FiltersContent</div> });

    await user.click(getFiltersToggleButton());
    expect(screen.getByTestId('index-page-filters')).toBeVisible();

    rerender(<IndexPageLayout filters={undefined} />);
    expect(screen.queryByTestId('index-page-filters')).toBeNull();
    expect(screen.queryByRole('button', { name: /filtros/i })).toBeNull();
  });

  it('passes activeFiltersCount and totalCountText through to the toolbar surface', () => {
    renderIndexPageLayout({
      statsCards: <div>Stats</div>,
      filters: <div>Filters</div>,
      activeFiltersCount: 2,
      totalCountText: <span>99 items</span>,
    });

    expect(screen.getByTestId('index-page-toolbar')).toBeVisible();
    expect(screen.getByText('99 items')).toBeVisible();
    expect(screen.getByText('2 filtros activos')).toBeVisible();
  });

  it('does not render the active filters chip when activeFiltersCount is 0', () => {
    renderIndexPageLayout({
      filters: <div>Filters</div>,
      activeFiltersCount: 0,
    });

    expect(screen.queryByText(/filtro.*activo/i)).toBeNull();
  });

  it('shows exactly one toolbar instance after prop changes', async () => {
    const user = userEvent.setup();

    const { rerender } = renderIndexPageLayout({
      statsCards: <div>Stats</div>,
      filters: <div>Filters</div>,
    });

    expect(screen.getAllByTestId('index-page-toolbar')).toHaveLength(1);

    await user.click(getStatsToggleButton());
    expect(screen.getByTestId('index-page-cards')).toBeVisible();

    rerender(
      <IndexPageLayout
        statsCards={<div>Stats</div>}
        filters={<div>Filters</div>}
        table={<div>Table</div>}
      />,
    );

    expect(screen.getAllByTestId('index-page-toolbar')).toHaveLength(1);
    expect(screen.getByTestId('index-page-cards')).toBeVisible();
  });
});
