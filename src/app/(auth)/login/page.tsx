'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import LoginForm from '@/components/auth/LoginForm';

/**
 * Layout principal
 */
const LoginContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: '#F5F7FA',
  fontFamily: theme.typography.fontFamily,
}));

const BackgroundSvg = styled('svg')({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0
});

/**
 * Shapes flotantes (SVG)
 * Notas importantes:
 * - animation: usamos duraciones más cortas para que se vea el movimiento
 * - transformBox y transformOrigin para que el transform en SVG sea consistente
 */
const FloatShape1Path = styled('path')({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

const FloatShape2Path = styled('path')({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

const FloatCircle1 = styled('circle')({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

const FloatCircle2 = styled('circle')({
  transformBox: 'fill-box',
  transformOrigin: 'center',
});

const FooterBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(4),
  width: '100%',
  textAlign: 'center',
  zIndex: 10,
  '& p': {
    ...theme.typography.caption,
    color: theme.palette.text.secondary,
    opacity: 0.6,
  },
}));

export default function LoginPage() {
  return (
    <LoginContainer id="login-container">
      <BackgroundSvg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{
                stopColor: '#082A3F',
                stopOpacity: 0.15,
              }}
            />
            <stop
              offset="100%"
              style={{
                stopColor: '#0E3D58',
                stopOpacity: 0.08,
              }}
            />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{
                stopColor: '#65BBB0',
                stopOpacity: 0.2,
              }}
            />
            <stop
              offset="100%"
              style={{
                stopColor: '#8FD2C9',
                stopOpacity: 0.1,
              }}
            />
          </linearGradient>
        </defs>

        <FloatShape1Path
          d="M-200,400 Q400,200 800,400 T1600,400 L1600,0 L-200,0 Z"
          fill="url(#gradient1)"
        />

        <FloatShape2Path
          d="M1920,600 Q1500,750 1100,600 T300,600 L300,1080 L1920,1080 Z"
          fill="url(#gradient2)"
        />

        <FloatCircle1
          cx="1700"
          cy="200"
          r="150"
          fill="#65BBB0"
          opacity="0.05"
        />

        <FloatCircle2
          cx="200"
          cy="900"
          r="200"
          fill="#0E3D58"
          opacity="0.05"
        />
      </BackgroundSvg>

      <LoginForm />

      <FooterBadge id="footer-badge">
        <Typography variant="caption">
          Mobix © 2026 - Monitoreo de Flotas Urbanas
        </Typography>
      </FooterBadge>
    </LoginContainer>
  );
}