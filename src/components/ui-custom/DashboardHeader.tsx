import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Headset } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // 100% preservation of existing notification logic
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getRequest(`${ENDPOINTS.notifications}?is_read=false&page_size=1`);
        if (response && response.count !== undefined) {
          setUnreadCount(response.count);
        } else if (response && response.unread_count !== undefined) {
          setUnreadCount(response.unread_count);
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper to extract clean initials if no profile picture exists
  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.surname?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full",
        // Premium Glass UI - Semi-transparent background, backdrop blur, soft shadows & borders
        "bg-white/70 dark:bg-slate-900/70",
        "backdrop-blur-xl md:backdrop-blur-2xl",
        "border-b border-slate-200/30 dark:border-slate-800/30",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.015)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* LEFT SECTION: User Profile & Dynamic Greeting */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Circular Interactive Avatar Container */}
          <button
            onClick={() => navigate('/profile')}
            className={cn(
              "relative flex-shrink-0 group rounded-full focus:outline-none",
              "focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            )}
            aria-label="View profile settings"
          >
            {/* Premium Brand Accent Ring (Animated Slow Spin) */}
            <div 
              className={cn(
                "relative w-12 h-12 rounded-full overflow-hidden transition-transform duration-300 ease-out",
                "group-hover:scale-105 group-active:scale-95 shadow-sm"
              )}
            >
              {/* Spinning dual-color gradient background */}
              <div 
                className={cn(
                  "absolute inset-0 animate-[spin_8s_linear_infinite]",
                  "bg-gradient-to-tr from-sky-400 via-blue-600 to-sky-400 dark:from-sky-500 dark:via-indigo-500 dark:to-sky-500"
                )}
              />
              
              {/* Inner Static Mask and Profile Image Container */}
              <div className="absolute inset-[2.5px] bg-white dark:bg-slate-900 rounded-full p-[1.5px] flex items-center justify-center">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={`${user.firstName || 'User'}'s profile avatar`} 
                    className="w-10 h-10 rounded-full object-cover select-none"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs tracking-wider select-none">
                    {getInitials()}
                  </div>
                )}
              </div>
            </div>
          </button>

          {/* Typography Stack */}
          <div className="flex flex-col justify-center min-w-0 select-none">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase leading-none mb-1">
              Hi,
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs">
              {(user?.firstName || 'Guest').toUpperCase()} 👋
            </span>
          </div>
        </div>

        {/* RIGHT SECTION: Action Hub */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          
          {/* Support Icon Button */}
          <button
            onClick={() => navigate('/support')}
            aria-label="Contact Customer Support"
            className={cn(
              "p-2.5 rounded-full transition-all duration-200",
              "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
              "bg-slate-100/40 hover:bg-slate-150/80 dark:bg-slate-800/40 dark:hover:bg-slate-750/80",
              "border border-slate-200/20 dark:border-slate-700/20",
              "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            )}
          >
            <Headset className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Notification Icon Button */}
          <button
            onClick={() => navigate('/notifications')}
            aria-label={`Notifications, ${unreadCount} unread items`}
            className={cn(
              "p-2.5 rounded-full transition-all duration-200 relative",
              "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
              "bg-slate-100/40 hover:bg-slate-150/80 dark:bg-slate-800/40 dark:hover:bg-slate-750/80",
              "border border-slate-200/20 dark:border-slate-700/20",
              "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            )}
          >
            <Bell className="w-5 h-5 stroke-[1.75]" />
            
            {/* Floating Unread Badge Indicator */}
            {unreadCount > 0 && (
              <span 
                className={cn(
                  "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1",
                  "bg-red-500 rounded-full text-white text-[10px] font-bold",
                  "flex items-center justify-center border-2 border-white dark:border-slate-900",
                  "animate-pulse shadow-sm"
                )}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
        </div>
      </div>
    </header>
  );
}
