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
      open={open}
      onClose={onStayActive}
      disableBackdropClose
      maxWidth="xs"
      fullWidth
      header={<Header>¿Sigues ahí?</Header>}
      body={
        <Body>
          <p>
            Tu sesión se cerrará automáticamente en <br />
            {secondsLeft} segundos por inactividad.
          </p>
        </Body>
      }
      footer={
        <Footer>
          <MobixButton variant="contained" onClick={onStayActive}>
            Continuar sesión
          </MobixButton>
        </Footer>
      }
    />
  );
}
