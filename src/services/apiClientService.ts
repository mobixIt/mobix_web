import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/firstparty`,
});

apiClient.interceptors.request.use((config) => {
  const appToken = localStorage.getItem('accessToken');
  if (appToken) {
    config.headers.Authorization = `Bearer ${appToken}`;
  }
  return config;
});

export default apiClient;