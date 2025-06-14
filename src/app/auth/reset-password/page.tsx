
import React from 'react';
import { Box } from '@mui/material';
import ResetPasswordForm from '../../../components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <ResetPasswordForm />
    </Box>
  );
}