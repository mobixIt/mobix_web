'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Button } from '@mui/material';

import { MobixModal, type MobixModalProps } from '@/components/mobix/modal';

const meta: Meta<typeof MobixModal> = {
  title: 'Mobix/Common/MobixModal',
  component: MobixModal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'onClose' },
  },
  args: {
    open: true,
    maxWidth: 'sm',
    fullWidth: true,
  } satisfies Partial<MobixModalProps>,
};

export default meta;

type Story = StoryObj<typeof MobixModal>;

export const Basic: Story = {
  args: {
    header: (
      <Typography
        variant="inherit"
        component="span"
        fontWeight={700}
        align="center"
        sx={{ display: 'block' }}
      >
        Default Modal Header
      </Typography>
    ),
    body: (
      <Typography variant="body1">
        Este es un modal genérico con header, body y footer.  
        Puedes personalizar completamente su contenido.
      </Typography>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => alert('Primary action clicked')}
        >
          Aceptar
        </Button>
      </div>
    ),
  },
};

export const WithTwoActions: Story = {
  args: {
    header: (
      <Typography
        variant="inherit"
        component="span"
        fontWeight={700}
        align="center"
        sx={{ display: 'block' }}
      >
        Confirmación Necesaria
      </Typography>
    ),
    body: (
      <Typography variant="body1">
        ¿Estás seguro de que deseas continuar con esta acción?
      </Typography>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
        <Button variant="outlined" onClick={() => alert('Cancelar')}>
          Cancelar
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => alert('Confirmado')}
        >
          Confirmar
        </Button>
      </div>
    ),
  },
};

export const NonDismissableBackdrop: Story = {
  args: {
    disableBackdropClose: true,
    header: (
      <Typography
        variant="inherit"
        component="span"
        fontWeight={700}
        align="center"
        sx={{ display: 'block' }}
      >
        Acción requerida
      </Typography>
    ),
    body: (
      <Typography variant="body2">
        Este modal no se puede cerrar haciendo clic fuera del diálogo o con ESC.
        Solo una acción explícita del usuario puede cerrarlo.
      </Typography>
    ),
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => alert('Entendido')}
        >
          Entendido
        </Button>
      </div>
    ),
  },
};
