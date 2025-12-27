import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import IndexPageLayout from '@/components/layout/index-page/IndexPageLayout';
import theme from '@/theme';

const renderLayout = (props?: Partial<React.ComponentProps<typeof IndexPageLayout>>) => {
  return render(
    <ThemeProvider theme={theme}>
      <IndexPageLayout
        showFiltersToggle
        showStatsToggle
        showAiAssistant
        onToggleFilters={() => {}}
        onToggleStats={() => {}}
        {...props}
      />
    </ThemeProvider>,
  );
};

describe('IndexPageLayout ai props forwarding', () => {
  it('forwards aiNoResults to toolbar', () => {
    renderLayout({
      aiNoResults: {
        show: true,
        message: 'Sin resultados',
        hint: 'Ajusta la búsqueda',
      },
    });
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('Ajusta la búsqueda')).toBeInTheDocument();
  });

  it('forwards aiErrorState to toolbar', () => {
    renderLayout({
      aiErrorState: {
        show: true,
        message: 'Error IA',
        hint: 'Reintenta',
      },
    });
    expect(screen.getByText('Error IA')).toBeInTheDocument();
    expect(screen.getByText('Reintenta')).toBeInTheDocument();
  });
});
