import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLoader } from '@/components/ui-custom';
import { getCookie, getRequest, ENDPOINTS } from '@/types';

type DashboardReadiness = {
  nicknameSet: boolean;
  pinSet: boolean;
};

const readinessCache = new Map<string, DashboardReadiness>();

// This key is intentionally session-scoped. It only remembers that the user
// skipped the optional username during the current authenticated login session.
// The backend remains the source of truth for the actual username/PIN state.
const USERNAME_SKIP_KEY = 'bluesea_username_skipped_token';

export function clearDashboardReadinessCache() {
  readinessCache.clear();
}

export function DashboardAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const [readiness, setReadiness] = useState<DashboardReadiness | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkReadiness = async () => {
      if (loading) return;

      if (!isAuthenticated) {
        if (!cancelled) {
          setReadiness(null);
          setChecking(false);
        }
        return;
      }

      const accessToken = getCookie('access_token');

      if (!accessToken) {
        if (!cancelled) {
          setChecking(false);
          setError(true);
        }
        return;
      }

      const cached = readinessCache.get(accessToken);

      if (cached) {
        if (!cancelled) {
          setReadiness(cached);
          setChecking(false);
        }
        return;
      }

      try {
        const profile = await getRequest(ENDPOINTS.user);

        const nickname = profile?.preference?.nickname;

        const result: DashboardReadiness = {
          nicknameSet:
            typeof nickname === 'string' && nickname.trim().length > 0,
          pinSet: profile?.pin_is_set === true,
        };

        readinessCache.set(accessToken, result);

        if (!cancelled) {
          setReadiness(result);
          setChecking(false);
          setError(false);
        }
      } catch (requestError) {
        console.error(
          'Failed to check dashboard account readiness:',
          requestError
        );

        if (!cancelled) {
          setChecking(false);
          setError(true);
        }
      }
    };

    checkReadiness();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loading]);

  if (loading || checking) {
    return <AuthLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (error || !readiness) {
    return <Navigate to="/login" replace />;
  }

  const accessToken = getCookie('access_token') || '';
  const usernameWasSkipped =
    !!accessToken &&
    sessionStorage.getItem(USERNAME_SKIP_KEY) === accessToken;

  /*
   * PIN is mandatory.
   *
   * If PIN is missing, always send the user to PIN setup.
   * Username skip never bypasses the PIN requirement.
   */
  if (!readiness.pinSet) {
    return <Navigate to="/app-auth/create-pin" replace />;
  }

  /*
   * PIN exists.
   *
   * If username exists, the account is fully ready.
   */
  if (readiness.nicknameSet) {
    return <>{children}</>;
  }

  /*
   * Username is optional.
   *
   * If the user skipped username during this authenticated session,
   * allow Dashboard access because the mandatory PIN is already set.
   *
   * sessionStorage is intentionally used here so the skip does NOT become
   * a permanent account-completion flag. A new login/session can check again.
   */
  if (usernameWasSkipped) {
    return <>{children}</>;
  }

  /*
   * Username is missing and has not been skipped in this session.
   * Send the user through the optional username step.
   */
  return <Navigate to="/app-auth/username" replace />;
}
