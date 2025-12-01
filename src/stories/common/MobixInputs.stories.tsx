'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';

import { MobixTextField } from '@/components/mobix/inputs/MobixTextField';
import { MobixFileUpload } from '@/components/mobix/inputs/MobixFileUpload';
import { MobixFileUploadInline } from '@/components/mobix/inputs/MobixFileUploadInline';

type InputsStoryProps = Record<string, never>;

const meta: Meta<InputsStoryProps> = {
  title: 'Mobix/Common/Inputs',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<InputsStoryProps>;

export const AllInputs: Story = {
  render: () => {
    const [searchValue, setSearchValue] = React.useState('Texto de ejemplo');

    return (
      <Box
        sx={{
          p: 4,
          backgroundColor: (t) => t.palette.background.default,
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1100 }}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Componentes de Entrada Mobix
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Variantes basadas en MUI TextField (outlined) usando la paleta Mobix.
          </Typography>

          {/* 1. Entradas básicas */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>
              1. Entradas básicas
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <MobixTextField
                label="Nombre completo"
                fullWidth
                mobixVariant="default"
              />
              <MobixTextField
                label="Correo electrónico"
                type="email"
                fullWidth
              />
              <MobixTextField
                label="Contraseña"
                mobixVariant="password"
                fullWidth
                helperText="Mínimo 8 caracteres"
              />
            </Stack>
          </Paper>

          {/* 2. Con iconos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>
              2. Con iconos (prefijo / sufijo)
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <MobixTextField
                label="Buscar"
                mobixVariant="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                fullWidth
                endIcon={
                  searchValue ? (
                    <IconButton
                      size="small"
                      onClick={() => setSearchValue('')}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ) : undefined
                }
              />
              <MobixTextField
                label="Usuario"
                mobixVariant="default"
                startIcon={<PersonIcon fontSize="small" />}
                fullWidth
              />
              <MobixTextField
                label="Ciudad"
                mobixVariant="default"
                startIcon={<LocationOnIcon fontSize="small" />}
                fullWidth
              />
            </Stack>
          </Paper>

          {/* 3. Fecha y hora */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>
              3. Fecha y hora
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <MobixTextField
                label="Fecha"
                mobixVariant="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <MobixTextField
                label="Hora"
                mobixVariant="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <MobixTextField
                label="Fecha y hora"
                mobixVariant="datetime"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Paper>

          {/* 4. Numéricos y monetarios */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>
              4. Numéricos y monetarios
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <MobixTextField
                label="Cantidad"
                mobixVariant="number"
                fullWidth
              />
              <MobixTextField
                label="Monto"
                mobixVariant="currency"
                fullWidth
              />
              <MobixTextField
                label="Porcentaje"
                mobixVariant="percentage"
                fullWidth
              />
            </Stack>
          </Paper>

          {/* 5. Carga de archivos */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>
              5. Carga de archivos
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* Subida con botón (inline) */}
              <MobixFileUploadInline
                label="Subida con botón"
                helperText="Formatos: JPG, PNG, PDF. Máx. 10MB."
                accept=".jpg,.jpeg,.png,.pdf"
              />

              {/* Drag & drop */}
              <MobixFileUpload
                label="Arrastrar y soltar"
                helperText="Formatos: JPG, PNG, PDF. Máx. 10MB."
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
              />
            </Stack>
          </Paper>

          {/* 6. Estados */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              6. Estados
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <MobixTextField
                label="Predeterminado"
                helperText="Texto de ayuda opcional"
                fullWidth
              />
              <MobixTextField
                label="Éxito"
                color="success"
                fullWidth
                helperText="Valor válido"
              />
              <MobixTextField
                label="Error"
                error
                helperText="Este campo es obligatorio"
                fullWidth
              />
              <MobixTextField
                label="Deshabilitado"
                disabled
                fullWidth
              />
            </Stack>
          </Paper>
        </Box>
      </Box>
    );
  },
};