import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanQrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PayLinkHeaderButton(): React.ReactElement {
  const navigate = useNavigate();

  const handlePayLinkClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    navigate('/paylink');
  };

  return (
    <div className="relative flex flex-col items-center group flex-shrink-0">
      {/* Hanging Vertical Connection Stem with Animated Node */}
      <div 
        aria-hidden="true" 
        className="absolute -top-[18px] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
      >
        {/* Top Connection Line */}
        <div className="w-[1.5px] h-2.5 bg-gradient-to-b from-sky-500/50 via-sky-400/30 to-transparent dark:from-sky-400/50 dark:via-sky-300/30" />
        
        {/* Animated Connecting Node (Rotating & Pulsing Diamond Metaphor) */}
        <div className="relative w-2 h-2 my-0.5 flex items-center justify-center">
          <div 
            className={cn(
              "absolute w-1.5 h-1.5 rotate-45 border border-sky-400/80 dark:border-sky-300/80",
              "bg-sky-500/30 dark:bg-sky-400/30 rounded-[1px]",
              "motion-safe:animate-[spin_4s_linear_infinite]",
              "motion-reduce:transform-none"
            )} 
          />
          <div 
            className={cn(
              "absolute w-2 h-2 rotate-45 bg-sky-400/40 dark:bg-sky-300/40 blur-[1px]",
              "motion-safe:animate-pulse",
              "motion-reduce:animate-none"
            )} 
          />
        </div>

        {/* Bottom Connection Line */}
        <div className="w-[1.5px] h-2.5 bg-gradient-to-b from-transparent via-sky-400/30 to-sky-500/50 dark:via-sky-300/30 dark:to-sky-400/50" />
      </div>

      {/* PayLink Translucent Glass Capsule Button */}
      <button
        type="button"
        onClick={handlePayLinkClick}
        aria-label="Open PayLink"
        className={cn(
          "relative z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full select-none",
          "transition-all duration-300 ease-out",
          // Glass visual characteristics
          "bg-white/75 dark:bg-slate-900/75 backdrop-blur-md",
          "border border-sky-500/30 dark:border-sky-400/30",
          "hover:border-sky-500/60 dark:hover:border-sky-400/60",
          // Color, text, and shadow styling
          "text-slate-800 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400",
          "shadow-[0_2px_10px_-2px_rgba(56,189,248,0.15)] dark:shadow-[0_2px_10px_-2px_rgba(56,189,248,0.25)]",
          "hover:shadow-[0_4px_16px_-2px_rgba(56,189,248,0.3)] dark:hover:shadow-[0_4px_16px_-2px_rgba(56,189,248,0.4)]",
          "hover:-translate-y-0.5 active:translate-y-0 active:scale-95",
          // Accessibility Focus Ring
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        )}
      >
        <ScanQrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 dark:text-sky-400 stroke-[2] shrink-0" />
        <span className="font-semibold tracking-tight text-[11px] sm:text-xs">PayLink</span>
      </button>
    </div>
  );
}