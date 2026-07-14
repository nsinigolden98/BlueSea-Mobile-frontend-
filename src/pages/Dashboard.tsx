import { useState, useEffect, useMemo } from 'react';
import {
  Sidebar,
  Header,
  BalanceCard,
  QuickActions
} from '@/components/ui-custom';
import { TransactionsData } from '@/data';
import { type Transaction } from '@/types';
import {
  ChevronRight,
  Plane,
  Hotel,
  Ticket,
  Shield,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await TransactionsData();
        if (isMounted) {
          setTransactions(data);
        }
      } catch (error) {
        console.error("Sync failed:", error);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const weeklySpent = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return transactions
      .filter(tx => new Date(tx.created_at) >= oneWeekAgo && tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  const exploreServices = [
    { 
      label: 'Flights', 
      description: 'Book domestic and international flights', 
      icon: Plane, 
      path: '/flights' 
    },
    { 
      label: 'Hotels', 
      description: 'Find premium stays and accommodations', 
      icon: Hotel, 
      path: '/hotels' 
    },
    { 
      label: 'Events', 
      description: 'Discover local experiences and concerts', 
      icon: Ticket, 
      path: '/marketplace' 
    },
    { 
      label: 'Insurance', 
      description: 'Secure your assets with tailored coverage', 
      icon: Shield, 
      path: '/insurance' 
    },
  ];

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />  

      {/* Independent Sidebar Viewport Container */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />  

      {/* Application Workspace Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">  
        <Header  
          title="Dashboard"  
          subtitle="The Trusted Way To Stay Connected"  
          onMenuClick={() => setSidebarOpen(true)}  
        />  

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide pb-24 lg:pb-6">  
          <div className="max-w-4xl mx-auto space-y-6">  
              
            {/* 1. HERO BALANCE CARD */}  
            <div className="relative">  
              <BalanceCard />  
            </div>  

            {/* 2. QUICK ACTIONS SECTION */}  
            <section className="space-y-3">  
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Quick Actions</h3>  
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">  
                <div className="flex gap-4 pb-2 w-max pr-4">  
                  <QuickActions />  
                </div>  
              </div>  
            </section>  

            {/* 3. RECENT ACTIVITY PREVIEW */}  
            <section className="space-y-3">  
              <div className="flex items-center justify-between px-1">  
                <div className="space-y-0.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Recent Activity</h3>  
                  {weeklySpent > 0 && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Outflow this week: <span className="font-semibold text-slate-700 dark:text-slate-300">₦{weeklySpent.toLocaleString()}</span>
                    </p>
                  )}
                </div>
                <button  
                  onClick={() => navigate('/transaction-history')}  
                  className="text-xs font-semibold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors flex items-center gap-0.5"
                >  
                  <span>See All</span>  
                  <ChevronRight className="w-3.5 h-3.5" />  
                </button>  
              </div>  

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 p-2 space-y-1 shadow-sm">  
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => {  
                    const isDebit = tx.transaction_type === 'DEBIT';  
                    return (  
                      <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">  
                        <div className="flex items-center gap-3 min-w-0">  
                          <div className={cn(  
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",  
                            isDebit ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400"  
                          )}>  
                            {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}  
                          </div>  
                          <div className="min-w-0">  
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">  
                              {tx.title || tx.narration || (isDebit ? 'Spends / Debits' : 'Received Funds')}  
                            </p>  
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">  
                              {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}  
                            </p>  
                          </div>  
                        </div>  
                        <span className={cn(  
                          "text-xs font-bold shrink-0 pl-2",  
                          isDebit ? "text-slate-800 dark:text-slate-200" : "text-emerald-600 dark:text-emerald-400"  
                        )}>  
                          {isDebit ? '-' : '+'}₦{Number(tx.amount).toLocaleString()}  
                        </span>  
                      </div>  
                    );  
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                    No recent activity found.
                  </div>
                )}  
              </div>  
            </section>  

            {/* 4. EXPLORE SERVICES GRID */}  
            <section className="space-y-3">  
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Explore Services</h3>  
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">  
                {exploreServices.map((service) => (  
                  <div  
                    key={service.label}  
                    onClick={() => navigate(service.path)}  
                    className="flex items-start gap-3.5 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/60 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 hover:shadow-sm transition-all duration-200 cursor-pointer group active:scale-[0.99]"  
                  >  
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border border-slate-100 dark:border-transparent group-hover:bg-sky-50 dark:group-hover:bg-sky-950/30 transition-colors shrink-0">  
                      <service.icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />  
                    </div>  
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">  
                        {service.label}  
                      </span>  
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal truncate">
                        {service.description}
                      </p>
                    </div>
                  </div>  
                ))}  
              </div>  
            </section>  

            {/* 5. REWARDS PROGRESS CARD */}  
            <div  
              onClick={() => navigate('/rewards')}  
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 rounded-2xl p-5 text-white cursor-pointer border border-slate-200/10 shadow-sm group hover:border-sky-500/30 transition-all duration-300"  
            >  
              <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
              
              <div className="flex items-center justify-between relative z-10">  
                <div className="flex items-center gap-4">  
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">  
                    🎁  
                  </div>  
                  <div>  
                    <h3 className="font-bold text-sm text-white tracking-wide">
                      BluePoints Rewards
                    </h3>  
                    <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                      Check your loyalty tier status and convert accrued points
                    </p>  
                  </div>  
                </div>  
                <div className="bg-white/5 group-hover:bg-white/10 p-1.5 rounded-full border border-white/10 transition-colors">  
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />  
                </div>  
              </div>  
            </div>  

          </div>  
        </main>  
      </div>  
    </div>
  );
}
