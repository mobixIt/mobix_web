'use client';

import * as React from 'react';
import {
  DialogTitle,
  DialogContent,
  type DialogProps,
} from '@mui/material';
import type { MobixModalProps } from './types';
import { StyledDialog, StyledFooter } from './styles';

export function MobixModal({
  open,
  onClose,
  disableBackdropClose = false,
  maxWidth = 'sm',
  fullWidth = true,
  header,
  body,
  footer,
}: MobixModalProps) {
  const handleClose: DialogProps['onClose'] = (
    _event,
    reason,
  ) => {
    if (
      disableBackdropClose &&
      (reason === 'backdropClick' || reason === 'escapeKeyDown')
    ) {
      return;
    }
    onClose?.();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      {header && <DialogTitle>{header}</DialogTitle>}

      {body && (
        <DialogContent>
          {body}
        </DialogContent>
      )}

      {footer && (
        <StyledFooter>
          {footer}
        </StyledFooter>
      )}
    </StyledDialog>
  );
}
