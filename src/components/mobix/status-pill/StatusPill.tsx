'use client';

import * as React from 'react';
import type { FC, ReactNode } from 'react';
import { StatusPillRoot, type StatusPillVariant } from './StatusPill.styled';

export interface StatusPillProps {
  label: ReactNode;
  variant?: StatusPillVariant;
  className?: string;
}

const StatusPill: FC<StatusPillProps> = ({
  label,
  variant = 'active',
  className,
}) => {
  return (
    <StatusPillRoot colorVariant={variant} className={className}>
      {label}
    </StatusPillRoot>
  );
};

export default StatusPill;