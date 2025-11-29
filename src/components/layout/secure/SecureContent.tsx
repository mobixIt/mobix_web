'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSession } from '@/providers/SessionProvider';
import { redirectToBaseLogin } from '@/utils/redirectToLogin';
import { SecureLayout } from './SecureLayout';

export function SecureContent({ children }: { children: React.ReactNode }) {
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === 'invalid') {
      redirectToBaseLogin();
    }
  }, [sessionStatus]);

  if (sessionStatus === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (sessionStatus === 'invalid') {
    return null;
  }

  return <SecureLayout>{children}</SecureLayout>;
}

export default SecureContent;
