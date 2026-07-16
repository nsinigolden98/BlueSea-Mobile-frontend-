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
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    <div className="h-screen bg-white dark:bg-slate-955 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
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
      ` }} />  

      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />  

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-950 transition-colors duration-300 relative">  
        
        {/* PREMIUM FIXED GLASS HEADER */}
        <DashboardHeader />

        {/* ISOLATED SCROLLABLE PAGE CONTENT CONTAINER */}  
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">  
          <div className="max-w-4xl mx-auto space-y-5">  
              
            {/* BALANCE CARD & INTEGRATED FLOATING SUMMARY */}  
            <div className="flex flex-col relative">  
              <BalanceCard showBalance={showBalance} onToggleBalance={setShowBalance} />  
              
              <button  
                onClick={() => navigate('/wallet')}  
                className="absolute bottom-14 right-6 w-10 h-10 bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl active:scale-95 z-20"  
              >  
                <Wallet className="w-5 h-5" />  
              </button>  

              {/* Natural floating extension attached directly underneath with tight overlap */}
              <button
                onClick={redirect}
                className="mx-3 -mt-1.5 bg-slate-50 dark:bg-slate-800 border-x border-b border-slate-200 dark:border-white/5 rounded-b-xl px-4 py-3 flex items-center justify-between shadow-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors z-0 text-left cursor-pointer"
              >  
                <div className="flex items-center gap-2">  
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />  
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">  
                    {showBalance ? `₦${weeklyStats.amount.toLocaleString()}` : '******'}{" "}
                    <span className="text-slate-500 dark:text-slate-500 font-normal ml-1">spent • {weeklyStats.count} transactions</span>  
                  </p>  
                </div>  
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />  
              </button>  
            </div>  

            {/* QUICK ACTIONS */}  
            <section className="space-y-3 pt-2">  
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Quick Actions</h3>  
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">  
                <div className="flex gap-4 pb-2 w-max pr-10">  
                  <QuickActions />  
                </div>  
              </div>  
            </section>  

            {/* BLUESEA EXCLUSIVES (Compact, Two Column Grid) */}  
            <section className="space-y-3 pt-2">  
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">BlueSea Exclusives</h3>  
              <div className="grid grid-cols-2 gap-3">  
                {premiumServices.map((service) => (  
                  <div  
                    key={service.label}  
                    onClick={() => navigate(service.path)}  
                    className="flex items-center gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-95 shadow-sm h-12 min-w-0"  
                  >  
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-slate-700/50 flex items-center justify-center border border-slate-100 dark:border-transparent group-hover:bg-sky-500/10 transition-colors">  
                      <service.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />  
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
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-[0.99] shadow-sm"  
            >  
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700/50 flex items-center justify-center border border-slate-100 dark:border-transparent group-hover:bg-sky-500/10 transition-colors">  
                  <LayoutGrid className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />  
                </div>  
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">  
                  Explore All Services
                </span>  
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg group-hover:bg-sky-500/10 transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400" />
              </div>
            </div>

            {/* REWARDS */}  
            <div  
              onClick={() => navigate('/rewards')}  
              className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-[0.98] shadow-sm"  
            >  
              <div className="flex items-center justify-between">  
                <div className="flex items-center gap-4">  
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">  
                    <Award className="w-5 h-5 text-amber-300" />  
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

            {/* RESPONSIVE TRANSACTION LIST CONTAINER */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-1 shadow-sm">  
               <TransactionList />  
            </div>  
          </div>  
        </main>  

        {/* FIXED MOBILE BOTTOM NAVIGATION LAYER */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900">
          <MobileBottomNavigation />
        </div>

      </div>  
    </div>
  );
}
