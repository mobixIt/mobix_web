'use client';

import * as React from 'react';
import type { ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MobixButton } from './MobixButton';

export interface MobixIconButtonProps extends ButtonProps {
  icon: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const MobixIconButtonRoot = styled(MobixButton)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    marginInlineStart: theme.spacing(1),
    marginInlineEnd: 0,
  },

  '& .MuiButton-startIcon svg, & .MuiButton-endIcon svg': {
    fontSize: 20,
  },
}));

export function MobixIconButton({
  icon,
  iconPosition = 'left',
  children,
  ...props
}: MobixIconButtonProps) {
  const startIcon = iconPosition === 'left' ? icon : undefined;
  const endIcon = iconPosition === 'right' ? icon : undefined;

  return (
    <MobixIconButtonRoot
      {...props}
      startIcon={startIcon}
      endIcon={endIcon}
    >
      {children}
    </MobixIconButtonRoot>
  );
}
