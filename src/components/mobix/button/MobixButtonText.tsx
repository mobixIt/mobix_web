'use client';

import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const MobixButtonText = styled(Button)(() => ({
  height: 36,
  border: 0,
  padding: '0 20px',
  backgroundColor: 'transparent',

  fontFamily: 'Roboto',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  lineHeight: '16px',
  textTransform: 'uppercase',
  cursor: 'pointer',
}));
