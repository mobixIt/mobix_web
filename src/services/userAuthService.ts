import apiClient from './apiClientService';
import type { ApiSuccessResponse } from '@/types/api';

/**
 * Authenticates a user using email or ID and password.
 *
 * @param emailOrId - The user's email or identification number.
 * @param password - The user's password.
 * @returns A promise resolving to the session data (tokens, user info, etc.).
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
 * Retrieves the current session's user information from the backend.
 *
 * @param userToken - The user's access token to authorize the request.
 * @returns A promise resolving to the user's session information.
 */
export async function fetchUserInfo(userToken: string) {
  const response = await apiClient.get('/me', {
    headers: {
      'X-User-Authorization': `Bearer ${userToken}`,
    },
  });
  return response.data;
}

/**
 * Requests a new access token using a refresh token.
 *
 * @param refreshToken - The refresh token obtained during login.
 * @returns A promise resolving to the new session data (e.g., new access token).
 */
export async function refreshUserToken() {
  const res = await apiClient.post('/auth/refresh');
  return res.data;
}

/**
 * Logs out the user from the current session.
 *
 * @param userToken - The user's access token to authorize the logout.
 * @returns A promise that resolves when the logout is completed.
 */
export async function logoutUser() {
  const userToken = localStorage.getItem('userToken');
  await apiClient.post('/auth/logout', {}, {
    headers: {
      'X-User-Authorization': `Bearer ${userToken}`,
    },
  });
}

/**
 * Notifies the backend that the user is still active.
 * Used to prevent session expiration due to inactivity.
 *
 * This function retrieves the token from localStorage.
 * If the token is missing, it silently exits.
 *
 * @returns A promise that resolves once the backend is notified.
 */
export async function notifyBackendOfActivity() {
  const userToken = localStorage.getItem('userToken');
  if (!userToken) return;

  try {
    await apiClient.post('/session/activity', {}, {
      headers: {
        'X-User-Authorization': `Bearer ${userToken}`,
      },
    });
  } catch (err) {
    console.error('[Session] Failed to notify backend of activity:', err);
  }
}