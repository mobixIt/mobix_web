export interface ClientTokenResponse {
  /** OAuth token type (e.g., "Bearer"). */
  token_type: string;
  /** The access token issued by the OAuth server. */
  access_token: string;
  /** The refresh token used to obtain a new access token. */
  refresh_token: string;
  /** Time in seconds until the access token expires. */
  expires_in: number;
}

/**
 * Stores the application (client) OAuth token information in `localStorage`.
 *
 * The following keys are stored:
 * - `accessToken`: The OAuth access token.
 * - `refreshToken`: The OAuth refresh token.
 * - `accessTokenExpiresAt`: Expiration time of the access token as a UNIX timestamp in seconds.
 *
 * @param data - The token response returned by the OAuth server.
 */
export function initClientTokenStorageFromResponse(data: ClientTokenResponse): void {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + data.expires_in;

  localStorage.setItem('accessToken', data.access_token);
  localStorage.setItem('refreshToken', data.refresh_token);
  localStorage.setItem('accessTokenExpiresAt', String(expiresAt));
}

/**
 * Updates only the access token and its expiration time in `localStorage` after a token refresh.
 *
 * @param data - Partial token response containing only `access_token` and `expires_in`.
 */
export function updateClientAccessTokenFromRefresh(
  data: Pick<ClientTokenResponse, 'access_token' | 'expires_in'>
): void {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + data.expires_in;

  localStorage.setItem('accessToken', data.access_token);
  localStorage.setItem('accessTokenExpiresAt', String(expiresAt));
}

/**
 * Removes all stored application (client) token keys from `localStorage`.
 *
 * This clears:
 * - `accessToken`
 * - `refreshToken`
 * - `accessTokenExpiresAt`
 */
export function clearClientTokenStorage(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessTokenExpiresAt');
}