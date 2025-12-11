import { Typography, Button, Box, Stack } from '@mui/material';

export function ForbiddenPage() {
  const goBack = () => {
    if (typeof window !== 'undefined') window.history.back();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1">
        No tienes acceso a este espacio
      </Typography>

      <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: 480 }}>
        Tu sesión está activa, pero no tienes permisos para acceder a este
        tenant o subdominio.
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={goBack}>
          Volver atrás
        </Button>
      </Stack>
    </Box>
  );
}