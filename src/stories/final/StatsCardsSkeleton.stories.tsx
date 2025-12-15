'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import StatsCardsSection from '@/components/layout/stats-cards/StatsCardsSection';
import StatsCardSkeleton from '@/components/stats/StatsCardsSkeleton/StatsCardsSkeleton';
import theme from '@/theme';

const meta: Meta<typeof StatsCardSkeleton> = {
  title: 'Mobix/Final/Stats/StatsCardSkeleton',
  component: StatsCardSkeleton,
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
            justifyContent: 'stretch',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof StatsCardSkeleton>;

const VARIANTS = ['teal', 'green', 'yellow', 'navy'] as const;

const Skeletons: React.FC<{ count: number }> = ({ count }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <StatsCardSkeleton
          key={`stat-skeleton-${idx}`}
          variant={VARIANTS[idx % VARIANTS.length]}
        />
      ))}
    </>
  );
};

/**
 * Full layout loading state (4 skeleton cards).
 * Mirrors the usual dashboard section.
 */
export const DefaultDashboardStats: Story = {
  render: () => (
    <StatsCardsSection>
      <Skeletons count={4} />
    </StatsCardsSection>
  ),
};

export const SingleCard: Story = {
  render: () => (
    <StatsCardsSection>
      <Skeletons count={1} />
    </StatsCardsSection>
  ),
};

export const TwoCards: Story = {
  render: () => (
    <StatsCardsSection>
      <Skeletons count={2} />
    </StatsCardsSection>
  ),
};

export const ThreeCards: Story = {
  render: () => (
    <StatsCardsSection>
      <Skeletons count={3} />
    </StatsCardsSection>
  ),
};

export const FourCards: Story = {
  render: () => (
    <StatsCardsSection>
      <Skeletons count={4} />
    </StatsCardsSection>
  ),
};
