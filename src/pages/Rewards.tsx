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
  Copy,
  Check,
  Users,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  PlayCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Interfaces updated to be more resilient to backend changes
interface BonusSummary {
  current_points: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  referral_count?: number;
  completed_referrals?: number;
}

interface BonusHistory {
  id: number;
  transaction_type: string;
  points: number;
  reason: string;
  description: string;
  created_at: string;
}

interface Task {
  id: string;
  name: string;
  points: number;
  type: 'social' | 'video' | 'app';
  status: 'start' | 'pending' | 'completed';
}

export function Rewards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'history' | 'referral' | 'tasks'>('points');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<BonusSummary | null>(null);
  const [history, setHistory] = useState<BonusHistory[]>([]);
  const [youtubeCode, setYoutubeCode] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent, showLoader, hideLoader } = Loader();
  const {user} = useAuth()

  const referralLink = `https://blueseamobile.com.ng/login?ref=${user?.referral_code}`;

  // Defined outside or memoized to avoid re-render issues
  const tasks: Task[] = [
    { id: '1', name: 'Follow X (Twitter) account', points: 4, type: 'social', status: 'start' },
    { id: '2', name: 'Like recent post', points: 2, type: 'social', status: 'start' },
    { id: '3', name: 'Repost announcement', points: 2, type: 'social', status: 'start' },
    { id: '4', name: 'Download BlueMobile App', points: 5, type: 'app', status: 'start' },
    { id: '5', name: 'Watch YouTube Tutorial', points: 8, type: 'video', status: 'start' },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchBonusData = async () => {
      try {
        setLoading(true);
        showLoader();
        
        const summaryRes = await getRequest(ENDPOINTS.bonus_summary);
        if (isMounted && summaryRes?.data) {
          setSummary(summaryRes.data);
        }
        
        const historyRes = await getRequest(ENDPOINTS.bonus_history);
        if (isMounted && historyRes?.data) {
          setHistory(historyRes.data);
        }
      } catch (error) {
        console.log(error);
        if (isMounted) showToast('Failed to load rewards data');
      } finally {
        if (isMounted) {
          hideLoader();
          setLoading(false);
        }
      }
    };

    fetchBonusData();
    return () => { isMounted = false; };
  }, [showLoader, hideLoader, showToast]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('Referral link copied!');
  };

  const handleSocialVerify = (platform: string) => {
    showToast(`${platform} handle submitted!`);
  };

  const handleVerifyYoutube = () => {
    if (!youtubeCode.trim()) {
      showToast('Please enter the code');
      return;
    }
    showToast('Code submitted for verification!');
    setExpandedTask(null);
    setYoutubeCode('');
  };

  const totalPoints = summary?.current_points ?? 0;
  const earnedPoints = summary?.lifetime_earned ?? 0;
  const redeemedPoints = summary?.lifetime_redeemed ?? 0;
  const referralCount = summary?.referral_count ?? 0;
  const completedReferrals = summary?.completed_referrals ?? 0;
  // const pendingReferrals = referralCount - completedReferrals;

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

            {/* Referral Link Strip */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Referral Link</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{referralLink}</p>
              </div>
              <button 
                onClick={handleCopyLink}
                className="p-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(['points', 'history', 'referral', 'tasks'] as const).map((tabId) => (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === tabId
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700'
                  )}
                >
                  {tabId === 'points' ? 'Points Details' : tabId.charAt(0).toUpperCase() + tabId.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : activeTab === 'points' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<TrendingUp className="text-green-500" />} label="Lifetime Earned" value={earnedPoints} color="green" />
                <StatCard icon={<Gift className="text-red-500" />} label="Lifetime Redeemed" value={redeemedPoints} color="red" />
                <StatCard icon={<Trophy className="text-sky-500" />} label="Current Balance" value={totalPoints} color="sky" isBalance />
                <StatCard icon={<Users className="text-purple-500" />} label="Referral Network" value={referralCount} color="purple" />
              </div>
            ) : activeTab === 'history' ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {history.length === 0 ? (
                  <EmptyState icon={<Gift className="w-12 h-12" />} text="No history yet" />
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            item.transaction_type === 'earned' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                          )}>
                            {item.transaction_type === 'earned' ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white text-sm">{item.description}</p>
                            <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={cn('font-bold', item.transaction_type === 'earned' ? 'text-green-500' : 'text-red-500')}>
                          {item.transaction_type === 'earned' ? '+' : '-'}{item.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'referral' ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                    <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-sky-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Referral Earnings</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6 text-sm">
                        Invite friends and earn 50 BluePoints when they complete their first transaction.
                    </p>
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-white">{referralCount}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Completed</p>
                            <p className="text-lg font-bold text-green-500">{completedReferrals}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Bonus Earned</p>
                            <p className="text-lg font-bold text-sky-500">{completedReferrals * 50}</p>
                        </div>
                    </div>
                </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { id: 'X', Icon: Twitter, ph: 'X ID' },
                    { id: 'IG', Icon: Instagram, ph: 'IG Handle' },
                    { id: 'FB', Icon: Facebook, ph: 'FB Name' },
                    { id: 'YT', Icon: Youtube, ph: 'YT Channel' }
                  ].map((s) => (
                    <div key={s.id} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1.5 rounded-xl">
                       <s.Icon className="w-4 h-4 text-slate-400 ml-1" />
                       <input type="text" placeholder={s.ph} className="bg-transparent border-none text-xs focus:ring-0 w-20 dark:text-white p-0" />
                       <button onClick={() => handleSocialVerify(s.id)} className="p-1.5 bg-green-500 text-white rounded-lg"><Check className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-500">
                                    {task.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white text-sm">{task.name}</p>
                                    <p className="text-[10px] font-bold text-sky-500 uppercase">+{task.points} Points</p>
                                </div>
                            </div>
                            <Button 
                                size="sm"
                                variant={task.status === 'start' ? 'default' : 'secondary'}
                                className={cn("h-8 text-xs", task.status === 'start' ? 'bg-sky-500' : '')}
                                onClick={() => task.type === 'video' ? setExpandedTask(expandedTask === task.id ? null : task.id) : null}
                            >
                                {task.status === 'start' ? 'Start' : 'Pending'}
                            </Button>
                        </div>
                        {expandedTask === task.id && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <p className="text-[10px] text-slate-500 mb-2">Find the hidden code in the video</p>
                                <div className="flex gap-2">
                                    <input value={youtubeCode} onChange={(e) => setYoutubeCode(e.target.value)} placeholder="Code" className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-xs dark:text-white" />
                                    <Button size="sm" className="bg-sky-500 h-8" onClick={handleVerifyYoutube}>Verify</Button>
                                </div>
                            </div>
                        )}
                    </div>
                  ))}
                </div>
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

// Sub-components to keep code clean and prevent mapping/key errors
function StatCard({ icon, label, value, color, isBalance }: { icon: React.ReactNode, label: string, value: number, color: string, isBalance?: boolean }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-100 dark:bg-green-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    sky: 'bg-sky-100 dark:bg-sky-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30'
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colorMap[color])}>{icon}</div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      </div>
      <p className={cn("text-xl font-bold", isBalance ? "text-sky-500" : "text-slate-800 dark:text-white")}>{value.toLocaleString()}</p>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-slate-300 dark:text-slate-600 mb-3 flex justify-center">{icon}</div>
      <p className="text-slate-500 dark:text-slate-400 text-sm">{text}</p>
    </div>
  );
                  }
                  
