import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';

const LoginForm = () => {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
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
        <Image
          src="/logo.svg"
          alt="Logo GEMA"
          width={120}
          height={120}
        />
        <Typography
          variant="h5"
          fontWeight="bold"
          color={theme.palette.text.primary}
        >
          Iniciar sesión
        </Typography>
      </Box>

      <Box component="form" noValidate onSubmit={handleSubmit} autoComplete="off">
        <input type="text" name="fakeusernameremembered" style={{ display: 'none' }} />
        <input type="password" name="fakepasswordremembered" style={{ display: 'none' }} />
        <Box
          sx={{
            marginBottom: 4
          }}
        >
          <TextField
            variant="filled"
            key={Date.now()}
            label="ID ó Correo electrónico"
            type="email"
            name="login_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            slotProps={{
              input: {
                autoComplete: 'off',
                name: 'login_email',
              }
            }}
            fullWidth
            margin="normal"
          />

          <TextField
            variant="filled"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            slotProps={{
              input: {
                autoComplete: 'new-password',
                name: 'login_pass',
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          type="submit"
        >
          Iniciar sesión
        </Button>

        <Box textAlign="center" mt={2}>
          <Typography
            component={Link}
            href="/auth/reset-password"
            variant="body2"
            textAlign="center"
            mt={2}
            sx={{
              color: theme.palette.primary.dark,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: theme.typography.fontWeightMedium,
            }}
          >
            ¿Olvidó su contraseña?
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm;