import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';

interface LegalNoticeProps {
  children: ReactNode;
}

export function LegalNotice({ children }: LegalNoticeProps) {
  return (
    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400 my-4">
      <Lock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}