import { cn } from '@/lib/utils';
import './Loader.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} role="status" aria-label={text || 'Loading'}>
      <div className={cn('bs-inline-loader-orb relative aspect-square overflow-hidden rounded-full', sizeClasses[size])}>
        <img
          src="/bluesea-logo.png"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full rounded-full object-contain"
        />
        <div className="bs-inline-water-shimmer" />
        <div className="bs-inline-eyelid bs-inline-eyelid-top" />
        <div className="bs-inline-eyelid bs-inline-eyelid-bottom" />
      </div>
      {text && <span className="text-sm font-medium text-sky-400">{text}</span>}
    </div>
  );
}
