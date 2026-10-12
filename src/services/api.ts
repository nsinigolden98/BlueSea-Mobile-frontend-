// ==========================================
// BlueSea Mobile - Central API & Auth Utility
// ==========================================

import Cookies from 'js-cookie';
import { refreshAccessToken, shouldAttemptRefresh } from '@/lib/session';
import { authHeaders, getSessionToken } from '@/lib/session';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.blueseamobile.com'
).replace(/\/+$/, '');

export function setCookie(name: string, token: string) {
  Cookies.set(name, token, {
    expires: 1,
    path: '/',
    secure: true,
    sameSite: 'lax',
  });
}

export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

export function getAuthToken(): string {
  return getSessionToken() ?? '';
}

export function deleteCookie(name: string) {
  Cookies.remove(name, { path: '/' });
}

function getAuthHeaders(isJson = true, unsafe = false): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...authHeaders(unsafe),
  };

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function withRefresh<T>(endpoint: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (e: any) {
    if (shouldAttemptRefresh(endpoint, e?.status ?? 0)) {
      try {
        if (await refreshAccessToken(API_BASE_URL)) return await run();
      } catch {
        // fall through and rethrow the original below
      }
    }
    throw e;
  }
}

export async function getRequest<T>(endpoint: string): Promise<T> {
  return withRefresh(endpoint, async () => {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method: 'GET',
      credentials: 'include',
      headers: getAuthHeaders(true, false),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err: any = new Error(errorData.detail || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.json() as Promise<T>;
  });
}
export async function postRequest<T>(endpoint: string, body: unknown): Promise<T> {
  return withRefresh(endpoint, async () => {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(true, true),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err: any = new Error(errorData.detail || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.json() as Promise<T>;
  });
}
export async function postFileRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  return withRefresh(endpoint, async () => {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(false, true),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err: any = new Error(errorData.detail || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.json() as Promise<T>;
  });
}
export async function putRequest<T>(endpoint: string, body: unknown): Promise<T> {
  return withRefresh(endpoint, async () => {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method: 'PUT',
      credentials: 'include',
      headers: getAuthHeaders(true, true),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err: any = new Error(errorData.detail || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.json() as Promise<T>;
  });
}
export async function patchRequest<T>(endpoint: string, body: unknown): Promise<T> {
  return withRefresh(endpoint, async () => {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(true, true),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err: any = new Error(errorData.detail || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    return response.json() as Promise<T>;
  });
}
export async function deleteRequest<T>(endpoint: string): Promise<T> {
  return withRefresh(endpoint, async () => {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(true, true),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err: any = new Error(errorData.detail || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      throw err;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  });
}
