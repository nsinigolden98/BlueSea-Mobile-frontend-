import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNativeAuth } from '../../hooks/useNativeAuth';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { AppGoogleButton } from '../../components/app-auth/AppGoogleButton';
import { postRequest, ENDPOINTS } from '@/types';

export const AppSignupPage: React.FC = () => {
  const { googleLogin } = useAuth();
  const { formData, updateField, error, validateEmailStep } = useNativeAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailStep()) return;

    setLoading(true);
    setAuthError(null);

    try {
      const endpoint =
        (ENDPOINTS as Record<string, any>).checkEmail ||
        (ENDPOINTS as Record<string, any>).sendOtp ||
        '/accounts/check-email/';

      const response = await postRequest(endpoint, { email: formData.email.trim() });

      if (response?.exists || response?.registered || response?.is_registered) {
        setAuthError('This Gmail address is already registered. Please sign in or use Google.');
      } else {
        // Email is available -> proceed to personal details step
        navigate('/app-auth/basic-details', { state: { email: formData.email.trim() } });
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      if (apiMsg && (apiMsg.toLowerCase().includes('exist') || apiMsg.toLowerCase().includes('registered'))) {
        setAuthError('This Gmail address is already registered. Please sign in.');
      } else {
        // If check endpoint falls back, safely proceed with email in state
        navigate('/app-auth/basic-details', { state: { email: formData.email.trim() } });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNativeGoogleAuth = async (idToken: string) => {
    try {
      setGoogleLoading(true);
      setAuthError(null);
      await googleLogin({ credential: idToken });
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-Up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleWebGoogleSuccess = async (credentialResponse: any) => {
    try {
      setGoogleLoading(true);
      setAuthError(null);
      await googleLogin(credentialResponse);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError('Google Sign-Up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Create Account"
          subtitle="Register with your Gmail address or Google Account"
          onBack={() => navigate('/app-auth')}
        />

        <AppGoogleButton
          mode="signup"
          text="Sign up with Google"
          onGoogleAuth={handleNativeGoogleAuth}
          onWebSuccess={handleWebGoogleSuccess}
          loading={googleLoading}
        />

        <div className="relative flex py-3 items-center mb-4">
          <div className="flex-grow border-t border-slate-700/80"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Or sign up with email
          </span>
          <div className="flex-grow border-t border-slate-700/80"></div>
        </div>

        {(error || authError) && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleNext}>
          <AppAuthInput
            label="Gmail Address"
            type="email"
            placeholder="yourname@gmail.com"
            value={formData.email}
            onChange={(e) => {
              updateField('email', e.target.value);
              if (authError) setAuthError(null);
            }}
            required
          />

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Note: BlueSea Mobile accepts only valid <span className="text-slate-200 font-semibold">@gmail.com</span> email addresses.
          </p>

          <AppAuthButton type="submit" loading={loading} disabled={loading || googleLoading}>
            {loading ? 'Verifying Email...' : 'Continue'}
          </AppAuthButton>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={() => navigate('/app-auth/login')}
            className="text-[#00D1FF] font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </AppAuthLayout>
  );
};