'use client';

import React, { useState } from 'react';
import { Box, Button, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import AuthContainer from '@/components/AuthContainer';
import BaseTextField from '@/components/ui/BaseTextField';
import AuthLink from '@/components/AuthLink';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } else {
      setError('Correo o contraseña inválidos');
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
          <AuthLink href="/auth/reset-password">¿Olvidó su contraseña?</AuthLink>
        </Box>
      </Box>
    </AuthContainer>
  );
}