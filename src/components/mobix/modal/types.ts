import type { ReactNode } from 'react';
import type { DialogProps } from '@mui/material/Dialog';

export interface MobixModalProps {
  open: boolean;
  onClose?: () => void;

  disableBackdropClose?: boolean;

  maxWidth?: DialogProps['maxWidth'];
  fullWidth?: boolean;

  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  testId?: string;
}
