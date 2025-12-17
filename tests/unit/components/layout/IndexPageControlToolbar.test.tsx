import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import IndexPageControlToolbar from '@/components/layout/index-page/IndexPageControlToolbar';

type RenderOptions = {
  showStats: boolean;
  showFilters: boolean;
  showStatsToggle: boolean;
  showFiltersToggle: boolean;
  activeFiltersCount?: number;
  totalCountText?: React.ReactNode;
};

function buildToolbarProps(overrides: Partial<RenderOptions> = {}) {
  const onToggleStats = vi.fn();
  const onToggleFilters = vi.fn();

  const props: RenderOptions = {
    showStats: false,
    showFilters: false,
    showStatsToggle: true,
    showFiltersToggle: true,
    activeFiltersCount: 0,
    totalCountText: undefined,
    ...overrides,
  };

  const element = (
    <IndexPageControlToolbar
      showStats={props.showStats}
      showFilters={props.showFilters}
      showStatsToggle={props.showStatsToggle}
      showFiltersToggle={props.showFiltersToggle}
      activeFiltersCount={props.activeFiltersCount}
      totalCountText={props.totalCountText}
      onToggleStats={onToggleStats}
      onToggleFilters={onToggleFilters}
    />
  );

  return { element, onToggleStats, onToggleFilters, props };
}

describe('IndexPageControlToolbar', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders both toggle buttons when both toggles are enabled', () => {
    const { element } = buildToolbarProps({ showStatsToggle: true, showFiltersToggle: true });
    render(element);

    expect(screen.getByRole('button', { name: /estadísticas/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /filtros/i })).toBeVisible();
  });

  it('does not render the stats button when showStatsToggle is false', () => {
    const { element } = { ...buildToolbarProps({ showStatsToggle: false, showFiltersToggle: true }) };
    render(element);

    expect(screen.queryByRole('button', { name: /estadísticas/i })).toBeNull();
    expect(screen.getByRole('button', { name: /filtros/i })).toBeVisible();
  });

  it('does not render the filters button when showFiltersToggle is false', () => {
    const { element } = buildToolbarProps({ showStatsToggle: true, showFiltersToggle: false });
    render(element);

    expect(screen.getByRole('button', { name: /estadísticas/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /filtros/i })).toBeNull();
  });

  it('invokes onToggleStats when the stats button is clicked', async () => {
    const user = userEvent.setup();
    const { element, onToggleStats } = buildToolbarProps({ showStatsToggle: true });
    render(element);

    await user.click(screen.getByRole('button', { name: /estadísticas/i }));

    expect(onToggleStats).toHaveBeenCalledTimes(1);
  });

  it('invokes onToggleFilters when the filters button is clicked', async () => {
    const user = userEvent.setup();
    const { element, onToggleFilters } = buildToolbarProps({ showFiltersToggle: true });
    render(element);

    await user.click(screen.getByRole('button', { name: /filtros/i }));

    expect(onToggleFilters).toHaveBeenCalledTimes(1);
  });

  it('does not render the active filters chip when activeFiltersCount is 0', () => {
    const { element } = buildToolbarProps({ showFiltersToggle: true, activeFiltersCount: 0 });
    render(element);

    expect(screen.queryByText(/filtro.*activo/i)).toBeNull();
  });

  it('renders the active filters chip in singular form when activeFiltersCount is 1', () => {
    const { element } = buildToolbarProps({ showFiltersToggle: true, activeFiltersCount: 1 });
    render(element);

    expect(screen.getByText('1 filtro activo')).toBeVisible();
  });

  it('renders the active filters chip in plural form when activeFiltersCount is greater than 1', () => {
    const { element } = buildToolbarProps({ showFiltersToggle: true, activeFiltersCount: 2 });
    render(element);

    expect(screen.getByText('2 filtros activos')).toBeVisible();
  });

  it('renders totalCountText when provided', () => {
    const { element } = buildToolbarProps({ totalCountText: <span>42 vehículos en total</span> });
    render(element);

    expect(screen.getByText(/42 vehículos en total/i)).toBeVisible();
  });

  it('does not render totalCountText when not provided', () => {
    const { element } = buildToolbarProps({ totalCountText: undefined });
    render(element);

    expect(screen.queryByText(/vehículos en total/i)).toBeNull();
  });

  it('keeps active filters chip hidden when activeFiltersCount is negative', () => {
    const { element } = buildToolbarProps({ showFiltersToggle: true, activeFiltersCount: -1 });
    render(element);

    expect(screen.queryByText(/filtro.*activo/i)).toBeNull();
  });

  it('renders a single filters button across prop changes without duplicating the toolbar in the DOM', () => {
    const first = buildToolbarProps({ showStats: false, showFilters: true });
    const rendered = render(first.element);

    expect(screen.getAllByRole('button', { name: /filtros/i })).toHaveLength(1);

    const second = buildToolbarProps({ showStats: true, showFilters: false });
    rendered.rerender(second.element);

    expect(screen.getAllByRole('button', { name: /filtros/i })).toHaveLength(1);
    expect(screen.getByRole('button', { name: /filtros/i })).toBeVisible();
  });
});
