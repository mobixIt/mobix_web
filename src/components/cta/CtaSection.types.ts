'use client';

import type React from 'react';

export type CtaSectionProps = {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryIcon?: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  'data-testid'?: string;
};
