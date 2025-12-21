'use client';

import { styled, Theme, CSSObject } from '@mui/material/styles';
import { Badge, Box, Chip, Paper, Typography, keyframes } from '@mui/material';

import { MobixButtonOutlined } from '@/components/mobix/button';

type ToggleButtonProps = {
  active?: boolean;
};

export const Root = styled('section')(() => ({
  width: '100%',
}));

export const Card = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  padding: theme.spacing(2),
}));

export const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export const Left = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}));

export const Right = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}));

export const TotalText = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  color: theme.palette.text.secondary,
}));

export const TotalNumber = styled('span')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightBold,
}));

export const ActiveFiltersChip = styled(Chip)(({ theme }) => ({
  height: 24,
  borderRadius: 999,
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightMedium,
}));

export const FiltersBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    minWidth: 10,
    height: 10,
    borderRadius: 999,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

export const ToggleButton = styled(MobixButtonOutlined, {
  shouldForwardProp: (prop) => prop !== 'active',
})<ToggleButtonProps>(({ theme, active }) => ({
  borderRadius: Number(theme.shape.borderRadius) * 2,

  ...(active && {
    borderColor: theme.palette.secondary.main,
    color: theme.palette.secondary.main,
    backgroundColor: theme.palette.action.hover,
  }),
}));

const mobixShimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const shimmerBase = (theme: Theme): CSSObject => ({
  background: theme.palette.grey[200],
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    transform: 'translateX(-100%)',
    background:
      'linear-gradient(90deg, rgba(243,244,246,0) 0%, rgba(229,231,235,0.9) 50%, rgba(243,244,246,0) 100%)',
    animation: `${mobixShimmer} 2s linear infinite`,
  },
});

export const ToolbarSkeletonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
}));

export const ToolbarSkeletonPill = styled('div')(({ theme }) => ({
  height: 36,
  width: 140,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  ...shimmerBase(theme),
}));

export const ToolbarSkeletonChip = styled('div')(({ theme }) => ({
  height: 24,
  width: 90,
  borderRadius: 999,
  ...shimmerBase(theme),
}));

export const ToolbarSkeletonText = styled('div')(({ theme }) => ({
  height: 16,
  width: 120,
  borderRadius: theme.shape.borderRadius,
  ...shimmerBase(theme),
}));

export const ToolbarSkeletonSeparator = styled('div')(() => ({
  flex: 1,
}));