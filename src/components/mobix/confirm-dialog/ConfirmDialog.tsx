'use client';

import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import type { MobixModalProps } from './types';
import {
  StyledDialog,
  ModalTitle,
  ModalContent,
  ModalActions,
  PrimaryActionButton,
  SecondaryActionButton,
} from './styles';

export function MobixConfirmDialog(props: MobixModalProps) {
  const {
    open,
    title,
    children,
    onClose,
    primaryActionLabel,
    onPrimaryAction,
    secondaryActionLabel,
    onSecondaryAction,
    disableBackdropClose = false,
    maxWidth = 'sm',
    fullWidth = true,
  } = props;

  const handleClose = (
    _event: object,
    reason: 'backdropClick' | 'escapeKeyDown',
  ) => {
    if (disableBackdropClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return;
    }
    onClose?.();
  };

  const showActions = Boolean(primaryActionLabel || secondaryActionLabel);

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      {title && (
        <ModalTitle>
          {title}
        </ModalTitle>
      )}

      {children && <ModalContent dividers>{children}</ModalContent>}

      {showActions && (
        <ModalActions>
          {secondaryActionLabel && (
            <SecondaryActionButton
              variant="text"
              color="primary"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </SecondaryActionButton>
          )}

          {primaryActionLabel && (
            <PrimaryActionButton
              variant="text"
              color="primary"
              onClick={onPrimaryAction}
            >
              {primaryActionLabel}
            </PrimaryActionButton>
          )}
        </ModalActions>
      )}
    </StyledDialog>
  );
}
