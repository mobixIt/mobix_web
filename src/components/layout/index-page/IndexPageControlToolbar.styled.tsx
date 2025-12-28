'use client';

import { styled, Theme, CSSObject, alpha } from '@mui/material/styles';
import { Box, Chip, keyframes, InputBase, Typography, IconButton } from '@mui/material';

import { MobixButtonOutlined, MobixButtonText } from '@/components/mobix/button';

type ToggleButtonProps = {
  active?: boolean;
};

export const Root = styled('section')(() => ({
  width: '100%',
}));

export const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const Left = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}));

export const Right = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flex: 1,
  minWidth: 320,
}));

export const ToggleButton = styled(MobixButtonOutlined, {
  shouldForwardProp: (prop) => prop !== 'active',
})<ToggleButtonProps>(({ theme, active }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  height: 48,
  minHeight: 48,
  paddingTop: theme.spacing(0.75),
  paddingBottom: theme.spacing(0.75),

  ...(active && {
    borderColor: theme.palette.secondary.main,
    color: theme.palette.secondary.main,
  }),
}));

export const ActiveFiltersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  flexBasis: '100%',
  marginTop: theme.spacing(1),
}));

export const ActiveFiltersLabel = styled('span')(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.text.secondary,
}));

export const ActiveFilterChip = styled(Chip)(({ theme }) => ({
  height: 28,
  borderRadius: 999,
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightMedium,
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.primary.main,
  '& .MuiChip-label': {
    paddingInline: theme.spacing(1.25),
  },
  '& .MuiChip-deleteIcon': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.75),
    fontSize: theme.typography.pxToRem(16),
  },
}));

export const ClearFiltersButton = styled(MobixButtonText)(({ theme }) => ({
  paddingInline: theme.spacing(0.4),
  minWidth: 0,
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'none',
}));

export const AiInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  width: '100%',
}));

export const AiInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  padding: theme.spacing(0.5, 1.5, 0.5, 0.75),
  height: 48,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  boxShadow: `0 6px 14px ${alpha(theme.palette.primary.main, 0.06)}`,
}));

export const AiSendButtonWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 40,
  width: 40,
  flexShrink: 0,
}));

export const AiInputIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.secondary.main,
  flexShrink: 0,
}));

export const AiQuestionInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  fontSize: theme.typography.pxToRem(14),
  lineHeight: theme.typography.pxToRem(20),
  color: theme.palette.text.primary,
  '& .MuiInputBase-input': {
    padding: 0,
  },
  '&::placeholder': {
    color: theme.palette.text.secondary,
  },
}));

const errorGradient = (theme: Theme) =>
  `linear-gradient(90deg, ${alpha(theme.palette.error.main, 0.12)} 0%, ${alpha(
    theme.palette.error.main,
    0.06,
  )} 100%)`;

const infoGradient = (theme: Theme) =>
  `linear-gradient(90deg, ${alpha(theme.palette.info.main, 0.12)} 0%, ${alpha(
    theme.palette.info.main,
    0.05,
  )} 100%)`;

export const SuggestionBanner = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.1, 1.5),
  marginTop: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: color === 'error'
    ? `1px solid ${alpha(theme.palette.error.main, 0.5)}`
    : `1px solid ${alpha(theme.palette.info.main, 0.4)}`,
  background: color === 'error' ? errorGradient(theme) : infoGradient(theme),
}));

export const SuggestionIcon = styled(Box)(({ theme, color }) => ({
  width: 36,
  height: 36,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.common.white,
  color: color === 'error' ? theme.palette.error.main : theme.palette.info.main,
  flexShrink: 0,
}));

export const SuggestionTexts = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const SuggestionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.primary,
  lineHeight: 1.2,
}));

export const SuggestionBody = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: theme.typography.pxToRem(13.5),
  lineHeight: 1.35,
}));

export const SuggestionActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexShrink: 0,
}));

export const SuggestionCloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const mobixShimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const shimmerBase = (theme: Theme): CSSObject => ({
  background: theme.palette.grey[200],
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    transform: 'translateX(-100%)',
    background:
      'linear-gradient(90deg, rgba(243,244,246,0) 0%, rgba(229,231,235,0.9) 50%, rgba(243,244,246,0) 100%)',
    animation: `${mobixShimmer} 2s linear infinite`,
  },
});

export const ToolbarSkeletonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(2),
  width: '100%',
}));

export const ToolbarSkeletonPill = styled('div')(({ theme }) => ({
  height: 48,
  width: 140,
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  ...shimmerBase(theme),
}));

export const ToolbarSkeletonInput = styled('div')(({ theme }) => ({
  height: 48,
  flex: 1,
  minWidth: 240,
  borderRadius: theme.shape.borderRadius,
  ...shimmerBase(theme),
}));
