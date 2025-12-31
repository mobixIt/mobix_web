'use client';

import React from 'react';

import type { QuickMetricsWidgetSkeletonProps } from './QuickMetricsWidgetSkeleton.types';
import {
  SkeletonRoot,
  SkeletonHeader,
  SkeletonGrid,
  SkeletonCard,
  ShimmerSkeleton,
} from './QuickMetricsWidgetSkeleton.styled';

const DEFAULT_ITEMS = 5;

export default function QuickMetricsWidgetSkeleton({
  items = DEFAULT_ITEMS,
  'data-testid': dataTestId,
}: QuickMetricsWidgetSkeletonProps) {
  return (
    <SkeletonRoot data-testid={dataTestId}>
      <SkeletonHeader>
        <ShimmerSkeleton variant="text" width={220} height={40} />
        
        <ShimmerSkeleton variant="rounded" width={140} height={24} />
      </SkeletonHeader>

      <SkeletonGrid>
        {Array.from({ length: items }).map((_, index) => (
          <SkeletonCard key={index}>
            <ShimmerSkeleton 
              variant="circular" 
              width={48} 
              height={48} 
              sx={{ mb: 1.5 }}
            />
            
            <ShimmerSkeleton 
              variant="text" 
              width="60%" 
              height={40} 
              sx={{ mb: 0.5 }}
            />
            
            <ShimmerSkeleton variant="text" width="40%" height={20} />
          </SkeletonCard>
        ))}
      </SkeletonGrid>
    </SkeletonRoot>
  );
}