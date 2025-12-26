export type IndexPageControlToolbarLabels = Partial<{
  stats: string;
  filters: string;
  totalSuffix: string;
  activeFiltersText: (count: number) => string;
}>;

export type IndexPageControlToolbarProps = {
  showStats: boolean;
  showFilters: boolean;

  showStatsToggle: boolean;
  showFiltersToggle: boolean;

  activeFiltersCount?: number;
  activeFiltersDisplay?: Record<string, string>;

  isLoading?: boolean;

  onToggleStats: () => void;
  onToggleFilters: () => void;
  onRemoveFilter?: (id: string) => void;
  onClearAllFilters?: () => void;
  activeFiltersLabel?: string;

  aiInputPlaceholder?: string;
  aiDefaultQuestion?: string;
  aiValue?: string;
  onAiChange?: (question: string) => void;
  onSendQuestion?: (question: string) => void;
  aiSuggestion?: {
    title?: string;
    body?: string;
    actions?: {
      primaryLabel?: string;
      secondaryLabel?: string;
      onPrimary?: () => void;
      onSecondary?: () => void;
      onCloseSuggestion?: () => void;
    };
  };
  showAiAssistant?: boolean;
};
