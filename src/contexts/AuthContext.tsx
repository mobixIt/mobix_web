'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getClientToken, refreshClientToken } from '@/services/oauthService';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType>({ accessToken: null, refreshToken: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  let refreshTimer: NodeJS.Timeout;

  useEffect(() => {
    async function initializeAuth() {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const expiresAtStr = localStorage.getItem('accessTokenExpiresAt');

      if (storedAccessToken && storedRefreshToken && expiresAtStr) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = parseInt(expiresAtStr, 10);
        const secondsLeft = expiresAt - now;

        if (secondsLeft > 30) {
          console.log(`[Auth] Reusing existing token. Valid for ${secondsLeft}s`);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);

          scheduleTokenRefresh(secondsLeft);
          return;
        } else {
          console.log('[Auth] Stored token expired or near expiration. Obtaining new one...');
        }
      }

      try {
        console.log('[Auth] Obtaining new client token...');
        const tokenData = await getClientToken(
          process.env.NEXT_PUBLIC_GEMA_CLIENT_ID!,
          process.env.NEXT_PUBLIC_GEMA_CLIENT_SECRET!
        );

        setAccessToken(tokenData.access_token);
        setRefreshToken(tokenData.refresh_token);

        localStorage.setItem('accessToken', tokenData.access_token);
        localStorage.setItem('refreshToken', tokenData.refresh_token);

        const now = Math.floor(Date.now() / 1000); // current time in seconds
        const expiresAt = now + tokenData.expires_in;
        localStorage.setItem('accessTokenExpiresAt', expiresAt.toString());

        scheduleTokenRefresh(tokenData.expires_in);
      } catch (error) {
        console.error('Error obtaining OAuth client token:', error);
      }
    }

    initializeAuth();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, []);

  function scheduleTokenRefresh(secondsUntilExpire: number) {
    const refreshDelay = (secondsUntilExpire - 30) * 1000; // refresh 30s before expiration

    refreshTimer = setTimeout(async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) throw new Error('No refresh token found in storage');

        const refreshedTokenData = await refreshClientToken(storedRefreshToken);

        setAccessToken(refreshedTokenData.access_token);
        localStorage.setItem('accessToken', refreshedTokenData.access_token);

        const now = Math.floor(Date.now() / 1000);
        const newExpiresAt = now + refreshedTokenData.expires_in;
        localStorage.setItem('accessTokenExpiresAt', newExpiresAt.toString());

        console.log('[Auth] Access token refreshed successfully');

        scheduleTokenRefresh(refreshedTokenData.expires_in);
      } catch (error) {
        console.error('Error refreshing access token:', error);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessTokenExpiresAt');
      }
    }, refreshDelay);
  }

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}