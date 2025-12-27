import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import IndexPageControlToolbar from '@/components/layout/index-page/IndexPageControlToolbar';
import theme from '@/theme';

const renderToolbar = (props?: Partial<React.ComponentProps<typeof IndexPageControlToolbar>>) => {
  return render(
    <ThemeProvider theme={theme}>
      <IndexPageControlToolbar
        showStats
        showFilters
        showStatsToggle
        showFiltersToggle
        onToggleStats={() => {}}
        onToggleFilters={() => {}}
        showAiAssistant
        {...props}
      />
    </ThemeProvider>,
  );
};

describe('IndexPageControlToolbar AI banners', () => {
  it('renders suggestion banner when aiSuggestion is provided', () => {
    renderToolbar({
      aiSuggestion: {
        title: 'Sugerencia',
        body: 'Detalle',
      },
    });
    expect(screen.getByText('Sugerencia')).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });

  it('renders no-results banner when aiNoResults.show is true and no suggestion nor error', () => {
    const onRetry = vi.fn();
    const onClear = vi.fn();
    renderToolbar({
      aiNoResults: {
        show: true,
        message: 'Sin resultados',
        hint: 'Ajusta tu búsqueda',
        note: 'Mostrando anteriores',
        onRetry,
        onClear,
      },
    });
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('Ajusta tu búsqueda')).toBeInTheDocument();
    expect(screen.getByText('Mostrando anteriores')).toBeInTheDocument();
    screen.getByRole('button', { name: /intentar de nuevo/i }).click();
    screen.getByRole('button', { name: /ver todos/i }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders error banner when aiErrorState.show is true and no suggestion', () => {
    const onRetry = vi.fn();
    const onClear = vi.fn();
    renderToolbar({
      aiErrorState: {
        show: true,
        message: 'Falló la IA',
        hint: 'Reintenta',
        note: 'Mostrando anteriores',
        onRetry,
        onClear,
      },
    });
    expect(screen.getByText('Falló la IA')).toBeInTheDocument();
    expect(screen.getByText('Reintenta')).toBeInTheDocument();
    expect(screen.getByText('Mostrando anteriores')).toBeInTheDocument();
    screen.getByRole('button', { name: /intentar de nuevo/i }).click();
    screen.getByRole('button', { name: /ver todos/i }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
