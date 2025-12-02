'use client';

import { styled } from '@mui/material/styles';

export const FieldRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  position: 'relative',

  '&:focus-within label': {
    color: theme.palette.primary.main,
  },
}));

export const Label = styled('label')(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.secondary,
  transition: 'color 200ms ease',
}));

export const InputWrapper = styled('div')({
  position: 'relative',
});

export const Input = styled('input', {
  shouldForwardProp: (prop) => prop !== 'hasToggle',
})<{
  hasToggle?: boolean;
}>(({ theme, hasToggle }) => ({
  width: '100%',
  padding: '12px 16px',
  paddingRight: hasToggle ? '3rem' : '16px',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: theme.palette.neutral.main,
  borderRadius: 4,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  fontSize: 14,
  fontFamily: theme.typography.fontFamily,
  transition: 'all 200ms ease',

  '::placeholder': {
    color: theme.palette.text.disabled,
    opacity: 1,
  },

  '&:focus': {
    borderColor: theme.palette.secondary.main,
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(101, 187, 176, 0.1)',
  },

  '&:focus-visible': {
    outline: `2px solid ${theme.palette.secondary.main}`,
    outlineOffset: 2,
  },

  '&:disabled': {
    backgroundColor: theme.palette.neutral.light,
  },
}));

export const ToggleButton = styled('button')(({ theme }) => ({
  position: 'absolute',
  right: 16,
  top: '50%',
  transform: 'translateY(-50%)',
  padding: 4,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 150ms ease',

  '&:hover': {
    color: theme.palette.secondary.main,
  },

  '&:focus-visible': {
    outline: `2px solid ${theme.palette.secondary.main}`,
    outlineOffset: 2,
  },
}));

export const ErrorText = styled('p')(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontSize: 12,
  color: theme.palette.error.main,
}));
