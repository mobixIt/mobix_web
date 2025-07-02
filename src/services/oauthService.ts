import axios from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

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