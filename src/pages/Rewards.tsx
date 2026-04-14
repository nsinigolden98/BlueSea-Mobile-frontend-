import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Gift, 
  TrendingUp, 
  ArrowRight,
  Trophy,
  Loader2,
} from 'lucide-react';

interface BonusSummary {
  current_points: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
}

interface BonusHistory {
  id: number;
  transaction_type: string;
  points: number;
  reason: string;
  description: string;
  created_at: string;
}

export function Rewards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'history'>('points');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<BonusSummary | null>(null);
  const [history, setHistory] = useState<BonusHistory[]>([]);
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  useEffect(() => {
    fetchBonusData();
  }, []);

  const fetchBonusData = async () => {
    try {
      setLoading(true);
      showLoader();
      
      const summaryRes = await getRequest(ENDPOINTS.bonus_summary);
      if (summaryRes && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      
      const historyRes = await getRequest(ENDPOINTS.bonus_history);
      if (historyRes && historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (error) {
      showToast('Failed to load rewards data');
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const totalPoints = summary?.current_points || 0;
  const earnedPoints = summary?.lifetime_earned || 0;
  const redeemedPoints = summary?.lifetime_redeemed || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Rewards" 
          subtitle="Earn & Redeem BluePoints"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Points Summary Card */}
            <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/25">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sky-100 text-sm">Total BluePoints</p>
                    <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => navigate('/loyalty')}
                >
                  Redeem
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-200" />
                  <span className="text-sky-100">Earned: {earnedPoints}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-sky-200" />
                  <span className="text-sky-100">Redeemed: {redeemedPoints}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('points')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  activeTab === 'points'
                    ? 'bg-sky-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                Points Details
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  activeTab === 'history'
                    ? 'bg-sky-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('referal')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  activeTab === 'referal'
                    ? 'bg-sky-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                Referal Bonus
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : activeTab === 'points' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Lifetime Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{earnedPoints.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Lifetime Redeemed</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{redeemedPoints.toLocaleString()}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-sky-500" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Current Balance</span>
                  </div>
                  <p className="text-2xl font-bold text-sky-500">{totalPoints.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No history yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            item.transaction_type === 'earned'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          )}>
                            {item.transaction_type === 'earned' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <Gift className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{item.description}</p>
                            <p className="text-sm text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={cn(
                          'font-bold',
                          item.transaction_type === 'earned'
                            ? 'text-green-500'
                            : 'text-red-500'
                        )}>
                          {item.transaction_type === 'earned' ? '+' : '-'}{item.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
