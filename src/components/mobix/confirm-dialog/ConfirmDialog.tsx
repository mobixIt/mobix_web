'use client';

import * as React from 'react';
import type { MobixModalProps } from './types';
import {
  ModalTitle,
  ModalContent,
  ModalActions,
} from './styles';

import { StyledDialog } from '@/components/mobix/modal';
import {
  MobixButton,
  MobixButtonText,
} from '@/components/mobix/button';

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
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (
      disableBackdropClose &&
      (reason === 'backdropClick' || reason === 'escapeKeyDown')
    ) {
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
            <MobixButtonText onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </MobixButtonText>
          )}

          {primaryActionLabel && (
            <MobixButton onClick={onPrimaryAction}>
              {primaryActionLabel}
            </MobixButton>
          )}
        </ModalActions>
      )}
    </StyledDialog>
  );
}
