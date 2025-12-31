import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled';

import MetricCard from '@/components/metrics/MetricCard';
import theme from '@/theme';

describe('MetricCard', () => {
  it('should render value, label and icon', () => {
    render(
      <ThemeProvider theme={theme}>
        <MetricCard value="92%" label="Activa" variant="punctuality" icon={<DirectionsBusFilledIcon />} />
      </ThemeProvider>,
    );

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByTestId('DirectionsBusFilledIcon')).toBeInTheDocument();
  });
});
