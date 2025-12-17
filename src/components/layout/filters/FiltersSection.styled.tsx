'use client';

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export const FiltersSectionRoot = styled('section')(({ theme }) => ({
  padding: theme.spacing(0),
  backgroundColor: theme.palette.background.default,
}));

export const FiltersCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow:
    '0 4px 12px rgba(15, 23, 42, 0.06), 0 0 4px rgba(15, 23, 42, 0.03)',
  padding: theme.spacing(3),
}));

export const FiltersHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

export const FiltersTitle = styled(Typography)<TypographyProps>(({ theme }) => ({
  fontSize: '0.95rem',
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.primary.main,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}));

export const FiltersActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  justifyContent: 'flex-end',
  flex: 1,
}));

type FiltersGridProps = {
  columns: number;
};

export const FiltersGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'columns',
})<FiltersGridProps>(({ theme, columns }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2.5),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
}));

type FiltersGridWrapperProps = {
  expanded: boolean;
  collapsedRows: number;
};

export const FiltersGridWrapper = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'expanded' && prop !== 'collapsedRows',
})<FiltersGridWrapperProps>(({ expanded, collapsedRows }) => {

  const rowHeightPx = 96;
  const collapsedMaxHeight = collapsedRows * rowHeightPx;

  return {
    overflow: 'hidden',
    transition: 'max-height 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
    maxHeight: expanded ? 1000 : collapsedMaxHeight,
  };
});

type FilterFieldItemProps = {
  colSpan?: number;
};

export const FilterFieldItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'colSpan',
})<FilterFieldItemProps>(({ colSpan = 1 }) => ({
  gridColumn: `span ${colSpan}`,
}));

type FilterLabelProps = TypographyProps & {
  htmlFor?: string;
};

const FilterLabelBase = (props: FilterLabelProps) => {
  const { children, ...rest } = props;
  return (
    <Typography component="label" {...rest}>
      {children}
    </Typography>
  );
};

export const FilterLabel = styled(FilterLabelBase)(({ theme }) => ({
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: theme.typography.fontWeightMedium,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

export const FiltersToggleWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));
