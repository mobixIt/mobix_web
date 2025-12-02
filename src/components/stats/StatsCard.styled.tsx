'use client';

import { styled, alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export type StatCardColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'error'
  | 'accent';

type StatCardRootProps = {
  variant: StatCardColor;
  active?: boolean;
  clickable?: boolean;
};

export const StatCardRoot = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'variant' && prop !== 'active' && prop !== 'clickable',
})<StatCardRootProps>(({ theme, variant, active, clickable }) => {
  const paletteColor = theme.palette[variant];

  const baseBg = theme.palette.background.paper;
  const activeBg = alpha(paletteColor.main, 0.12);

  return {
    backgroundColor: active ? activeBg : baseBg,
    borderRadius: Number(theme.shape.borderRadius) * 2,
    padding: theme.spacing(3.5),
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    borderLeftColor: active ? paletteColor.dark : paletteColor.main,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2.5),

    boxShadow: active
      ? '0px 12px 28px rgba(9, 30, 66, 0.16), 0px 4px 12px rgba(9, 30, 66, 0.08)'
      : '0px 6px 16px rgba(9, 30, 66, 0.05), 0px 0px 8px rgba(9, 30, 66, 0.03)',

    transition:
      'transform .25s ease, box-shadow .25s ease, background-color .25s ease, border-color .25s ease',

    ...(clickable && {
      cursor: 'pointer',
    }),

    '&:hover': {
      transform: 'translateY(-6px)',
      backgroundColor: alpha(paletteColor.main, 0.06),
      boxShadow:
        '0px 12px 28px rgba(9, 30, 66, 0.15),' +
        '0px 4px 12px rgba(9, 30, 66, 0.08)',
    },
  };
});

export const StatCardMain = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const StatCardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: theme.typography.fontWeightMedium,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

export const StatCardValue = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  fontSize: '2.5rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
}));

export const StatCardHelper = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  fontSize: '0.8rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
}));

type StatCardIconWrapperProps = {
  variant: StatCardColor;
  active?: boolean;
};

export const StatCardIconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'active',
})<StatCardIconWrapperProps>(({ theme, variant, active }) => {
  const paletteColor = theme.palette[variant];

  return {
    width: 80,
    height: 80,
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundImage: `linear-gradient(135deg, ${
      active ? paletteColor.main : paletteColor.light
    }, ${paletteColor.main})`,

    color: theme.palette.common.white,
    flexShrink: 0,

    boxShadow: active
      ? '0 14px 30px rgba(8, 42, 63, 0.38)'
      : '0 12px 24px -8px rgba(8, 42, 63, 0.35)',

    '& svg': {
      fontSize: '2rem',
    },
  };
});