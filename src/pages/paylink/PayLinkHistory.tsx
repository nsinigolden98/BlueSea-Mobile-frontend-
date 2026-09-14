import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { paylinkService } from '@/services/paylinkService';
import type { PayLinkItem } from '@/types/paylink';
import { ArrowLeft, History, BarChart3 } from 'lucide-react';

export function PayLinkHistory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [links, setLinks] = useState<PayLinkItem[]>([]);
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'HISTORY';
  const navigate = useNavigate();

  useEffect(() => {
    paylinkService.getPayLinks().then(setLinks);
  }, []);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title={currentTab === 'ANALYTICS' ? 'PayLink Analytics' : 'Payment Link History'} 
            subtitle="Transaction records & performance data"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 max-w-3xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/paylink')}
            className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
          </button>

          {currentTab === 'ANALYTICS' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-sky-500" />
                <span>Performance Overview</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Collected</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">₦150,000</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Settlement Net</p>
                  <p className="text-xl font-extrabold text-emerald-500 mt-1">₦148,500</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Commission (1%)</p>
                  <p className="text-xl font-extrabold text-amber-500 mt-1">₦1,500</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <History className="w-4 h-4 text-sky-500" />
                <span>Recent Link Activity</span>
              </div>
              <div className="space-y-2.5">
                {links.map((link) => (
                  <div key={link.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{link.title}</h3>
                      <p className="text-[11px] text-slate-400">{link.id} • {link.type}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {link.amount > 0 ? `₦${link.amount.toLocaleString()}` : 'Flexible'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}