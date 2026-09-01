import React from 'react';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { useLocation } from 'react-router-dom';
import { postRequest } from '@/types';
import { ENDPOINTS } from '@/types';

export const AppEmailVerificationPage: React.FC = () => {
  const { formData, loading, error, setLoading, setError, navigate } = useNativeAuth();
  const location = useLocation();
  const email = location.state?.email || formData.email;

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const res = await postRequest(ENDPOINTS.sendOtp, { email });
      if (res && res.status !== false) {
        setError('Verification code resent successfully!');
      } else {
        setError(res?.message || 'Could not resend code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="pt-4 flex justify-end">
        <span className="text-xs text-slate-400">Step 3 of 4</span>
      </header>

      <main className="my-auto max-w-md w-full mx-auto text-center space-y-6">
        <div
          className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400"
        >
          <Mail className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Check your email</h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
            We sent a verification OTP code to <br />
            <span className="text-white font-semibold">{email || 'your email'}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/app-auth/verify-otp', { state: { email } })}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm"
          >
            <span>Enter OTP Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Resend Verification Code</span>
          </button>
        </div>
      </main>

      <div />
    </div>
  );
};