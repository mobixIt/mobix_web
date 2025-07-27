'use client';

import React from 'react';

interface Props {
  secondsLeft: number;
  onStayActive: () => void;
}

export default function SessionTimeoutModal({ secondsLeft, onStayActive }: Props) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <h2>¿Sigues ahí?</h2>
        <p>Tu sesión se cerrará automáticamente en {secondsLeft} segundos por inactividad.</p>
        <button
          onClick={onStayActive}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.5rem',
            backgroundColor: '#1E6687',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Continuar sesión
        </button>
      </div>
    </div>
  );
}