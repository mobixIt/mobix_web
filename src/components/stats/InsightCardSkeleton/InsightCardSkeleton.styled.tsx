'use client';

import { styled, keyframes } from '@mui/material/styles';
import { Paper, Box, Skeleton } from '@mui/material';

// Animación de brillo sutil
const shimmer = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

// Replica exacta de InsightCardRoot (padding, gap, background)
export const SkeletonContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  gap: theme.spacing(3), // Mismo gap que el real
  padding: theme.spacing(3), // Mismo padding que el real
  minHeight: 156,
  backgroundColor: theme.palette.background.paper,
  // Borde izquierdo gris suave para indicar que es un placeholder
  borderLeft: `4px solid ${theme.palette.action.disabledBackground}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1], // Sombra sutil por defecto
}));

// Replica de InsightHeader (Flex space-between)
export const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

// Contenedor para el bloque de Valor + Label
export const ValueBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

// Componente base para los elementos del esqueleto
export const ShimmerSkeleton = styled(Skeleton)(({ theme }) => ({
  // Usamos el color de "hover" o "selected" para que se adapte al modo Dark/Light automáticamente
  backgroundColor: theme.palette.action.hover, 
  animation: `${shimmer} 2s ease-in-out infinite`,
  transform: 'scale(1, 1)', // Corrige un bug visual de MUI Skeleton
}));
