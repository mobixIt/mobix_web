'use client';

import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import AuthContainer from '@/components/AuthContainer';
import BaseTextField from '@/components/ui/BaseTextField';
import AuthLink from '@/components/AuthLink';
import { loginUser } from '@/services/userAuthService';
import { initSessionStorageFromSessionResponse } from '@/utils/sessionAuthStorage';
import { getLoginErrorMessage } from '@/errors/getLoginErrorMessage';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data: { expires_at, idle_timeout_minutes } } = await loginUser(email, password);
      initSessionStorageFromSessionResponse({ expires_at, idle_timeout_minutes });

      router.push('/dashboard');
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      const code = err?.response?.data?.errors?.[0]?.code;
      setError(getLoginErrorMessage(code));
    };
  };

  return (
    <AuthContainer title="Iniciar sesión">
      <Box component="form" noValidate onSubmit={handleSubmit} autoComplete="off">
        <input type="text" name="fakeuser" style={{ display: 'none' }} />
        <input type="password" name="fakepass" style={{ display: 'none' }} />

        <Box display="flex" flexDirection="column" gap={3} mb={4}>
          <BaseTextField
            label="ID ó Correo electrónico"
            type="email"
            value={email}
            name="login_email"
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              input: {
                autoComplete: 'off',
                name: 'login_email',
              },
            }}
          />
          <BaseTextField
            label="Contraseña"
            type="password"
            value={password}
            name="login_pass"
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                autoComplete: 'new-password',
                name: 'login_pass',
              },
            }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button variant="contained" fullWidth type="submit">
          Iniciar sesión
        </Button>

        <Box textAlign="center" mt={2}>
          <AuthLink href="/reset-password">¿Olvidó su contraseña?</AuthLink>
        </Box>
      </Box>
    </AuthContainer>
  );
}