'use client';

import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

const radarSpin = keyframes`
  to { transform: rotate(360deg); }
`;

const ringBreathe = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.15; }
  50% { transform: scale(1.05); opacity: 0.1; }
`;

const orbitSpin = keyframes`
  to { transform: rotate(360deg); }
`;

const lineFlow = keyframes`
  to { stroke-dashoffset: -100; }
`;

const dataBurst = keyframes`
  0% { stroke-dasharray: 0 100; stroke-dashoffset: 130; opacity: 1; }
  50% { stroke-dasharray: 20 100; opacity: 1; } 
  100% { stroke-dasharray: 0 100; stroke-dashoffset: -10; opacity: 0; }
`;

const coreHeartbeat = keyframes`
  0%, 100% { transform: scale(1); background-color: #0B2436; }
  10% { transform: scale(1.15); background-color: #2D968F; box-shadow: 0 0 0 6px rgba(45, 150, 143, 0.2); }
  20% { transform: scale(1); }
`;

const pingNode = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(45, 150, 143, 0.7); transform: scale(1); }
  10% { transform: scale(1.2); background: #2D968F; border-color: #0B2436; }
  70% { box-shadow: 0 0 0 10px rgba(45, 150, 143, 0); transform: scale(1); }
  100% { box-shadow: 0 0 0 0 rgba(45, 150, 143, 0); }
`;

const textPulse = keyframes`
  0%, 100% { opacity: 0.5; letter-spacing: 3px; }
  50% { opacity: 1; letter-spacing: 4px; }
`;

const LoaderContainer = styled(Box)(() => ({
  position: 'relative',
  width: '160px',
  height: '160px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const RadarSweep = styled('div')(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: 'conic-gradient(from 0deg, transparent 0%, transparent 60%, rgba(45, 150, 143, 0.1) 100%)',
  animation: `${radarSpin} 4s linear infinite`,
  zIndex: 0,
  opacity: 0.6,
}));

const OrbitRing = styled('svg')(() => ({
  position: 'absolute',
  width: '140px',
  height: '140px',
  fill: 'none',
  stroke: '#0B2436',
  strokeWidth: 1,
  strokeDasharray: '4 6',
  opacity: 0.15,
  animation: `${ringBreathe} 6s ease-in-out infinite`,
}));

const OrbitRingInner = styled('svg')(() => ({
  position: 'absolute',
  width: '90px',
  height: '90px',
  fill: 'none',
  stroke: '#2D968F',
  strokeWidth: 1.5,
  strokeDasharray: '40 100',
  strokeLinecap: 'round',
  opacity: 0.3,
  animation: `${orbitSpin} 8s linear infinite reverse`,
}));

const DataNetwork = styled('svg')(() => ({
  position: 'absolute',
  width: '160px',
  height: '160px',
  zIndex: 2,
  overflow: 'visible',
  '& .connection-line': {
    fill: 'none',
    stroke: '#0B2436',
    strokeWidth: 1,
    strokeDasharray: '5 5',
    opacity: 0.15,
    animation: `${lineFlow} 20s linear infinite`,
  },
  '& .data-packet': {
    fill: 'none',
    stroke: '#2D968F',
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeDasharray: '0 100',
    filter: 'drop-shadow(0 0 4px #2D968F)',
    animation: `${dataBurst} 2s cubic-bezier(0.1, 0.7, 1.0, 0.1) infinite`,
  },
  '& .dp-1': { animationDelay: '0s' },
  '& .dp-2': { animationDelay: '0.6s' },
  '& .dp-3': { animationDelay: '1.2s' },
}));

const Core = styled('div')(() => ({
  position: 'absolute',
  width: '20px',
  height: '20px',
  backgroundColor: '#0B2436',
  borderRadius: '50%',
  zIndex: 10,
  boxShadow: '0 0 0 4px rgba(255,255,255,0.5), 0 0 15px rgba(11, 36, 54, 0.3)',
  animation: `${coreHeartbeat} 2s ease-in-out infinite`,
  top: '70px',
  left: '70px',
}));

const Satellite = styled('div')(() => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  backgroundColor: 'white',
  border: '2px solid #2D968F',
  borderRadius: '50%',
  zIndex: 5,
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  '&.s-1': { top: '22px', left: '72px', animation: `${pingNode} 3s infinite 0.2s` },
  '&.s-2': { top: '117px', left: '30px', animation: `${pingNode} 3s infinite 0.8s` },
  '&.s-3': { top: '117px', left: '114px', animation: `${pingNode} 3s infinite 1.4s` },
}));

const LoadingText = styled(Typography)(() => ({
  color: '#0B2436',
  fontSize: '10px',
  letterSpacing: '3px',
  textTransform: 'uppercase',
  marginTop: '60px',
  opacity: 0.7,
  fontWeight: 700,
  animation: `${textPulse} 3s ease-in-out infinite`,
}));

export default function MobixLoader() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <LoaderContainer>
        <RadarSweep />

        <OrbitRing viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="69" />
        </OrbitRing>
        <OrbitRingInner viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="45" />
        </OrbitRingInner>

        <DataNetwork viewBox="0 0 160 160">
          <path className="connection-line" d="M80,80 L80,30" />
          <path className="data-packet dp-1" d="M80,80 L80,30" pathLength="100" />

          <path className="connection-line" d="M80,80 L38,125" />
          <path className="data-packet dp-2" d="M80,80 L38,125" pathLength="100" />

          <path className="connection-line" d="M80,80 L122,125" />
          <path className="data-packet dp-3" d="M80,80 L122,125" pathLength="100" />
        </DataNetwork>

        <Core />
        <Satellite className="s-1" />
        <Satellite className="s-2" />
        <Satellite className="s-3" />
      </LoaderContainer>

      <LoadingText variant="h3">ACTIVANDO MOVILIDAD INTELIGENTE...</LoadingText>
    </Box>
  );
}
