'use client';

import React from 'react';
import { Box } from '@mui/material';

import type { InsightCardSkeletonProps } from './InsightCardSkeleton.types';
import {
  SkeletonContainer,
  HeaderRow,
  ValueBlock,
  ShimmerSkeleton,
} from './InsightCardSkeleton.styled';

export default function InsightCardSkeleton({
  'data-testid': dataTestId,
}: InsightCardSkeletonProps) {
  return (
    <SkeletonContainer data-testid={dataTestId}>
      <HeaderRow>
        <ShimmerSkeleton 
          variant="rounded" 
          width={56} 
          height={56} 
          sx={{ borderRadius: 2 }} 
        />
        
        <ShimmerSkeleton 
          variant="rounded" 
          width={80} 
          height={24} 
          sx={{ borderRadius: 999 }} 
        />
      </HeaderRow>

      <ShimmerSkeleton variant="text" width="60%" height={32} />

      <ValueBlock>
        <ShimmerSkeleton variant="text" width="40%" height={60} />
        
        <ShimmerSkeleton variant="text" width="30%" height={20} />
      </ValueBlock>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <ShimmerSkeleton variant="text" width="90%" height={16} />
        <ShimmerSkeleton variant="text" width="70%" height={16} />
      </Box>

      <Box sx={{ mt: 1 }}>
        <ShimmerSkeleton variant="rounded" width="100%" height={12} sx={{ borderRadius: 999 }} />
      </Box>

      <ShimmerSkeleton 
        variant="rounded" 
        width="100%" 
        height={48} 
        sx={{ borderRadius: 2, mt: 1 }} 
      />
    </SkeletonContainer>
  );
}