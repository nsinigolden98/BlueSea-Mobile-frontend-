import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppAuthLayout } from '@/components/app-auth/AppAuthLayout';
import { AppAuthInput } from '@/components/app-auth/AppAuthInput';
import { AppAuthButton } from '@/components/app-auth/AppAuthButton';
import { Toast, Loader } from '@/components/ui-custom';
import { patchRequest, ENDPOINTS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { clearDashboardReadinessCache } from '@/components/ui-custom/DashboardAccessGuard';

export function AppUsernamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const email = location.state?.email || '';
  const [username, setUsername] = useState('');

  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const handleCreateUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      showToast('Please enter a valid username');
      return;
    }

    const formattedUsername = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;

    const usernameRegex = /^@[a-z0-9_-]{3,29}$/;
    if (!usernameRegex.test(formattedUsername)) {
      showToast('Username must be 4–30 characters long and use lowercase letters, numbers, underscores, or hyphens');
      return;
    }

    showLoader();

    try {
      const response = await patchRequest(ENDPOINTS.user, {
        nickname: formattedUsername,
      });

      if (response?.state === false || response?.success === false) {
        throw new Error(response?.message || 'Failed to set username.');
      }

      await refreshUser();
      clearDashboardReadinessCache();
      showToast('Username set successfully!');
      navigate('/app-auth/create-pin', { state: { email, username: formattedUsername }, replace: true });
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to set username. Please try again.'
      );
    } finally {
      hideLoader();
    }
  };

  return (
    <AppAuthLayout>
      <ToastComponent />
      <LoaderComponent />

      <div className="w-full max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">
          Choose a Username
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6">
          Choose a username to complete your account setup.
        </p>

        <form onSubmit={handleCreateUsername} className="space-y-4">
          <AppAuthInput
            label="Username"
            type="text"
            placeholder="@john_doe"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />

          <AppAuthButton type="submit" className="w-full">
            Continue
          </AppAuthButton>
        </form>
      </div>
    </AppAuthLayout>
  );
}
