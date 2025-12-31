import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import QuickMetricsWidget from '@/components/metrics/QuickMetricsWidget';
import theme from '@/theme';

describe('QuickMetricsWidget', () => {
  it('should render title, updated text and five metrics', () => {
    render(
      <ThemeProvider theme={theme}>
        <QuickMetricsWidget />
      </ThemeProvider>,
    );

    expect(screen.getByText('Métricas Rápidas')).toBeInTheDocument();
    expect(screen.getByText('Actualizado hace 5 min')).toBeInTheDocument();
    expect(screen.getAllByText(/Pasajeros Hoy|Rutas Activas|Puntualidad|Consumo\/100km|Satisfacción/)).toHaveLength(5);
  });
});
