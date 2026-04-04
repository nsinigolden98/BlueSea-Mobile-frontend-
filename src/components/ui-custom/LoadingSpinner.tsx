import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative" style={{ perspective: '1000px' }}>
        {/* Coin flip animation - flip → pause → flip */}
        <div 
          className={cn(
            'rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600',
            'flex items-center justify-center font-bold text-white shadow-xl shadow-sky-500/30',
            'coin-flip',
            sizeClasses[size]
          )}
        >
          <span className="font-bold tracking-tight">BS</span>
        </div>
        
        {/* Coin edge effect */}
        <div 
          className={cn(
            'absolute inset-0 rounded-full border-2 border-white/20',
            sizeClasses[size]
          )}
        />
      </div>
      
      {text && (
        <span className="text-sm text-sky-500 font-medium animate-pulse">{text}</span>
      )}

      <style>{`
        @keyframes coinFlip {
          0% {
            transform: rotateY(0deg);
          }
          25% {
            transform: rotateY(180deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          75% {
            transform: rotateY(360deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        
        .coin-flip {
          animation: coinFlip 2.5s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        
        /* Add a subtle glow pulse */
        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(14, 165, 233, 0.5);
          }
        }
        
        .coin-flip {
          animation: coinFlip 2.5s ease-in-out infinite, glowPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
