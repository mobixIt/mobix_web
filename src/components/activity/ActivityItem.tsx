'use client';

import React from 'react';

import {
  ActivityRow,
  IconWrapper,
  ActivityTitle,
  ActivityTimestamp,
} from './ActivityItem.styled';
import type { ActivityItemProps } from './ActivityItem.types';

export type { ActivityItemProps } from './ActivityItem.types';

export default function ActivityItem({
  title,
  description,
  timestamp,
  variant,
  icon,
  'data-testid': dataTestId,
}: ActivityItemProps) {
  return (
    <ActivityRow data-testid={dataTestId}>
      {icon && <IconWrapper $variant={variant}>{icon}</IconWrapper>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ActivityTitle>{title}</ActivityTitle>
        <ActivityTimestamp data-testid={dataTestId ? `${dataTestId}-timestamp` : undefined}>
          {description} • {timestamp}
        </ActivityTimestamp>
      </div>
    </ActivityRow>
  );
}
