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
  Check
} from 'lucide-react';

/* ================= TYPES ================= */

interface BonusSummary {
  current_points: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  referrals_count?: number;
  user_id?: string | number;
}

interface BonusHistory {
  id: number;
  transaction_type: string;
  points: number;
  reason: string;
  description: string;
  created_at: string;
}

/* ================= TABS ================= */

const tabs = ['points','history','referral','tasks'] as const;
type TabType = typeof tabs[number];

/* ================= COMPONENT ================= */

export function Rewards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('points');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<BonusSummary | null>(null);
  const [history, setHistory] = useState<BonusHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [youtubeCode, setYoutubeCode] = useState('');

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
      if (summaryRes?.data) setSummary(summaryRes.data);

      const historyRes = await getRequest(ENDPOINTS.bonus_history);
      if (historyRes?.data) setHistory(historyRes.data);

    } catch {
      showToast('Failed to load rewards data');
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  /* ================= SAFE VALUES ================= */

  const totalPoints = Number(summary?.current_points || 0);
  const earnedPoints = Number(summary?.lifetime_earned || 0);
  const redeemedPoints = Number(summary?.lifetime_redeemed || 0);
  const referralsCount = Number(summary?.referrals_count || 0);

  const userId = summary?.user_id || 'user';
  const referralLink = `https://lucymobile.com.ng/${userId}`;

  /* ================= SAFE COPY ================= */

  const copyLink = () => {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast('Copied!');
      setTimeout(() => setCopied(false), 1500);
    }
  };

  /* ================= UI ================= */

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

            {/* ===== TOP CARD (UNCHANGED) ===== */}
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
            </div>

            {/* ===== REFERRAL LINK (SUBTLE) ===== */}
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="truncate">{referralLink}</span>
              <button 
                onClick={copyLink}
                className="flex items-center gap-1 text-sky-400 hover:text-sky-500"
              >
                {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
              </button>
            </div>

            {/* ===== TABS ===== */}
            <div className="flex gap-2">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm capitalize',
                    activeTab === tab
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ===== LOADING ===== */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : activeTab === 'points' ? (

              <div className="grid md:grid-cols-4 gap-4">

                <Stat title="Lifetime Earned" value={earnedPoints} icon={<TrendingUp />} green />
                <Stat title="Lifetime Redeemed" value={redeemedPoints} icon={<Gift />} red />
                <Stat title="Current Balance" value={totalPoints} icon={<Trophy />} blue />
                <Stat title="Referral Network" value={referralsCount} icon={<Gift />} />

              </div>

            ) : activeTab === 'tasks' ? (

              <div className="space-y-4">

                {/* SOCIAL INPUT */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {['X ID','Instagram','Facebook','YouTube'].map(i => (
                    <input
                      key={i}
                      placeholder={i}
                      className="min-w-[160px] px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-sm"
                    />
                  ))}
                </div>

                {/* TASKS */}
                {[
                  {name:'Follow Account', pts:4},
                  {name:'Like Post', pts:2},
                  {name:'Retweet', pts:2},
                  {name:'Download App', pts:4},
                ].map(task => (
                  <div key={task.name} className="flex justify-between items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <span>{task.name} (+{task.pts})</span>
                    <button className="text-sky-500 text-sm">Start</button>
                  </div>
                ))}

                {/* YOUTUBE */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2">
                  <p>Watch YouTube Video (+8)</p>
                  <input 
                    value={youtubeCode}
                    onChange={(e)=>setYoutubeCode(e.target.value)}
                    placeholder="Enter hidden code"
                    className="w-full px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 text-sm"
                  />
                  <button className="text-sky-500 text-sm">Verify</button>
                </div>

              </div>

            ) : activeTab === 'history' ? (

              <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No history yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {history.map(item => (
                      <div key={item.id} className="p-4 flex justify-between">
                        <span>{item.description}</span>
                        <span>{item.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            ) : (

              <div className="p-4 text-slate-400">
                Referral bonus section (ready for backend)
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

/* ================= CARD ================= */

function Stat({title,value,icon,green,red,blue}:any){
  return(
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-slate-400 text-sm">{title}</span>
      </div>
      <p className={cn(
        "text-2xl font-bold",
        green && "text-green-500",
        red && "text-red-500",
        blue && "text-sky-500"
      )}>
        {value.toLocaleString()}
      </p>
    </div>
  )
            }
