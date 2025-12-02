'use client';

import { styled } from '@mui/material/styles';
import { Button, type ButtonProps } from '@mui/material';

export const MobixButtonText = styled(Button)<ButtonProps>(
  ({ size = 'medium' }) => {
    const sizeStyles =
      size === 'small'
        ? {
            height: 30,
            padding: '0 14px',
            fontSize: '12px',
            lineHeight: '14px',
          }
        : size === 'large'
        ? {
            height: 44,
            padding: '0 26px',
            fontSize: '15px',
            lineHeight: '18px',
          }
        : {
            height: 36,
            padding: '0 20px',
            fontSize: '14px',
            lineHeight: '16px',
          };

    return {
      border: 0,
      backgroundColor: 'transparent',
      textTransform: 'uppercase',
      fontFamily: 'Roboto',
      fontWeight: 'bold',
      letterSpacing: '0.5px',
      cursor: 'pointer',

      ...sizeStyles,

      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.04)',
      },
    };
  }
);