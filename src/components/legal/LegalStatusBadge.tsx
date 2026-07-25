import { cn } from '@/lib/utils';
import { LegalStatus } from '@/types/legal';

interface LegalStatusBadgeProps {
  status: LegalStatus;
  className?: string;
}

export function LegalStatusBadge({ status, className }: LegalStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Active & Binding',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500 animate-pulse',
    },
    under_review: {
      label: 'Under Review',
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    archived: {
      label: 'Archived Version',
      bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    draft: {
      label: 'Draft',
      bg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
      dot: 'bg-sky-500',
    },
  };

  const current = statusConfig[status] || statusConfig.active;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all',
        current.bg,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', current.dot)} />
      {current.label}
    </span>
  );
}