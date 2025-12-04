'use client';

import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';

export function ServerErrorPage() {
  const router = useRouter();

  return (
    <Box
      data-testid="server-error-page"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Typography variant="h5" component="h1">
        Ocurrió un error en el servidor
      </Typography>

      <Typography variant="body2">
        Código de error: <strong>500</strong>
      </Typography>

      <Typography variant="body2">
        Intenta recargar la página. Si el problema persiste, contacta al administrador.
      </Typography>

      <Button
        variant="contained"
        onClick={() => router.refresh()}
      >
        Recargar
      </Button>
    </Box>
  );
}
