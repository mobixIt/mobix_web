'use client';

import type { StatCardColor } from './StatsCard.styled';
import type { InsightCardVariant } from './InsightCard.types';

export const INSIGHT_CARD_VARIANT_COLOR: Record<
  InsightCardVariant,
  StatCardColor
> = {
  alert: 'error',
  fleet: 'secondary',
  revenue: 'primary',
};
