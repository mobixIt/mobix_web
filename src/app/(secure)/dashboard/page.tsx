'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { logoutUser } from '@/services/userAuthService';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expiresAtStr = localStorage.getItem('userTokenExpiresAt');

    if (!expiresAtStr) {
      router.push('/login');
      return;
    }

    const expiresAtMs = parseInt(expiresAtStr, 10);
    const nowMs = Date.now();

    if (Number.isNaN(expiresAtMs) || nowMs >= expiresAtMs) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem('userTokenExpiresAt');
      localStorage.removeItem('userIdleTimeout');
      router.push('/login');
    }
  };

  if (loading) {
    return <Typography sx={{ p: 4 }}>Cargando...</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>
        Bienvenido al Dashboard
      </Typography>

      <Typography variant="body1" mb={4}>
        Has iniciado sesión correctamente.
      </Typography>

      <Button variant="outlined" color="secondary" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </Box>
  );
}
