'use client';

import { styled, alpha } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';

export const CardRoot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export const HeaderTitleGroup = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}));

export const IconContainer = styled(Box)(({ theme }) => ({
  width: 52,
  height: 52,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.accent.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const SuggestionCard = styled(Paper)(({ theme }) => ({
  boxShadow: 'none',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.info.main}`,
  backgroundColor: theme.palette.accent.light,
  padding: theme.spacing(3),
}));

export const SuggestionContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
}));

export const SuggestionIcon = styled(Box)(({ theme }) => ({
  width: 52,
  height: 52,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

export const SuggestionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const SuggestionActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  marginTop: theme.spacing(1.5),
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  height: 48,
  padding: theme.spacing(1.25, 2.75),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 700,
  fontSize: theme.typography.body1.fontSize,
  boxShadow: 'none',
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1.5),
  },
}));

export const PrimaryActionButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: 'none',
  },
}));

export const SecondaryActionButton = styled(ActionButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  borderColor: alpha(theme.palette.primary.main, 0.8),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
    boxShadow: 'none',
  },
}));

export const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
  backgroundColor: theme.palette.background.paper,
}));

export const QuestionInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  fontSize: theme.typography.body1.fontSize,
  color: theme.palette.text.primary,
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
}));

export const TipRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export const TextMuted = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
