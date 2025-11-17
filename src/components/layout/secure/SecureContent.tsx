'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Header from '@/components/header/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import { SIDEBAR_WIDTH } from '@/components/sidebar/constants';
import { useSession } from '@/providers/SessionProvider';
import { redirectToBaseLogin } from '@/utils/redirectToLogin';

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
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (sessionStatus === 'invalid') {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, sm: `${SIDEBAR_WIDTH}px` },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Header />
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
