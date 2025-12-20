'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { MobixButton } from './MobixButton';
import type { ComponentProps } from 'react';

type MobixButtonBaseProps = ComponentProps<typeof MobixButton>;

interface MobixButtonProgressProps extends MobixButtonBaseProps {
  isSubmitting?: boolean;
  fullWidth?: boolean; 
}

const Root = styled('div', {
  shouldForwardProp: (prop) => prop !== 'fullWidth',
})<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  position: 'relative',
  display: fullWidth ? 'flex' : 'inline-flex',
  width: fullWidth ? '100%' : 'auto',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LoaderOverlay = styled('div', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: 'contained' | 'outlined' | 'text' }>(({ theme, variant }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  pointerEvents: 'none',
  
  ...(variant === 'contained' && {
    backgroundColor: theme.palette.primary.main,
    color: '#FFF',
  }),
  ...(variant === 'outlined' && {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.primary.main}50`,
    color: theme.palette.primary.main,
  }),
  ...(variant === 'text' && {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  }),
}));

const HiddenText = styled('span')({
  visibility: 'hidden',
  opacity: 0,
});

export function MobixButtonProgress({
  isSubmitting = false,
  children,
  variant = 'contained',
  fullWidth = false,
  sx,
  disabled,
  ...props
}: MobixButtonProgressProps) {
  
  return (
    <Root fullWidth={fullWidth}>
      <MobixButton
        {...props}
        variant={variant}
        fullWidth={fullWidth}
        disabled={isSubmitting || disabled}
        className={isSubmitting ? 'no-border' : undefined}
        sx={{
          ...(sx || {}),
        }}
      >
        {isSubmitting ? <HiddenText>{children}</HiddenText> : children}
      </MobixButton>

      {isSubmitting && (
        <LoaderOverlay variant={variant}>
          <CircularProgress 
            size={24} 
            color="inherit"
          />
        </LoaderOverlay>
      )}
    </Root>
  );
}

export default MobixButtonProgress;
