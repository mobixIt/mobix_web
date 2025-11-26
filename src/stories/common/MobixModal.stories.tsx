'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Typography } from '@mui/material';

import {
  MobixModal,
  type MobixModalProps,
} from '@/components/mobix/modal';
import {
  MobixButton,
  MobixButtonText,
} from '@/components/mobix/button';

const meta: Meta<typeof MobixModal> = {
  title: 'Mobix/Common/MobixModal',
  component: MobixModal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'onClose' },
  },
  // Solo args serializables aquí
  args: {
    open: true,
    maxWidth: 'sm',
    fullWidth: true,
  } satisfies Partial<MobixModalProps>,
};

export default meta;

type Story = StoryObj<typeof MobixModal>;

export const Basic: Story = {
  render: (args) => (
    <MobixModal
      {...args}
      header={
        <Typography
          variant="inherit"
          component="span"
          fontWeight={700}
          align="center"
          sx={{ display: 'block' }}
        >
          Default Modal Header
        </Typography>
      }
      body={
        <Typography variant="body1">
          Este es un modal genérico con header, body y footer.
          Puedes personalizar completamente su contenido.
        </Typography>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <MobixButton onClick={() => alert('Primary action clicked')}>
            Aceptar
          </MobixButton>
        </div>
      }
    />
  ),
};

export const WithTwoActions: Story = {
  render: (args) => (
    <MobixModal
      {...args}
      header={
        <Typography
          variant="inherit"
          component="span"
          fontWeight={700}
          align="center"
          sx={{ display: 'block' }}
        >
          Confirmación Necesaria
        </Typography>
      }
      body={
        <Typography variant="body1">
          ¿Estás seguro de que deseas continuar con esta acción?
        </Typography>
      }
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 16,
          }}
        >
          <MobixButtonText onClick={() => alert('Cancelar')}>
            Cancelar
          </MobixButtonText>

          <MobixButton onClick={() => alert('Confirmado')}>
            Confirmar
          </MobixButton>
        </div>
      }
    />
  ),
};

export const NonDismissableBackdrop: Story = {
  args: {
    disableBackdropClose: true,
  },
  render: (args) => (
    <MobixModal
      {...args}
      header={
        <Typography
          variant="inherit"
          component="span"
          fontWeight={700}
          align="center"
          sx={{ display: 'block' }}
        >
          Acción requerida
        </Typography>
      }
      body={
        <Typography variant="body2">
          Este modal no se puede cerrar haciendo clic fuera del diálogo o con ESC.
          Solo una acción explícita del usuario puede cerrarlo.
        </Typography>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <MobixButton onClick={() => alert('Entendido')}>
            Entendido
          </MobixButton>
        </div>
      }
    />
  ),
};
