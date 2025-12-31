'use client';

import { styled } from '@mui/material/styles';
import { Paper, Box, Typography } from '@mui/material';

export const WidgetRoot = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[6],
  padding: theme.spacing(3),
}));

export const WidgetHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
}));

export const WidgetTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
}));

export const DriversStack = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));
