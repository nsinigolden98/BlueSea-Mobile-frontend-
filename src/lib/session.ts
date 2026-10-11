// Session token handling for the cookie migration.
// The access JWT lives ONLY here, in memory: never localStorage, never a
// readable cookie (both are XSS-readable). The httpOnly server cookies carry
// the web session automatically (withCredentials); this memory token carries
// native apps and WebSocket URLs, where cookies don't flow cross-origin.

let memoryToken: string | null = null;

export function setSessionToken(token: string | null) {
  memoryToken = token && token.length > 0 ? token : null;
}

export function getSessionToken(): string | null {
  return memoryToken;
}

export function hasSessionToken(): boolean {
  return memoryToken !== null;
}

// Double-submit CSRF value (readable `csrf_token` cookie set by the API).
export function csrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith('csrf_token='));
  return hit ? decodeURIComponent(hit.slice('csrf_token='.length)) : null;
}

// Headers for an authenticated API call: Bearer when we hold the token in
// memory (native + explicit callers), CSRF on unsafe methods for the
// cookie session (web). `withCredentials` must be set on the request.
export function authHeaders(unsafe = false): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getSessionToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (unsafe) {
    const csrf = csrfToken();
    if (csrf) headers['X-CSRFToken'] = csrf;
  }
  return headers;
}
