'use client';

import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { IndexPageLayout } from '@/components/layout/index-page/IndexPageLayout';

const Vehicles: React.FC = () => {
  const header = (
    <Box
      display="flex"
      flexDirection={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      gap={2}
    >
      <Box>
        <Typography variant="h4" component="h1">
          Vehículos
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Consulta y administra la flota de vehículos del tenant actual.
        </Typography>
      </Box>

      {/* Aquí irán filtros / botones de acciones del header más adelante */}
      <Box />
    </Box>
  );

  const table = (
    <Typography variant="body2" color="text.secondary">
      Pantalla de vehículos en construcción. Aquí irá la tabla / grilla con la
      lista de vehículos, filtros y acciones.
    </Typography>
  );

  return (
    <div data-testid="vehicles-page">
      <IndexPageLayout
        header={header}
        table={table}
      />
    </div>
  );
};

export default Vehicles;