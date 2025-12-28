import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import IndexPageControlToolbar from '@/components/layout/index-page/IndexPageControlToolbar';
import theme from '@/theme';

const { detectPastQuestionMock } = vi.hoisted(() => ({
  detectPastQuestionMock: vi.fn(),
}));

vi.mock('@/lib/openai/detectPastQuestion', () => ({
  detectPastQuestion: detectPastQuestionMock,
}));

const renderToolbar = (props?: Partial<React.ComponentProps<typeof IndexPageControlToolbar>>) => {
  return render(
    <ThemeProvider theme={theme}>
      <IndexPageControlToolbar
        showStats
        showFilters
        showStatsToggle
        showFiltersToggle
        onToggleStats={vi.fn()}
        onToggleFilters={vi.fn()}
        {...props}
      />
    </ThemeProvider>,
  );
};

describe('IndexPageControlToolbar IA flow', () => {
  beforeEach(() => {
    detectPastQuestionMock.mockReset();
  });

  it('shows historical suggestion and does not call onSendQuestion when past is detected', async () => {
    detectPastQuestionMock.mockResolvedValueOnce({ isPast: true, source: 'fallback' });
    const onSendQuestion = vi.fn();
    renderToolbar({
      aiHistoricalSuggestion: {
        title: 'Consulta histórica detectada',
        body: 'Abrir reporte histórico',
        actions: { onPrimary: vi.fn(), onSecondary: vi.fn(), onCloseSuggestion: vi.fn() },
      },
      onSendQuestion,
    });
    const input = screen.getByLabelText('AI question input');
    await userEvent.type(input, 'ayer');
    await userEvent.click(screen.getByLabelText('send question'));
    await waitFor(() => expect(screen.getByText('Consulta histórica detectada')).toBeVisible());
    expect(onSendQuestion).not.toHaveBeenCalled();
  });

  it('sends the question when it is not past and clears local suggestions', async () => {
    detectPastQuestionMock.mockResolvedValueOnce({ isPast: false, source: 'fallback' });
    const onSendQuestion = vi.fn();
    renderToolbar({ onSendQuestion });
    const input = screen.getByLabelText('AI question input');
    await userEvent.type(input, 'Estado actual');
    await userEvent.click(screen.getByLabelText('send question'));
    await waitFor(() => expect(onSendQuestion).toHaveBeenCalledWith('Estado actual'));
    expect(screen.queryByText('Consulta histórica detectada')).toBeNull();
  });

  it('renders an error banner when aiErrorState.show is true', () => {
    renderToolbar({
      aiErrorState: {
        show: true,
        message: 'Fallo IA',
        hint: 'Reintenta',
        note: 'Mostrando últimos resultados',
        onRetry: vi.fn(),
        onClear: vi.fn(),
      },
    });
    expect(screen.getByText('Fallo IA')).toBeVisible();
    expect(screen.getByText('Reintenta')).toBeVisible();
    expect(screen.getByText('Mostrando últimos resultados')).toBeVisible();
  });

  it('renders a no-results banner with actions', () => {
    renderToolbar({
      aiNoResults: {
        show: true,
        message: 'Sin resultados',
        hint: 'Añade filtros',
        note: 'Usa marca o año',
        onRetry: vi.fn(),
        onClear: vi.fn(),
      },
    });
    expect(screen.getByText('Sin resultados')).toBeVisible();
    expect(screen.getByText('Añade filtros')).toBeVisible();
    expect(screen.getByText('Usa marca o año')).toBeVisible();
  });
});
