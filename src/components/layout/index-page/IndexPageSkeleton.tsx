'use client';

import * as React from 'react';
import { Skeleton, Stack, Box } from '@mui/material';

import {
  IndexPageRoot,
  HeaderSection,
  CardsSection,
  FiltersWrapper,
  TableSection,
  ToolbarSection,
} from './IndexPageLayout.styled';
import IndexPageControlToolbar from './IndexPageControlToolbar';
import StatsCardsSection from '../stats-cards/StatsCardsSection';
import { StatsCardSkeleton } from '@/components/stats/StatsCardsSkeleton/StatsCardsSkeleton';
import { TableSkeleton } from '@/components/mobix/table/TableSkeleton';

export type IndexPageSkeletonProps = {
  showStats?: boolean;
  showFilters?: boolean;
  showTable?: boolean;
  showHeaderAction?: boolean;
};

export function IndexPageSkeleton({
  showStats = false,
  showFilters = false,
  showTable = true,
  showHeaderAction = true,
}: IndexPageSkeletonProps) {
  return (
    <IndexPageRoot data-testid="index-page-skeleton">
      <HeaderSection data-testid="index-page-skeleton-header">
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="rounded" width={180} height={24} />
          <Skeleton variant="rounded" width={320} height={18} />
        </Stack>

        {showHeaderAction && (
          <Skeleton
            variant="rounded"
            width={200}
            height={44}
            sx={{ flexShrink: 0 }}
          />
        )}
      </HeaderSection>

      <ToolbarSection data-testid="index-page-skeleton-toolbar">
        <IndexPageControlToolbar
          showStats={false}
          showFilters={false}
          showStatsToggle={showStats}
          showFiltersToggle={showFilters}
          activeFiltersCount={0}
          onToggleStats={() => {}}
          onToggleFilters={() => {}}
          isLoading
        />
      </ToolbarSection>

      {showStats && (
        <CardsSection data-testid="index-page-skeleton-stats">
          <StatsCardsSection>
            <StatsCardSkeleton variant="teal" />
            <StatsCardSkeleton variant="green" />
            <StatsCardSkeleton variant="yellow" />
            <StatsCardSkeleton variant="navy" />
          </StatsCardsSection>
        </CardsSection>
      )}

      {showFilters && (
        <FiltersWrapper data-testid="index-page-skeleton-filters">
          <Box
            sx={(theme) => ({
              backgroundColor: theme.palette.background.paper,
              borderRadius: theme.shape.borderRadius,
              boxShadow:
                '0 4px 12px rgba(15, 23, 42, 0.06), 0 0 4px rgba(15, 23, 42, 0.03)',
              padding: theme.spacing(3),
              display: 'grid',
              gap: theme.spacing(2),
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              [theme.breakpoints.down('md')]: {
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              },
              [theme.breakpoints.down('sm')]: {
                gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
              },
            })}
          >
            {Array.from({ length: 6 }).map((_, idx) => (
              <Stack key={idx} spacing={1.25}>
                <Skeleton variant="rounded" width={80} height={14} />
                <Skeleton variant="rounded" width="100%" height={40} />
              </Stack>
            ))}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ gridColumn: '1 / -1', justifyContent: 'flex-end' }}
            >
              <Skeleton variant="rounded" width={96} height={32} />
              <Skeleton variant="rounded" width={108} height={36} />
            </Stack>
          </Box>
        </FiltersWrapper>
      )}

      {showTable && (
        <TableSection elevation={0} data-testid="index-page-skeleton-table">
          <TableSkeleton />
        </TableSection>
      )}
    </IndexPageRoot>
  );
}

export default IndexPageSkeleton;
