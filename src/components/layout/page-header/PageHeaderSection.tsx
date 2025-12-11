'use client';

import React from 'react';
import AddIcon from '@mui/icons-material/Add';

import { MobixButton } from '@/components/mobix/button';

import {
  HeaderSection,
  HeaderContent,
  TitleBlock,
  PageTitle,
  PageSubtitle,
  ActionsWrapper,
} from './PageHeaderSection.styled';

export type PageHeaderSectionProps = {
  /** Main page title, e.g. "Usuarios" */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Action button label text, defaults to "Crear nuevo" */
  actionLabel?: string;
  /** Callback fired when the action button is clicked */
  onActionClick?: () => void;
  /** Disables the action button (e.g. while loading) */
  actionDisabled?: boolean;
  /** If false, the action button will not be rendered */
  showActionButton?: boolean;
  /** Optional icon for the action button (defaults to an "Add" icon) */
  actionIcon?: React.ReactNode;
  /** Position of the icon relative to the label text */
  actionIconPosition?: 'left' | 'right';
  testId?: string;
};

/**
 * Visual header component for index pages (Users, Vehicles, etc.).
 * Uses the Mobix theme and Mobix buttons.
 */
export default function PageHeaderSection({
  title,
  subtitle = 'Gestiona y administra los recursos del sistema',
  actionLabel = 'Crear nuevo',
  onActionClick,
  actionDisabled = false,
  showActionButton = true,
  actionIcon,
  actionIconPosition = 'left',
  testId,
}: PageHeaderSectionProps) {
  const finalIcon = actionIcon ?? <AddIcon />;
  const isLeft = actionIconPosition === 'left';

  return (
    <HeaderSection id="page-header-section" data-testid={testId}>
      <HeaderContent>
        <TitleBlock>
          <PageTitle variant="h1" data-testid={testId ? `${testId}-title` : undefined}>{title}</PageTitle>
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </TitleBlock>

        {showActionButton && (
          <ActionsWrapper>
            <MobixButton
              variant="contained"
              color="primary"
              onClick={onActionClick}
              disabled={actionDisabled}
              aria-label={actionLabel}
              startIcon={isLeft ? finalIcon : undefined}
              endIcon={!isLeft ? finalIcon : undefined}
              sx={{
                // Larger padding to match CTA-style button
                px: 3.5, // roughly equivalent to Tailwind px-8
                py: 1.5, // roughly equivalent to Tailwind py-4
                // Slightly more rounded corners (8px with default theme.spacing)
                borderRadius: 1,
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                // Elevated, soft shadow
                boxShadow: '0px 10px 25px rgba(8, 42, 63, 0.22)',
                // Smooth transitions for hover/active states
                transition:
                  'transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
                '&:hover': {
                  // On hover, move from primary to accent color
                  backgroundColor: 'accent.main',
                  boxShadow: '0px 12px 30px rgba(8, 42, 63, 0.3)',
                  transform: 'scale(1.03)',
                },
                '&:active': {
                  transform: 'scale(0.99)',
                  boxShadow: '0px 6px 16px rgba(8, 42, 63, 0.22)',
                },
                '&.Mui-disabled': {
                  boxShadow: 'none',
                  transform: 'none',
                },
                // Fine-tune spacing between icon and label
                '& .MuiButton-startIcon': {
                  marginRight: 1.25,
                },
                '& .MuiButton-endIcon': {
                  marginLeft: 1.25,
                },
              }}
            >
              {actionLabel}
            </MobixButton>
          </ActionsWrapper>
        )}
      </HeaderContent>
    </HeaderSection>
  );
}