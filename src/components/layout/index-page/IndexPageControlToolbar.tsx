'use client';

import * as React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';

import {
  Root,
  Card,
  Row,
  Left,
  Right,
  ToggleButton,
  FiltersBadge,
  ActiveFiltersChip,
  TotalText,
} from './IndexPageControlToolbar.styled';

import type { IndexPageControlToolbarProps } from './IndexPageControlToolbar.types';

export default function IndexPageControlToolbar({
  showStats,
  showFilters,
  showStatsToggle,
  showFiltersToggle,
  activeFiltersCount = 0,
  totalCountText,
  onToggleStats,
  onToggleFilters,
}: IndexPageControlToolbarProps) {
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Root>
      <Card elevation={0}>
        <Row>
          <Left>
            {showStatsToggle && (
              <ToggleButton
                variant="outlined"
                color={showStats ? 'secondary' : 'accent'}
                onClick={onToggleStats}
                active={showStats}
                startIcon={<BarChartIcon />}
              >
                Estadísticas
              </ToggleButton>
            )}

            {showFiltersToggle && (
              <FiltersBadge
                color="primary"
                variant="dot"
                invisible={!hasActiveFilters}
                overlap="circular"
              >
                <ToggleButton
                  variant="outlined"
                  color={showStats ? 'secondary' : 'accent'}
                  onClick={onToggleFilters}
                  active={showFilters}
                  startIcon={<FilterListIcon />}
                >
                  Filtros
                </ToggleButton>
              </FiltersBadge>
            )}

            {showFiltersToggle && hasActiveFilters && (
              <ActiveFiltersChip
                color="primary"
                variant="outlined"
                label={`${activeFiltersCount} filtro${activeFiltersCount === 1 ? '' : 's'} activo${
                  activeFiltersCount === 1 ? '' : 's'
                }`}
              />
            )}
          </Left>

          <Right>
            {totalCountText ? <TotalText>{totalCountText}</TotalText> : null}
          </Right>
        </Row>
      </Card>
    </Root>
  );
}
