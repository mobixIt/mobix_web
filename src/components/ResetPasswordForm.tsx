'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';

export default function ResetPasswordForm() {
  const theme = useTheme();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Enviar correo de recuperación a:', email);
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
          Restablecer contraseña
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} autoComplete="off">
        <Box
          sx={{
            marginBottom: 4
          }}
        >
          <TextField
            variant="filled"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>
        <Button
          variant="contained"
          fullWidth
          type="submit"
        >
          Restablecer contraseña
        </Button>

        <Box mt={2} textAlign="center">
          <Typography
            component={Link}
            href="/auth/login"
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
            Volver al inicio de sesión
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}