import { StatsCardsSkeletonCard, StatsCardVariant } from './StatsCardsSkeleton.types';

export const STATS_CARDS_SKELETON_TEST_IDS = {
  root: 'stats-cards-skeleton',
  grid: 'stats-cards-skeleton-grid',
} as const;

export const DEFAULT_VARIANTS_ORDER: StatsCardVariant[] = ['teal', 'green', 'yellow', 'navy'];

export const DEFAULT_CARDS: StatsCardsSkeletonCard[] = DEFAULT_VARIANTS_ORDER.map((variant) => ({
  id: `stats-card-skeleton-${variant}`,
  variant,
}));
