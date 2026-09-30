import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { navItems } from '@/data';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutGrid,
 // HandCoins,
  Smartphone,
 // Wifi,
  Store,
  Globe,
  Gift,
  X,
  Settings,
  User,
  Bell,
  Headphones,
  Grid3X3,
 // PlaneTakeoff,
  QrCode,
  Briefcase,
  //Orbit,
  //ShieldCheck
  ScanQrCode,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
 // HandCoins,
  Smartphone,
 // Wifi,
  Store,
  Globe,
  Gift,
  Bell,
  Headphones,
  Grid3X3,
 // PlaneTakeoff,
  QrCode,
  Briefcase,
  //Orbit,
 // ShieldCheck
 ScanQrCode
};

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'bluesimo-sidebar-collapsed';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedCollapsedState = window.localStorage.getItem(
        SIDEBAR_COLLAPSED_STORAGE_KEY
      );

      if (savedCollapsedState === 'true') {
        setIsCollapsed(true);
      } else if (savedCollapsedState === 'false') {
        setIsCollapsed(false);
      }
    } catch {
      // Keep the default expanded state if localStorage is unavailable.
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((collapsed) => {
      const nextCollapsedState = !collapsed;

      try {
        window.localStorage.setItem(
          SIDEBAR_COLLAPSED_STORAGE_KEY,
          String(nextCollapsedState)
        );
      } catch {
        // Keep the UI working if localStorage is unavailable.
      }

      return nextCollapsedState;
    });
  };

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
          'fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'transform transition-all duration-300 ease-out',
          'w-[280px] lg:w-[280px]',
          'lg:transition-[width,transform] lg:duration-300',
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800',
            'lg:min-h-[73px]',
            isCollapsed && 'lg:justify-center lg:px-2'
          )}>
            <div className={cn(
              'transition-opacity duration-200',
              isCollapsed && 'lg:hidden'
            )}>
              <Logo size="sm" />
            </div>

            {/* Mobile close button - unchanged */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse button */}
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={cn(
                'hidden lg:flex items-center justify-center w-9 h-9 rounded-lg',
                'text-slate-500 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800',
                'transition-colors',
                !isCollapsed && 'ml-auto'
              )}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] || LayoutGrid;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.id} className="relative group">
                    <NavLink
                      to={item.path}
                      onClick={() => onClose()}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isCollapsed && 'lg:justify-center lg:px-0',
                        isActive 
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className={cn(
                        'font-medium transition-opacity duration-150',
                        isCollapsed && 'lg:hidden'
                      )}>
                        {item.label}
                      </span>
                    </NavLink>

                    {/* Desktop collapsed label */}
                    {isCollapsed && (
                      <div className="hidden lg:block pointer-events-none absolute left-full top-1/2 z-[60] ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                        {item.label}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Profile Section */}
          <div className={cn(
            'p-3 border-t border-slate-100 dark:border-slate-800',
            isCollapsed && 'lg:px-2'
          )}>
            <NavLink
              to="/settings"
              onClick={() => onClose()}
              title={isCollapsed ? `${user?.firstName || 'Guest'} ${user?.surname || ''}`.trim() : undefined}
              className={cn(
                'relative flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group',
                isCollapsed && 'lg:justify-center lg:p-2'
              )}
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
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
              <div className={cn(
                'flex-1 min-w-0',
                isCollapsed && 'lg:hidden'
              )}>
                <p className="font-medium text-slate-800 dark:text-white truncate">
                  {user?.firstName || 'Guest'} {user?.surname || ''}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'guest@example.com'}
                </p>
              </div>
              <Settings className={cn(
                'w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors',
                isCollapsed && 'lg:hidden'
              )} />

              {/* Desktop collapsed profile label */}
              {isCollapsed && (
                <div className="hidden lg:block pointer-events-none absolute left-[70px] bottom-3 z-[60] whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                  <div>{user?.firstName || 'Guest'} {user?.surname || ''}</div>
                  <div className="text-xs font-normal opacity-80">{user?.email || 'guest@example.com'}</div>
                </div>
              )}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
