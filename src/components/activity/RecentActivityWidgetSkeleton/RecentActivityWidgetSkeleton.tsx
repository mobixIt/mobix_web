'use client';

import React from 'react';
import { Box } from '@mui/material';

import type { RecentActivityWidgetSkeletonProps } from './RecentActivityWidgetSkeleton.types';
import {
  SkeletonRoot,
  SkeletonHeader,
  SkeletonStack,
  SkeletonItemRow,
  SkeletonDivider,
  ShimmerSkeleton,
} from './RecentActivityWidgetSkeleton.styled';

const DEFAULT_ITEMS = 5;

export default function RecentActivityWidgetSkeleton({
  items = DEFAULT_ITEMS,
  'data-testid': dataTestId,
}: RecentActivityWidgetSkeletonProps) {
  return (
    <SkeletonRoot data-testid={dataTestId}>
      <SkeletonHeader>
        <ShimmerSkeleton variant="text" width={180} height={32} />
        
        <ShimmerSkeleton variant="text" width={80} height={24} />
      </SkeletonHeader>

      <SkeletonStack>
        {Array.from({ length: items }).map((_, index) => {
          const isLast = index === items - 1;

          return (
            <React.Fragment key={index}>
              <SkeletonItemRow>
                <ShimmerSkeleton 
                  variant="rounded" 
                  width={36} 
                  height={36} 
                  sx={{ borderRadius: 1 }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ShimmerSkeleton 
                    variant="text" 
                    width="70%" 
                    height={20} 
                    sx={{ mb: 0.5 }}
                  />
                  
                  <ShimmerSkeleton variant="text" width="40%" height={16} />
                </Box>
              </SkeletonItemRow>

              {!isLast && <SkeletonDivider />}
            </React.Fragment>
          );
        })}
      </SkeletonStack>
    </SkeletonRoot>
  );
}
