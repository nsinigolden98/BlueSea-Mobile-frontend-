import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { useLocation } from 'react-router-dom';
import { postRequest } from '@/types';
import { ENDPOINTS } from '@/types';
import { setCookie } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const AppOtpPage: React.FC = () => {
  const { loading, error, setLoading, setError, navigate } = useNativeAuth();
  const location = useLocation();
  const { refreshUser } = useAuth();
  
  const email = location.state?.email || '';
  const [otp, setOtp] = useState<string>('');

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await postRequest(ENDPOINTS.verifyOtp, {
        email,
        otp: otp.trim(),
      });

      if (response && response.status !== false) {
        // AUTHENTICATION SESSION ESTABLISHMENT
        const token = response.access_token || response.token || response.data?.token;
        const refreshToken = response.refresh_token || response.data?.refresh_token;

        if (token) {
          setCookie('access_token', token);
          if (refreshToken) setCookie('refresh_token', refreshToken);
          await refreshUser();
        }

        navigate('/app-auth/username');
      } else {
        setError(response?.message || 'Invalid OTP code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/app-auth/verify-email', { state: { email } })}
          className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Verification</span>
        </div>
      </header>

      <main className="my-auto max-w-md w-full mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-extrabold text-white">Enter OTP Code</h1>
          <p className="text-slate-400 text-xs">
            Enter the code sent to <span className="text-white font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="0 0 0 0 0 0"
            className="w-full text-center text-2xl tracking-[0.5em] font-mono bg-slate-900/90 border border-slate-800 rounded-xl py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </main>

      <div />
    </div>
  );
};