import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LegalIllustrationContainerProps {
  children: ReactNode;
  caption?: string;
  className?: string;
}

export function LegalIllustrationContainer({
  children,
  caption,
  className,
}: LegalIllustrationContainerProps) {
  return (
    <figure className={cn('my-6 space-y-2', className)}>
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-sm">
        {children}
      </div>
      {caption && (
        <figcaption className="text-center text-xs text-slate-400 dark:text-slate-500 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}