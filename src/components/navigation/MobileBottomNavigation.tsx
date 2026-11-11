import { NavLink, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Home, Gift, Store, Settings, Briefcase } from 'lucide-react';
import type { ComponentType } from 'react';
import { cn } from '@/lib/utils';
import { navMotionStyles, navStyles } from './MobileBottomNavigation.styles';
import { useEffect, useState } from 'react';
import { getPreferredWorkspace, WORKSPACE_HOME, type WorkspaceId } from '@/features/workspace/workspacePreference';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'home', label: 'Home', path: '/dashboard', icon: Home },
  { id: 'rewards', label: 'Rewards', path: '/rewards', icon: Gift },
  { id: 'payroll', label: 'Payroll', path: '/payroll-pro', icon: Briefcase },
  { id: 'tickets', label: 'BlueTickets', path: '/marketplace', icon: Store },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

function isItemActive(pathname: string, path: string): boolean {
  if (path === '/dashboard' || path.startsWith('/workspace/')) {
    return pathname === '/' || pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/');
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

export function MobileBottomNavigation() {
  const location = useLocation();
  const [workspace, setWorkspace] = useState<WorkspaceId>('personal');

  useEffect(() => {
    let active = true;
    void getPreferredWorkspace().then((value) => { if (active) setWorkspace(value); });
    return () => { active = false; };
  }, [location.pathname]);

  const homePath = WORKSPACE_HOME[workspace];
  const navigationItems = NAVIGATION_ITEMS.map((item) =>
    item.id === 'home' ? { ...item, path: homePath } : item
  );

  // Keep the mobile dock native-only, matching the existing app behavior.
  if (!Capacitor.isNativePlatform()) return null;

  return (
    <>
      <style>{navMotionStyles}</style>
      <nav
        className={navStyles.wrapper}
        aria-label="BlueSea Mobile primary navigation"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(location.pathname, item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              title={item.label}
              className={({ isActive }) =>
                cn(
                  navStyles.link,
                  (active || isActive) && navStyles.activeLink,
                )
              }
            >
              <span
                className={cn(
                  navStyles.iconCircle,
                  active
                    ? navStyles.activeIconCircle
                    : navStyles.inactiveIconCircle,
                )}
              >
                <Icon
                  className={cn(
                    navStyles.navIcon,
                    active ? navStyles.activeIcon : navStyles.inactiveIcon,
                  )}
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  navStyles.label,
                  active ? navStyles.activeLabel : navStyles.inactiveLabel,
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
      {/* Preserve the existing scroll clearance below the fixed dock. */}
      <div
        aria-hidden="true"
        className="h-[calc(84px+env(safe-area-inset-bottom,0px))] md:hidden shrink-0"
      />
    </>
  );
}

export default MobileBottomNavigation;
