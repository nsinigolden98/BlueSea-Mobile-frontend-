import React from 'react';
import { ArrowLeft, AtSign, ArrowRight, Gift } from 'lucide-react';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { postRequest } from '@/types';
import { ENDPOINTS } from '@/types';

export const AppUsernamePage: React.FC = () => {
  const {
    formData,
    loading,
    error,
    setLoading,
    setError,
    updateField,
    validateUsernameStep,
    navigate,
  } = useNativeAuth();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsernameStep()) return;

    setLoading(true);
    setError(null);

    try {
      if (formData.referralCode.trim()) {
        await postRequest(ENDPOINTS.referral, {
          referral_code: formData.referralCode.trim(),
        });
      }
      navigate('/app-auth/create-pin');
    } catch (err: any) {
      // Non-blocking fallback if referral fails
      navigate('/app-auth/create-pin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/app-auth/verify-otp')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          <span>Step 4 of 4</span>
        </div>
      </header>

      <main className="my-auto max-w-md w-full mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Choose a handle</h1>
          <p className="text-slate-400 text-xs">
            Your handle lets other BlueSea users send you money instantly.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleNext} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateField('username', e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Referral Code (Optional)</label>
            <div className="relative">
              <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => updateField('referralCode', e.target.value)}
                placeholder="REF12345"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                <span>Set PIN</span>
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