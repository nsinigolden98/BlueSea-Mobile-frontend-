import { useState, useEffect, useMemo } from 'react';
import { 
  Sidebar, 
  Header, 
  BalanceCard, 
  QuickActions, 
  TransactionList 
} from '@/components/ui-custom';
import { announcements, TransactionsData } from '@/data';
import { cn } from '@/lib/utils';
import { 
  Megaphone, 
  X, 
  ChevronRight, 
  Wallet, 
  Plane, 
  Hotel, 
  Ticket, 
  Calendar, 
  Shield,
  type Transaction
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  // Fetch transaction data for Weekly Summary logic
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await TransactionsData();
        setTransactions(data);
      } catch (error) {
        console.error("Error loading transactions for summary:", error);
      }
    };
    loadData();
  }, []);

  const activeAnnouncements = announcements.filter(
    a => !dismissedAnnouncements.includes(a.id) && a.priority === 'high'
  );

  const dismissAnnouncement = (id: string) => {
    setDismissedAnnouncements([...dismissedAnnouncements, id]);
  };

  // Weekly Summary Logic (Last 7 days)
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
    { label: 'Tickets', icon: Ticket, path: '/marketplace' },
    { label: 'Events', icon: Calendar, path: '/events' },
    { label: 'Insurance', icon: Shield, path: '/insurance' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Animation Styles for Billboard */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard"
          subtitle="Buy Smarter & Cheaper"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-5">
            
            {/* Auto-scroll Billboard / Announcement Strip */}
            {activeAnnouncements.length > 0 && (
              <div className="relative bg-white dark:bg-slate-800 border-y border-slate-100 dark:border-slate-800 overflow-hidden py-2 -mx-4 md:mx-0 md:rounded-xl md:border-x">
                <div className="animate-marquee gap-8 items-center px-4">
                  {[...activeAnnouncements, ...activeAnnouncements].map((announcement, idx) => (
                    <div key={`${announcement.id}-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
                      <Megaphone className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {announcement.title}: {announcement.content}
                      </span>
                      <button 
                        onClick={() => dismissAnnouncement(announcement.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Balance Card Section with Wallet Update */}
            <div className="space-y-4">
              <div className="relative group">
                <BalanceCard />
                {/* Wallet Action Overlay */}
                <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end">
                  <div className="mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all pointer-events-none">
                    Wallet
                  </div>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors shadow-lg"
                  >
                    <Wallet className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Weekly Summary - Directly below BalanceCard */}
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Weekly Spending</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      ₦{weeklyStats.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Activity</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {weeklyStats.count} Transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Horizontal Scroll Container */}
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Quick Services</h3>
              </div>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                <div className="flex gap-3 min-w-max">
                  <div className="scale-[0.96] origin-left">
                    <QuickActions />
                  </div>
                </div>
              </div>
            </section>

            {/* Explore Services Grid */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 px-1">Explore Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {exploreServices.map((service) => (
                  <div
                    key={service.label}
                    onClick={() => navigate(service.path)}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <service.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {service.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Rewards Teaser */}
            <div
              onClick={() => navigate('/rewards')}
              className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="text-xl">🎁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Earn BluePoints</h3>
                    <p className="text-xs text-sky-100">Complete tasks and earn rewards</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-1">
               <TransactionList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
              }
