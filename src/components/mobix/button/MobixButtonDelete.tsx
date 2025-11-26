'use client';

import { styled } from '@mui/material/styles';
import { MobixButtonText } from './MobixButtonText';

export const MobixButtonDelete = styled(MobixButtonText)(({ theme }) => ({
  color: theme.palette.error.main,

  '&:hover': {
    backgroundColor: `${theme.palette.error.main}15`,
    borderRadius: 2,
  },
}));