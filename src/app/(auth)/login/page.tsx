'use client';

import React from 'react';
import { Box } from '@mui/material';
import LoginForm from '../../../components/LoginForm';

export default function LoginPage() {
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
      <LoginForm />
    </Box>
  );
}