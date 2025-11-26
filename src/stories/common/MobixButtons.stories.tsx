'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import UploadIcon from '@mui/icons-material/Upload';

import {
  MobixButton,
  MobixButtonSmall,
  MobixButtonOutlined,
  MobixButtonText,
  MobixButtonLink,
  MobixButtonDelete,
  MobixButtonSecondaryAction,
  MobixButtonProgress,
  MobixIconButton, // <-- nuevo import
} from '@/components/mobix/button';

interface ButtonsStoryProps {
  onClick: () => void;
  onDelete: () => void;
  onSecondaryAction: () => void;
}

const meta: Meta<ButtonsStoryProps> = {
  title: 'Mobix/Common/Buttons',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClick: { action: 'click' },
    onDelete: { action: 'delete' },
    onSecondaryAction: { action: 'secondary-action' },
  },
};

export default meta;

type Story = StoryObj<ButtonsStoryProps>;

export const AllButtons: Story = {
  render: ({ onClick, onDelete, onSecondaryAction }) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleProgressClick = () => {
      onClick();
      setIsSubmitting(true);

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxWidth: 360,
        }}
      >
        {/* NORMAL BUTTON */}
        <section>
          <h3>MobixButton (default)</h3>
          <MobixButton
            variant="contained"
            color="primary"
            onClick={onClick}
          >
            Guardar
          </MobixButton>
        </section>

        {/* SMALL BUTTON */}
        <section>
          <h3>MobixButtonSmall</h3>
          <MobixButtonSmall
            variant="contained"
            color="primary"
            onClick={onClick}
          >
            Pequeño
          </MobixButtonSmall>
        </section>

        {/* OUTLINED FULL-WIDTH */}
        <section style={{ width: 300 }}>
          <h3>MobixButtonOutlined (full width)</h3>
          <MobixButtonOutlined
            variant="outlined"
            onClick={onClick}
          >
            Descargar Reporte
          </MobixButtonOutlined>
        </section>

        {/* TEXT BUTTON */}
        <section>
          <h3>MobixButtonText</h3>
          <MobixButtonText onClick={onClick}>
            Continuar
          </MobixButtonText>
        </section>

        {/* LINK BUTTON */}
        <section>
          <h3>MobixButtonLink</h3>
          <MobixButtonLink onClick={onClick}>
            Ver detalles
          </MobixButtonLink>
        </section>

        {/* DELETE BUTTON */}
        <section>
          <h3>MobixButtonDelete</h3>
          <MobixButtonDelete onClick={onDelete}>
            Eliminar registro
          </MobixButtonDelete>
        </section>

        {/* SECONDARY-ACTION BUTTON */}
        <section>
          <h3>MobixButtonSecondaryAction</h3>
          <MobixButtonSecondaryAction
            variant="contained"
            color="primary"
            onClick={onSecondaryAction}
          >
            Acción secundaria
          </MobixButtonSecondaryAction>
        </section>

        {/* PROGRESS BUTTON */}
        <section>
          <h3>MobixButtonProgress</h3>
          <MobixButtonProgress
            variant="contained"
            isSubmitting={isSubmitting}
            onClick={handleProgressClick}
          >
            Guardar
          </MobixButtonProgress>
        </section>

        {/* ICON BUTTON */}
        <section>
          <h3>MobixIconButton</h3>
            <MobixIconButton
              variant="contained"
              color="primary"
              icon={<UploadIcon />}
              iconPosition="left"
              onClick={onClick}
            >
              Subir Archivo
            </MobixIconButton>
          </section>

          <section>
            <h3>MobixIconButton</h3>
            <MobixIconButton
              variant="contained"
              color="primary"
              icon={<UploadIcon />}
              iconPosition="right"
              onClick={onClick}
            >
              Upload Right
            </MobixIconButton>
        </section>
      </div>
    );
  },
};