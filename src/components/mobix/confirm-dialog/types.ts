'use client';

import type { ReactNode } from 'react';

export interface MobixModalProps {
  /** Controls whether the modal is visible */
  open: boolean;

  /** Title displayed at the top of the modal */
  title?: ReactNode;

  /** Main body content inside the modal */
  children?: ReactNode;

  /** Called when the user closes the modal (backdrop, ESC or close button) */
  onClose?: () => void;

  /** Label for the primary (right) action button */
  primaryActionLabel?: string;

  /** Handler for the primary (right) action button */
  onPrimaryAction?: () => void;

  /** Label for the secondary (left) action button */
  secondaryActionLabel?: string;

  /** Handler for the secondary (left) action button */
  onSecondaryAction?: () => void;

  /** Disable closing the modal by clicking outside or pressing ESC */
  disableBackdropClose?: boolean;

  /** Max width for the modal content (MUI Dialog maxWidth prop) */
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** If true, the modal paper takes the full width of the screen up to maxWidth */
  fullWidth?: boolean;
}
