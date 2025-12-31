'use client';

import { styled } from '@mui/material/styles';
import { Paper, Box, Typography } from '@mui/material';

export const WidgetRoot = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[6],
  padding: theme.spacing(4),
}));

export const WidgetHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const WidgetTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
}));

export const WidgetTimestamp = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
}));

export const MetricsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: theme.spacing(2.5),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  },
}));
