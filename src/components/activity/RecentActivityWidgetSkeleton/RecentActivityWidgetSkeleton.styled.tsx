'use client';

import { styled, keyframes } from '@mui/material/styles';
import { Paper, Box, Skeleton, Divider } from '@mui/material';

const shimmer = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

export const SkeletonRoot = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[6],
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
}));

export const SkeletonHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
}));

export const SkeletonStack = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const SkeletonItemRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
}));

export const SkeletonDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.grey[200],
}));

export const ShimmerSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  animation: `${shimmer} 2s ease-in-out infinite`,
  transform: 'scale(1, 1)',
}));
