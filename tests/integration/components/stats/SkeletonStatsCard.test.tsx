import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import StatsCardSkeleton from '@/components/stats/StatsCardsSkeleton/StatsCardsSkeleton';

type StatsCardVariant = 'teal' | 'green' | 'yellow' | 'navy';

const appTheme = createTheme({
  shape: { borderRadius: 4 },
  palette: {
    mode: 'light',
    primary: { main: '#082A3F' },
    secondary: { main: '#65BBB0' },
    success: { main: '#4ADE80' },
    warning: { main: '#FBBF24' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#082A3F', secondary: '#4B5563' },
  },
});

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {ui}
    </ThemeProvider>,
  );
};

describe('StatsCardSkeleton integration render', () => {
  it('mounts without runtime errors and exposes the test id when provided', () => {
    renderWithTheme(
      <StatsCardSkeleton
        variant={'teal' satisfies StatsCardVariant}
        data-testid="stats-card-skeleton-integration"
      />,
    );

    expect(screen.getByTestId('stats-card-skeleton-integration')).toBeInTheDocument();
  });

  it('mounts successfully for every supported variant to prevent visual regressions by configuration', () => {
    const variants: StatsCardVariant[] = ['teal', 'green', 'yellow', 'navy'];

    renderWithTheme(
      <div>
        {variants.map((variant) => (
          <StatsCardSkeleton
            key={variant}
            variant={variant}
            data-testid={`stats-card-skeleton-${variant}`}
          />
        ))}
      </div>,
    );

    for (const variant of variants) {
      expect(screen.getByTestId(`stats-card-skeleton-${variant}`)).toBeInTheDocument();
    }
  });

  it('supports active state without crashing to protect parity with interactive StatsCard filters', () => {
    renderWithTheme(
      <StatsCardSkeleton
        variant={'green' satisfies StatsCardVariant}
        isActive
        data-testid="stats-card-skeleton-active"
      />,
    );

    expect(screen.getByTestId('stats-card-skeleton-active')).toBeInTheDocument();
  });
});
