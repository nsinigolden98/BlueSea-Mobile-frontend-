import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  User, 
  CreditCard, 
  Lock, 
  LogOut, 
  ChevronRight,
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Grid3X3,
  ShieldCheck // Added for Identity Center
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [kycStatus, setKycStatus] = useState<string>('unverified');

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h1>
      </div>

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
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
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
                  
                  <div className="flex-1 text-left">
                    <span className="block font-semibold text-slate-800 dark:text-white">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        kycStatus === 'verified' ? "text-emerald-500" : "text-amber-500"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {item.showArrow && (
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
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
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
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
                'w-12 h-6 rounded-full transition-colors relative',
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
    </div>
  );
}
