'use client';

import { Typography, TypographyProps } from '@mui/material';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';

interface AuthLinkProps extends TypographyProps {
  href: string;
  children: React.ReactNode;
}

export default function AuthLink({ href, children, ...rest }: AuthLinkProps) {
  const theme = useTheme();

  return (
    <Typography
      component={Link}
      href={href}
      variant="body2"
      textAlign="center"
      sx={{
        color: theme.palette.primary.dark,
        textDecoration: 'underline',
        cursor: 'pointer',
        fontWeight: theme.typography.fontWeightMedium,
      }}
      {...rest}
    >
      {children}
    </Typography>
  );
}