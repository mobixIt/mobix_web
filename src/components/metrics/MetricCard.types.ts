'use client';

import type React from 'react';

export type MetricVariant =
  | 'passengers'
  | 'routes'
  | 'punctuality'
  | 'fuel'
  | 'satisfaction';

export type MetricCardProps = {
  value: string | number;
  label: string;
  variant: MetricVariant;
  icon?: React.ReactNode;
  'data-testid'?: string;
};
