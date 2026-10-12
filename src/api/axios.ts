import axios from 'axios';
import { authHeaders, refreshAccessToken, shouldAttemptRefresh } from '@/lib/session';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  undefined,
  async (error) => {
    const config: any = error?.config;
    const status = error?.response?.status ?? 0;
    const url: string = config?.url ?? '';
    if (config && !config.__refreshed && shouldAttemptRefresh(url, status)) {
      config.__refreshed = true;
      try {
        if (await refreshAccessToken(config.baseURL ?? '')) {
          return apiClient.request(config);
        }
      } catch {
        // fall through to the original rejection below
      }
    }
    return Promise.reject(error);
  },
);

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