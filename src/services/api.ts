// ==========================================
// BlueSea Mobile - Central API & Auth Utility
// ==========================================

import Cookies from 'js-cookie';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.blueseamobile.com.ng'
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
  return getCookie('access_token') || '';
}

export function deleteCookie(name: string) {
  Cookies.remove(name, { path: '/' });
}

function getAuthHeaders(isJson = true): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${getAuthToken()}`;
  }

  return headers;
}

export async function getRequest<T>(endpoint: string): Promise<T> {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method: 'GET',
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function postRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function postFileRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function putRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function patchRequest<T>(endpoint: string, body: unknown): Promise<T> {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method: 'PATCH',
    headers: getAuthHeaders(true),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function deleteRequest<T>(endpoint: string): Promise<T> {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method: 'DELETE',
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}