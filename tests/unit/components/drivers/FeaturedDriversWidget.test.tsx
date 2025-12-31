import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';

import FeaturedDriversWidget from '@/components/drivers/FeaturedDriversWidget';
import theme from '@/theme';

describe('FeaturedDriversWidget', () => {
  it('should render title, action label and driver list', () => {
    render(
      <ThemeProvider theme={theme}>
        <FeaturedDriversWidget />
      </ThemeProvider>,
    );

    expect(screen.getByText('Conductores Destacados')).toBeInTheDocument();
    expect(screen.getByText('Ver ranking')).toBeInTheDocument();
    expect(screen.getAllByText(/Pérez|González|Ramírez|Fernández|Sánchez/).length).toBeGreaterThanOrEqual(5);
  });
});
