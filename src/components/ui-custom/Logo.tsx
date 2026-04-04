import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-lg',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center font-bold text-white shadow-lg',
          sizeClasses[size]
        )}
      >
        <span className="font-bold tracking-tight">BS</span>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold text-slate-800 dark:text-white leading-tight', textSizes[size])}>
            BlueSea Mobile
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            The Trusted Way to Stay Connected
          </span>
        </div>
      )}
    </div>
  );
}
