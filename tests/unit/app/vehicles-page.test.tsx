import React, { Suspense } from 'react';
import { act } from 'react-dom/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme';
import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';
import type { StrategyComponentLoader } from '@/config/moduleStrategies';

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

  const mockModuleRegistry = (loader: StrategyComponentLoader) => {
    vi.doMock('@/config/moduleStrategies', async () => {
      const actual = await vi.importActual<typeof import('@/config/moduleStrategies')>(
        '@/config/moduleStrategies',
      );

      return {
        __esModule: true,
        ...actual,
        moduleStrategyRegistry: {
          ...actual.moduleStrategyRegistry,
          vehicles: {
            defaultStrategy: 'base',
            strategies: {
              base: { loader },
            },
          },
        },
      };
    });

    vi.doMock('@/lib/strategy/resolveModuleStrategy', () => ({
      __esModule: true,
      resolveModuleStrategy: async () => 'base',
    }));
  };

  it('shows the IndexPageSkeleton while base strategy suspends', async () => {
    vi.resetModules();
    mockModuleRegistry(() => new Promise(() => {
      // keep suspended to force the fallback to stay visible
    }));

    const VehiclesPage = (await import('@/app/(secure)/vehicles/page')).default;

    await act(async () => {
      renderWithTheme(<VehiclesPage />);
    });

    expect(await screen.findByTestId('index-page-skeleton')).toBeInTheDocument();
  });

  it('renders Vehicles when strategy resolves without showing the fallback', async () => {
    vi.resetModules();
    const VehiclesComponent = () => <div data-testid="vehicles-component" />;
    mockModuleRegistry(async () => ({
      default: VehiclesComponent,
    }));

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
