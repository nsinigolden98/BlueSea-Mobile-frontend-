import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AuthLoader } from '@/components/ui-custom';
import { getCookie, getRequest, ENDPOINTS } from '@/types';

type DashboardReadiness = {
  nicknameSet: boolean;
  pinSet: boolean;
};

// The readiness result is intentionally kept in memory.
// It is checked again when the app/website is opened fresh, but normal
// Dashboard -> other page -> Dashboard navigation does not cause another API call.
const readinessCache = new Map<string, DashboardReadiness>();

export function clearDashboardReadinessCache() {
  readinessCache.clear();
}

export function DashboardAccessGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [readiness, setReadiness] = useState<DashboardReadiness | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkReadiness = async () => {
      if (loading) return;

      if (!isAuthenticated) {
        if (!cancelled) setChecking(false);
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
          nicknameSet: typeof nickname === 'string' && nickname.trim().length > 0,
          pinSet: profile?.pin_is_set === true,
        };

        readinessCache.set(accessToken, result);

        if (!cancelled) {
          setReadiness(result);
          setChecking(false);
        }
      } catch (requestError) {
        console.error('Failed to check dashboard account readiness:', requestError);
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

  if (!readiness.nicknameSet) {
    return <Navigate to="/app-auth/username" replace />;
  }

  if (!readiness.pinSet) {
    return <Navigate to="/app-auth/create-pin" replace />;
  }

  return <>{children}</>;
}
