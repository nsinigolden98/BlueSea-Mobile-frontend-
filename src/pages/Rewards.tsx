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

interface BonusSummary {
  current_points: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  referral_count?: number;
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

  // Simulated User ID for referral link
  const userId = "user_123"; 
  const referralLink = `https://bluemobile.com.ng/${userId}`;

  const tasks: Task[] = [
    { id: '1', name: 'Follow X (Twitter) account', points: 4, type: 'social', status: 'start' },
    { id: '2', name: 'Like recent post', points: 2, type: 'social', status: 'start' },
    { id: '3', name: 'Repost announcement', points: 2, type: 'social', status: 'start' },
    { id: '4', name: 'Download BlueMobile App', points: 5, type: 'app', status: 'start' },
    { id: '5', name: 'Watch YouTube Tutorial', points: 8, type: 'video', status: 'start' },
  ];

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('Referral link copied!');
  };

  const handleSocialVerify = (platform: string) => {
    showToast(`${platform} handle submitted for verification`);
  };

  const handleVerifyYoutube = (taskId: string) => {
    if (!youtubeCode) return showToast('Please enter the code');
    showToast('Code submitted! Verification pending.');
    setExpandedTask(null);
  };

  const totalPoints = summary?.current_points || 0;
  const earnedPoints = summary?.lifetime_earned || 0;
  const redeemedPoints = summary?.lifetime_redeemed || 0;
  const referralCount = summary?.referral_count || 0;

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
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Your Referral Link</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{referralLink}</p>
              </div>
              <button 
                onClick={handleCopyLink}
                className="p-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'points', label: 'Points Details' },
                { id: 'history', label: 'History' },
                { id: 'referral', label: 'Referral Bonus' },
                { id: 'tasks', label: 'Tasks' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : activeTab === 'points' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400">Referral Network</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{referralCount}</p>
                </div>
              </div>
            ) : activeTab === 'history' ? (
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
                            {item.transaction_type === 'earned' ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{item.description}</p>
                            <p className="text-sm text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
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
                 <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                    Invite your friends to BlueMobile and earn 50 BluePoints for every successful sign-up.
                 </p>
                 <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 uppercase font-bold">Total Referrals</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{referralCount}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 uppercase font-bold">Referral Bonus</p>
                        <p className="text-xl font-bold text-sky-500">{referralCount * 50}</p>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Social Carousel */}
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {[
                    { id: 'x', icon: Twitter, placeholder: 'X ID' },
                    { id: 'ig', icon: Instagram, placeholder: 'IG Handle' },
                    { id: 'fb', icon: Facebook, placeholder: 'FB Name' },
                    { id: 'yt', icon: Youtube, placeholder: 'YT Channel' }
                  ].map((social) => (
                    <div key={social.id} className="flex-shrink-0 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-2 rounded-xl">
                       <social.icon className="w-4 h-4 text-slate-400 ml-1" />
                       <input 
                        type="text" 
                        placeholder={social.placeholder}
                        className="bg-transparent border-none text-sm focus:ring-0 w-24 dark:text-white"
                       />
                       <button 
                        onClick={() => handleSocialVerify(social.id.toUpperCase())}
                        className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                       >
                        <Check className="w-3 h-3" />
                       </button>
                    </div>
                  ))}
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-500">
                                    {task.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white text-sm md:text-base">{task.name}</p>
                                    <p className="text-xs font-bold text-sky-500">+{task.points} BluePoints</p>
                                </div>
                            </div>
                            <Button 
                                size="sm"
                                variant={task.status === 'start' ? 'default' : 'secondary'}
                                className={cn(task.status === 'start' ? 'bg-sky-500 hover:bg-sky-600' : '')}
                                onClick={() => task.type === 'video' ? setExpandedTask(expandedTask === task.id ? null : task.id) : null}
                            >
                                {task.status === 'start' ? 'Start' : 'Pending'}
                            </Button>
                        </div>
                        
                        {/* Expanded Video Task Flow */}
                        {expandedTask === task.id && (
                            <div className="px-4 pb-4 pt-2 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">Find the 4-digit code hidden in the video</p>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Enter code"
                                        value={youtubeCode}
                                        onChange={(e) => setYoutubeCode(e.target.value)}
                                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:ring-sky-500"
                                    />
                                    <Button size="sm" className="bg-sky-500" onClick={() => handleVerifyYoutube(task.id)}>
                                        Verify
                                    </Button>
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
                  
