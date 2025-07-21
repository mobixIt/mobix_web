'use client';

import React from 'react';
import Image from 'next/image';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import Link from 'next/link';

export default function AppDisabledPage() {
  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#F9FAFB',
        textAlign: 'center',
      }}
    >
      <Box>
        <Box mb={4}>
          <Image
            src="/logo.svg"
            alt="Logo Gema"
            width={64}
            height={64}
            style={{ margin: '0 auto' }}
          />
        </Box>

        <Typography variant="h5" component="h1" fontWeight="600" color="#003B5C" gutterBottom>
          Aplicación no autorizada
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          Esta aplicación ha sido deshabilitada o no tiene permisos para acceder al sistema.
        </Typography>

        <Stack spacing={2} direction="column" alignItems="center">
          <Button
            variant="contained"
            href="mailto:soporte@gema.com?subject=Acceso%20denegado%20a%20la%20aplicación"
            sx={{
              bgcolor: '#1E6687',
              '&:hover': {
                bgcolor: '#12445A',
              },
              textTransform: 'none',
            }}
          >
            Contactar soporte
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}