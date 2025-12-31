'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import QuickMetricsWidgetSkeleton from '@/components/metrics/QuickMetricsWidgetSkeleton/QuickMetricsWidgetSkeleton';
import theme from '@/theme';

const meta: Meta<typeof QuickMetricsWidgetSkeleton> = {
  title: 'Mobix/Final/Metrics/QuickMetricsWidgetSkeleton',
  component: QuickMetricsWidgetSkeleton,
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
          <Box sx={{ width: '100%', maxWidth: 1200 }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof QuickMetricsWidgetSkeleton>;

export const Default: Story = {
  args: {
    items: 5,
  },
};
