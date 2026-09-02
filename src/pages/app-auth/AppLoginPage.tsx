import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppPasswordInput } from '../../components/app-auth/AppPasswordInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { AppGoogleButton } from '../../components/app-auth/AppGoogleButton';
import { validateGmail } from '../../utils/platform';

export const AppLoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Pre-fill email address if forwarded via location state from success screen
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

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
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
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

        <AppGoogleButton
          mode="login"
          text="Sign in with Google"
          onGoogleAuth={handleNativeGoogleAuth}
          onWebSuccess={handleWebGoogleSuccess}
          loading={googleLoading}
        />

        <div className="relative flex py-3 items-center mb-4">
          <div className="flex-grow border-t border-slate-700/80"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-700/80"></div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
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

          <div className="flex items-center justify-between my-3">
            <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
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
            onClick={() => navigate('/app-auth/signup')}
            className="text-[#00D1FF] font-semibold hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </AppAuthLayout>
  );
};