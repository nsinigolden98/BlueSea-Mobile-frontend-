import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Bell,
  Settings,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { affiliateApi } from '@/services/affiliateApi';
import type { BackendAffiliateStatus } from '@/types/affiliate';

const NAV_ITEMS = [
  { path: '/affiliate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/affiliate/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/affiliate/notifications', label: 'Alerts', icon: Bell },
  { path: '/affiliate/settings', label: 'Settings', icon: Settings },
];

export function AffiliateLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<BackendAffiliateStatus | 'loading'>('loading');

  useEffect(() => {
    let isMounted = true;

    async function checkAffiliateStatus() {
      try {
        const data = await affiliateApi.getStatus();
        if (!isMounted) return;

        if (data.is_approved || data.status === 'approved') {
          setStatus('approved');
        } else if (data.status === 'pending') {
          setStatus('pending');
          if (!location.pathname.includes('/pending')) {
            navigate('/affiliate/pending');
          }
        } else if (data.status === 'rejected') {
          setStatus('rejected');
        } else {
          setStatus('none');
          if (!location.pathname.includes('/register')) {
            navigate('/affiliate/register');
          }
        }
      } catch {
        if (isMounted) {
          setStatus('none');
        }
      }
    }

    checkAffiliateStatus();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
        <p className="text-xs font-bold">Verifying Affiliate Status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/marketplace')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Return to Marketplace"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-sky-500">Affiliate Center</h1>
        </div>
      </header>

      {/* Navigation Menu Bar */}
      {status === 'approved' && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 overflow-x-auto">
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
      )}

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}