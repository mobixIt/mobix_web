'use client';

import { styled, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

import type { ActivityVariant } from './ActivityItem.types';

const VARIANT_COLORS: Record<
  ActivityVariant,
  { main: string; bg: (alphaFn: typeof alpha) => string }
> = {
  success: {
    main: '#16A34A',
    bg: (alphaFn) => alphaFn('#22C55E', 0.14),
  },
  info: {
    main: '#2563EB',
    bg: (alphaFn) => alphaFn('#3B82F6', 0.14),
  },
  warning: {
    main: '#EA580C',
    bg: (alphaFn) => alphaFn('#F97316', 0.14),
  },
  user: {
    main: '#8B5CF6',
    bg: (alphaFn) => alphaFn('#A855F7', 0.14),
  },
  report: {
    main: '#0D9488',
    bg: (alphaFn) => alphaFn('#14B8A6', 0.14),
  },
};

type IconWrapperProps = {
  $variant: ActivityVariant;
};

export const ActivityRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
}));

export const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$variant',
})<IconWrapperProps>(({ theme, $variant }) => {
  const colorConfig = VARIANT_COLORS[$variant];
  const bg = colorConfig.bg(alpha);

  return {
    width: 36,
    height: 36,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colorConfig.main,

    '& svg': {
      fontSize: '1.1rem',
    },
  };
});

export const ActivityTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.95rem',
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.text.primary,
}));

export const ActivityTimestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));
