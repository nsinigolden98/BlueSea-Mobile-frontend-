import React from 'react';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { postRequest } from '@/types';
import { ENDPOINTS } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const AppCreatePinPage: React.FC = () => {
  const {
    formData,
    loading,
    error,
    setLoading,
    setError,
    updateField,
    validatePinStep,
    navigate,
  } = useNativeAuth();
  const { refreshUser } = useAuth();

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePinStep()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await postRequest(ENDPOINTS.pin_set, {
        pin: formData.pin,
      });

      if (response && response.status !== false) {
        await refreshUser();
        navigate('/app-auth/success');
      } else {
        setError(response?.message || 'Failed to set transaction PIN.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error setting PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="pt-4 flex justify-end">
        <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Security Setup
        </span>
      </header>

      <main className="my-auto max-w-md w-full mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400 mb-3">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Create Transaction PIN</h1>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            Set a secure 4-digit PIN to authorize transfers and bill payments.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSetPin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">4-Digit PIN</label>
            <input
              type="password"
              maxLength={4}
              value={formData.pin}
              onChange={(e) => updateField('pin', e.target.value)}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.5em] bg-slate-900/90 border border-slate-800 rounded-xl py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Confirm PIN</label>
            <input
              type="password"
              maxLength={4}
              value={formData.confirmPin}
              onChange={(e) => updateField('confirmPin', e.target.value)}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.5em] bg-slate-900/90 border border-slate-800 rounded-xl py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
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
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Setup</span>
              </>
            )}
          </button>
        </form>
      </main>

      <div />
    </div>
  );
};