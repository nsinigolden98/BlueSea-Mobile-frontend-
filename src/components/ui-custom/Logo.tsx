import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// If logo.png is in the SAME folder as this file:
//import logoImg from './logo.png'; 

// OR if logo.png is ONE folder above this file, uncomment this line instead:
import logoImg from '../../logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 56, height: 56 },
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={cn('flex items-center gap-2', className)}>
      <img
        src={logoImg}
        alt="BlueSea Mobile Logo"
        width={dimensions[size].width}
        height={dimensions[size].height}
        loading="lazy"
        decoding="async"
        className={cn('object-contain', sizeClasses[size])}
      />
      
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
    </Link>
  );
}
