import apiClient from './apiClientService';
import type { ApiSuccessResponse } from '@/types/api';

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
export async function fetchUserInfo() {
  const response = await apiClient.get('/me');
  return response.data;
}

/**
 * Requests a new session token from the backend.
 * This uses the httpOnly refresh cookie automatically.
 *
 * @returns A promise resolving to the new session data.
 */
export async function refreshUserToken(): Promise<ApiSuccessResponse<{ expires_at: string; idle_timeout_minutes?: number }>> {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
}

/**
 * Logs out the user from the current session.
 * The backend will clear the httpOnly authentication cookie.
 */
export async function logoutUser() {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('userTokenExpiresAt');
  localStorage.removeItem('userIdleTimeout');
}

/**
 * Notifies the backend that the user is still active.
 * Used to extend or maintain session activity.
 */
export async function notifyBackendOfActivity() {
  try {
    await apiClient.post('/session/activity');
  } catch (err) {
    console.error('[Session] Failed to notify backend of activity:', err);
  }
}
