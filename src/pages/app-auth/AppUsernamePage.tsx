import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppAuthLayout } from '@/components/app-auth/AppAuthLayout';
import { AppAuthInput } from '@/components/app-auth/AppAuthInput';
import { AppAuthButton } from '@/components/app-auth/AppAuthButton';
import { Toast, Loader } from '@/components/ui-custom';
import { getCookie, getRequest, patchRequest, ENDPOINTS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { clearDashboardReadinessCache } from '@/components/ui-custom/DashboardAccessGuard';

const USERNAME_REGEX = /^@[a-z0-9_-]{3,29}$/;
const SKIP_KEY = 'bluesea_username_skipped_token';

export function AppUsernamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const email = location.state?.email || '';

  const [username, setUsername] = useState('');
  const [existingUsername, setExistingUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameValid, setUsernameValid] = useState(false);

  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const token = getCookie('access_token') || '';
  const skippedForCurrentLogin = useMemo(
    () => !!token && sessionStorage.getItem(SKIP_KEY) === token,
    [token]
  );

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUsername = async () => {
      if (!token) {
        if (!cancelled) setChecking(false);
        return;
      }

      try {
        const profile = await getRequest(ENDPOINTS.user);
        const nickname = profile?.preference?.nickname;

        if (!cancelled && typeof nickname === 'string' && nickname.trim()) {
          setExistingUsername(nickname.trim());
          setUsername(nickname.trim());
        }
      } catch (error) {
        console.error('Failed to check existing username:', error);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    loadCurrentUsername();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const formattedUsername = useMemo(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return '';
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  }, [username]);

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError(null);
      setUsernameValid(false);
      return;
    }

    if (!USERNAME_REGEX.test(value)) {
      setUsernameError(
        'Username must be 4–30 characters and use lowercase letters, numbers, underscores, or hyphens.'
      );
      setUsernameValid(false);
      return;
    }

    setUsernameError(null);
    setUsernameValid(true);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    validateUsername(value.startsWith('@') ? value : value ? `@${value}` : '');
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingUsername) {
      navigate('/app-auth/create-pin', { state: { email }, replace: true });
      return;
    }

    if (!usernameValid || !formattedUsername) {
      setUsernameError('Enter a valid username before continuing.');
      return;
    }

    setSaving(true);
    showLoader();

    try {
      /*
       * This is the existing backend user endpoint supplied for
       * updating the authenticated user's profile. The backend
       * remains responsible for validating whether the nickname
       * is already taken.
       */
      const response = await patchRequest(ENDPOINTS.user, {
        nickname: formattedUsername,
      });

      if (response?.state === false || response?.success === false) {
        const message = response?.message || 'Username is not available.';
        setUsernameError(message);
        showToast(message);
        return;
      }

      await refreshUser();
      clearDashboardReadinessCache();
      showToast('Username set successfully!');
      navigate('/app-auth/create-pin', {
        state: { email },
        replace: true,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Username is not available. Please choose another username.';

      setUsernameError(message);
      showToast(message);
    } finally {
      hideLoader();
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (token) sessionStorage.setItem(SKIP_KEY, token);
    navigate('/app-auth/create-pin', { state: { email }, replace: true });
  };

  if (checking) {
    return (
      <AppAuthLayout>
        <LoaderComponent />
        <div className="w-full max-w-md mx-auto p-6 flex items-center justify-center min-h-[300px]">
          <p className="text-sm text-slate-500 dark:text-slate-400">Checking your account...</p>
        </div>
      </AppAuthLayout>
    );
  }

  if (skippedForCurrentLogin) {
    navigate('/app-auth/create-pin', { state: { email }, replace: true });
    return null;
  }

  return (
    <AppAuthLayout>
      <ToastComponent />
      <LoaderComponent />

      <div className="w-full max-w-md mx-auto px-5 py-6 sm:p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">
          Choose a Username
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
          Your username is optional. You can skip it and continue to PIN setup.
        </p>

        {existingUsername ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-4">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                Username already set
              </p>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {existingUsername}
              </p>
            </div>

            <AppAuthButton type="button" className="w-full" onClick={handleContinue}>
              Continue
            </AppAuthButton>
          </div>
        ) : (
          <form onSubmit={handleContinue} className="space-y-4">
            <AppAuthInput
              label="Username"
              type="text"
              placeholder="@john_doe"
              value={username}
              onChange={handleUsernameChange}
              disabled={saving}
            />

            {usernameError && (
              <p className="text-sm text-red-500 text-center">{usernameError}</p>
            )}

            {usernameValid && !usernameError && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">
                Username format is valid. Continue to save it.
              </p>
            )}

            <div className="space-y-3 pt-2">
              <AppAuthButton
                type="submit"
                className="w-full"
                disabled={!usernameValid || !!usernameError || saving}
                loading={saving}
              >
                Continue
              </AppAuthButton>

              <AppAuthButton
                type="button"
                variant="secondary"
                onClick={handleSkip}
                disabled={saving}
                className="w-full"
              >
                Skip for now
              </AppAuthButton>
            </div>
          </form>
        )}
      </div>
    </AppAuthLayout>
  );
}
