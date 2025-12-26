'use client';

import * as React from 'react';
import Collapse from '@mui/material/Collapse';

import IndexPageControlToolbar from './IndexPageControlToolbar';
import type { IndexPageControlToolbarProps } from './IndexPageControlToolbar.types';

import {
  IndexPageRoot,
  HeaderSection,
  CardsSection,
  FiltersWrapper,
  TableSection,
  ToolbarSection,
} from './IndexPageLayout.styled';


export type IndexPageLayoutProps = {
  header?: React.ReactNode;

  statsCards?: React.ReactNode;
  filters?: React.ReactNode;

  table?: React.ReactNode;

  activeFiltersCount?: number;
  activeFiltersDisplay?: Record<string, string>;
  isLoading?: boolean;
  onRemoveFilter?: (id: string) => void;
  onClearAllFilters?: () => void;
  activeFiltersLabel?: string;
  aiInputPlaceholder?: IndexPageControlToolbarProps['aiInputPlaceholder'];
  aiDefaultQuestion?: IndexPageControlToolbarProps['aiDefaultQuestion'];
  aiValue?: IndexPageControlToolbarProps['aiValue'];
  onAiChange?: IndexPageControlToolbarProps['onAiChange'];
  onSendQuestion?: IndexPageControlToolbarProps['onSendQuestion'];
  aiSuggestion?: IndexPageControlToolbarProps['aiSuggestion'];
  showAiAssistant?: IndexPageControlToolbarProps['showAiAssistant'];
};

export function IndexPageLayout({
  header,
  statsCards,
  filters,
  table,
  activeFiltersCount = 0,
  activeFiltersDisplay = {},
  isLoading = false,
  onRemoveFilter,
  onClearAllFilters,
  activeFiltersLabel,
  aiInputPlaceholder,
  aiDefaultQuestion,
  aiValue,
  onAiChange,
  onSendQuestion,
  aiSuggestion,
  showAiAssistant,
}: IndexPageLayoutProps) {
  const hasStats = Boolean(statsCards);
  const hasFilters = Boolean(filters);
  const shouldRenderToolbar = hasStats || hasFilters;

  const [showStats, setShowStats] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    if (!hasStats) setShowStats(false);
  }, [hasStats]);

  React.useEffect(() => {
    if (!hasFilters) setShowFilters(false);
  }, [hasFilters]);

  const handleToggleStats = () => setShowStats((prev) => !prev);
  const handleToggleFilters = () => setShowFilters((prev) => !prev);

  return (
    <IndexPageRoot data-testid="index-page-layout">
      {header && <HeaderSection data-testid="index-page-header">{header}</HeaderSection>}

      {shouldRenderToolbar && (
        <ToolbarSection data-testid="index-page-toolbar">
          <IndexPageControlToolbar
            showStats={showStats}
            showFilters={showFilters}
            onToggleStats={handleToggleStats}
            onToggleFilters={handleToggleFilters}
            activeFiltersCount={activeFiltersCount}
            activeFiltersDisplay={activeFiltersDisplay}
            showStatsToggle={hasStats}
            showFiltersToggle={hasFilters}
            onRemoveFilter={onRemoveFilter}
            onClearAllFilters={onClearAllFilters}
            activeFiltersLabel={activeFiltersLabel}
            isLoading={isLoading}
            aiInputPlaceholder={aiInputPlaceholder}
            aiDefaultQuestion={aiDefaultQuestion}
            aiValue={aiValue}
            onAiChange={onAiChange}
            onSendQuestion={onSendQuestion}
            aiSuggestion={aiSuggestion}
            showAiAssistant={showAiAssistant}
          />
        </ToolbarSection>
      )}

      {hasStats && (
        <Collapse in={showStats} timeout="auto" unmountOnExit>
          <CardsSection data-testid="index-page-cards">{statsCards}</CardsSection>
        </Collapse>
      )}

      {hasFilters && (
        <Collapse in={showFilters} timeout="auto">
          <FiltersWrapper data-testid="index-page-filters">{filters}</FiltersWrapper>
        </Collapse>
      )}

      {table && (
        <TableSection elevation={0} data-testid="index-page-table">
          {table}
        </TableSection>
      )}
    </IndexPageRoot>
  );
}

export default IndexPageLayout;
