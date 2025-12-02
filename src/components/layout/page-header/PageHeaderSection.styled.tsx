'use client';

import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export const HeaderSection = styled('section')(({ theme }) => ({
  padding: theme.spacing(3, 4),
  backgroundColor: theme.palette.background.default,
}));

export const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

export const TitleBlock = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem', // ~28px
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
}));

export const PageSubtitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

export const ActionsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));
