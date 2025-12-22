'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import IndexPageSkeleton from '@/components/layout/index-page/IndexPageSkeleton';
import theme from '@/theme';

const meta: Meta<typeof IndexPageSkeleton> = {
  title: 'Mobix/Final/IndexPage/IndexPageSkeleton',
  component: IndexPageSkeleton,
  args: {
    showStats: true,
    showFilters: true,
    showTable: true,
    showHeaderAction: true,
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
            justifyContent: 'center',
            alignItems: 'flex-start',
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

type Story = StoryObj<typeof IndexPageSkeleton>;

export const Default: Story = {};

export const SinStatsNiFilters: Story = {
  args: {
    showStats: false,
    showFilters: false,
  },
};

export const SoloTabla: Story = {
  args: {
    showStats: false,
    showFilters: false,
    showHeaderAction: false,
  },
};
