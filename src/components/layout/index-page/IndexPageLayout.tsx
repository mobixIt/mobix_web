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
  showStatsToggle?: boolean;
  showFiltersToggle?: boolean;

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
  aiIsLoading?: IndexPageControlToolbarProps['aiIsLoading'];
  aiSuggestion?: IndexPageControlToolbarProps['aiSuggestion'];
  showAiAssistant?: IndexPageControlToolbarProps['showAiAssistant'];
  aiNoResults?: IndexPageControlToolbarProps['aiNoResults'];
  aiErrorState?: IndexPageControlToolbarProps['aiErrorState'];
};

export function IndexPageLayout({
  header,
  statsCards,
  filters,
  table,
  activeFiltersCount = 0,
  activeFiltersDisplay = {},
  isLoading = false,
  showStatsToggle,
  showFiltersToggle,
  onRemoveFilter,
  onClearAllFilters,
  activeFiltersLabel,
  aiInputPlaceholder,
  aiDefaultQuestion,
  aiValue,
  onAiChange,
  onSendQuestion,
  aiIsLoading,
  aiSuggestion,
  showAiAssistant,
  aiNoResults,
  aiErrorState,
}: IndexPageLayoutProps) {
  const hasStats = Boolean(statsCards);
  const hasFilters = Boolean(filters);
  const hasFiltersDisplay = activeFiltersCount > 0 || Object.keys(activeFiltersDisplay).length > 0;
  const shouldShowStatsToggle = showStatsToggle ?? hasStats;
  const shouldShowFiltersToggle = (showFiltersToggle ?? hasFilters) || hasFiltersDisplay;
  const shouldRenderToolbar = shouldShowStatsToggle || shouldShowFiltersToggle || Boolean(showAiAssistant);

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
            showStatsToggle={shouldShowStatsToggle}
            showFiltersToggle={shouldShowFiltersToggle}
            onRemoveFilter={onRemoveFilter}
            onClearAllFilters={onClearAllFilters}
            activeFiltersLabel={activeFiltersLabel}
            isLoading={isLoading}
            aiInputPlaceholder={aiInputPlaceholder}
            aiDefaultQuestion={aiDefaultQuestion}
            aiValue={aiValue}
            onAiChange={onAiChange}
            onSendQuestion={onSendQuestion}
            aiIsLoading={aiIsLoading}
            aiSuggestion={aiSuggestion}
            showAiAssistant={showAiAssistant}
            aiNoResults={aiNoResults}
            aiErrorState={aiErrorState}
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
