import apiClient from './apiClientService';
import type { ApiSuccessResponse } from '@/types/api';
import type { MeResponse, MembershipResponse } from '@/types/access-control';
import { clearSessionIdleCookie } from '@/utils/sessionIdleCookie';

/**
 * Authenticates a user using email or ID and password.
 *
 * @param emailOrId - The user's email or identification number.
 * @param password - The user's password.
 * @returns A promise resolving to the session data (tokens, expiration, etc.).
 */
export async function loginUser(
  emailOrId: string,
  password: string
): Promise<ApiSuccessResponse<{ expires_at: string; idle_timeout_minutes?: number }>> {
  const response = await apiClient.post('/auth/login', {
    person: { login: emailOrId, password },
  });
  return response.data;
}

/**
 * Retrieves information about the current authenticated user.
 * Requires a valid session cookie (httpOnly).
 *
 * @returns A promise resolving to the user's session information.
 */
export async function fetchUserInfo(): Promise<ApiSuccessResponse<MeResponse>> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}

/**
 * Requests a new session token from the backend.
 * This uses the httpOnly refresh cookie automatically.
 *
 * @returns A promise resolving to the new session data.
 */
type RefreshPayload = {
  expires_at: string;
  idle_timeout_minutes?: number;
};

let inFlightRefresh: Promise<ApiSuccessResponse<RefreshPayload>> | null = null;
export async function refreshUserToken(): Promise<ApiSuccessResponse<RefreshPayload>> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    try {
      const response = await apiClient.post<ApiSuccessResponse<RefreshPayload>>(
        '/auth/refresh'
      );

      return response.data;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

/**
 * Logs out the user from the current session.
 * The backend will clear the httpOnly authentication cookie.
 */
export async function logoutUser() {
  try {
    await apiClient.delete('/auth/logout');
  } catch (error) {
    console.error('Error calling /auth/logout', error);
  } finally {
    clearSessionIdleCookie();
  }
}

/**
 * Notifies the backend that the user is still active.
 * Used to extend or maintain session activity.
 */
export async function notifyBackendOfActivity() {
  try {
    await apiClient.post('/auth/activity');
  } catch (err) {
    console.error('[Session] Failed to notify backend of activity:', err);
  }
}

/**
 * Retrieves membership + roles info for the current person in a given tenant.
 * Requires a valid session cookie (httpOnly).
 */
export async function fetchUserMembership(
  tenantSlug: string
): Promise<ApiSuccessResponse<MembershipResponse>> {
  const response = await apiClient.get('/auth/membership', {
    headers: {
      'X-Tenant': tenantSlug,
    },
  });

  return response.data;
}

