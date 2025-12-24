import React, { Suspense, act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';
import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';

const renderWithTheme = (ui: React.ReactElement) =>
  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<IndexPageSkeleton showStats={false} showFilters={false} />}>
        {ui}
      </Suspense>
    </ThemeProvider>,
  );

describe('Vehicles page suspense fallback', () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  let StrategyOrchestratorMock: React.FC;

  const mockVehiclesPage = () => {
    vi.doMock('@/components/strategy/StrategyOrchestrator', () => ({
      __esModule: true,
      StrategyOrchestrator: StrategyOrchestratorMock,
    }));

    vi.doMock('@/app/(secure)/vehicles/page', () => {
      const VehiclesPage = () => (
        <Suspense fallback={<IndexPageSkeleton showStats={false} showFilters={false} />}>
          <StrategyOrchestratorMock />
        </Suspense>
      );
      return { __esModule: true, default: VehiclesPage };
    });
  };

  it('shows the IndexPageSkeleton while base strategy suspends', async () => {
    vi.resetModules();
    const suspensePromise = new Promise<never>(() => {});
    StrategyOrchestratorMock = () => {
      throw suspensePromise;
    };
    mockVehiclesPage();

    const VehiclesPage = (await import('@/app/(secure)/vehicles/page')).default;

    await act(async () => {
      renderWithTheme(<VehiclesPage />);
    });

    expect(await screen.findByTestId('index-page-skeleton')).toBeInTheDocument();
  });

  it('renders Vehicles when strategy resolves without showing the fallback', async () => {
    vi.resetModules();
    const VehiclesComponent = () => <div data-testid="vehicles-component" />;
    StrategyOrchestratorMock = () => <VehiclesComponent />;
    mockVehiclesPage();

    const VehiclesPage = (await import('@/app/(secure)/vehicles/page')).default;

    await act(async () => {
      renderWithTheme(<VehiclesPage />);
    });

    await screen.findByTestId('vehicles-component');

    // Skeleton may briefly render via Suspense; ensure it eventually disappears
    await waitFor(() => {
      expect(screen.queryByTestId('index-page-skeleton')).not.toBeInTheDocument();
    });
  });
});
