'use client';

import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

import { useAppSelector } from '@/store/hooks';
import { selectCurrentPerson } from '@/store/slices/authSlice';
import { logoutUser } from '@/services/userAuthService';
import { redirectToBaseLogin } from '@/utils/redirectToLogin';

export function PersonDashboard() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const person = useAppSelector(selectCurrentPerson);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
    } catch {
    } finally {
      redirectToBaseLogin();
    }
  };

  return (
    <Box sx={{ p: 4 }} data-testid="person-dashboard">
      <Typography variant="h4" mb={2}>
        {person
          ? `Bienvenido, ${person.first_name} ${person.last_name}`
          : 'Bienvenido al Dashboard'}
      </Typography>

      <Typography variant="body1" mb={4}>
        Has iniciado sesión correctamente.
      </Typography>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}
