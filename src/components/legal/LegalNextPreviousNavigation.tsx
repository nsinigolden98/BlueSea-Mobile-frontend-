import { LegalNavigationLink } from '@/types/legal';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LegalNextPreviousNavigationProps {
  previousDoc?: LegalNavigationLink;
  nextDoc?: LegalNavigationLink;
}

export function LegalNextPreviousNavigation({
  previousDoc,
  nextDoc,
}: LegalNextPreviousNavigationProps) {
  const navigate = useNavigate();

  return (
    <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {previousDoc ? (
        <button
          onClick={() => navigate(previousDoc.path)}
          className="group text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Previous Legal Doc
          </p>
          <p className="font-bold text-slate-800 dark:text-white text-sm mt-1 group-hover:text-sky-500 transition-colors">
            {previousDoc.title}
          </p>
        </button>
      ) : (
        <div />
      )}

      {nextDoc ? (
        <button
          onClick={() => navigate(nextDoc.path)}
          className="group text-right p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all shadow-sm sm:col-start-2"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
            Next Legal Doc
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
          <p className="font-bold text-slate-800 dark:text-white text-sm mt-1 group-hover:text-sky-500 transition-colors">
            {nextDoc.title}
          </p>
        </button>
      ) : null}
    </div>
  );
}