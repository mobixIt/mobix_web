'use client';

import { styled } from '@mui/material/styles';
import { MobixButton } from './MobixButton';

export const MobixButtonSecondaryAction = styled(MobixButton)(() => ({
  '& .MuiButton-label': {
    fontSize: '16px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    lineHeight: '20px',
  },
}));
