'use client';

import * as React from 'react';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterListIcon from '@mui/icons-material/FilterList';

import {
  Root,
  Row,
  Left,
  Right,
  ToggleButton,
  ActiveFiltersContainer,
  ActiveFiltersLabel,
  ActiveFilterChip,
  ClearFiltersButton,
  ToolbarSkeletonRow,
  ToolbarSkeletonPill,
} from './IndexPageControlToolbar.styled';

import type { IndexPageControlToolbarProps } from './IndexPageControlToolbar.types';

export default function IndexPageControlToolbar({
  showStats,
  showFilters,
  showStatsToggle,
  showFiltersToggle,
  activeFiltersDisplay = {},
  onToggleStats,
  onToggleFilters,
  onRemoveFilter,
  onClearAllFilters,
  activeFiltersLabel = 'Filtros activos:',
  isLoading = false,
}: IndexPageControlToolbarProps) {
  const hasFiltersDisplay = Object.keys(activeFiltersDisplay).length > 0;

  return (
    <Root>
      <>
        {isLoading ? (
          <ToolbarSkeletonRow>
            <ToolbarSkeletonPill />
            <ToolbarSkeletonPill />
          </ToolbarSkeletonRow>
        ) : (
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
                <ToggleButton
                  variant="outlined"
                  color={showFilters ? 'secondary' : 'accent'}
                  onClick={onToggleFilters}
                  active={showFilters}
                  startIcon={<FilterListIcon />}
                >
                  Filtros
                </ToggleButton>
              )}

              {showFiltersToggle && hasFiltersDisplay && (
                <ActiveFiltersContainer data-testid="active-filters-chips">
                  <ActiveFiltersLabel>{activeFiltersLabel}</ActiveFiltersLabel>
                  {Object.entries(activeFiltersDisplay).map(([id, label]) => (
                  <ActiveFilterChip
                    key={id}
                    label={label}
                    onDelete={onRemoveFilter ? () => onRemoveFilter(id) : undefined}
                    data-testid={`active-filter-chip-${id}`}
                  />
                ))}
              {onClearAllFilters && (
                <ClearFiltersButton
                  size="small"
                  color="secondary"
                  onClick={onClearAllFilters}
                  data-testid="clear-all-filters"
                >
                  Limpiar filtros
                </ClearFiltersButton>
              )}
            </ActiveFiltersContainer>
              )}
            </Left>

            <Right>
            </Right>
          </Row>
        )}
      </>
    </Root>
  );
}
