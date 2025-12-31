'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import FeaturedDriversWidget from '@/components/drivers/FeaturedDriversWidget';
import theme from '@/theme';

const meta: Meta<typeof FeaturedDriversWidget> = {
  title: 'Mobix/Final/Drivers/FeaturedDriversWidget',
  component: FeaturedDriversWidget,
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
          <Box sx={{ width: '100%', maxWidth: 640 }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FeaturedDriversWidget>;

export const Default: Story = {
  args: {
    title: 'Conductores Destacados',
    actionLabel: 'Ver ranking',
  },
};
