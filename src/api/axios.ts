import axios from 'axios';
import { authHeaders } from '@/lib/session';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Bearer from memory when held (native/explicit); cookies ride along
  // automatically (web). CSRF header on unsafe methods for the cookie path.
  const unsafe = !['get', 'head', 'options'].includes((config.method ?? 'get').toLowerCase());
  Object.assign(config.headers, authHeaders(unsafe));
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized');
    }

    return Promise.reject(error);
  }
);