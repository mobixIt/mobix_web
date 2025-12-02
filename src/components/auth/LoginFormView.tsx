'use client';

import React from 'react';
import Image from 'next/image';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import AuthTextField from './AuthTextField';
import AuthLink from '@/components/AuthLink';
import MobixButtonProgress from '@/components/mobix/button/MobixButtonProgress';

import {
  AccentStripe,
  CardContentBox,
  ErrorAlert,
  FieldsWrapper,
  ForgotPasswordBox,
  Form,
  HiddenInput,
  LoginCard,
  LogoSection,
  LogoWrapper,
} from './LoginFormView.styled';

type LoginFormViewProps = {
  email: string;
  password: string;
  error: string;
  isSubmitting: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

export default function LoginFormView({
  email,
  password,
  error,
  isSubmitting,
  onSubmit,
  onEmailChange,
  onPasswordChange,
}: LoginFormViewProps) {
  const theme = useTheme();

  return (
    <LoginCard>
      <AccentStripe />
      <CardContentBox>
        <LogoSection>
          <LogoWrapper>
            <Image
              src="/logo.svg"
              alt="Mobix Logo"
              width={100}
              height={100}
              style={{ width: '100%', height: '100%' }}
              priority
            />
          </LogoWrapper>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              letterSpacing: '-0.03em',
            }}
          >
            Iniciar sesión
          </Typography>
        </LogoSection>

        <Form noValidate autoComplete="off" onSubmit={onSubmit}>
          <HiddenInput type="text" name="fakeuser" />
          <HiddenInput type="password" name="fakepass" />

          <FieldsWrapper>
            <AuthTextField
              label="ID ó Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Ingrese su ID o correo"
              autoComplete="username"
              data-testid="login-email"
            />

            <AuthTextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
              showPasswordToggle
              data-testid="login-password"
            />
          </FieldsWrapper>

          {error && <ErrorAlert severity="error">{error}</ErrorAlert>}

          <Box sx={{ mt: 1, width: '100%', display: 'flex', justifyContent: 'stretch' }}>
            <MobixButtonProgress
              isSubmitting={isSubmitting}
              variant="contained"
              onClick={undefined}
              type="submit"
              sx={{ width: '100%' }}
              data-testid="login-submit"
            >
              INICIAR SESIÓN
            </MobixButtonProgress>
          </Box>

          <ForgotPasswordBox>
            <AuthLink href="/reset-password">
              ¿Olvidó su contraseña?
            </AuthLink>
          </ForgotPasswordBox>
        </Form>
      </CardContentBox>
    </LoginCard>
  );
}