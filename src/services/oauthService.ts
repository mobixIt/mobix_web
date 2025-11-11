import axios from 'axios';

interface TokenResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Requests the initial OAuth client token using Basic Auth with client_id and client_secret.
 *
 * @param {string} clientId - The client ID registered in the OAuth server.
 * @param {string} clientSecret - The client secret registered in the OAuth server.
 * @returns {Promise<TokenResponse>} The token response containing access and refresh tokens.
 * @throws Will throw an error if the request fails.
 */
export async function getClientToken(clientId: string, clientSecret: string): Promise<TokenResponse> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const response = await axios.post(
    `${apiBaseUrl}/oauth/token`,
    {},
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

/**
 * Refreshes the access token using the previously obtained refresh token.
 *
 * @param {string} refreshToken - The refresh token obtained during the initial authentication.
 * @returns {Promise<Pick<TokenResponse, 'token_type' | 'access_token' | 'expires_in'>>} The new token response with the refreshed access token.
 * @throws Will throw an error if the request fails or the refresh token is invalid/expired.
 */
export async function refreshClientToken(refreshToken: string): Promise<Pick<TokenResponse, 'token_type' | 'access_token' | 'expires_in'>> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await axios.post(
    `${apiBaseUrl}/oauth/refresh`,
    {
      refresh_token: refreshToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

/**
 * Verifies whether the provided client token is still valid and the application is authorized to operate.
 *
 * This function makes a request to the backend `/oauth/validate-client` endpoint using the given access token.
 * If the token is valid and the client is enabled, the request resolves successfully.
 * If the token is expired, revoked, or the client is disabled, it throws an error with status information.
 *
 * @param token - The access token to be validated against the backend.
 * @returns A Promise that resolves if the token is valid; otherwise, it throws an error.
 *
 * @throws {Error} If the token is invalid, expired, or the client is disabled. The error includes a `status` code.
 */
export async function verifyClientToken(token: string): Promise<void> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    await axios.post(
      `${apiBaseUrl}/oauth/validate-client`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || 'Unauthorized';

    const err = new Error(message);
    (err as any).status = status;
    throw err;
  }
}