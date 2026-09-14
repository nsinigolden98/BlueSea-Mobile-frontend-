import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

export const SupportAssistant: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 mb-6 relative overflow-hidden opacity-80">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                AI Support Assistant
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Sparkles className="w-2.5 h-2.5" />
                Coming soon
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Get quick answers to common questions automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
