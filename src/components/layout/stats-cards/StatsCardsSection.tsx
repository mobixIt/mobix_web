'use client';

import React from 'react';
import type { ReactNode } from 'react';

import { StatsCardsSectionRoot, StatsCardsGrid } from './StatsCardsSection.styled';

export type StatsCardsSectionProps = {
  /** Typically a list of <StatsCard /> components */
  children: ReactNode;
  /** Optional id for anchoring / testing */
  id?: string;
};

export default function StatsCardsSection({
  children,
  id = 'stats-cards-section',
}: StatsCardsSectionProps) {
  return (
    <StatsCardsSectionRoot id={id}>
      <StatsCardsGrid>{children}</StatsCardsGrid>
    </StatsCardsSectionRoot>
  );
}