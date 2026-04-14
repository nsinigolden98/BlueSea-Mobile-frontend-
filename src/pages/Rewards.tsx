import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Gift, 
  ArrowRight,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

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

export function Rewards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'history' | 'referral' | 'tasks'>('points');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<BonusSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
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

    } catch {
      showToast('Failed to load rewards data');
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const totalPoints = summary?.current_points || 0;
  const earnedPoints = summary?.lifetime_earned || 0;
  const redeemedPoints = summary?.lifetime_redeemed || 0;
  const referralsCount = summary?.referrals_count || 0;

  const referralLink = `https://lucymobile.com.ng/${summary?.user_id || ''}`;

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast('Copied!');
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const sendHandle = (type: string, val: string) => {
    if (!val) return;
    showToast(`${type} submitted`);
  };

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

            {/* ORIGINAL CARD */}
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

            {/* REFERRAL */}
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span className="truncate">{referralLink}</span>
              <button onClick={copyLink} className="text-sky-500 flex items-center gap-1">
                {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
              </button>
            </div>

            {/* TABS */}
            <div className="flex gap-2">
              {['points','history','referral','tasks'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    activeTab === tab
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : activeTab === 'points' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Lifetime Earned</p>
                  <p className="text-2xl font-bold">{earnedPoints}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Lifetime Redeemed</p>
                  <p className="text-2xl font-bold">{redeemedPoints}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Current Balance</p>
                  <p className="text-2xl font-bold text-sky-500">{totalPoints}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <p className="text-slate-500 dark:text-slate-400 mb-2">Referral Network</p>
                  <p className="text-2xl font-bold">{referralsCount}</p>
                </div>

              </div>
            ) : activeTab === 'tasks' ? (
              <div className="space-y-4">

                {['X','Instagram','Facebook','YouTube'].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <input
                      placeholder={`${item} ID`}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                      onBlur={(e) => sendHandle(item, e.target.value)}
                    />
                    <button className="text-green-500">
                      <Check className="w-5 h-5"/>
                    </button>
                  </div>
                ))}

                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>Follow Account (+4)</span>
                  <Button size="sm">Start</Button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>Like Post (+2)</span>
                  <Button size="sm">Start</Button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>Watch YouTube (+8)</span>
                    <Button size="sm" onClick={()=>setYoutubeOpen(!youtubeOpen)}>Start</Button>
                  </div>

                  {youtubeOpen && (
                    <div className="mt-3 space-y-2">
                      <input
                        value={youtubeCode}
                        onChange={(e)=>setYoutubeCode(e.target.value)}
                        placeholder="Enter hidden code"
                        className="w-full px-3 py-2 rounded-lg border"
                      />
                      <Button size="sm">Verify</Button>
                    </div>
                  )}
                </div>

              </div>
            ) : null}

          </div>
        </main>
      </div>

      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
