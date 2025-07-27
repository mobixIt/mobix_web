/**
 * Stores user session information in `localStorage` based on the backend login response.
 *
 * It saves the access token, its expiration time in seconds, the idle timeout in minutes,
 * and optionally the refresh token if present.
 *
 * @param data - Object containing session-related values returned by the backend.
 * @param data.token - The JWT access token.
 * @param data.expires_in - Time (in seconds) until the token expires.
 * @param data.idle_timeout_minutes - Allowed idle time (in minutes) before forcing logout.
 * @param data.refresh_token - (Optional) Refresh token to renew the access token.
 *
 * @example
 * initSessionStorageFromSessionResponse({
 *   token: 'abc.def.ghi',
 *   expires_in: 3600,
 *   idle_timeout_minutes: 15,
 *   refresh_token: 'refresh.123'
 * });
 */
export function initSessionStorageFromSessionResponse(data: {
  token: string;
  expires_in: number;
  idle_timeout_minutes: number;
  refresh_token?: string;
}) {
  const now = Math.floor(Date.now() / 1000); // segundos
  const expiresAt = now + data.expires_in;

  localStorage.setItem('userToken', data.token);
  localStorage.setItem('userTokenExpiresAt', expiresAt.toString());
  localStorage.setItem('userIdleTimeout', data.idle_timeout_minutes.toString());

  if (data.refresh_token) {
    localStorage.setItem('refreshToken', data.refresh_token);
  }
}