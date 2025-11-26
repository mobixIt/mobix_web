'use client';

import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const MobixButtonOutlined = styled(Button)(({ theme }) => ({
  borderRadius: 2,
  height: 40,
  fontFamily: 'Roboto',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
}));
