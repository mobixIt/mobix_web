import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import InsightCard, { type InsightCardProps } from '@/components/stats/InsightCard';
import theme from '@/theme';

const renderWithTheme = (props: InsightCardProps) =>
  render(
    <ThemeProvider theme={theme}>
      <InsightCard {...props} />
    </ThemeProvider>,
  );

describe('InsightCard', () => {
  it('should render core fields without optional sections', () => {
    renderWithTheme({
      title: 'Disponibilidad de Flota',
      value: '92%',
    });

    expect(screen.getByText('Disponibilidad de Flota')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText('Ver detalles')).toBeNull();
  });

  it('should render status pill and action button and trigger onAction once', () => {
    const onAction = vi.fn();
    renderWithTheme({
      title: 'Disponibilidad de Flota',
      value: '92%',
      statusLabel: 'Operativo',
      actionLabel: 'Ver detalles',
      onAction,
    });

    expect(screen.getByText('Operativo')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ver detalles'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should clamp progress aria value when progressValue exceeds 100', () => {
    renderWithTheme({
      title: 'Disponibilidad de Flota',
      value: '92%',
      progressValue: 150,
      progressLabel: 'Activa',
    });

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '100');
  });

  it('should handle keyboard activation when clickable', () => {
    const onClick = vi.fn();
    renderWithTheme({
      title: 'Disponibilidad de Flota',
      value: '92%',
      onClick,
    });

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
