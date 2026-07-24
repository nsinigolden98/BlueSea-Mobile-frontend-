import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  BalanceCard,
  QuickActions,
  TransactionList,
} from '@/components/ui-custom';
import { BlueConnectPreview } from '@/components/blueconnect';
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
  LayoutGrid,
  Award
} from 'lucide-react';

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
        console.error('Sync failed:', error);
      }
    };
    loadData();
  }, []);

  const weeklyStats = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyTransactions = transactions.filter(
      (tx) => new Date(tx.created_at) >= oneWeekAgo
    );
    const totalSpent = weeklyTransactions
      .filter((tx) => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return {
      amount: totalSpent,
      count: weeklyTransactions.length,
    };
  }, [transactions]);

  const premiumServices = [
    {
      label: 'Payroll Pro',
      icon: Briefcase,
      path: '/payroll-pro',
    },
    {
      label: 'Travel',
      icon: Plane,
      path: '/flights',
    },
    {
      label: 'Events',
      icon: Ticket,
      path: '/marketplace',
    },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-x-hidden">
        {/* DASHBOARD HEADER */}
        <DashboardHeader />

        {/* ISOLATED SCROLLABLE PAGE CONTENT CONTAINER (STRICTLY NO VISIBLE SCROLLBARS) */}
        <main className="flex-1 p-3 md:p-6 overflow-y-auto z-10 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="max-w-4xl mx-auto space-y-3 md:space-y-5">
            
            {/* BALANCE CARD WITH INTEGRATED BOTTOM-RIGHT WALLET BUTTON */}
            <div className="flex flex-col relative group">
              <div className="relative rounded-3xl overflow-hidden shadow-xs">
                <BalanceCard showBalance={showBalance} onToggleBalance={setShowBalance} />

                {/* INTEGRATED WALLET BUTTON AT BOTTOM RIGHT OF BALANCE CARD */}
                <div className="absolute bottom-3 right-3 z-20">
                  <button
                    onClick={() => navigate('/wallet')}
                    aria-label="Open Wallet"
                    className="w-10 h-10 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl active:scale-90 cursor-pointer border border-white/20 dark:border-white/10 group/wallet"
                  >
                    <Wallet className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* SPENT SUMMARY ACTION STRIP BENEATH BALANCE CARD */}
              <div className="mx-2 md:mx-3 -mt-1.5 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => navigate('/transaction-history')}
                  className="flex-1 bg-white dark:bg-slate-900 border-x border-b border-slate-100 dark:border-slate-800 rounded-b-2xl px-3.5 py-2.5 md:py-3 flex items-center justify-between shadow-xs hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors z-0 text-left cursor-pointer group/spent"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    <p className="text-[11px] md:text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {showBalance ? `₦${weeklyStats.amount.toLocaleString()}` : '••••••'}{' '}
                      <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">
                        spent • {weeklyStats.count} txns
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 group-hover/spent:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS (HORIZONTAL SWIPEABLE WITHOUT VISIBLE SCROLLBAR LINE) */}
            <section className="space-y-2 md:space-y-3 pt-0.5">
              <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">
                Quick Actions
              </h3>
              <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex gap-3 md:gap-4 pb-1 md:pb-2 w-max pr-6 md:pr-0">
                  <QuickActions />
                </div>
              </div>
            </section>

            {/* BLUESEA CONNECT PREVIEW SECTION (COMPACT & PROPORTIONED FIT) */}
            <div
              onClick={() => navigate('/blueconnect')}
              className="cursor-pointer transition-transform active:scale-[0.98] w-full max-w-full overflow-hidden"
            >
              <div className="scale-[0.99] md:scale-100 origin-center">
                <BlueConnectPreview />
              </div>
            </div>

            {/* BLUESEA EXCLUSIVES */}
            <section className="space-y-2 md:space-y-3 pt-0.5">
              <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">
                BlueSea Exclusives
              </h3>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {premiumServices.map((service) => (
                  <div
                    key={service.label}
                    onClick={() => navigate(service.path)}
                    className="flex items-center gap-2 p-2 md:p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-95 shadow-xs h-11 md:h-12 min-w-0"
                  >
                    <div className="w-6 h-6 md:w-7 md:h-7 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-sky-500/10 transition-colors">
                      <service.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                    </div>
                    <span className="text-[11px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {service.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* EXPLORE ALL SERVICES NAV CARD */}
            <div
              onClick={() => navigate('/services')}
              className="flex items-center justify-between p-2.5 md:p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-[0.99] shadow-xs"
            >
              <div className="flex items-center gap-2.5 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 group-hover:bg-sky-500/10 transition-colors">
                  <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-slate-600 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
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
              className="bg-gradient-to-r from-sky-500 to-sky-700 rounded-2xl p-3.5 md:p-4 text-white cursor-pointer hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-[0.98] shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center text-white border border-white/20">
                    <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs md:text-sm">BluePoints Reward</h3>
                    <p className="text-[10px] md:text-[11px] text-sky-100 opacity-90">
                      Check your loyalty progress
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 p-1.5 rounded-full border border-white/20">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* RECENT TRANSACTIONS (DESKTOP ONLY) */}
            <section className="hidden md:block space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Recent Transactions
                </h3>
                <button
                  onClick={() => navigate('/transaction-history')}
                  className="text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                >
                  View History
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-1 shadow-xs">
                <TransactionList />
              </div>
            </section>
          </div>
        </main>

        {/* FIXED MOBILE BOTTOM NAVIGATION LAYER */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>
    </div>
  );
}
