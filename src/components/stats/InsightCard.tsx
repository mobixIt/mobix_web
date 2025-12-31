'use client';

import React from 'react';
import { Box } from '@mui/material';

import { INSIGHT_CARD_VARIANT_COLOR } from './InsightCard.constants';
import { type InsightCardProps } from './InsightCard.types';
import {
  InsightCardRoot,
  InsightHeader,
  InsightIconWrapper,
  StatusPill,
  InsightValue,
  InsightValueLabel,
  InsightDescription,
  InsightTitle,
  ActionButton,
  ProgressTrack,
  ProgressBar,
} from './InsightCard.styled';

export type { InsightCardProps } from './InsightCard.types';

export default function InsightCard({
  title,
  value,
  helperText,
  icon,
  variant = 'alert',
  statusLabel,
  statusTone,
  description,
  actionLabel,
  actionIcon,
  onAction,
  progressValue,
  progressLabel,
  onClick,
  isActive = false,
  'data-testid': dataTestId,
}: InsightCardProps) {
  const resolvedTone = INSIGHT_CARD_VARIANT_COLOR[variant];
  const pillTone = statusTone ?? resolvedTone;
  const isClickable = !!onClick;

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!isClickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <InsightCardRoot
      variant={resolvedTone} 
      tone={resolvedTone}
      clickable={isClickable}
      active={isActive}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-pressed={isClickable ? isActive : undefined}
      data-testid={dataTestId}
      onKeyDown={handleKeyDown}
    >
      <InsightHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon && (
            <InsightIconWrapper tone={resolvedTone}>
              {icon}
            </InsightIconWrapper>
          )}
        </Box>

        {statusLabel && <StatusPill tone={pillTone}>{statusLabel}</StatusPill>}
      </InsightHeader>

      <InsightTitle>{title}</InsightTitle>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <InsightValue tone={resolvedTone}>{value}</InsightValue>
        {helperText && (
          <InsightValueLabel as="div">{helperText}</InsightValueLabel>
        )}
      </Box>

      {description && <InsightDescription>{description}</InsightDescription>}

      {typeof progressValue === 'number' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ProgressTrack>
            <ProgressBar
              tone={resolvedTone}
              value={progressValue}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.max(0, Math.min(100, progressValue))}
            />
          </ProgressTrack>
          {progressLabel && (
            <InsightValueLabel as="div">
              {progressLabel}
            </InsightValueLabel>
          )}
        </Box>
      )}

      {actionLabel && (
        <ActionButton
          tone={resolvedTone}
          startIcon={actionIcon}
          onClick={onAction ?? onClick}
          data-testid={dataTestId ? `${dataTestId}-action` : undefined}
        >
          {actionLabel}
        </ActionButton>
      )}
    </InsightCardRoot>
  );
}
