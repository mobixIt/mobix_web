import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/Upload';
import { fn } from 'storybook/test';

import PageHeaderSection from '@/components/layout/page-header/PageHeaderSection';
import theme from '@/theme';

const meta: Meta<typeof PageHeaderSection> = {
  title: 'Mobix/Final/Layout/PageHeaderSection',
  component: PageHeaderSection,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: (themeInstance) =>
              themeInstance.palette.background.default,
            p: 4,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'stretch',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PageHeaderSection>;

/* -------------------------
 * DEFAULT
 * ------------------------- */
export const Default: Story = {
  args: {
    title: 'Usuarios',
    subtitle: 'Gestiona y administra los usuarios del sistema',
    actionLabel: 'Crear nuevo',
    actionIcon: <AddIcon />,               // ⬅️ ahora explícito
    actionIconPosition: 'left',
    onActionClick: fn(),
  },
};

/* -------------------------
 * CUSTOM ICON
 * ------------------------- */
export const WithCustomIcon: Story = {
  args: {
    title: 'Importar datos',
    subtitle: 'Carga masiva de usuarios desde archivo CSV',
    actionLabel: 'Subir archivo',
    actionIcon: <UploadIcon />,            // ⬅️ icono custom
    actionIconPosition: 'left',
    onActionClick: fn(),
  },
};

/* -------------------------
 * NO SUBTÍTULO
 * ------------------------- */
export const WithoutSubtitle: Story = {
  args: {
    title: 'Vehículos',
    actionLabel: 'Registrar vehículo',
    actionIcon: <AddIcon />,               // opcional
    onActionClick: fn(),
  },
};

/* -------------------------
 * DESHABILITADO
 * ------------------------- */
export const ActionDisabled: Story = {
  args: {
    title: 'Usuarios',
    subtitle: 'El botón está deshabilitado (ej: cargando)',
    actionLabel: 'Procesando…',
    actionDisabled: true,
    actionIcon: <AddIcon />,
    onActionClick: fn(),
  },
};

/* -------------------------
 * SIN BOTÓN
 * ------------------------- */
export const NoActionButton: Story = {
  args: {
    title: 'Dashboard general',
    subtitle: 'Vista principal del sistema',
    showActionButton: false,
  },
};

/* -------------------------
 * TÍTULO Y SUBTÍTULO LARGOS
 * ------------------------- */
export const LongTitleAndSubtitle: Story = {
  args: {
    title: 'Control de recursos y permisos avanzados',
    subtitle:
      'Configura el acceso a cada módulo, administra roles, usuarios y políticas de seguridad.',
    actionLabel: 'Agregar recurso',
    actionIcon: <AddIcon />,
    onActionClick: fn(),
  },
};