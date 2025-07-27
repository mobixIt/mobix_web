/**
 * Clears all session-related data from `localStorage`.
 *
 * This function removes the access token, its expiration timestamp,
 * the idle timeout configuration, and the refresh token (if present).
 * It is typically used during logout or when the session has expired.
 *
 * @example
 * clearSessionStorage();
 */
export function clearSessionStorage(): void {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userTokenExpiresAt');
  localStorage.removeItem('userIdleTimeout');
  localStorage.removeItem('refreshToken');
}