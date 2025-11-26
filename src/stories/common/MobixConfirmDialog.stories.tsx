import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Typography } from '@mui/material';
import { MobixConfirmDialog } from '@/components/mobix/confirm-dialog';
import type { MobixModalProps } from '@/components/mobix/confirm-dialog/types';

type ComponentType = typeof MobixConfirmDialog;

const meta: Meta<ComponentType> = {
  title: 'Mobix/Common/MobixConfirmDialog',
  component: MobixConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClose: { action: 'onClose' },
    onPrimaryAction: { action: 'onPrimaryAction' },
    onSecondaryAction: { action: 'onSecondaryAction' },
  },
  args: {
    open: true,
    maxWidth: 'sm',
    fullWidth: true,
  } satisfies Partial<MobixModalProps>,
};

export default meta;

type Story = StoryObj<ComponentType>;

// ---------------------------------------------
// Stories
// ---------------------------------------------

export const Basic: Story = {
  args: {
    title: 'Basic MobixConfirmDialog',
    primaryActionLabel: 'Aceptar',
    children: (
      <Typography variant="body2">
        Este es un modal base de Mobix. Puedes usarlo para cualquier diálogo
        genérico en la aplicación.
      </Typography>
    ),
  },
};

export const WithSecondaryAction: Story = {
  args: {
    title: 'ConfirmDialog con acciones',
    primaryActionLabel: 'Guardar',
    secondaryActionLabel: 'Cancelar',
    children: (
      <Typography variant="body2">
        Aquí puedes mostrar contenido más largo, formularios o mensajes de
        confirmación. Usa los botones de abajo para simular acciones.
      </Typography>
    ),
  },
};

export const NonDismissableBackdrop: Story = {
  args: {
    title: 'Backdrop no cerrable',
    primaryActionLabel: 'Entendido',
    disableBackdropClose: true,
    children: (
      <Typography variant="body2">
        Este modal no se cierra al hacer clic fuera ni con la tecla ESC.
        Úsalo solo cuando realmente necesites forzar una decisión del usuario.
      </Typography>
    ),
  },
};
