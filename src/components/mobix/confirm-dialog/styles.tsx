'use client';

import { styled } from '@mui/material/styles';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';

export const ModalTitle = styled(DialogTitle)(({ theme }) => ({
  alignItems: 'center',
  color: theme.palette.text.primary,
  display: 'flex',
  fontSize: '20px',
  fontWeight: 700,
  justifyContent: 'space-between',
  letterSpacing: '0.25px',
  lineHeight: '24px',
  padding: '24px 24px 0 24px',
  margin: 0,
  marginBottom: theme.spacing(1.875),
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export const ModalContent = styled(DialogContent)(({ theme }) => ({
  border: 0,
  margin: 0,
  padding: theme.spacing(0, 3),
  '& p': {
    color: theme.palette.text.secondary,
    fontSize: '16px',
    fontFamily: 'Roboto',
    lineHeight: '24px',
    margin: 0,
  },
}));

export const ModalActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 1),
}));
