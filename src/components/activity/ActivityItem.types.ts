'use client';

import type React from 'react';

export type ActivityVariant = 'success' | 'info' | 'warning' | 'user' | 'report';

export type ActivityItemProps = {
  title: string;
  description: string;
  timestamp: string;
  variant: ActivityVariant;
  icon?: React.ReactNode;
  'data-testid'?: string;
};
