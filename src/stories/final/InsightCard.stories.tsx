'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DirectionsBusFilledIcon from '@mui/icons-material/DirectionsBusFilled';
import ShowChartIcon from '@mui/icons-material/ShowChart';

import InsightCard from '@/components/stats/InsightCard';
import theme from '@/theme';

const meta: Meta<typeof InsightCard> = {
  title: 'Mobix/Final/Stats/InsightCard',
  component: InsightCard,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: (themeInstance) =>
              themeInstance.palette.background.default,
            p: 4,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 360 }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof InsightCard>;

export const Alert: Story = {
  args: {
    variant: 'alert',
    title: 'Alerta de Rentabilidad',
    value: '-15%',
    helperText: 'Margen Operativo',
    description: 'Ruta 5 y Sur operando a pérdida esta madrugada.',
    statusLabel: 'Crítico',
    actionLabel: 'Analizar ahora',
    icon: <WarningAmberIcon />,
  },
};

export const Fleet: Story = {
  args: {
    variant: 'fleet',
    title: 'Disponibilidad de Flota',
    value: '92%',
    helperText: 'Activa',
    description: '240 vehículos en ruta. 18 en taller.',
    statusLabel: 'Operativo',
    actionLabel: 'Ver detalles',
    icon: <DirectionsBusFilledIcon />,
    progressValue: 92,
  },
};

export const Revenue: Story = {
  args: {
    variant: 'revenue',
    title: 'Recaudo Ayer',
    value: '$84.2M',
    helperText: 'Total Recaudado',
    description: '+3.5% vs promedio semanal. Cartera sana.',
    statusLabel: '+3.5%',
    actionLabel: 'Ver tendencia',
    icon: <ShowChartIcon />,
  },
};
