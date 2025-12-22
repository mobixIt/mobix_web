import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';

const renderPage = async () => {
  const module = await import('@/app/(secure)/vehicles/page');
  return module.default;
};

describe('Vehicles page suspense fallback', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const renderWithTheme = (ui: React.ReactElement) =>
    render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {ui}
      </ThemeProvider>,
    );

  it('shows the IndexPageSkeleton while Vehicles suspends', async () => {
    vi.doMock('@/components/vehicles', () => ({
      __esModule: true,
      default: function Vehicles() {
        throw new Promise(() => {
          /* never resolve to keep suspended */
        });
      },
    }));

    const VehiclesPage = await renderPage();

    renderWithTheme(<VehiclesPage />);

    expect(screen.getByTestId('index-page-skeleton')).toBeInTheDocument();
  });

  it('renders Vehicles when it resolves without showing the fallback', async () => {
    vi.doMock('@/components/vehicles', () => ({
      __esModule: true,
      default: function Vehicles() {
        return <div data-testid="vehicles-component" />;
      },
    }));

    const VehiclesPage = await renderPage();

    renderWithTheme(<VehiclesPage />);

    expect(screen.queryByTestId('index-page-skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('vehicles-component')).toBeInTheDocument();
  });
});
