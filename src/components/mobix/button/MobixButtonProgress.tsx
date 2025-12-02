'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import { MobixButton } from './MobixButton';

interface MobixButtonProgressProps {
  isSubmitting?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  type?: 'button' | 'submit' | 'reset';
}

const Root = styled('div')({
  position: 'relative',
  display: 'inline-block',
  width: '100%',
});

const ProgressContainer = styled('div')(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ProgressContainerContained = styled(ProgressContainer)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const ProgressContainerOutlined = styled(ProgressContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.primary.main}50`,
}));

const HiddenText = styled('span')({
  opacity: 0,
});

export function MobixButtonProgress({
  isSubmitting = false,
  children,
  variant = 'contained',
  sx,
  ...props
}: MobixButtonProgressProps) {
  const isContained = variant === 'contained';
  const isOutlined = variant === 'outlined';

  return (
    <Root>
      <MobixButton
        {...props}
        variant={variant}
        disabled={isSubmitting || props.disabled}
        className={isSubmitting ? 'no-border' : undefined}
        sx={{
          border: isSubmitting ? '0 !important' : undefined,
          ...(sx || {}),
        }}
      >
        {isSubmitting ? <HiddenText>{children}</HiddenText> : children}
      </MobixButton>

      {isSubmitting && (
        <>
          {isContained && (
            <ProgressContainerContained>
              <CircularProgress size={24} sx={{ color: '#FFF' }} />
            </ProgressContainerContained>
          )}

          {isOutlined && (
            <ProgressContainerOutlined>
              <CircularProgress size={24} color="primary" />
            </ProgressContainerOutlined>
          )}
        </>
      )}
    </Root>
  );
}

export default MobixButtonProgress;