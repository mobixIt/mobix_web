'use client';

import { styled, alpha } from '@mui/material/styles';
import { Paper, Box, Typography, Chip } from '@mui/material';

export const CtaRoot = styled(Paper)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[8],
  padding: theme.spacing(6),
}));

export const Content = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

export const TextBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  maxWidth: 720,
}));

export const Badge = styled(Chip)(({ theme }) => ({
  alignSelf: 'flex-start',
  backgroundColor: alpha(theme.palette.primary.light, 0.6),
  color: theme.palette.common.white,
  fontWeight: theme.typography.fontWeightBold,
  letterSpacing: '0.05em',
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
}));

export const Title = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.common.white,
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  color: alpha(theme.palette.common.white, 0.8),
  lineHeight: 1.5,
}));

export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const AccentCircleTop = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -80,
  right: -120,
  width: 240,
  height: 240,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.light, 0.12),
}));

export const AccentCircleBottom = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -100,
  left: -80,
  width: 200,
  height: 200,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.light, 0.12),
}));

export const IconGhost = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(6),
  bottom: theme.spacing(-6),
  fontSize: '9rem',
  color: alpha(theme.palette.common.white, 0.1),
  zIndex: 0,
  lineHeight: 1,
}));
