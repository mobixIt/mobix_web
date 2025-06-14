'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';

interface AuthContainerProps {
  title: string;
  children: ReactNode;
}

export default function AuthContainer({ title, children }: AuthContainerProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        p: 4,
        boxShadow: 4,
        maxWidth: 400,
        width: '100%',
      }}
    >
      <Box textAlign="center" mb={4}>
        <Image src="/logo.svg" alt="Logo GEMA" width={120} height={120} />
        <Typography
          variant="h5"
          fontWeight="bold"
          color={theme.palette.text.primary}
        >
          {title}
        </Typography>
      </Box>

      {children}
    </Box>
  );
}