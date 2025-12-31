'use client';

import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

import { METRIC_VARIANT_COLOR } from './MetricCard.constants';
import type { MetricVariant } from './MetricCard.types';

type RootProps = {
  $variant: MetricVariant;
};

export const MetricCardRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$variant',
})<RootProps>(({ theme, $variant }) => {
  const colors = METRIC_VARIANT_COLOR[$variant];

  return {
    width: '100%',
    padding: theme.spacing(2),
    textAlign: 'center',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.bg,
  };
});

type IconWrapperProps = {
  $variant: MetricVariant;
};

export const MetricIconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$variant',
})<IconWrapperProps>(({ theme, $variant }) => {
  const colors = METRIC_VARIANT_COLOR[$variant];

  return {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: colors.iconBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.iconColor,
    margin: '0 auto',
    marginBottom: theme.spacing(1.5),

    '& svg': {
      fontSize: '1.5rem',
    },
  };
});

export const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
}));

export const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));
