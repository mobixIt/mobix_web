'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import IndexPageControlToolbar from '@/components/layout/index-page/IndexPageControlToolbar';
import theme from '@/theme';

const meta: Meta<typeof IndexPageControlToolbar> = {
  title: 'Mobix/Final/IndexPage/IndexPageControlToolbar',
  component: IndexPageControlToolbar,
  args: {
    showStats: false,
    showFilters: false,
    showStatsToggle: true,
    showFiltersToggle: true,
    activeFiltersCount: 2,
    activeFiltersDisplay: {
      status: 'Estado: Inactivo',
      model_year: 'Año: 2024',
      brand_id: 'Marca: Mercedes-Benz',
    },
    activeFiltersLabel: 'Filtros activos:',
    isLoading: false,
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: (themeInstance) => themeInstance.palette.background.default,
            p: 4,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 1280 }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof IndexPageControlToolbar>;

export const ConFiltrosActivos: Story = {
  args: {
    showFilters: true,
    onRemoveFilter: (id: string) => console.log('remove', id),
    onClearAllFilters: () => console.log('clear all'),
  },
};

export const SinFiltros: Story = {
  args: {
    activeFiltersCount: 0,
    activeFiltersDisplay: {},
  },
};

export const Cargando: Story = {
  args: {
    isLoading: true,
    activeFiltersCount: 0,
    activeFiltersDisplay: {},
  },
};
