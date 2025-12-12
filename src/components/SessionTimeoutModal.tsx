'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { MobixModal } from '@/components/mobix/modal';
import { MobixButton } from '@/components/mobix/button';

interface Props {
  secondsLeft: number;
  onStayActive: () => void;
  open?: boolean;
}

const Header = styled('span')(({ theme }) => ({
  display: 'block',
  margin: 0,
  textAlign: 'center',
  fontFamily: theme.typography.fontFamily,
}));

const Body = styled('div')(({ theme }) => ({
  textAlign: 'center',
  fontFamily: theme.typography.fontFamily,
}));

const Footer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
});

export default function SessionTimeoutModal({
  secondsLeft,
  onStayActive,
  open = true,
}: Props) {
  return (
    <MobixModal
      testId="session-timeout-modal"
      open={open}
      onClose={onStayActive}
      disableBackdropClose
      maxWidth="xs"
      fullWidth
      header={<Header data-testid="session-timeout-header">¿Sigues ahí?</Header>}
      body={
        <Body data-testid="session-timeout-body">
          <p data-testid="session-timeout-message">
            Tu sesión se cerrará automáticamente en <br />
            <span data-testid="session-timeout-seconds">{secondsLeft}</span> segundos por inactividad.
          </p>
        </Body>
      }
      footer={
        <Footer data-testid="session-timeout-footer">
          <MobixButton
            variant="contained"
            onClick={onStayActive}
            color="info"
            data-testid="session-timeout-stay-active"
          >
            Continuar sesión
          </MobixButton>
        </Footer>
      }
    />
  );
}
