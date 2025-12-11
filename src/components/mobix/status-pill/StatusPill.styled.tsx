import { styled } from '@mui/material/styles';

export type StatusPillVariant = 'active' | 'inactive' | 'warning' | 'info';

interface StatusPillRootProps {
  colorVariant: StatusPillVariant;
}

export const StatusPillRoot = styled('span', {
  shouldForwardProp: (prop) => prop !== 'colorVariant',
})<StatusPillRootProps>(({ theme, colorVariant }) => {
  let backgroundColor = theme.palette.neutral.light;
  let textColor = theme.palette.text.secondary;

  switch (colorVariant) {
    case 'active':
      backgroundColor = theme.palette.success.light;
      textColor = theme.palette.success.dark;
      break;
    case 'inactive':
      backgroundColor = theme.palette.neutral.light;
      textColor = theme.palette.neutral.dark;
      break;
    case 'warning':
      backgroundColor = theme.palette.warning.light;
      textColor = theme.palette.warning.dark;
      break;
    case 'info':
      backgroundColor = theme.palette.info.light;
      textColor = theme.palette.info.dark;
      break;
    default:
      break;
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px 10px',
    borderRadius: 9999,
    fontSize: '0.75rem', // 12p
    fontWeight: 500,
    lineHeight: 1.4,
    backgroundColor,
    color: textColor,
    whiteSpace: 'nowrap',
  };
});
