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

  isLoading?: boolean;

  onToggleStats: () => void;
  onToggleFilters: () => void;
};