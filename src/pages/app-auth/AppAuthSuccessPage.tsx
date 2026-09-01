import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AppAuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div />

      <main className="my-auto max-w-md w-full mx-auto text-center space-y-6">
        <div
          className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400"
        >
          <CheckCircle className="w-12 h-12" />
        </div>

        <div
          className="space-y-2"
        >
          <h1 className="text-3xl font-extrabold text-white tracking-tight">You're All Set!</h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
            Your account is verified and ready. Start exploring BlueSea Mobile today.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      <div />
    </div>
  );
};