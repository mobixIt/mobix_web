'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
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

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLogout}
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}