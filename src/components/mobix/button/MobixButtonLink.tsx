'use client';

import { styled } from '@mui/material/styles';

export const MobixButtonLink = styled('button')(({ theme }) => ({
  border: 0,
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  cursor: 'pointer',

  fontFamily: 'Roboto',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '24px',
  textDecoration: 'underline',

  padding: 0,
  outline: 'none',
}));
