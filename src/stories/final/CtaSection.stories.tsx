'use client';

import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import CtaSection from '@/components/cta/CtaSection';
import theme from '@/theme';

const meta: Meta<typeof CtaSection> = {
  title: 'Mobix/Final/CTA/CtaSection',
  component: CtaSection,
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
            justifyContent: 'center',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 1200 }}>
            <Story />
          </Box>
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof CtaSection>;

export const Default: Story = {
  args: {
    badgeText: 'Mobix IA Disponible 24/7',
    title: '¿Necesitas un análisis más profundo?',
    subtitle:
      'Pregúntame cualquier cosa sobre tu operación. Desde rentabilidad hasta eficiencia de conductores.',
    primaryLabel: 'Hacer Consulta',
    secondaryLabel: 'Ver Ejemplos',
    primaryIcon: <AutoAwesomeIcon />,
    secondaryIcon: <PsychologyIcon />,
  },
};
