import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { vi as vitestMock } from 'vitest';

import DriverRankingItem from '@/components/drivers/DriverRankingItem';
import theme from '@/theme';

vi.mock('@/services/avatarService', () => ({
  getUserAvatarUrl: (identifier?: string) => `https://mock.avatar/${identifier ?? 'user'}`,
}));

describe('DriverRankingItem', () => {
  it('should show badge for top 3 ranks and omit for others', () => {
    render(
      <ThemeProvider theme={theme}>
        <DriverRankingItem
          rank={1}
          name="Juan Pérez"
          route="Ruta Norte"
          punctuality="98%"
          rating="4.9"
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('1')).toBeInTheDocument();

    render(
      <ThemeProvider theme={theme}>
        <DriverRankingItem
          rank={4}
          name="Luis Fernández"
          route="Ruta Sur"
          punctuality="94%"
          rating="4.6"
        />
      </ThemeProvider>,
    );

    expect(screen.queryByText('4')).toBeNull();
  });

  it('should use fallback avatar when no avatarUrl is provided', () => {
    render(
      <ThemeProvider theme={theme}>
        <DriverRankingItem
          rank={5}
          name="Roberto Sánchez"
          route="Ruta Oeste"
          punctuality="93%"
          rating="4.5"
        />
      </ThemeProvider>,
    );

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://mock.avatar/Roberto Sánchez');
  });
});
