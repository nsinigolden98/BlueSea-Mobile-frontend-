import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Home, Gift, Compass, User } from 'lucide-react';
import { navStyles } from './MobileBottomNavigation.styles';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MobileBottomNavigation() {
  const { user } = useAuth();
  const location = useLocation();

  // Primary destinations mapped to their respective routes
  const bottomNavItems: NavigationItem[] = [
    { id: 'home', label: 'Home', path: '/dashboard', icon: Home },
    { id: 'rewards', label: 'Rewards', path: '/rewards', icon: Gift },
    { id: 'explore', label: 'Explore', path: '/services', icon: Compass },
  ];

  // Helper utility to generate user initials if avatar image is absent
  const getInitials = (): string => {
    if (!user) return 'U';
    const first = user.firstName?.trim().charAt(0) || '';
    const surname = user.surname?.trim().charAt(0) || '';
    return `${first}${surname}`.toUpperCase() || 'U';
  };

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
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(navStyles.label, isActive ? navStyles.activeLabel : navStyles.inactiveLabel)}>
                {item.label}
              </span>
              <div className={isActive ? navStyles.indicator : navStyles.hiddenIndicator} />
            </NavLink>
          );
        })}

        {/* Profile Navigation (Dynamically handles local/remote profiles) */}
        {(() => {
          const isProfileActive = location.pathname === '/profile';
          return (
            <NavLink
              to="/profile"
              className={cn(navStyles.link, "group", isProfileActive && "active-nav-link")}
            >
              <div 
                className={cn(
                  navStyles.avatarWrapper, 
                  isProfileActive ? navStyles.activeAvatar : navStyles.inactiveAvatar
                )}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : user?.firstName || user?.surname ? (
                  <div className={navStyles.avatarInitials}>
                    {getInitials()}
                  </div>
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <span className={cn(navStyles.label, isProfileActive ? navStyles.activeLabel : navStyles.inactiveLabel)}>
                Profile
              </span>
              <div className={isProfileActive ? navStyles.indicator : navStyles.hiddenIndicator} />
            </NavLink>
          );
        })()}
      </nav>
    </div>
  );
}
