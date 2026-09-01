import React from 'react';
import { ArrowLeft, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { postRequest } from '@/types';
import { ENDPOINTS } from '@/types';

export const AppSignupPage: React.FC = () => {
  const {
    formData,
    loading,
    error,
    setLoading,
    setError,
    updateField,
    validateEmailStep,
    navigate,
  } = useNativeAuth();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailStep()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await postRequest(ENDPOINTS.sendOtp, { email: formData.email.trim() });
      if (response && response.status !== false) {
        navigate('/app-auth/basic-details', { state: { email: formData.email } });
      } else {
        setError(response?.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/app-auth')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Step 1 of 4</span>
        </div>
      </header>

      <main className="my-auto max-w-md w-full mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 text-sm">
            Enter your email address to begin your financial journey.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleNext} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </main>

      <footer className="text-center text-xs text-slate-500 py-4">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/app-auth/login')}
          className="text-blue-400 font-semibold hover:underline"
        >
          Sign In
        </button>
      </footer>
    </div>
  );
};