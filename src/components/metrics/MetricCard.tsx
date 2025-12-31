'use client';

import React from 'react';

import {
  MetricCardRoot,
  MetricIconWrapper,
  MetricValue,
  MetricLabel,
} from './MetricCard.styled';
import type { MetricCardProps } from './MetricCard.types';

export type { MetricCardProps } from './MetricCard.types';

export default function MetricCard({
  value,
  label,
  variant,
  icon,
  'data-testid': dataTestId,
}: MetricCardProps) {
  return (
    <MetricCardRoot $variant={variant} data-testid={dataTestId}>
      {icon && <MetricIconWrapper $variant={variant}>{icon}</MetricIconWrapper>}
      <MetricValue>{value}</MetricValue>
      <MetricLabel>{label}</MetricLabel>
    </MetricCardRoot>
  );
}
