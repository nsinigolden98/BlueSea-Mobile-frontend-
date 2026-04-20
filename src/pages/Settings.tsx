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
  Grid3X3
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h1>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Settings Items */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                      index !== settingsItems.length - 1 && 'border-b border-slate-100 dark:border-slate-800'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-sky-500" />
                    </div>
                    <span className="flex-1 text-left font-medium text-slate-800 dark:text-white">
                      {item.label}
                    </span>
                    {item.showArrow && (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-sky-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-sky-500" />
                  )}
                </div>
                <span className="flex-1 text-left font-medium text-slate-800 dark:text-white">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <div className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  theme === 'dark' ? 'bg-sky-500' : 'bg-slate-300'
                )}>
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    theme === 'dark' ? 'left-7' : 'left-1'
                  )} />
                </div>
              </button>
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-500">Sign Out</span>
              </div>
            </button>
          </div>
      </main>
    </div>
  );
}
