'use client';

import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const StatsCardsSectionRoot = styled('section')(({ theme }) => ({
  padding: theme.spacing(0),
  paddingTop: 0,
}));

export const StatsCardsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
}));