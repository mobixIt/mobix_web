'use client';

import { useCallback } from 'react';
import { logoutUser } from '@/services/userAuthService';
import { redirectToBaseLogin } from '@/utils/redirectToLogin';

export function useLogout() {
  const handleLogout = useCallback(() => {
    void (async () => {
      try {
        await logoutUser();
      } finally {
        redirectToBaseLogin();
      }
    })();
  }, []);

  return handleLogout;
}