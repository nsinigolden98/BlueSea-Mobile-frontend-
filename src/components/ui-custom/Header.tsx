import { cn } from '@/lib/utils';
import { Menu, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@/data';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  className?: string;
  showBackButton?: boolean;
}

export function Header({ title, subtitle, onMenuClick, className, showBackButton }: HeaderProps) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header 
      className={cn(
        'flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <button 
            onClick={() => navigate(-1)}
            className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          onMenuClick && (
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )
        )}
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/notifications')}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] font-medium flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
