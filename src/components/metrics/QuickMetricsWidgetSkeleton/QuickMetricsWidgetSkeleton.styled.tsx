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
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
}));

export const SkeletonHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const SkeletonGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: theme.spacing(2.5),
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
}));

export const SkeletonCard = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ShimmerSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  animation: `${shimmer} 2s ease-in-out infinite`,
  transform: 'scale(1, 1)',
}));
