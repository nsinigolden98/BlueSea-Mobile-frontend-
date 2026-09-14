import type { ReactNode } from 'react';
import type { LegalCalloutType } from '@/types/legal';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, ShieldCheck, Info, CheckCircle2, Lightbulb } from 'lucide-react';

interface LegalCalloutProps {
  type: LegalCalloutType;
  title: string;
  children: ReactNode;
  className?: string;
}

export function LegalCallout({ type, title, children, className }: LegalCalloutProps) {
  const configs = {
    important: {
      border: 'border-amber-300 dark:border-amber-800/60',
      bg: 'bg-amber-50/70 dark:bg-amber-950/20',
      titleColor: 'text-amber-900 dark:text-amber-200',
      iconColor: 'text-amber-500',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    warning: {
      border: 'border-red-300 dark:border-red-800/60',
      bg: 'bg-red-50/70 dark:bg-red-950/20',
      titleColor: 'text-red-900 dark:text-red-200',
      iconColor: 'text-red-500',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    security: {
      border: 'border-sky-300 dark:border-sky-800/60',
      bg: 'bg-sky-50/70 dark:bg-sky-950/20',
      titleColor: 'text-sky-900 dark:text-sky-200',
      iconColor: 'text-sky-500',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    information: {
      border: 'border-slate-200 dark:border-slate-700',
      bg: 'bg-slate-100/70 dark:bg-slate-800/40',
      titleColor: 'text-slate-900 dark:text-slate-100',
      iconColor: 'text-slate-500 dark:text-slate-400',
      icon: <Info className="w-5 h-5" />,
    },
    success: {
      border: 'border-emerald-300 dark:border-emerald-800/60',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
      titleColor: 'text-emerald-900 dark:text-emerald-200',
      iconColor: 'text-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    tip: {
      border: 'border-purple-300 dark:border-purple-800/60',
      bg: 'bg-purple-50/70 dark:bg-purple-950/20',
      titleColor: 'text-purple-900 dark:text-purple-200',
      iconColor: 'text-purple-500',
      icon: <Lightbulb className="w-5 h-5" />,
    },
  };

  const current = configs[type] || configs.information;

  return (
    <div
      className={cn(
        'rounded-2xl p-4 sm:p-5 border my-6 transition-all duration-200',
        current.bg,
        current.border,
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className={cn('mt-0.5 shrink-0', current.iconColor)}>{current.icon}</div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className={cn('text-sm font-bold tracking-tight', current.titleColor)}>
            {title}
          </h4>
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}