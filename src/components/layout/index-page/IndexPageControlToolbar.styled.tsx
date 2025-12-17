'use client';

import { styled } from '@mui/material/styles';
import { Badge, Box, Chip, Paper, Typography } from '@mui/material';

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
