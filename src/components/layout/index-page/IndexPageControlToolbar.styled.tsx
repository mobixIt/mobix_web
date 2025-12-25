'use client';

import { styled, Theme, CSSObject } from '@mui/material/styles';
import { Box, Chip, keyframes } from '@mui/material';

import { MobixButtonOutlined, MobixButtonText } from '@/components/mobix/button';

type ToggleButtonProps = {
  active?: boolean;
};

export const Root = styled('section')(() => ({
  width: '100%',
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

export const ToggleButton = styled(MobixButtonOutlined, {
  shouldForwardProp: (prop) => prop !== 'active',
})<ToggleButtonProps>(({ theme, active }) => ({
  background: theme.palette.background.paper,
  borderRadius: Number(theme.shape.borderRadius) * 2,

  ...(active && {
    borderColor: theme.palette.secondary.main,
    color: theme.palette.secondary.main,
  }),
}));

export const ActiveFiltersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  flexBasis: '100%',
  marginTop: theme.spacing(0.5),
}));

export const ActiveFiltersLabel = styled('span')(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.text.secondary,
}));

export const ActiveFilterChip = styled(Chip)(({ theme }) => ({
  height: 28,
  borderRadius: 999,
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightMedium,
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.primary.main,
  '& .MuiChip-label': {
    paddingInline: theme.spacing(1.25),
  },
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.75),
    fontSize: theme.typography.pxToRem(16),
  },
}));

export const ClearFiltersButton = styled(MobixButtonText)(({ theme }) => ({
  paddingInline: theme.spacing(0.4),
  minWidth: 0,
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'none',
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
