'use client';

import type { MetricVariant } from './MetricCard.types';

export const METRIC_VARIANT_COLOR: Record<
  MetricVariant,
  { bg: string; border: string; iconBg: string; iconColor: string }
> = {
  passengers: {
    bg: '#F3E8FF',
    border: '#E9D5FF',
    iconBg: '#E9D5FF',
    iconColor: '#7C3AED',
  },
  routes: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    iconBg: '#BFDBFE',
    iconColor: '#2563EB',
  },
  punctuality: {
    bg: '#ECFDF3',
    border: '#BBF7D0',
    iconBg: '#BBF7D0',
    iconColor: '#16A34A',
  },
  fuel: {
    bg: '#FFF7ED',
    border: '#FED7AA',
    iconBg: '#FED7AA',
    iconColor: '#EA580C',
  },
  satisfaction: {
    bg: '#FFF1F5',
    border: '#FBCFE8',
    iconBg: '#FBCFE8',
    iconColor: '#DB2777',
  },
};
