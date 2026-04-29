import { useState, useEffect, useMemo } from 'react';
import { 
  Sidebar, 
  Header, 
  BalanceCard, 
  QuickActions, 
  TransactionList 
} from '@/components/ui-custom';
import { announcements, TransactionsData } from '@/data'; 
import { type Transaction } from '@/types';
import { 
  Megaphone, 
  ChevronRight, 
  Wallet, 
  Plane, 
  Hotel, 
  Ticket,
  Shield,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await TransactionsData();
        setTransactions(data);
      } catch (error) {
        console.error("Sync failed:", error);
      }
    };
    loadData();
  }, []);

  const activeAnnouncements = announcements.filter(
    a => !dismissedAnnouncements.includes(a.id) && a.priority === 'high'
  );

  const weeklyStats = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyTransactions = transactions.filter(tx => new Date(tx.created_at) >= oneWeekAgo);
    const totalSpent = weeklyTransactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      amount: totalSpent,
      count: weeklyTransactions.length
    };
  }, [transactions]);

  const exploreServices = [
    { label: 'Flights', icon: Plane, path: '/flights' },
    { label: 'Hotels', icon: Hotel, path: '/hotels' },
    { label: 'Events', icon: Ticket, path: '/marketplace' },
    { label: 'Insurance', icon: Shield, path: '/insurance' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover { animation-play-state: paused; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Light mode QuickAction styles */
        .quick-action-item {
          width: 80px !important;
          height: 80px !important;
          background: #f8fafc !important; /* bg-slate-50 */
          border: 1px solid #e2e8f0 !important; /* border-slate-200 */
          border-radius: 1rem !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .quick-action-item:hover { background: #f1f5f9 !important; }

        /* Dark mode overrides for QuickAction items */
        .dark .quick-action-item {
          background: #1e293b !important; /* bg-slate-800 */
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .dark .quick-action-item:hover { background: rgba(255,255,255,0.1) !important; }
      ` }} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 transition-colors duration-300">
        <Header
          title="Dashboard"
          subtitle="The Trusted Way To Stay Connected"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* 1. AUTO-SCROLL BILLBOARD */}
        {activeAnnouncements.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-white/5 py-2 overflow-hidden group">
            <div className="animate-marquee flex items-center">
              {[...activeAnnouncements, ...activeAnnouncements].map((announcement, idx) => (
                <div key={`${announcement.id}-${idx}`} className="flex items-center gap-3 px-8 border-r border-slate-200 dark:border-white/5">
                  <Megaphone className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                  <span className="text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
                    {announcement.title}: {announcement.content}
                  </span>
                  <button 
                    onClick={() => setDismissedAnnouncements([...dismissedAnnouncements, announcement.id])}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* 2. BALANCE CARD & WEEKLY SUMMARY */}
            <div className="space-y-3">
              <div className="relative group">
                <BalanceCard />
                <button
                  onClick={() => navigate('/wallet')}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl active:scale-95"
                >
                  <Wallet className="w-5 h-5" />
                </button>
              </div>

              {/* Refactored Weekly Summary Bar */}
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    ₦{weeklyStats.amount.toLocaleString()} <span className="text-slate-500 dark:text-slate-500 font-normal ml-1">spent • {weeklyStats.count} transactions</span>
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
              </div>
            </div>

            {/* 3. QUICK ACTIONS (Horizontal Scroll) */}
            <section className="pt-2">
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3 pb-2 w-max pr-10">
                  <div className="flex gap-3">
                    <QuickActions />
                  </div>
                </div>
              </div>
            </section>

            {/* 4. EXPLORE SERVICES GRID */}
            <section className="space-y-3 pt-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Explore Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {exploreServices.map((service) => (
                  <div
                    key={service.label}
                    onClick={() => navigate(service.path)}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-95 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700/50 flex items-center justify-center border border-slate-100 dark:border-transparent group-hover:bg-sky-500/10 transition-colors">
                      <service.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {service.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* REWARDS (The only remaining gradient) */}
            <div
              onClick={() => navigate('/rewards')}
              className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                    🎁
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">BluePoints Reward</h3>
                    <p className="text-[11px] text-sky-100 opacity-80">Check your loyalty progress</p>
                  </div>
                </div>
                <div className="bg-white/10 p-1 rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* 5. TRANSACTION LIST */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-1 shadow-sm dark:shadow-2xl">
               <TransactionList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
