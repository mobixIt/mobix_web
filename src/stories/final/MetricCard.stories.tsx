'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import StarIcon from '@mui/icons-material/Star';

import MetricCard from '@/components/metrics/MetricCard';
import type { MetricCardProps } from '@/components/metrics/MetricCard.types';
import theme from '@/theme';

const meta: Meta<typeof MetricCard> = {
  title: 'Mobix/Final/Metrics/MetricCard',
  component: MetricCard,
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
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof MetricCard>;

const baseArgs: MetricCardProps = {
  value: '12.4K',
  label: 'Pasajeros Hoy',
  variant: 'passengers',
  icon: <PeopleAltIcon />,
};

export const Passengers: Story = {
  args: baseArgs,
};

export const Routes: Story = {
  args: {
    value: '48',
    label: 'Rutas Activas',
    variant: 'routes',
    icon: <AltRouteIcon />,
  },
};

export const Punctuality: Story = {
  args: {
    value: '94%',
    label: 'Puntualidad',
    variant: 'punctuality',
    icon: <AccessTimeIcon />,
  },
};

export const Fuel: Story = {
  args: {
    value: '8.2L',
    label: 'Consumo/100km',
    variant: 'fuel',
    icon: <LocalGasStationIcon />,
  },
};

export const Satisfaction: Story = {
  args: {
    value: '4.7',
    label: 'Satisfacción',
    variant: 'satisfaction',
    icon: <StarIcon />,
  },
};
