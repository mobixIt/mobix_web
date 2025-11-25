'use client';

import { styled } from '@mui/material/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
} from '@mui/material';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 0,
    boxShadow: theme.shadows[8],
  },
}));

export const ModalTitle = styled(DialogTitle)(({ theme }) => ({
  alignItems: 'center',
  color: 'rgba(12,31,44,0.87)',
  display: 'flex',
  fontSize: '20px',
  fontWeight: 700,
  justifyContent: 'space-between',
  letterSpacing: '0.25px',
  lineHeight: '24px',
  padding: "24px 24px 0 24px",
  margin: 0,
  marginBottom: theme.spacing(1.875),
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

export const ModalContent = styled(DialogContent)(({ theme }) => ({
  border: 0,
  margin: 0,
  padding: theme.spacing(0, 3),
  "& p": {
    color: 'rgba(12,31,44,0.6)',
    fontSize: '16px',
    fontFamily: "Roboto",
    lineHeight: '24px',
    margin: 0,
  }
}));

export const ModalActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 1),
}));

export const PrimaryActionButton = styled(Button)(() => ({
  height: 36,
  border: 0,
  padding: '0 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  lineHeight: '16px',
  outline: 'none',
  cursor: 'pointer',
  textTransform: 'uppercase'
}));

export const SecondaryActionButton = styled(Button)(() => ({
  height: 36,
  border: 0,
  padding: '0 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  lineHeight: '16px',
  outline: 'none',
  cursor: 'pointer',
  textTransform: 'uppercase'
}));
