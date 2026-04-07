import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { navItems } from '@/data';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutGrid,
  Wallet,
  Smartphone,
  Wifi,
  Store,
  Globe,
  Gift,
  X,
  Settings,
  User,
  Bell,
  Headphones,
  Grid3X3,
  Sparkles,
  QrCode,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  Wallet,
  Smartphone,
  Wifi,
  Store,
  Globe,
  Gift,
  Bell,
  Headphones,
  Grid3X3,
  Sparkles,
  QrCode,
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <Logo size="sm" />
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || LayoutGrid;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={() => onClose()}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive 
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Profile Section */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <NavLink
              to="/settings"
              onClick={() => onClose()}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                {user?.profilePicture ?
                    <img 
                  src={user?.profilePicture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover  border-white dark:bord-slate-800"
                />
                  :
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-white truncate">
                  {user?.firstName || 'Guest'} {user?.surname || ''}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'guest@example.com'}
                </p>
              </div>
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
