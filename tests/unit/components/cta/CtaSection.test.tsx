import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import CtaSection from '@/components/cta/CtaSection';
import theme from '@/theme';

const renderWithTheme = (props?: Partial<React.ComponentProps<typeof CtaSection>>) =>
  render(
    <ThemeProvider theme={theme}>
      <CtaSection
        badgeText="Mobix IA Disponible 24/7"
        title="¿Necesitas un análisis más profundo?"
        subtitle="Pregúntame cualquier cosa sobre tu operación."
        primaryLabel="Hacer Consulta"
        secondaryLabel="Ver Ejemplos"
        {...props}
      />
    </ThemeProvider>,
  );

describe('CtaSection', () => {
  it('should render badge, title, subtitle and both buttons', () => {
    renderWithTheme();

    expect(screen.getByText(/Mobix IA Disponible 24\/7/i)).toBeInTheDocument();
    expect(screen.getByText(/¿Necesitas un análisis más profundo\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Pregúntame cualquier cosa sobre tu operación\./i)).toBeInTheDocument();
    expect(screen.getByText('Hacer Consulta')).toBeInTheDocument();
    expect(screen.getByText('Ver Ejemplos')).toBeInTheDocument();
  });

  it('should trigger callbacks when buttons are clicked', () => {
    const onPrimaryClick = vi.fn();
    const onSecondaryClick = vi.fn();
    renderWithTheme({ onPrimaryClick, onSecondaryClick });

    fireEvent.click(screen.getByText('Hacer Consulta'));
    fireEvent.click(screen.getByText('Ver Ejemplos'));

    expect(onPrimaryClick).toHaveBeenCalledTimes(1);
    expect(onSecondaryClick).toHaveBeenCalledTimes(1);
  });
});
