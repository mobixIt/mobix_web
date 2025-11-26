'use client';

import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const MobixButton = styled(Button)(({ theme }) => ({
  borderRadius: 2,
  height: 40,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  marginRight: theme.spacing(2),
  textTransform: 'uppercase',

  '&:last-child': {
    marginRight: 0,
  },

  fontFamily: theme.typography.fontFamily,
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  lineHeight: '16px',

  '&.Mui-disabled': {
    color: theme.palette.text.disabled ?? 'rgba(0,0,0,0.38)',
    backgroundColor: theme.palette.action.disabledBackground,
  },
}));
