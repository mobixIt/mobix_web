'use client';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import AuthContainer from '@/components/AuthContainer';
import BaseTextField from '@/components/ui/BaseTextField';
import AuthLink from '@/components/AuthLink';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <AuthContainer title="Restablecer contraseña">
      <Box component="form" onSubmit={handleSubmit} autoComplete="off">
        <Box display="flex" flexDirection="column" gap={3} mb={4}>
          <BaseTextField
            label="Correo electrónico"
            type="email"
            value={email}
            name="reset_email"
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              input: {
                autoComplete: 'off',
                name: 'reset_email',
              },
            }}
          />
        </Box>

        <Button variant="contained" fullWidth type="submit">
          Restablecer contraseña
        </Button>

        <Box textAlign="center" mt={2}>
          <AuthLink href="/login">Volver al inicio de sesión</AuthLink>
        </Box>
      </Box>
    </AuthContainer>
  );
}