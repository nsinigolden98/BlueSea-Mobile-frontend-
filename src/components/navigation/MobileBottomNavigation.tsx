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
        {/* A single SVG stroke traces the whole pill; no rotating rectangular layer. */}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 460 76"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="bluesea-nav-orbit-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1DA1F2" stopOpacity="0" />
              <stop offset="42%" stopColor="#1DA1F2" stopOpacity="0.45" />
              <stop offset="72%" stopColor="#8BD8FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#1DA1F2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x="0.8"
            y="0.8"
            width="458.4"
            height="74.4"
            rx="37.2"
            pathLength="1000"
            fill="none"
            stroke="#69C5FF"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
          <rect
            x="0.8"
            y="0.8"
            width="458.4"
            height="74.4"
            rx="37.2"
            pathLength="1000"
            fill="none"
            stroke="url(#bluesea-nav-orbit-gradient)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="58 942"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-1000"
              dur="7s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>

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
