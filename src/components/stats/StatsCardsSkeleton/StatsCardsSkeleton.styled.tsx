import { keyframes, styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import type { Theme } from '@mui/material/styles';
import { StatsCardVariant } from './StatsCardsSkeleton.types';

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

type CardRootProps = {
  $variant: StatsCardVariant;
  $active?: boolean;
};

export const getVariantAccentColor = (theme: Theme, variant: StatsCardVariant): string => {
  switch (variant) {
    case 'teal':
      return theme.palette.secondary.main;
    case 'green':
      return theme.palette.success.main;
    case 'yellow':
      return theme.palette.warning.main;
    case 'navy':
    default:
      return theme.palette.primary.main;
  }
};

export const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

export const CardsGrid = styled(Grid)(({ theme }) => ({
  maxWidth: 1920,
  margin: '0 auto',
  width: '100%',
  padding: theme.spacing(4),
}));

export const CardRoot = styled(Paper, {
  shouldForwardProp: (prop) => prop !== '$variant' && prop !== '$active',
})<CardRootProps>(({ theme, $variant, $active }) => {
  const accent = getVariantAccentColor(theme, $variant);
  const activeBg = alpha(accent, 0.12);

  return {
    backgroundColor: $active ? activeBg : theme.palette.background.paper,
    borderRadius: Number(theme.shape.borderRadius) * 2, // igual StatsCard
    padding: theme.spacing(2, 3),
    borderLeftWidth: 4,
    borderLeftStyle: 'solid',
    borderLeftColor: $active ? alpha(accent, 0.9) : accent,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2.5), // igual StatsCard (20px)

    boxShadow: $active
      ? '0px 12px 28px rgba(9, 30, 66, 0.16), 0px 4px 12px rgba(9, 30, 66, 0.08)'
      : '0px 6px 16px rgba(9, 30, 66, 0.05), 0px 0px 8px rgba(9, 30, 66, 0.03)',

    // importante: no fijes height 124 si tu StatsCard real no la tiene fija
    // (eso era del HTML). Deja que el contenido defina el alto como el real.
    // Si necesitas forzar altura para igualarlo, usa minHeight.
    minHeight: 156, // <- este valor suele calzar con tu StatsCard (ajústalo si tu layout final difiere)
    overflow: 'hidden',
  };
});

export const Main = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  // para que el lado izquierdo ocupe el ancho adecuado y no “encojan” los skeletons
  flex: 1,
  minWidth: 0,
  gap: theme.spacing(1.5), // coincide con Title->Value spacing visual
}));

export const HelperRow = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5), // igual a StatCardHelper mt
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75), // igual StatCardHelper gap
}));

type IconWrapperProps = {
  $variant: StatsCardVariant;
  $active?: boolean;
};

export const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$variant' && prop !== '$active',
})<IconWrapperProps>(({ theme, $variant, $active }) => {
  const accent = getVariantAccentColor(theme, $variant);

  return {
    width: 80,
    height: 80,
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,

    backgroundImage: `linear-gradient(135deg, ${
      $active ? alpha(accent, 0.55) : alpha(accent, 0.35)
    }, ${alpha(accent, 0.65)})`,

    boxShadow: $active
      ? '0 14px 30px rgba(8, 42, 63, 0.18)'
      : '0 12px 24px -8px rgba(8, 42, 63, 0.16)',
  };
});

export const ShimmerSkeleton = styled(Skeleton)(({ theme }) => ({
  transform: 'none',
  background: `linear-gradient(to right, ${theme.palette.grey[100]} 4%, ${theme.palette.grey[200]} 25%, ${theme.palette.grey[100]} 36%)`,
  backgroundSize: '1000px 100%',
  animation: `${shimmer} 2s infinite linear`,
}));
