import { cn } from '@/lib/utils';

interface LegalReadingProgressProps {
  progress: number;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export function LegalReadingProgress({
  progress,
  variant = 'horizontal',
  className,
}: LegalReadingProgressProps) {
  if (variant === 'vertical') {
    return (
      <div className={cn('relative w-1 bg-slate-200 dark:bg-slate-800 rounded-full h-full overflow-hidden', className)}>
        <div
          className="bg-gradient-to-b from-sky-400 to-sky-600 w-full rounded-full transition-all duration-150 ease-out"
          style={{ height: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    );
  }

  return (
    <div className={cn('w-full bg-slate-200/60 dark:bg-slate-800 h-1 overflow-hidden', className)}>
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 transition-all duration-150 ease-out"
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
}