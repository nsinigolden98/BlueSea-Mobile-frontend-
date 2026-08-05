import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart2, 
  Trophy, 
  Award, 
  Bell, 
  Bookmark, 
  Settings, 
  ArrowLeft 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/affiliate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/affiliate/events', label: 'My Events', icon: Calendar },
  { path: '/affiliate/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/affiliate/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/affiliate/achievements', label: 'Achievements', icon: Award },
  { path: '/affiliate/saved', label: 'Saved Events', icon: Bookmark },
  { path: '/affiliate/notifications', label: 'Alerts', icon: Bell },
  { path: '/affiliate/settings', label: 'Settings', icon: Settings },
];

export function AffiliateLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/marketplace')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            title="Return to Marketplace"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-sky-500">Affiliate Center</h1>
        </div>
      </header>

      {/* Navigation Sub-Menu Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 overflow-x-auto max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-1 md:gap-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all shrink-0",
                  isActive
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}