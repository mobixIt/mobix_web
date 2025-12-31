'use client';

import { styled, alpha, type Theme } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';

import {
  StatCardRoot as BaseStatCardRoot,
  type StatCardColor,
} from './StatsCard.styled';

// Helper para tipar el theme correctamente
type WithTheme = { theme: Theme };

// --- InsightCardRoot ---
// CAMBIO: Renombramos 'variant' a 'tone' para evitar conflicto con props de MUI Paper
type InsightCardRootProps = {
  tone: StatCardColor;
  active?: boolean;
  clickable?: boolean;
};

export const InsightCardRoot = styled(BaseStatCardRoot, {
  shouldForwardProp: (prop) =>
    prop !== 'tone' && prop !== 'active' && prop !== 'clickable',
})<InsightCardRootProps>(({ theme, tone }: InsightCardRootProps & WithTheme) => ({
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  minHeight: 156,
  backgroundColor: theme.palette.background.paper,
  // Usamos 'tone' aquí
  borderLeftColor: theme.palette[tone].main,
}));

// --- InsightHeader ---
export const InsightHeader = styled(Box)(({ theme }: WithTheme) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

// --- InsightIconWrapper ---
// CAMBIO: Renombramos 'variant' a 'tone' por consistencia
type InsightIconWrapperProps = {
  tone: StatCardColor;
};

export const InsightIconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<InsightIconWrapperProps>(({ theme, tone }: InsightIconWrapperProps & WithTheme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderRadius: Number(theme.shape.borderRadius) * 1.75,
  backgroundColor: alpha(theme.palette[tone].main, 0.1),
  color: theme.palette[tone].main,

  '& svg': {
    fontSize: '2.25rem',
  },
}));

// --- StatusPill ---
type StatusPillProps = {
  tone: StatCardColor;
};

export const StatusPill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<StatusPillProps>(({ theme, tone }: StatusPillProps & WithTheme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0.75, 1.75),
  borderRadius: 999,
  backgroundColor: alpha(theme.palette[tone].main, 0.12),
  color: theme.palette[tone].main,
  fontWeight: theme.typography.fontWeightBold,
  fontSize: '0.75rem',
  lineHeight: 1,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
}));

// --- InsightValue ---
// CAMBIO CRÍTICO: Renombrado 'variant' a 'tone'.
// Typography ya tiene una prop 'variant' (h1, h2...), el conflicto rompía el tipo.
type InsightValueProps = {
  tone: StatCardColor;
};

export const InsightValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<InsightValueProps>(({ theme, tone }: InsightValueProps & WithTheme) => ({
  fontSize: '3rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette[tone].main,
}));

// --- Textos Simples ---
export const InsightValueLabel = styled(Typography)(({ theme }: WithTheme) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const InsightTitle = styled(Typography)(({ theme }: WithTheme) => ({
  fontSize: '1.25rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
}));

export const InsightDescription = styled(Typography)(({ theme }: WithTheme) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

// --- ActionButton ---
type ActionButtonProps = {
  tone: StatCardColor;
};

export const ActionButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<ActionButtonProps>(({ theme, tone }: ActionButtonProps & WithTheme) => ({
  width: '100%',
  justifyContent: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette[tone].main, 0.1),
  color: theme.palette[tone].main,
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'none',
  boxShadow: 'none',

  '&:hover': {
    backgroundColor: alpha(theme.palette[tone].main, 0.18),
    boxShadow: 'none',
  },
}));

// --- Barras de Progreso ---
export const ProgressTrack = styled(Box)(({ theme }: WithTheme) => ({
  width: '100%',
  height: 12,
  borderRadius: 999,
  backgroundColor: theme.palette.grey[200],
  overflow: 'hidden',
}));

type ProgressBarProps = {
  tone: StatCardColor;
  value?: number;
};

export const ProgressBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'tone' && prop !== 'value',
})<ProgressBarProps>(({ theme, tone, value }: ProgressBarProps & WithTheme) => {
  const width = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0;

  return {
    width: `${width}%`,
    height: '100%',
    backgroundColor: theme.palette[tone].main,
  };
});
