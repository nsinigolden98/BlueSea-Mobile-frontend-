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
  Users,
  CheckCircle
} from 'lucide-react';

interface BonusSummary {
  current_points: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  referrals_count?: number;
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
  const [activeTab, setActiveTab] = useState<'points' | 'history' | 'referrals' | 'tasks'>('points');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<BonusSummary | null>(null);
  const [history, setHistory] = useState<BonusHistory[]>([]);
  const [copied, setCopied] = useState(false);

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
  const referralsCount = summary?.referrals_count || 0;

  const referralLink = `https://lucymobile.com.ng/${12345}`; // replace with real user ID

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
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

            {/* POINTS CARD */}
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

            {/* REFERRAL LINK */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-sm text-slate-600 dark:text-slate-300 truncate">
                {referralLink}
              </div>
              <Button onClick={handleCopy} className="flex items-center gap-2">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            {/* TABS */}
            <div className="flex gap-2 flex-wrap">
              {['points', 'history', 'referrals', 'tasks'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize',
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

                {/* Existing Cards */}
                <Card title="Lifetime Earned" value={earnedPoints} icon={<TrendingUp />} />
                <Card title="Lifetime Redeemed" value={redeemedPoints} icon={<Gift />} />
                <Card title="Current Balance" value={totalPoints} icon={<Trophy />} highlight />

                {/* NEW REFERRAL COUNT */}
                <Card title="Referral Network" value={referralsCount} icon={<Users />} />

              </div>
            ) : activeTab === 'referrals' ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                <h3 className="font-semibold mb-2">Referral Bonuses</h3>
                <p className="text-sm text-slate-500">Track bonuses earned from referrals.</p>
              </div>
            ) : activeTab === 'tasks' ? (
              <div className="space-y-4">

                {/* SOCIAL INPUT */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {['X ID', 'Instagram', 'Facebook', 'YouTube'].map((item) => (
                    <input
                      key={item}
                      placeholder={item}
                      className="min-w-[180px] px-4 py-2 rounded-xl border dark:bg-slate-800"
                    />
                  ))}
                </div>

                {/* TASK LIST */}
                {[
                  'Follow Account',
                  'Like Post',
                  'Retweet',
                  'Download App',
                  'Watch YouTube Video'
                ].map((task) => (
                  <div key={task} className="p-4 rounded-xl border bg-white dark:bg-slate-900 flex justify-between items-center">
                    <span>{task}</span>
                    <Button size="sm">Start</Button>
                  </div>
                ))}

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
                {history.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between">
                    <span>{item.description}</span>
                    <span>{item.points}</span>
                  </div>
                ))}
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

/* SMALL REUSABLE CARD */
function Card({ title, value, icon, highlight }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm text-slate-500">{title}</span>
      </div>
      <p className={cn("text-2xl font-bold", highlight && "text-sky-500")}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
