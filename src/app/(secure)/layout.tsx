'use client';

import * as React from 'react';
import { Box } from '@mui/material';
import Header from '@/components/header/Header';
import { SessionProvider } from '@/providers/SessionProvider';
import Sidebar from '@/components/sidebar/Sidebar';
import { SIDEBAR_WIDTH } from '@/components/sidebar/constants';

export default function SecureLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar />
        <Box sx={{ flex: 1, ml: { xs: 0, sm: `${SIDEBAR_WIDTH}px` }, display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Box component="main" sx={{ flex: 1, p: 3 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </SessionProvider>
  );
}