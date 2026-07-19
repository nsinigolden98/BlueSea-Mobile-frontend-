// /src/components/navigation/MobileBottomNavigation.tsx

import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Gift, Briefcase, Store, Settings } from 'lucide-react';
import { navStyles } from './MobileBottomNavigation.styles';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileBottomNavigation() {
  const location = useLocation();

  // Primary destinations mapped to their respective routes
  const bottomNavItems: NavigationItem[] = [
    { id: 'home', label: 'Home', path: '/dashboard', icon: Home },
    { id: 'rewards', label: 'Rewards', path: '/rewards', icon: Gift },
    { id: 'marketplace', label: 'MarketPlace', path: '/marketplace', icon: Store },
    { id: 'payroll-pro', label: 'Payroll', path: '/payroll-pro', icon: Briefcase },
    { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className={navStyles.wrapper} aria-label="Mobile Navigation Bar">
      <nav className={navStyles.container}>
        {/* Render Primary Navigation Items */}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive: linkActive }) => 
                cn(navStyles.link, "group", linkActive && "active-nav-link")
              }
            >
              <div className={cn(navStyles.iconContainer, isActive ? navStyles.activeIcon : navStyles.inactiveIcon)}>
                <Icon className="w-[22px] h-[22px] transition-transform" />
              </div>
              <span className={cn(navStyles.label, isActive ? navStyles.activeLabel : navStyles.inactiveLabel)}>
                {item.label}
              </span>
              <div className={isActive ? navStyles.indicator : navStyles.hiddenIndicator} />
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
