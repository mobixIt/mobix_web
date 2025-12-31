'use client';

import type React from 'react';
import type { StatCardColor } from './StatsCard.styled';

export type InsightCardVariant = 'alert' | 'fleet' | 'revenue';

export type InsightCardProps = {
  title: string;
  value: number | string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: InsightCardVariant;
  statusLabel?: string;
  statusTone?: StatCardColor;
  description?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  progressValue?: number;
  progressLabel?: string;
  onClick?: () => void;
  isActive?: boolean;
  'data-testid'?: string;
};
