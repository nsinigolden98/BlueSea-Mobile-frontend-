import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/context/AuthContext';
import { API_BASE } from '@/types';
import { refreshAccessToken, setSessionRefresh } from '@/lib/session';
import {
  getBiometricFlag,
  getBiometricLoginCredential,
  isBiometricSupported,
} from '@/lib/security/biometrics';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppPasswordInput } from '../../components/app-auth/AppPasswordInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { AppGoogleButton } from '../../components/app-auth/AppGoogleButton';
import { validateGmail } from '../../utils/platform';

export const AppLoginPage: React.FC = () => {
  const { login, googleLogin, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricMessage, setBiometricMessage] = useState<string | null>(null);
  const biometricAttempted = useRef(false);

  // Pre-fill email address if forwarded via location state from success screen.
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // The AuthProvider owns the one-time automatic biometric prompt during app
  // bootstrap. This page only exposes a manual retry and never prompts twice
  // automatically when React mounts or re-renders.
  useEffect(() => {
    let active = true;

    const checkBiometricAvailability = async () => {
      if (!Capacitor.isNativePlatform() || !getBiometricFlag('biometricLoginEnabled')) {
        if (active) setBiometricAvailable(false);
        return;
      }

      const supported = await isBiometricSupported();
      if (active) setBiometricAvailable(supported);
    };

    void checkBiometricAvailability();
    return () => {
      active = false;
    };
  }, []);

  const handleBiometricLogin = useCallback(async () => {
    if (biometricLoading || loading || googleLoading) return;

    setBiometricLoading(true);
    setError(null);
    setBiometricMessage(null);

    try {
      // This helper first verifies the user's biometric, then reads the
      // refresh credential from the native Keychain/Keystore vault.
      const credential = await getBiometricLoginCredential();
      if (!credential) {
        setBiometricMessage('Fingerprint sign-in was cancelled or not completed. You can sign in with your password instead.');
        return;
      }

      setSessionRefresh(credential.refreshToken);
      const restored = await refreshAccessToken(API_BASE);

      if (!restored) {
        setBiometricMessage('Your saved sign-in has expired. Please sign in with your email and password again.');
        return;
      }

      await refreshUser();
      // refreshUser updates the shared AuthContext after fetching the
      // authenticated profile and wallet. Confirm that it actually succeeded
      // before navigating away from the login form.
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Biometric login failed:', err);
      setBiometricMessage('Fingerprint sign-in could not be completed. Please use your email and password.');
    } finally {
      setBiometricLoading(false);
    }
  }, [biometricLoading, loading, googleLoading, refreshUser, navigate]);

  const handleNativeGoogleAuth = async (idToken: string) => {
    try {
      setGoogleLoading(true);
      setError(null);
      await googleLogin({ credential: idToken });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleWebGoogleSuccess = async (credentialResponse: any) => {
    try {
      setGoogleLoading(true);
      setError(null);
      await googleLogin(credentialResponse);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBiometricMessage(null);

    if (!validateGmail(email)) {
      setError('Only standard @gmail.com email addresses are allowed.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    try {
      setLoading(true);
      const response: any = await login({ email, password, rememberMe });
      if (response && typeof response === 'object' && 'email' in response) {
        navigate('/dashboard');
      } else if (response) {
        setError(typeof response === 'string' ? response : 'Login failed');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Welcome Back"
          subtitle="Sign in to continue accessing your BlueSea account"
          onBack={() => navigate('/app-auth')}
        />

        {biometricAvailable && (
          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={biometricLoading || loading || googleLoading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-[#00D1FF]/30 bg-[#00D1FF]/10 px-4 py-3.5 text-sm font-semibold text-[#00D1FF] transition hover:bg-[#00D1FF]/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Fingerprint className="h-5 w-5" aria-hidden="true" />
            {biometricLoading ? 'Verifying fingerprint…' : 'Use fingerprint'}
          </button>
        )}

        {biometricMessage && (
          <div className="mb-4 rounded-xl border border-slate-700/80 bg-slate-800/50 p-3 text-xs text-slate-300" role="status">
            {biometricMessage}
          </div>
        )}

        <AppGoogleButton
          mode="login"
          text="Sign in with Google"
          onGoogleAuth={handleNativeGoogleAuth}
          onWebSuccess={handleWebGoogleSuccess}
          loading={googleLoading}
        />

        <div className="relative mb-4 flex items-center py-3">
          <div className="flex-grow border-t border-slate-700/80"></div>
          <span className="mx-4 flex-shrink text-xs font-semibold uppercase tracking-wider text-slate-500">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-700/80"></div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-2">
          <AppAuthInput
            label="Gmail Address"
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AppPasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="my-3 flex items-center justify-between">
            <label className="flex cursor-pointer items-center space-x-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-[#00D1FF] focus:ring-0"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => navigate('/app-auth/forgot-password')}
              className="text-xs font-semibold text-[#00D1FF] hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <AppAuthButton type="submit" loading={loading}>
            Sign In
          </AppAuthButton>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/app-auth/signup')}
            className="font-semibold text-[#00D1FF] hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </AppAuthLayout>
  );
};
