import apiClient from './apiClientService';

export async function loginUser(emailOrId: string, password: string) {
  const response = await apiClient.post('/session/create', {
    emailOrId,
    password,
  });
  return response.data;
}

export async function fetchUserInfo(userToken: string) {
  const response = await apiClient.get('/session/me', {
    headers: {
      'X-User-Authorization': `Bearer ${userToken}`,
    },
  });
  return response.data;
}

export async function refreshUserToken(refreshToken: string) {
  const userToken = localStorage.getItem('userToken');
  const response = await apiClient.post('/session/refresh',
    { refreshToken },
    {
      headers: {
        'X-User-Authorization': `Bearer ${userToken}`,
      },
    }
  );
  return response.data;
}

export async function logoutUser(userToken: string) {
  await apiClient.post('/session/logout', {}, {
    headers: {
      'X-User-Authorization': `Bearer ${userToken}`,
    },
  });
}