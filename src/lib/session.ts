// Session token handling for the cookie migration.
// The access JWT lives ONLY here, in memory: never localStorage, never a
// readable cookie (both are XSS-readable). The httpOnly server cookies carry
// the web session automatically (withCredentials); this memory token carries
// native apps and WebSocket URLs, where cookies don't flow cross-origin.

let memoryToken: string | null = null;
let memoryRefresh: string | null = null;

export function setSessionToken(token: string | null, refresh?: string | null) {
  memoryToken = token && token.length > 0 ? token : null;
  if (refresh !== undefined) {
    memoryRefresh = refresh && refresh.length > 0 ? refresh : null;
  }
  if (token === null) memoryRefresh = null;
}

export function getSessionToken(): string | null {
  return memoryToken;
}

export function getSessionRefresh(): string | null {
  return memoryRefresh;
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

// ---- silent refresh ----

type Listener = () => void;
const listeners = new Set<Listener>();

// Sockets subscribe: after a rotation they must reconnect with the new
// memory token (their 4401 handlers stop otherwise).
export function onSessionRefreshed(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notifyRefreshed() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // A failing listener must never break the refresh flow.
    }
  });
}

// Endpoints that must never trigger a refresh (would loop or leak).
function isAuthEndpoint(url: string): boolean {
  return [
    '/accounts/login',
    '/accounts/sign-up',
    '/accounts/verify',
    '/accounts/token/refresh',
    '/accounts/password',
    '/accounts/resend',
    '/accounts/pin/reset',
  ].some((p) => url.includes(p));
}

export function shouldAttemptRefresh(url: string, status: number): boolean {
  return status === 401 && !isAuthEndpoint(url);
}

let inflight: Promise<boolean> | null = null;

// Rotation cooldown: a completed rotation (success or failure) suppresses
// new network rotations for ROTATE_COOLDOWN_MS, returning the last result.
// Without this, a client whose retried requests keep 401ing (or sockets
// stuck in 4401) rotates in a tight loop — single-use rotation means every
// iteration burns a refresh token and hammers the endpoint.
const ROTATE_COOLDOWN_MS = 10_000;
let lastFinish = 0;
let lastResult = false;

// Rotate the session: cookie-first (web), memory-refresh body fallback
// (native, where httpOnly cookies don't flow). Single-flighted so concurrent
// 401s share one rotation. Notifies socket subscribers on success.
export function refreshAccessToken(apiBase: string): Promise<boolean> {
  if (!inflight) {
    const now = Date.now();
    if (now - lastFinish < ROTATE_COOLDOWN_MS) {
      return Promise.resolve(lastResult);
    }
    inflight = doRefresh(apiBase)
      .then((ok) => {
        lastFinish = Date.now();
        lastResult = ok;
        return ok;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('csrf_token='));
  return hit ? decodeURIComponent(hit.slice('csrf_token='.length)) : null;
}

async function doRefresh(apiBase: string): Promise<boolean> {
  try {
    const body = memoryRefresh ? { refresh_token: memoryRefresh } : {};
    // The live access cookie (if any) makes this a cookie-authed unsafe
    // call, so attach the double-submit value like every other POST.
    const csrf = readCsrfCookie();
    const res = await fetch(`${apiBase}/accounts/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      // Never hang the auth bootstrap on a stalled tunnel: abort the
      // rotation so callers resolve (logged-out) instead of pending forever.
      // (Generous: debug hashing + tunnel routinely cost tens of seconds.)
      signal: AbortSignal.timeout(60000),
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'X-CSRFToken': csrf } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setSessionToken(null);
      return false;
    }
    const data = await res.json().catch(() => null);
    const access = data?.access_token;
    if (typeof access !== 'string' || !access) return false;
    setSessionToken(access, typeof data?.refresh_token === 'string' ? data.refresh_token : undefined);
    notifyRefreshed();
    return true;
  } catch {
    return false;
  }
}
