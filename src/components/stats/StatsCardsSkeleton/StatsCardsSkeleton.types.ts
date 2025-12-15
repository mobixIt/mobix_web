export type StatsCardVariant = 'teal' | 'green' | 'yellow' | 'navy';

export type StatsCardsSkeletonCard = {
  variant: StatsCardVariant;
  isActive?: boolean;
  'data-testid'?: string;
};