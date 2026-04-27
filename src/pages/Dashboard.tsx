import { useState, useEffect, useMemo } from 'react';
import { 
  Sidebar, 
  Header, 
  BalanceCard, 
  QuickActions, 
  TransactionList 
} from '@/components/ui-custom';
// Corrected import based on your finding
import { announcements, TransactionsData } from '@/data'; 
import { type Transaction } from '@/types'; 
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
  ArrowUpRight,
  TrendingUp
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
        console.error("Data fetch failed", error);
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
    return { amount: totalSpent, count: weeklyTransactions.length };
  }, [transactions]);

  const exploreServices = [
    { label: 'Flights', icon: Plane, path: '/flights', color: 'text-blue-500' },
    { label: 'Hotels', icon: Hotel, path: '/hotels', color: 'text-purple-500' },
    { label: 'Tickets', icon: Ticket, path: '/marketplace', color: 'text-orange-500' },
    { label: 'Events', icon: Calendar, path: '/events', color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      ` }} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header
          title="Overview"
          subtitle="Welcome back, Chief"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto hide-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Premium Announcement Bar */}
            {activeAnnouncements.length > 0 && (
              <div className="glass-card rounded-2xl p-1 overflow-hidden">
                <div className="flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-widest rounded-xl">
                  <TrendingUp className="w-3 h-3 mr-2" />
                  Live Updates
                </div>
                <div className="py-3 px-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-300">
                    {activeAnnouncements[0].title}: {activeAnnouncements[0].content}
                  </p>
                  <button onClick={() => setDismissedAnnouncements([activeAnnouncements[0].id])}>
                    <X className="w-4 h-4 text-slate-500 hover:text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Wallet Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative">
                   <BalanceCard />
                </div>
              </div>

              {/* Enhanced Weekly Stats */}
              <div className="glass-card rounded-3xl p-6 flex flex-col justify-between border-l-4 border-l-blue-500">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Weekly Burn</p>
                  <h2 className="text-3xl font-black mt-1 text-white">
                    ₦{weeklyStats.amount.toLocaleString()}
                  </h2>
                </div>
                <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>{weeklyStats.count} actions this week</span>
                </div>
              </div>
            </section>

            {/* Quick Actions (The Grid Look) */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-1">Quick Actions</h3>
              <div className="glass-card rounded-3xl p-4">
                <QuickActions />
              </div>
            </section>

            {/* Explore Services - Modern Tiles */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-1">Explore Ecosystem</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {exploreServices.map((service) => (
                  <button
                    key={service.label}
                    onClick={() => navigate(service.path)}
                    className="glass-card p-5 rounded-3xl flex flex-col items-start gap-4 hover:bg-slate-800/50 hover:scale-[1.02] transition-all group"
                  >
                    <div className={`p-3 rounded-2xl bg-slate-900 shadow-inner group-hover:bg-slate-800 transition-colors`}>
                      <service.icon className={`w-5 h-5 ${service.color}`} />
                    </div>
                    <span className="text-sm font-bold text-slate-200">{service.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Bottom Section: Transactions */}
            <section className="glass-card rounded-[2rem] overflow-hidden">
               <div className="p-6 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Activity History</h3>
                  <button className="text-xs font-bold text-blue-500 hover:underline">View All</button>
               </div>
               <div className="p-2">
                 <TransactionList />
               </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
                }
