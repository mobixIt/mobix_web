'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import FeaturedDriversWidgetSkeleton from '@/components/drivers/FeaturedDriversWidgetSkeleton/FeaturedDriversWidgetSkeleton';
import theme from '@/theme';

const meta: Meta<typeof FeaturedDriversWidgetSkeleton> = {
  title: 'Mobix/Final/Drivers/FeaturedDriversWidgetSkeleton',
  component: FeaturedDriversWidgetSkeleton,
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
          <Box sx={{ width: '100%', maxWidth: 720 }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FeaturedDriversWidgetSkeleton>;

export const Default: Story = {
  args: {
    items: 5,
  },
};
