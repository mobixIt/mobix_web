'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
  MobixIconButton,
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
          maxWidth: 520,
        }}
      >
        {/* PRIMARY / SECONDARY / SUCCESS / WARNING / ERROR / INFO / ACCENT / DISABLED */}
        <section>
          <h3>MobixButton (color variants)</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {/* Primary */}
            <MobixButton
              variant="contained"
              color="primary"
              onClick={onClick}
            >
              Primary
            </MobixButton>

            {/* Secondary */}
            <MobixButton
              variant="contained"
              color="secondary"
              onClick={onClick}
            >
              Secondary
            </MobixButton>

            {/* Success */}
            <MobixButton
              variant="contained"
              color="success"
              onClick={onClick}
            >
              Success
            </MobixButton>

            {/* Warning */}
            <MobixButton
              variant="contained"
              color="warning"
              onClick={onClick}
            >
              Warning
            </MobixButton>

            {/* Error / Danger */}
            <MobixButton
              variant="contained"
              color="error"
              onClick={onDelete}
            >
              Danger
            </MobixButton>

            {/* Info */}
            <MobixButton
              variant="contained"
              color="info"
              onClick={onClick}
            >
              Info
            </MobixButton>

            {/* Accent (custom palette color) */}
            <MobixButton
              variant="contained"
              color="accent"
              onClick={onClick}
            >
              Accent
            </MobixButton>

            {/* Disabled */}
            <MobixButton
              variant="contained"
              color="primary"
              disabled
            >
              Disabled
            </MobixButton>
          </div>
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
            color="accent"
            onClick={onClick}
          >
            Descargar Reporte
          </MobixButtonOutlined>
        </section>

        {/* TEXT BUTTON */}
        <section>
          <h3>MobixButtonText</h3>
          <MobixButtonText color="accent" onClick={onClick}>
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
            color="secondary"
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

        {/* ICON BUTTON LEFT */}
        <section>
          <h3>MobixIconButton (left icon)</h3>
          <MobixIconButton
            variant="contained"
            color="primary"
            icon={<UploadIcon />}
            iconPosition="left"
            onClick={onClick}
          >
            Subir archivo
          </MobixIconButton>
        </section>

        {/* ICON BUTTON RIGHT */}
        <section>
          <h3>MobixIconButton (right icon)</h3>
          <MobixIconButton
            variant="contained"
            color="accent"
            icon={<UploadIcon />}
            iconPosition="right"
            onClick={onClick}
          >
            Upload right
          </MobixIconButton>
        </section>
      </div>
    );
  },
};
