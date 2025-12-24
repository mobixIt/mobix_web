'use client';

import React from 'react';
import { IconButton, type IconButtonProps } from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';

const shimmerKeyframe = keyframes`
  0% { transform: translateX(-150%); }
  100% { transform: translateX(150%); }
`;

const strongPulseKeyframe = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.85); opacity: 0.7; }
  100% { transform: scale(1.15); opacity: 1; }
`;

const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isLoading',
})<{ isLoading?: boolean }>(({ theme, isLoading }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  width: 48,
  height: 48,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid transparent',
  position: 'relative',
  overflow: 'hidden',

  ...(!isLoading && {
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows[3],
      '& .spark-primary': { transform: 'scale(1.05)' },
      '& .spark-secondary': { transform: 'translate(1.5px, -1.5px) scale(1.1)' },
    },
  }),

  ...(isLoading && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
    cursor: 'wait',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
      transform: 'translateX(-100%)',
      animation: `${shimmerKeyframe} 1.2s infinite cubic-bezier(0.4, 0, 0.2, 1)`,
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.common.white,
      opacity: 0.9,
    },
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      transform: 'none',
      boxShadow: 'none',
    },
  }),

  '&:disabled': {
    ...(!isLoading && {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    }),
  },

  '& svg': {
    ...(isLoading && {
      animation: `${strongPulseKeyframe} 1s infinite ease-in-out alternate`,
    }),
    '& path': {
      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transformOrigin: 'center',
    },
  },
}));

export interface AiSendButtonProps extends IconButtonProps {
  isLoading?: boolean;
}

export const AiSendButton: React.FC<AiSendButtonProps> = ({ isLoading = false, ...props }) => (
  <StyledIconButton isLoading={isLoading} {...props} disabled={isLoading || props.disabled}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        className="spark-primary"
        d="M12 2C12 2 14 8 19 10C14 12 12 18 12 18C12 18 10 12 5 10C10 8 12 2 12 2Z"
        fill="currentColor"
      />
      <path
        className="spark-secondary"
        d="M18 16C18 16 19 19 22 20C19 21 18 24 18 24C18 24 17 21 14 20C17 19 18 16 18 16Z"
        fill="currentColor"
      />
    </svg>
  </StyledIconButton>
);

export default AiSendButton;
