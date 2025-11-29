'use client';

import * as React from 'react';
import HeaderView from './HeaderView';

export default function Header() {
  const userMock = {
    name: 'Harold Rangel',
    email: 'user@example.com',
    avatarUrl: undefined,
  };
  
  return (
    <HeaderView
      userName={userMock.name}
      userEmail={userMock.email}
      avatarUrl={userMock.avatarUrl}
      notificationsCount={3}
      onMyAccountClick={() => console.log('Ir a Mi cuenta')}
      onLogoutClick={() => console.log('Cerrar sesión')}
    />
  );
}


