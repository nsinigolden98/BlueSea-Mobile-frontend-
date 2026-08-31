import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppAuthLayout } from '@/components/app-auth/AppAuthLayout';
import { AppAuthInput } from '@/components/app-auth/AppAuthInput';
import { AppAuthButton } from '@/components/app-auth/AppAuthButton';
import { Toast, Loader } from '@/components/ui-custom';
import { postRequest, ENDPOINTS } from '@/types';

export function AppUsernamePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';
  const [username, setUsername] = useState('');

  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const handleCreateUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      showToast('Please enter a valid username');
      return;
    }

    showLoader();

    try {
      const endpoint = (ENDPOINTS as Record<string, any>).createUsername || '/auth/username';
      const response = await postRequest(endpoint, {
        email,
        username: username.trim(),
      });

      if (response?.status || response?.success || response?.state) {
        showToast('Username created successfully!');
        navigate('/app-auth/create-pin', { state: { email, username: username.trim() } });
      } else {
        showToast(response?.message || 'Failed to register username');
      }
    } catch (err: any) {
      showToast(err?.message || 'An error occurred while setting your username');
    } finally {
      hideLoader();
    }
  };

  const handleSkip = () => {
    navigate('/app-auth/create-pin', { state: { email } });
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
          This will be your unique identifier on BlueSea Mobile (Optional)
        </p>

        <form onSubmit={handleCreateUsername} className="space-y-4">
          <AppAuthInput
            label="Username"
            type="text"
            placeholder="e.g. john_doe"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />

          <div className="space-y-3 pt-2">
            <AppAuthButton type="submit" className="w-full">
              Continue
            </AppAuthButton>

            <AppAuthButton
              type="button"
              variant="secondary"
              onClick={handleSkip}
              className="w-full"
            >
              Skip for now
            </AppAuthButton>
          </div>
        </form>
      </div>
    </AppAuthLayout>
  );
}