import React from 'react';
import { MessageSquarePlus, Clock, ShieldCheck } from 'lucide-react';

interface SupportHeroProps {
  onStartConversation: () => void;
}

export const SupportHero: React.FC<SupportHeroProps> = ({ onStartConversation }) => {
  return (
    <div className="bg-gradient-to-b from-sky-500/10 via-sky-500/5 to-transparent dark:from-sky-950/30 dark:via-transparent p-6 md:p-8 rounded-3xl border border-sky-100 dark:border-sky-900/40 mb-6">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          BlueSea Support Center
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          We're here to help.
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          Get assistance with your account, payments, transactions, and BlueSea Mobile services.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            onClick={onStartConversation}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Start a conversation
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
            <Clock className="w-4 h-4 text-sky-500 shrink-0" />
            <span>Fast support — Get organized assistance from BlueSea Mobile.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
