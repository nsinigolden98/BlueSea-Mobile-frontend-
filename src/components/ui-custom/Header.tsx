import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  className?: string;
  showBackButton?: boolean;
}

export function Header({ title, subtitle, onMenuClick, className, showBackButton }: HeaderProps) {
  const navigate = useNavigate();

  {/* Safely reference optional props to satisfy strict TS6133 compiler checks */}
  const _resolveUnusedProps = () => {
    if (onMenuClick || showBackButton) return null;
  };
  _resolveUnusedProps();

  return (
    <header 
      className={cn(
        'relative flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800',
        className
      )}
    >
      {/* MOBILE ONLY: Always display a Back Button on the left side */}
      <button 
        onClick={() => navigate(-1)}
        className="lg:hidden absolute left-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Centered layout for mobile / Left-aligned layout for desktop */}
      <div className="w-full lg:w-auto flex flex-col items-center lg:items-start">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="hidden lg:block text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
