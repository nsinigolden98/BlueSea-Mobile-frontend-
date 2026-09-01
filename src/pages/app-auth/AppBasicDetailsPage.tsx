import React from 'react';
import { ArrowLeft, User, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { postRequest } from '@/types';
import { ENDPOINTS } from '@/types';
import { normalizePhoneNumber } from '@/utils/platform';

export const AppBasicDetailsPage: React.FC = () => {
  const {
    formData,
    loading,
    error,
    setLoading,
    setError,
    updateField,
    validateBasicDetailsStep,
    navigate,
  } = useNativeAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBasicDetailsStep()) return;

    setLoading(true);
    setError(null);

    const cleanPhone = normalizePhoneNumber(formData.phone);
    
    // BACKEND PAYLOAD CONTRACT REQUIREMENT
    const payload = {
      email: formData.email.trim(),
      phone: String(cleanPhone),
      other_names: formData.firstName.trim(),
      surname: formData.surname.trim(),
      password: formData.password,
    };

    try {
      const response = await postRequest(ENDPOINTS.signup, payload);
      if (response && response.status !== false) {
        navigate('/app-auth/verify-otp', { state: { email: formData.email } });
      } else {
        setError(response?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="flex items-center justify-between pt-4">
        <button
          onClick={() => navigate('/app-auth/signup')}
          className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Step 2 of 4</span>
        </div>
      </header>

      <main className="my-auto max-w-md w-full mx-auto space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-white">Personal Information</h1>
          <p className="text-slate-400 text-xs">Enter your details exactly as they appear on official documents.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="John"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Surname</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => updateField('surname', e.target.value)}
                placeholder="Doe"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="08012345678"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
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