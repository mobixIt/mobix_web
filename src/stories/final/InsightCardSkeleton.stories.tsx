'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import InsightCardSkeleton from '@/components/stats/InsightCardSkeleton/InsightCardSkeleton';
import theme from '@/theme';

const meta: Meta<typeof InsightCardSkeleton> = {
  title: 'Mobix/Final/Stats/InsightCardSkeleton',
  component: InsightCardSkeleton,
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
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof InsightCardSkeleton>;

export const Default: Story = {};
