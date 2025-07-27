'use client';

import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import AuthContainer from '@/components/AuthContainer';
import BaseTextField from '@/components/ui/BaseTextField';
import AuthLink from '@/components/AuthLink';
import { loginUser } from '@/services/userAuthService';
import { initSessionStorageFromSessionResponse } from '@/utils/session/initSessionStorageFromSessionResponse';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await loginUser(email, password);
      localStorage.setItem('userToken', data.token);

      initSessionStorageFromSessionResponse(data);

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);

      const code = err?.response?.data?.errors?.[0]?.code;

      switch (code) {
        case 'INVALID_CREDENTIALS':
          setError('Credenciales inválidas. Verifica tu ID o correo y tu contraseña.');
          break;
        case 'ACCOUNT_INACTIVE':
          setError('Tu cuenta está inactiva. Comunícate con tu administrador.');
          break;
        case 'NO_ROLE_ACCESS':
          setError('No tienes roles asignados en ninguna empresa. Comunícate con tu administrador.');
          break;
        case 'NO_TENANT_ACCESS':
          setError('No tienes acceso a ninguna empresa. Contacta al administrador.');
          break;
        default:
          setError('Ocurrió un error al intentar iniciar sesión. Inténtalo más tarde.');
          break;
      }
    }
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