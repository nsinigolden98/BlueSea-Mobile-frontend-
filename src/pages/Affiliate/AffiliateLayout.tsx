import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, BarChart3, Trophy, 
  Award, Bookmark, Bell, Settings, UserPlus, Sparkles 
} from 'lucide-react';

export function AffiliateLayout() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/affiliate/dashboard', icon: LayoutDashboard },
    { label: 'My Events', path: '/affiliate/events', icon: Calendar },
    { label: 'Analytics', path: '/affiliate/analytics', icon: BarChart3 },
    { label: 'Leaderboard', path: '/affiliate/leaderboard', icon: Trophy },
    { label: 'Achievements', path: '/affiliate/achievements', icon: Award },
    { label: 'Saved Events', path: '/affiliate/saved', icon: Bookmark },
    { label: 'Alerts', path: '/affiliate/alerts', icon: Bell },
    { label: 'Settings', path: '/affiliate/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-base leading-tight">Affiliate Hub</h1>
            <p className="text-[10px] text-slate-400">BlueSea Partner Center</p>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main View Display */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}