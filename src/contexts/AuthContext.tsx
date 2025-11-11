'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getClientToken, refreshClientToken, verifyClientToken } from '@/services/oauthService';
import {
  initClientTokenStorageFromResponse,
  updateClientAccessTokenFromRefresh,
  clearClientTokenStorage,
} from '@/utils/appAuthStorage';

/**
 * Interface representing the structure of expected OAuth errors
 */
interface OAuthError {
  status?: number;
  message?: string;
  response?: {
    status?: number;
  };
}

/**
 * Interface for authentication context values
 */
interface AuthContextType {
  accessToken?: string | null;
  refreshToken?: string | null;
  isAppChecked?: boolean;
  isAppAuthorized?: boolean;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  refreshToken: null,
  isAppChecked: true,
  isAppAuthorized: true,
});

/**
 * Global authentication provider that manages OAuth client token lifecycle,
 * app authorization state, and session revalidation.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // const [accessToken, setAccessToken] = useState<string | null>(null);
  // const [refreshToken, setRefreshToken] = useState<string | null>(null);
  // const [isAppChecked, setIsAppChecked] = useState(false);
  // const [isAppAuthorized, setIsAppAuthorized] = useState(true);

  const router = useRouter();
  // const pathname = usePathname();

  // let refreshTimer: NodeJS.Timeout;

  /**
   * Redirect to homepage if the app was previously blocked and is now authorized.
   */
  // useEffect(() => {
  //   if (isAppChecked && isAppAuthorized && pathname === '/app-disabled') {
  //     router.push('/');
  //   }
  // }, [isAppChecked, isAppAuthorized, pathname, router]);

  /**
   * Initializes authentication:
   * - Tries to reuse tokens from localStorage if still valid
   * - Verifies with backend if token is still authorized
   * - Otherwise requests a new client token from the backend
   * - Manages app availability and redirection based on backend response
   */
  useEffect(() => {
    async function initializeAuth() {
      // const storedAccessToken = localStorage.getItem('accessToken');
      // const storedRefreshToken = localStorage.getItem('refreshToken');
      // const expiresAtStr = localStorage.getItem('accessTokenExpiresAt');

      // ✅ Reuse token if still valid for more than 30s and backend confirms it
      // if (storedAccessToken && storedRefreshToken && expiresAtStr) {
      //   const now = Math.floor(Date.now() / 1000);
      //   const expiresAt = parseInt(expiresAtStr, 10);
      //   const secondsLeft = expiresAt - now;

      //   if (secondsLeft > 30) {
      //     try {
      //       await verifyClientToken(storedAccessToken);
      //       setAccessToken(storedAccessToken);
      //       setRefreshToken(storedRefreshToken);
      //       setIsAppAuthorized(true);
      //       setIsAppChecked(true);
      //       scheduleTokenRefresh(secondsLeft);
      //       return;
      //     } catch (error) {
      //       const typedError = error as OAuthError;
      //       const status = typedError?.response?.status || typedError?.status;
      //       const isBlocked =
      //         typedError?.message === 'APP_DISABLED' || status === 401 || status === 403;

      //       if (isBlocked) {
      //         setIsAppAuthorized(false);
      //         setIsAppChecked(true);
      //         router.push('/app-disabled');
      //         return;
      //       }
      //     }
      //   }
      // }

      try {
        // const tokenData = await getClientToken(
        //   process.env.NEXT_PUBLIC_MOBIX_CLIENT_ID!,
        //   process.env.NEXT_PUBLIC_MOBIX_CLIENT_SECRET!
        // );

        // setAccessToken(tokenData.access_token);
        // setRefreshToken(tokenData.refresh_token);
        // setIsAppAuthorized(true);
        // setIsAppChecked(true);

        // initClientTokenStorageFromResponse(tokenData);

        // scheduleTokenRefresh(tokenData.expires_in);
      } catch {
        // const typedError = error as OAuthError;

        // const status = typedError?.response?.status || typedError?.status;
        // const isBlocked =
        //   typedError?.message === 'APP_DISABLED' || status === 401 || status === 403;

        // /**
        //  * ⛔️ If the app is blocked or unauthorized, mark as unauthorized and redirect
        //  */
        // if (isBlocked) {
        //   setIsAppAuthorized(false);
        //   setIsAppChecked(true);
        //   router.push('/app-disabled');
        //   return;
        // }

        // setIsAppAuthorized(true);
        // setIsAppChecked(true);
      }
    }

    initializeAuth();

    // return () => {
    //   if (refreshTimer) clearTimeout(refreshTimer);
    // };
  }, [router]);

  /**
   * Sets a timer to refresh the access token before it expires.
   * @param secondsUntilExpire Seconds until the current token expires
   */
  // function scheduleTokenRefresh(secondsUntilExpire: number) {
  //   const refreshDelay = (secondsUntilExpire - 30) * 1000;

  //   refreshTimer = setTimeout(async () => {
  //     try {
  //       const storedRefreshToken = localStorage.getItem('refreshToken');
  //       if (!storedRefreshToken) throw new Error('No refresh token found in storage');

  //       const refreshedTokenData = await refreshClientToken(storedRefreshToken);

  //       setAccessToken(refreshedTokenData.access_token);

  //       updateClientAccessTokenFromRefresh(refreshedTokenData);

  //       scheduleTokenRefresh(refreshedTokenData.expires_in);
  //     } catch (error) {
  //       const typedError = error as OAuthError;
  //       const status = typedError?.response?.status || typedError?.status;
  //       const isBlocked =
  //         typedError?.message === 'APP_DISABLED' || status === 401 || status === 403;

  //       setAccessToken(null);
  //       setRefreshToken(null);

  //       clearClientTokenStorage();

  //       // ⛔️ If the refresh fails due to disabled app or invalid credentials, redirect
  //       if (isBlocked) {
  //         setIsAppAuthorized(false);
  //         setIsAppChecked(true);

  //         router.push('/app-disabled');
  //         return;
  //       }
  //     }
  //   }, refreshDelay);
  // }

  /**
   * ⏳ Block rendering until the app availability has been verified
   */
  // if (!isAppChecked) {
  //   return null;
  // }

  /**
   * ✅ Allow visiting /app-disabled but block all other views if app is unauthorized
   */
  // if (!isAppAuthorized && pathname !== '/app-disabled') {
  //   return null;
  // }

  return (
    // <AuthContext.Provider
    //   value={{
    //     accessToken,
    //     refreshToken,
    //     isAppChecked,
    //     isAppAuthorized,
    //   }}
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the AuthContext
 * @returns Auth context with access token, refresh token, and app status
 */
export function useAuth() {
  return useContext(AuthContext);
}