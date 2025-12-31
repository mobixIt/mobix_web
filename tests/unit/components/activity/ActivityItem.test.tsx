import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';

import ActivityItem from '@/components/activity/ActivityItem';
import theme from '@/theme';

describe('ActivityItem', () => {
  it('should render title, description, timestamp and icon', () => {
    render(
      <ThemeProvider theme={theme}>
        <ActivityItem
          title="Mantenimiento completado"
          description="Bus #A-245"
          timestamp="Hace 15 min"
          variant="success"
          icon={<CheckIcon />}
          data-testid="activity-item"
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Mantenimiento completado')).toBeInTheDocument();
    expect(screen.getByText(/Bus #A-245/)).toBeInTheDocument();
    expect(screen.getByTestId('activity-item-timestamp')).toHaveTextContent('Bus #A-245 • Hace 15 min');
    expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
  });
});
