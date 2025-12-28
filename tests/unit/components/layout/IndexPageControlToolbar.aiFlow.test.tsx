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

  it('muestra sugerencia histórica y no llama onSendQuestion cuando detecta pasado', async () => {
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

  it('envía pregunta cuando no es pasada y limpia sugerencias locales', async () => {
    detectPastQuestionMock.mockResolvedValueOnce({ isPast: false, source: 'fallback' });
    const onSendQuestion = vi.fn();
    renderToolbar({ onSendQuestion });
    const input = screen.getByLabelText('AI question input');
    await userEvent.type(input, 'Estado actual');
    await userEvent.click(screen.getByLabelText('send question'));
    await waitFor(() => expect(onSendQuestion).toHaveBeenCalledWith('Estado actual'));
    expect(screen.queryByText('Consulta histórica detectada')).toBeNull();
  });

  it('renderiza banner de error cuando aiErrorState.show es true', () => {
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

  it('renderiza banner de no resultados con acciones', () => {
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
