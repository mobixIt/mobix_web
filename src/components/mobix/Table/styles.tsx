'use client';

import { styled } from '@mui/material/styles';
import { Box, Paper, Typography, Checkbox, LinearProgress } from '@mui/material';

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
  position: 'relative',
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
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,

  backgroundColor: hasSelection
    ? theme.palette.accent.light
    : theme.palette.background.paper,

  color: hasSelection
    ? theme.palette.info.main
    : theme.palette.text.primary,
}));

export const ToolbarActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
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

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  '& .MuiSvgIcon-root': {
    color: theme.palette.info.main,
    borderRadius: 4,
  },

  '&.Mui-checked .MuiSvgIcon-root': {
    color: theme.palette.info.main,
  },

  '&.MuiCheckbox-indeterminate .MuiSvgIcon-root': {
    color: theme.palette.info.main,
  },
}));

export const TableTopProgress = styled(LinearProgress)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 2,
  opacity: 0.6,
  zIndex: 1,
}));
