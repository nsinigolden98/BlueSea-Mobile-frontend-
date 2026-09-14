import { ArrowUp } from 'lucide-react';

interface LegalScrollToTopProps {
  onClick: () => void;
}

export function LegalScrollToTop({ onClick }: LegalScrollToTopProps) {
  return (
    <button
      onClick={onClick}
      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 shadow-sm transition-all text-xs flex items-center gap-2 font-medium"
      title="Scroll back to top"
    >
      <ArrowUp className="w-4 h-4" />
      <span>Back to top</span>
    </button>
  );
}