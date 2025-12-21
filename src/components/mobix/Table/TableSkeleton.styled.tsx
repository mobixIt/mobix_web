'use client';

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const TableSkeletonContainer = styled('div')(() => ({
  boxShadow:
    '0 1px 1px 0 rgba(12,31,44,0.12), 0 2px 1px -1px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(12,31,44,0.2)',
  width: '100%',
}));

export const Root = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  width: '100%',
}));

export const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(3),
}));

export const Action = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  height: 36,
  width: 144,
  background: theme.palette.grey[200],
}));

export const TableWrap = styled(Box)(() => ({
  width: '100%',
  overflowX: 'auto',
}));

export const Table = styled('table')(({ theme }) => ({
  width: '100%',
  borderCollapse: 'collapse',
  '& th, & td': {
    padding: theme.spacing(1.5, 2),
    textAlign: 'left',
    verticalAlign: 'middle',
  },
  '& thead tr': {
    borderBottom: `1px solid ${theme.palette.neutral.light}`,
  },
  '& tbody tr': {
    borderBottom: `1px solid ${theme.palette.neutral.light}`,
  },
  '& tbody tr:last-of-type': {
    borderBottom: 'none',
  },
}));

export const Cell = styled('td')(() => ({}));
export const HeadCell = styled('th')(() => ({}));

export const RowLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

export const SkeletonLine = styled(Box)(({ theme }) => ({
  height: 16,
  borderRadius: theme.shape.borderRadius,
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
    animation: 'mobixShimmer 2s linear infinite',
  },
  '@keyframes mobixShimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}));

export const SkeletonCircle = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '999px',
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
    animation: 'mobixShimmer 2s linear infinite',
  },
}));

export const SkeletonButton = styled(Box)(({ theme }) => ({
  height: 32,
  width: 80,
  borderRadius: theme.shape.borderRadius,
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
    animation: 'mobixShimmer 2s linear infinite',
  },
}));