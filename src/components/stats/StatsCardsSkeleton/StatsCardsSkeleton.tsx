import React from 'react';
import { StatsCardsSkeletonCard } from './StatsCardsSkeleton.types';
import { CardRoot, Main, HelperRow, IconWrapper, ShimmerSkeleton } from './StatsCardsSkeleton.styled';

export const StatsCardSkeleton: React.FC<StatsCardsSkeletonCard> = ({
  variant,
  isActive = false,
  'data-testid': dataTestId,
}) => {
  return (
    <CardRoot $variant={variant} $active={isActive} data-testid={dataTestId}>
      <Main>
        {/* title */}
        <ShimmerSkeleton variant="rounded" width={80} height={14} />

        {/* value */}
        <ShimmerSkeleton variant="rounded" width={96} height={44} />

        {/* helper */}
        <HelperRow>
          <ShimmerSkeleton variant="circular" width={14} height={14} />
          <ShimmerSkeleton variant="rounded" width={160} height={14} />
        </HelperRow>
      </Main>

      <IconWrapper $variant={variant} $active={isActive}>
      </IconWrapper>
    </CardRoot>
  );
};

export default StatsCardSkeleton;