import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, CssBaseline } from '@mui/material';

import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';
import theme from '@/theme';

const renderWithTheme = (ui: React.ReactElement) =>
  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {ui}
    </ThemeProvider>,
  );

describe('IndexPageSkeleton', () => {
  it('renders all skeleton sections by default', () => {
    renderWithTheme(<IndexPageSkeleton />);

    expect(screen.getByTestId('index-page-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('index-page-skeleton-header')).toBeInTheDocument();
    expect(screen.getByTestId('index-page-skeleton-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('index-page-skeleton-stats')).toBeInTheDocument();
    expect(screen.getByTestId('index-page-skeleton-filters')).toBeInTheDocument();
    expect(screen.getByTestId('index-page-skeleton-table')).toBeInTheDocument();
  });

  it('respects visibility toggles for sections', () => {
    renderWithTheme(
      <IndexPageSkeleton showStats={false} showFilters={false} showTable={false} />,
    );

    expect(screen.queryByTestId('index-page-skeleton-stats')).not.toBeInTheDocument();
    expect(screen.queryByTestId('index-page-skeleton-filters')).not.toBeInTheDocument();
    expect(screen.queryByTestId('index-page-skeleton-table')).not.toBeInTheDocument();
    expect(screen.getByTestId('index-page-skeleton-header')).toBeInTheDocument();
    expect(screen.getByTestId('index-page-skeleton-toolbar')).toBeInTheDocument();
  });
});
