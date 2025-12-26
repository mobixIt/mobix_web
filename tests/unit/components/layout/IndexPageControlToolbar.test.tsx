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
  const onAiChange = vi.fn();
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
      onAiChange={onAiChange}
      {...overrides}
    />
  );
  return { element, onToggleStats, onToggleFilters, onRemoveFilter, onClearAllFilters, onAiChange };
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

  it('renders AI input skeleton when loading', () => {
    const { element } = renderToolbar({
      activeFiltersDisplay: { status: 'Estado: Inactivo' },
      isLoading: true,
    });
    render(element);
    expect(screen.getByTestId('toolbar-skeleton-ai-input')).toBeVisible();
  });

  it('hides AI input and skeleton when showAiAssistant is false', () => {
    const { element } = renderToolbar({
      activeFiltersDisplay: { status: 'Estado: Inactivo' },
      showAiAssistant: false,
      isLoading: true,
    });
    render(element);
    expect(screen.queryByPlaceholderText('Pregúntale a Mobix IA...')).toBeNull();
    expect(screen.queryByTestId('toolbar-skeleton-ai-input')).toBeNull();
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

  it('sends AI question when clicking the send button', async () => {
    const user = userEvent.setup();
    const onSendQuestion = vi.fn();
    const { element, onAiChange } = renderToolbar({
      activeFiltersDisplay: {},
      onSendQuestion,
    });
    render(element);

    await user.type(screen.getByPlaceholderText('Pregúntale a Mobix IA...'), 'Hola IA');
    await user.click(screen.getByLabelText(/send question/i));

    expect(onAiChange).toHaveBeenCalled();
    expect(onSendQuestion).toHaveBeenCalledWith('Hola IA');
  });

  it('uses controlled value when provided', async () => {
    const user = userEvent.setup();
    const onSendQuestion = vi.fn();
    const onAiChange = vi.fn();
    const { element } = renderToolbar({
      activeFiltersDisplay: {},
      aiValue: 'Controlado',
      onAiChange,
      onSendQuestion,
    });

    render(element);
    await user.click(screen.getByLabelText(/send question/i));
    expect(onSendQuestion).toHaveBeenCalledWith('Controlado');

    await user.type(screen.getByPlaceholderText('Pregúntale a Mobix IA...'), ' Nuevo');
    expect(onAiChange).toHaveBeenCalled();
  });

  it('keeps the AI send button sized to align with the input', () => {
    const { element } = renderToolbar({
      activeFiltersDisplay: {},
      aiIsLoading: true,
    });
    render(element);
    const sendButton = screen.getByLabelText(/send question/i);
    const styles = getComputedStyle(sendButton);
    expect(styles.height).toBe('40px');
    expect(styles.width).toBe('40px');
    expect(sendButton).toBeDisabled();
  });

  it('renders suggestion banner with actions and handles clicks', async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    const onCloseSuggestion = vi.fn();
    const { element } = renderToolbar({
      activeFiltersDisplay: { status: 'Estado: Inactivo' },
      aiSuggestion: {
        title: 'Historical query detected: Jan 01, 2024',
        body: 'Podemos abrir el reporte histórico.',
        actions: {
          primaryLabel: 'Open Report',
          onPrimary,
          onCloseSuggestion,
        },
      },
    });

    render(element);

    expect(screen.getByText(/historical query detected/i)).toBeVisible();
    expect(screen.queryByTestId('active-filters-chips')).toBeNull();
    await user.click(screen.getByRole('button', { name: /open report/i }));
    await user.click(screen.getByLabelText(/close suggestion/i));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onCloseSuggestion).toHaveBeenCalledTimes(1);
  });
});
