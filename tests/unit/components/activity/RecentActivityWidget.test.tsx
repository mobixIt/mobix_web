import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import RecentActivityWidget from '@/components/activity/RecentActivityWidget';
import theme from '@/theme';

describe('RecentActivityWidget', () => {
  it('should render title and list items', () => {
    render(
      <ThemeProvider theme={theme}>
        <RecentActivityWidget />
      </ThemeProvider>,
    );

    expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /Mantenimiento completado|Nueva ruta activada|Alerta de retraso|Nuevo conductor registrado|Reporte generado/,
      ).length,
    ).toBeGreaterThanOrEqual(5);
  });

  it('should call action click when provided', () => {
    const onActionClick = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <RecentActivityWidget onActionClick={onActionClick} actionLabel="Ver todas" />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText('Ver todas'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });
});
