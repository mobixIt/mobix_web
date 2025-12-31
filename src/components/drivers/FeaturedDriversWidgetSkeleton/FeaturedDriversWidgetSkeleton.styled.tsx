'use client';

import { styled, keyframes } from '@mui/material/styles';
import { Paper, Box, Skeleton } from '@mui/material';

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
  gap: theme.spacing(1.5),
}));

export const SkeletonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.neutral.light}`,
  backgroundColor: theme.palette.background.paper,
}));

// 5. Contenedor para el Avatar + Badge simulado
export const AvatarSkeletonWrapper = styled(Box)({
  position: 'relative',
  width: 48,
  height: 48,
});

export const ShimmerSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  animation: `${shimmer} 2s ease-in-out infinite`,
  transform: 'scale(1, 1)',
}));