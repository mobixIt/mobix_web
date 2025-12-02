import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { fn } from 'storybook/test';

import LoginFormView from '@/components/auth/LoginFormView';
import theme from '@/theme';

const meta: Meta<typeof LoginFormView> = {
  title: 'Mobix/Final/LoginForm',
  component: LoginFormView,
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (themeInstance) =>
              themeInstance.palette.background.default,
            p: 2,
          }}
        >
          <Story />
        </Box>
      </ThemeProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof LoginFormView>;

// mock que evita el submit real del formulario
const onSubmitMock = fn((event: React.FormEvent) => {
  event.preventDefault();
});

export const Default: Story = {
  args: {
    email: '',
    password: '',
    error: '',
    isSubmitting: false,
    onSubmit: onSubmitMock,
    onEmailChange: fn(),
    onPasswordChange: fn(),
  },
};

export const WithError: Story = {
  args: {
    email: 'user@example.com',
    password: 'wrong-password',
    error: 'Credenciales incorrectas. Por favor intente nuevamente.',
    isSubmitting: false,
    onSubmit: onSubmitMock,
    onEmailChange: fn(),
    onPasswordChange: fn(),
  },
};

export const Submitting: Story = {
  args: {
    email: 'user@example.com',
    password: 'secret123',
    error: '',
    isSubmitting: true,
    onSubmit: onSubmitMock,
    onEmailChange: fn(),
    onPasswordChange: fn(),
  },
};