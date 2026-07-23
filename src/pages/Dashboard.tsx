import { useState, useEffect, useMemo } from 'react';
import {
  Sidebar,
  BalanceCard,
  QuickActions,
  TransactionList
} from '@/components/ui-custom';
import { DashboardHeader } from '@/components/ui-custom/DashboardHeader';
import { TransactionsData } from '@/data';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

import { type Transaction } from '@/types';
import {
  ChevronRight,
  Wallet,
  Plane,
  Ticket,
  Briefcase,
  Network,
  LayoutGrid,
  Award,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlueConnectPartner {
  id: string;
  name: string;
  category: string;
  logoBg: string;
  logoText: string;
}

const BLUECONNECT_PLACEHOLDERS: BlueConnectPartner[] = [
  { id: '1', name: 'Netflix', category: 'Subscription', logoBg: 'bg-red-500/10 text-red-500 dark:bg-red-500/20', logoText: 'N' },
  { id: '2', name: 'DSTV', category: 'Entertainment', logoBg: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20', logoText: 'D' },
  { id: '3', name: 'BlueSea Premium', category: 'Membership', logoBg: 'bg-sky-500/10 text-sky-500 dark:bg-sky-500/20', logoText: 'BS' },
  { id: '4', name: 'Spotify', category: 'Music Streaming', logoBg: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20', logoText: 'S' },
  { id: '5', name: 'Uber Technologies', category: 'Logistics & Ride', logoBg: 'bg-slate-800/10 text-slate-800 dark:bg-slate-200/10 dark:text-slate-200', logoText: 'U' },
  { id: '6', name: 'Starlink', category: 'Satellite Internet', logoBg: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20', logoText: 'SL' }
];

export function BlueConnectPreview() {
  // Duplicated array ensures an infinite seamless scrolling loop
  const carouselItems = [...BLUECONNECT_PLACEHOLDERS, ...BLUECONNECT_PLACEHOLDERS];

  return (
    <section className="space-y-3 pt-1">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              BlueConnect
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Zap className="w-2.5 h-2.5 fill-current" />
              Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pay trusted businesses securely through BlueConnect
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden w-full rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/5 py-3.5">
        {/* Soft edge gradients for continuous horizontal fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 dark:from-slate-900 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 dark:from-slate-900 to-transparent z-10" />

        <div className="animate-marquee hover:[animation-play-state:paused] active:[animation-play-state:paused] flex gap-3 px-3">
          {carouselItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="w-48 shrink-0 p-3 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-xs hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-default flex items-center gap-3 select-none"
            >
              <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-black text-xs border border-slate-100 dark:border-white/5 ${item.logoBg}`}>
                {item.logoText}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {item.name}
                </p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {item.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  // Synced state to ensure all sensitive details toggle together
  const [showBalance, setShowBalance] = useState(() => {
    const savedState = localStorage.getItem('dashboard_showBalance');
    return savedState === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dashboard_showBalance', String(showBalance));
  }, [showBalance]);

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

  const redirect = () => (window.location.href = '/transaction-history');

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

  const premiumServices = [
    {
      label: 'BlueSea Connect',
      icon: Network,
      path: '/connect'
    },
    {
      label: 'Payroll Pro',
      icon: Briefcase,
      path: '/payroll-pro'
    },
    {
      label: 'Travel',
      icon: Plane,
      path: '/flights'
    },
    {
      label: 'Events',
      icon: Ticket,
      path: '/marketplace'
    }
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
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
        .animate-marquee:hover,
        .animate-marquee:active {
          animation-play-state: paused;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
        
        {/* PREMIUM FIXED HEADER */}
        <DashboardHeader />

        {/* ISOLATED SCROLLABLE PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-4xl mx-auto space-y-5">
            
            {/* BALANCE CARD & INTEGRATED FLOATING SUMMARY */}
            <div className="flex flex-col relative group">
              <BalanceCard showBalance={showBalance} onToggleBalance={setShowBalance} />
              
              <button
                onClick={() => navigate('/wallet')}
                aria-label="Go to Wallet"
                className="absolute top-4 right-4 w-9 h-9 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-md active:scale-95 z-20 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
              </button>

              {/* Natural floating extension attached directly underneath */}
              <button
                onClick={redirect}
                className="mx-3 -mt-1.5 bg-white dark:bg-slate-900 border-x border-b border-slate-200/80 dark:border-white/5 rounded-b-xl px-4 py-3 flex items-center justify-between shadow-xs hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors z-0 text-left cursor-pointer group/spent"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {showBalance ? `₦${weeklyStats.amount.toLocaleString()}` : '••••••'}{" "}
                    <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">
                      spent • {weeklyStats.count} transactions
                    </span>
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/spent:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <section className="space-y-3 pt-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">
                Quick Actions
              </h3>
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 pb-2 w-max pr-10">
                  <QuickActions />
                </div>
              </div>
            </section>

            {/* BLUESEA CONNECT SECTION (IMMEDIATELY BELOW QUICK ACTIONS) */}
            <BlueConnectPreview />

            {/* BLUESEA EXCLUSIVES */}
            <section className="space-y-3 pt-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">
                BlueSea Exclusives
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {premiumServices.map((service) => (
                  <div
                    key={service.label}
                    onClick={() => navigate(service.path)}
                    className="flex items-center gap-2.5 p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-95 shadow-xs h-12 min-w-0"
                  >
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-transparent group-hover:bg-sky-500/10 transition-colors">
                      <service.icon className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {service.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* EXPLORE ALL SERVICES NAV CARD */}
            <div
              onClick={() => navigate('/services')}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-[0.99] shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-transparent group-hover:bg-sky-500/10 transition-colors">
                  <LayoutGrid className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Explore All Services
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    Airtime, data, bills & utilities
                  </span>
                </div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg group-hover:bg-sky-500/10 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400" />
              </div>
            </div>

            {/* REWARDS */}
            <div
              onClick={() => navigate('/rewards')}
              className="bg-gradient-to-r from-sky-500 to-sky-700 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-[0.98] shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white border border-white/20">
                    <Award className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">BluePoints Reward</h3>
                    <p className="text-[11px] text-sky-100 opacity-90">Check your loyalty progress</p>
                  </div>
                </div>
                <div className="bg-white/10 p-1.5 rounded-full border border-white/20">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* RESPONSIVE TRANSACTION LIST CONTAINER */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Recent Transactions
                </h3>
                <button
                  onClick={redirect}
                  className="text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                >
                  View History
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/5 p-1 shadow-xs">
                <TransactionList />
              </div>
            </section>
          </div>
        </main>

        {/* FIXED MOBILE BOTTOM NAVIGATION LAYER */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
          <MobileBottomNavigation />
        </div>

      </div>
    </div>
  );
}