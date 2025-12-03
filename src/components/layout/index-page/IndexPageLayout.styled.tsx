'use client';

import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const IndexPageRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export const HeaderSection = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export const CardsSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
}));

const cardLike = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow:
    '8px 8px 16px rgba(8, 42, 63, 0.08), -8px -8px 16px rgba(255, 255, 255, 0.9)',
  border: `1px solid ${theme.palette.neutral.light}`,
});

export const FiltersSection = styled(Paper)(({ theme }) => ({
  ...cardLike(theme),
}));

export const TableSection = styled(Paper)(({ theme }) => ({
  ...cardLike(theme),
}));

export const SectionTitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: theme.typography.pxToRem(18),
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
}));

export const SectionSubtitle = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: theme.typography.pxToRem(13),
  color: theme.palette.text.secondary,
}));

export const SectionActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));
