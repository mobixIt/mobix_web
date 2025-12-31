'use client';

import React from 'react';
import { Box } from '@mui/material';

import type { FeaturedDriversWidgetSkeletonProps } from './FeaturedDriversWidgetSkeleton.types';
import {
  SkeletonRoot,
  SkeletonHeader,
  SkeletonStack,
  SkeletonRow,
  AvatarSkeletonWrapper,
  ShimmerSkeleton,
} from './FeaturedDriversWidgetSkeleton.styled';

const DEFAULT_ITEMS = 5;

export default function FeaturedDriversWidgetSkeleton({
  items = DEFAULT_ITEMS,
  'data-testid': dataTestId,
}: FeaturedDriversWidgetSkeletonProps) {
  return (
    <SkeletonRoot data-testid={dataTestId}>
      {/* HEADER: Título (izq) + Botón de Acción (der) */}
      <SkeletonHeader>
        <ShimmerSkeleton variant="text" width={200} height={32} />
        <ShimmerSkeleton variant="text" width={100} height={24} />
      </SkeletonHeader>

      <SkeletonStack>
        {Array.from({ length: items }).map((_, index) => {
          // Simulamos que los primeros 3 son Top Rank (tienen badge visualmente)
          const isTopRank = index < 3;

          return (
            <SkeletonRow key={index}>
              {/* 1. Avatar + Badge Rank */}
              <AvatarSkeletonWrapper>
                <ShimmerSkeleton variant="circular" width={48} height={48} />
                
                {isTopRank && (
                  <ShimmerSkeleton
                    variant="circular"
                    width={24}
                    height={24}
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      border: '2px solid white', // Simula el borde blanco del badge real
                    }}
                  />
                )}
              </AvatarSkeletonWrapper>

              {/* 2. Info Central (Nombre + Ruta) */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Nombre (Bold) */}
                <ShimmerSkeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                {/* Ruta + Puntualidad (Small) */}
                <ShimmerSkeleton variant="text" width="85%" height={16} />
              </Box>

              {/* 3. Rating Badge (Estrella + Nota) */}
              <ShimmerSkeleton 
                variant="rounded" 
                width={50} 
                height={24} 
                sx={{ borderRadius: 1 }} 
              />
            </SkeletonRow>
          );
        })}
      </SkeletonStack>
    </SkeletonRoot>
  );
}
