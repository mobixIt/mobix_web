'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Button, buttonClasses, type ButtonProps } from '@mui/material';

const StyledOutlinedButton = styled(Button, {
  name: 'MobixButtonOutlined',
  slot: 'Root',
})(({ theme }) => ({
  [`&.${buttonClasses.outlined}`]: {
    borderRadius: 2,
    height: 40,
    fontFamily: 'Roboto',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },

  [`&.${buttonClasses.outlined}.${buttonClasses.colorPrimary}`]: {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },

  [`&.${buttonClasses.outlined}.${buttonClasses.colorSecondary}`]: {
    borderColor: theme.palette.secondary.main,
    color: theme.palette.secondary.main,
  },

  [`&.${buttonClasses.outlined}.${buttonClasses.colorSuccess}`]: {
    borderColor: theme.palette.success.main,
    color: theme.palette.success.main,
  },

  [`&.${buttonClasses.outlined}.${buttonClasses.colorError}`]: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
  },

  [`&.${buttonClasses.outlined}.${buttonClasses.colorWarning}`]: {
    borderColor: theme.palette.warning.main,
    color: theme.palette.warning.main,
  },

  [`&.${buttonClasses.outlined}.${buttonClasses.colorInfo}`]: {
    borderColor: theme.palette.info.main,
    color: theme.palette.info.main,
  },
}));

export type MobixButtonOutlinedProps = ButtonProps;

export const MobixButtonOutlined: React.FC<MobixButtonOutlinedProps> = (props) => (
  <StyledOutlinedButton
    variant="outlined"
    {...props}
  />
);

export default MobixButtonOutlined;