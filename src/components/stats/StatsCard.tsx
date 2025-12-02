'use client';

import React from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import {
  StatCardRoot,
  StatCardMain,
  StatCardTitle,
  StatCardValue,
  StatCardHelper,
  StatCardIconWrapper,
  type StatCardColor,
} from './StatsCard.styled';

export type StatsCardProps = {
  /** Main label, e.g. "Total Usuarios" */
  title: string;
  /** Big number/value shown in the center */
  value: number | string;
  /** Optional helper text, e.g. "12% vs mes anterior" */
  helperText?: string;
  /** Optional icon displayed before the helper text */
  helperIcon?: React.ReactNode;
  /**
   * Color variant for borders and icon background.
   * Maps to Mobix palette: primary, secondary, success, warning, etc.
   */
  variant?: StatCardColor;
  /** Right-side large icon (inside the circular background) */
  icon?: React.ReactNode;
  /**
   * Optional click handler for the whole card.
   * When defined, the card becomes interactive and keyboard-focusable.
   */
  onClick?: () => void;
  /**
   * When true, the card is considered “active / selected”.
   * Useful when the card is used as a filter toggle.
   */
  isActive?: boolean;
  /** Optional data-testid for testing */
  'data-testid'?: string;
};

export default function StatsCard({
  title,
  value,
  helperText,
  helperIcon,
  variant = 'secondary',
  icon,
  onClick,
  isActive = false,
  'data-testid': dataTestId,
}: StatsCardProps) {
  const finalHelperIcon = helperIcon ?? <ArrowUpwardIcon fontSize="inherit" />;

  const isClickable = !!onClick;

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!isClickable) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <StatCardRoot
      variant={variant}
      clickable={isClickable}
      active={isActive}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={isClickable ? isActive : undefined}
      data-testid={dataTestId}
      onKeyDown={handleKeyDown}
    >
      <StatCardMain>
        <StatCardTitle>{title}</StatCardTitle>
        <StatCardValue>{value}</StatCardValue>

        {helperText && (
          <StatCardHelper
            sx={(theme) => ({
              color:
                variant === 'success'
                  ? theme.palette.success.main
                  : variant === 'warning'
                  ? theme.palette.warning.dark
                  : variant === 'primary'
                  ? theme.palette.primary.main
                  : variant === 'secondary'
                  ? theme.palette.secondary.main
                  : theme.palette.text.secondary,
            })}
          >
            {finalHelperIcon && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                }}
              >
                {finalHelperIcon}
              </span>
            )}
            <span>{helperText}</span>
          </StatCardHelper>
        )}
      </StatCardMain>

      {icon && (
        <StatCardIconWrapper variant={variant} active={isActive}>
          {icon}
        </StatCardIconWrapper>
      )}
    </StatCardRoot>
  );
}
