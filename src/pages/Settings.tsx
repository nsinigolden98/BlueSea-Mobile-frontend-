import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  User, 
  CreditCard, 
  Lock, 
  LogOut, 
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Grid3X3,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';
import { Sidebar, Header } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

export function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [kycStatus, setKycStatus] = useState<string>('unverified');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync status for the UI badge
  useEffect(() => {
    const status = localStorage.getItem('bluese_kyc_status') || 'unverified';
    setKycStatus(status);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const settingsItems = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      action: () => navigate('/profile'),
      showArrow: true 
    },
    { 
      id: 'identity', 
      label: 'Identity Center', 
      icon: ShieldCheck, 
      action: () => navigate('/identity-center'),
      showArrow: true,
      badge: kycStatus === 'verified' ? 'Verified' : 'Action Required'
    },
    { 
      id: 'transactions', 
      label: 'Transactions', 
      icon: CreditCard, 
      action: () => navigate('/transaction-history'),
      showArrow: true 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      action: () => navigate('/notifications'),
      showArrow: true 
    },
    { 
      id: 'pin', 
      label: 'Create / Edit Pin', 
      icon: Lock, 
      action: () => navigate('/pin'),
      showArrow: true 
    },
    { 
      id: 'more-services', 
      label: 'More Services', 
      icon: Grid3X3, 
      action: () => navigate('/more-services'),
      showArrow: true 
    },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
      
      {/* Structural Sidebar Navigation Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel Viewport */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
        
        {/* Unified Layout Control Header (Fixed) */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-955">
          <Header 
            title="Settings" 
            subtitle="System Core Preferences" 
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* Viewport Content Wrapper (Only this part scrolls) */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            
            {/* Main Settings Group */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.99]',
                      index !== settingsItems.length - 1 && 'border-b border-slate-50 dark:border-slate-800/50'
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
                      item.id === 'identity' && kycStatus === 'verified' 
                        ? "bg-emerald-100 dark:bg-emerald-900/30" 
                        : "bg-sky-100 dark:bg-sky-900/30"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        item.id === 'identity' && kycStatus === 'verified' 
                          ? "text-emerald-500" 
                          : "text-sky-500"
                    )} />
                    </div>
                    
                    <div className="flex-1 text-left min-w-0">
                      <span className="block font-semibold text-slate-800 dark:text-white truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider block mt-0.5",
                          kycStatus === 'verified' ? "text-emerald-500" : "text-amber-500"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {item.showArrow && (
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Theme Toggle Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <span className="flex-1 text-left font-semibold text-slate-800 dark:text-white">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <div className={cn(
                  'w-12 h-6 rounded-full transition-colors relative flex-shrink-0',
                  theme === 'dark' ? 'bg-sky-500' : 'bg-slate-200'
                )}>
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300',
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  )} />
                </div>
              </button>
            </div>

            {/* Sign Out Action */}
            <button
              onClick={handleLogout}
              className="w-full p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                <span className="font-bold text-red-500">Sign Out</span>
              </div>
            </button>
          </div>
        </main>

        {/* FIXED MOBILE BOTTOM NAVIGATION LAYER */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900">
          <MobileBottomNavigation />
        </div>
      </div>
    </div>
  );
}
