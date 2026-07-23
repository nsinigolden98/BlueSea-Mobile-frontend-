import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const ApiApplicationBanner: React.FC = () => {
  const handleApplyClick = () => {
    // TODO: Connect to Merchant API Application onboarding modal/flow
    alert('BlueConnect API integration application feature coming soon.');
  };

  return (
    <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-white rounded-2xl border border-slate-800 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">Receive Payments via BlueConnect</h4>
          <p className="text-[11px] text-slate-300 dark:text-slate-400 mt-0.5">
            Connect your business or institution to receive direct payments.
          </p>
        </div>
      </div>
      <button
        onClick={handleApplyClick}
        className="w-full sm:w-auto px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95"
      >
        <span>Apply for API</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};