'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

import StatsCardsSection from '@/components/layout/stats-cards/StatsCardsSection';
import StatsCard from '@/components/stats/StatsCard';
import theme from '@/theme';

const meta: Meta<typeof StatsCardsSection> = {
  title: 'Mobix/Final/Stats/StatsCardsSection',
  component: StatsCardsSection,
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

type Story = StoryObj<typeof StatsCardsSection>;

/**
 * Full layout with 4 cards,
 * simulating the typical "Users" dashboard section.
 */
export const DefaultDashboardStats: Story = {
  render: () => (
    <StatsCardsSection>
      <StatsCard
        title="Total users"
        value={248}
        helperText="12% vs last month"
        variant="secondary"
        icon={<GroupIcon />}
      />

      <StatsCard
        title="Active users"
        value={186}
        helperText="75% of total"
        variant="success"
        icon={<VerifiedUserIcon />}
      />

      <StatsCard
        title="Inactive users"
        value={62}
        helperText="25% of total"
        variant="warning"
        icon={<AccessTimeIcon />}
      />

      <StatsCard
        title="New (this month)"
        value={24}
        helperText="+8 vs last month"
        variant="primary"
        icon={<PersonAddAlt1Icon />}
      />
    </StatsCardsSection>
  ),
};

/**
 * Single-card scenario.
 * Useful to validate how the grid behaves when only 1 item is present.
 */
export const SingleCard: Story = {
  render: () => (
    <StatsCardsSection>
      <StatsCard
        title="Total users"
        value={248}
        helperText="12% vs last month"
        variant="secondary"
        icon={<GroupIcon />}
      />
    </StatsCardsSection>
  ),
};

/**
 * Two-card scenario.
 * The grid should naturally place them in two columns on desktop.
 */
export const TwoCards: Story = {
  render: () => (
    <StatsCardsSection>
      <StatsCard
        title="Active users"
        value={186}
        helperText="75% of total"
        variant="success"
        icon={<VerifiedUserIcon />}
      />
      <StatsCard
        title="Inactive users"
        value={62}
        helperText="25% of total"
        variant="warning"
        icon={<AccessTimeIcon />}
      />
    </StatsCardsSection>
  ),
};

/**
 * Three-card scenario.
 * Useful to ensure the layout stays balanced when
 * the number of cards is not a multiple of the number of columns.
 */
export const ThreeCards: Story = {
  render: () => (
    <StatsCardsSection>
      <StatsCard
        title="Total users"
        value={248}
        helperText="12% vs last month"
        variant="secondary"
        icon={<GroupIcon />}
      />
      <StatsCard
        title="Active users"
        value={186}
        helperText="75% of total"
        variant="success"
        icon={<VerifiedUserIcon />}
      />
      <StatsCard
        title="Inactive users"
        value={62}
        helperText="25% of total"
        variant="warning"
        icon={<AccessTimeIcon />}
      />
    </StatsCardsSection>
  ),
};

/**
 * Interactive example where each card acts as a visual filter.
 * Clicking a card toggles its `isActive` state to simulate a filter being applied.
 */
export const InteractiveFilters: Story = {
  render: () => {
    const [activeFilter, setActiveFilter] = React.useState<string | null>(
      'active',
    );

    const handleFilterClick = (key: string) => {
      setActiveFilter((current) => (current === key ? null : key));
    };

    return (
      <StatsCardsSection>
        <StatsCard
          title="Total users"
          value={248}
          helperText="12% vs last month"
          variant="secondary"
          icon={<GroupIcon />}
          isActive={activeFilter === 'all'}
          onClick={() => handleFilterClick('all')}
          data-testid="stat-card-total"
        />

        <StatsCard
          title="Active users"
          value={186}
          helperText="75% of total"
          variant="success"
          icon={<VerifiedUserIcon />}
          isActive={activeFilter === 'active'}
          onClick={() => handleFilterClick('active')}
          data-testid="stat-card-active"
        />

        <StatsCard
          title="Inactive users"
          value={62}
          helperText="25% of total"
          variant="warning"
          icon={<AccessTimeIcon />}
          isActive={activeFilter === 'inactive'}
          onClick={() => handleFilterClick('inactive')}
          data-testid="stat-card-inactive"
        />

        <StatsCard
          title="New (this month)"
          value={24}
          helperText="+8 vs last month"
          variant="primary"
          icon={<PersonAddAlt1Icon />}
          isActive={activeFilter === 'new'}
          onClick={() => handleFilterClick('new')}
          data-testid="stat-card-new"
        />
      </StatsCardsSection>
    );
  },
};
