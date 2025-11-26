'use client';

import { styled } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';

export const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow:
    '0 1px 1px 0 rgba(12,31,44,0.12), 0 2px 1px -1px rgba(0,0,0,0.12), 0 1px 3px 0 rgba(12,31,44,0.2)',
  paddingBottom: theme.spacing(1),
  position: 'relative',
  width: '100%',
}));

export const TablePaper = styled(Paper)(({ theme }) => ({
  boxShadow: 'none',
  backgroundColor: theme.palette.background.paper,
}));

interface ToolbarRootProps {
  hasSelection?: boolean;
}

export const ToolbarRoot = styled(
  Box,
  {
    shouldForwardProp: (prop) => prop !== 'hasSelection',
  }
)<ToolbarRootProps>(({ theme, hasSelection }) => ({
  alignItems: 'center',
  display: 'flex',
  minHeight: 72,
  borderBottom: 0,

  backgroundColor: hasSelection
    ? theme.palette.primary.light
    : theme.palette.background.paper,

  color: hasSelection
    ? theme.palette.primary.main
    : theme.palette.text.primary,
}));

export const ToolbarContent = styled(Box)(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  paddingLeft: theme.spacing(1.8),
  paddingRight: theme.spacing(1),
  width: '100%',
}));

export const TableName = styled(Typography)(({ theme }) => ({
  color: 'inherit',
  fontSize: '20px',
  fontWeight: theme.typography.fontWeightMedium,
  flex: 1,
  letterSpacing: '0.25px',
  lineHeight: '24px',
  margin: 0,
}));