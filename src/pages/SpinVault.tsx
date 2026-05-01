import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Gift, 
  TrendingUp, 
  ChevronLeft,
  Trophy,
  Loader2,
  Clock, // Now utilized in the button
  History,
  Zap,
  Lock,
  ShieldAlert,
  PlusCircle,
  Coins,
  Sparkles,
  ArrowUpRight,
  CircleDot
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- TYPES & INTERFACES ---

interface HistoryItem {
  id: string;
  reward: string;
  type: string;
  date: string;
  status: string;
}

interface RewardSector {
  label: string;
  type: string;
  value: number;
  color: string;
  weight: number;
}

interface ResultModalState {
  show: boolean;
  reward?: RewardSector;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

interface DevButtonProps {
  label: string;
  onClick: () => void;
}

// --- CONFIGURATION ---

const SECTORS: RewardSector[] = [
  { label: '5 Pts', type: 'points', value: 5, color: 'bg-slate-100 dark:bg-slate-800', weight: 40 },
  { label: '₦50', type: 'airtime', value: 50, color: 'bg-sky-100 dark:bg-sky-900/40', weight: 10 },
  { label: '20 Pts', type: 'points', value: 20, color: 'bg-slate-100 dark:bg-slate-800', weight: 25 },
  { label: '₦100', type: 'airtime', value: 100, color: 'bg-sky-200 dark:bg-sky-800/40', weight: 5 },
  { label: 'Bonus Spin', type: 'spin', value: 1, color: 'bg-indigo-100 dark:bg-indigo-900/40', weight: 10 },
  { label: '50 Pts', type: 'points', value: 50, color: 'bg-sky-300 dark:bg-sky-700/40', weight: 5 },
  { label: '₦500', type: 'airtime', value: 500, color: 'bg-sky-400 dark:bg-sky-600/40', weight: 3 },
  { label: 'Mystery', type: 'mystery', value: 0, color: 'bg-sky-500 dark:bg-sky-500/40', weight: 2 },
];

export function SpinVault() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent } = Loader();
  const { user } = useAuth(); 
  
  // Typed State Management
  const [points, setPoints] = useState<number>(120);
  const [airtimeBalance, setAirtimeBalance] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [bonusSpins, setBonusSpins] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  
  // UI States
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState<ResultModalState>({ show: false });
  const [showDevPanel, setShowDevPanel] = useState<boolean>(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('spin_vault_v2');
    if (saved) {
      const data = JSON.parse(saved);
      setPoints(data.points || 0);
      setAirtimeBalance(data.airtimeBalance || 0);
      setStreak(data.streak || 1);
      setBonusSpins(data.bonusSpins || 0);
      setHistory(data.history || []);
      setLastSpinTime(data.lastSpinTime || null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('spin_vault_v2', JSON.stringify({
      points, airtimeBalance, streak, bonusSpins, history, lastSpinTime
    }));
  }, [points, airtimeBalance, streak, bonusSpins, history, lastSpinTime]);

  const canSpin = (): boolean => {
    if (bonusSpins > 0) return true;
    if (!lastSpinTime) return true;
    return Date.now() - lastSpinTime >= 86400000;
  };

  const getTimeRemaining = (): string | null => {
    if (!lastSpinTime) return null;
    const diff = (lastSpinTime + 86400000) - Date.now();
    if (diff <= 0) return null;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const handleSpin = () => {
    if (isSpinning || !canSpin()) return;
    
    setIsSpinning(true);
    const totalWeight = SECTORS.reduce((acc, s) => acc + s.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < SECTORS.length; i++) {
      if (random < SECTORS[i].weight) {
        selectedIndex = i;
        break;
      }
      random -= SECTORS[i].weight;
    }

    const sectorAngle = 360 / SECTORS.length;
    const extraSpins = 1800; 
    const targetRotation = rotation + extraSpins + (selectedIndex * sectorAngle) + (360 - (rotation % 360));
    
    setRotation(targetRotation);

    setTimeout(() => {
      const reward = SECTORS[selectedIndex];
      if (bonusSpins > 0) setBonusSpins(s => s - 1);
      else {
        setLastSpinTime(Date.now());
        setStreak(s => (s < 30 ? s + 1 : 1));
      }

      if (reward.type === 'points') setPoints(p => p + reward.value);
      if (reward.type === 'airtime') setAirtimeBalance(a => a + reward.value);
      if (reward.type === 'spin') setBonusSpins(s => s + 1);
      if (reward.type === 'mystery') setPoints(p => p + 250);

      setHistory(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        reward: reward.label,
        type: reward.type,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Active'
      }, ...prev]);

      setIsSpinning(false);
      setShowResultModal({ show: true, reward });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden">
      
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-sky-500 transition-colors group"
          >
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-sky-50 dark:group-hover:bg-sky-900/30">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm">Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {user?.firstName ? `Hi, ${user.firstName}` : 'Vault Balance'}
              </span>
              <span className="text-sm font-bold text-sky-500">{points.toLocaleString()} Pts</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <Trophy className="w-5 h-5 text-sky-500" />
            </div>
          </div>
        </div>
      </header>

      <div className="bg-slate-900 dark:bg-sky-950 text-white overflow-hidden py-2 border-y border-slate-800 dark:border-sky-900">
        <div className="flex whitespace-nowrap animate-marquee">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> {user?.firstName || 'User'} won ₦500 Airtime
              </span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Streak Updated
              </span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                <CircleDot className="w-3.5 h-3.5 text-emerald-400" /> Mystery Box Ready
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="BluePoints" value={points} icon={<Coins className="text-amber-500" />} />
          <StatCard label="Airtime" value={`₦${airtimeBalance}`} icon={<TrendingUp className="text-emerald-500" />} />
          <StatCard label="Streak" value={`${streak} Days`} icon={<Zap className="text-orange-500" />} />
          <StatCard label="Bonus" value={bonusSpins} icon={<PlusCircle className="text-sky-500" />} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">The SpinVault</h2>
                  <p className="text-slate-400 text-sm font-medium">Daily rewards await you</p>
                </div>
                <div className="px-4 py-1.5 bg-sky-500/10 text-sky-500 rounded-full text-[10px] font-black uppercase">Live</div>
              </div>

              <div className="relative w-72 h-72 md:w-80 md:h-80 mb-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-xl">
                  <div className="w-8 h-10 bg-sky-500 clip-path-polygon-[50%_100%,0_0,100%_0] rounded-t-lg" />
                </div>
                <div 
                  className="w-full h-full rounded-full border-[12px] border-slate-900 dark:border-slate-800 relative overflow-hidden transition-transform duration-[transition:2500ms] cubic-bezier(0.15, 0, 0.15, 1) shadow-2xl"
                  style={{ transform: `rotate(-${rotation}deg)` }}
                >
                  {SECTORS.map((s, i) => (
                    <div 
                      key={i}
                      className={cn("absolute top-0 left-1/2 w-1/2 h-full origin-left", s.color)}
                      style={{ 
                        transform: `rotate(${i * (360/SECTORS.length)}deg)`,
                        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 50%)'
                      }}
                    >
                      <span className="absolute top-10 left-14 -rotate-90 origin-center text-[11px] font-black uppercase text-slate-900 dark:text-white">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 m-auto w-14 h-14 bg-slate-900 rounded-full border-4 border-white dark:border-slate-700 z-20 flex items-center justify-center">
                  <div className={cn("w-3 h-3 bg-sky-400 rounded-full", isSpinning && "animate-ping")} />
                </div>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <Button 
                  onClick={handleSpin}
                  disabled={isSpinning || !canSpin()}
                  className="w-full h-16 text-lg font-black rounded-2xl bg-sky-500 hover:bg-sky-600 text-white transition-all disabled:bg-slate-200 dark:disabled:bg-slate-800"
                >
                  {isSpinning ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : canSpin() ? (
                    "SPIN WHEEL"
                  ) : (
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5" /> {getTimeRemaining()}
                    </span>
                  )}
                </Button>
                <button 
                  onClick={() => points >= 50 ? (setPoints(p => p - 50), setBonusSpins(s => s + 1)) : showToast("Need 50 Pts")}
                  className="w-full py-2 text-[11px] font-bold text-slate-400 hover:text-sky-500 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Get extra spin for 50 Pts
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden">
              <h3 className="font-bold mb-1">7-Day Streak</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black">{Math.min(streak, 7)}/7</span>
                <Lock className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${(Math.min(streak, 7)/7)*100}%` }} />
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                <History className="w-4 h-4" /> Activity
              </h3>
              <div className="space-y-4 max-h-[280px] overflow-y-auto no-scrollbar">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        {item.type === 'airtime' ? <Zap className="w-4 h-4 text-emerald-500" /> : <Trophy className="w-4 h-4 text-sky-500" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">{item.reward}</p>
                        <p className="text-[10px] text-slate-400">{item.date}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3 h-3 text-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setShowDevPanel(!showDevPanel)} className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-2xl">
          <ShieldAlert className="w-5 h-5" />
        </button>
        {showDevPanel && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl w-48 space-y-2">
            <DevButton label="Next Day" onClick={() => setLastSpinTime(prev => prev ? prev - 86400000 : null)} />
            <DevButton label="Add Spin" onClick={() => setBonusSpins(s => s + 1)} />
          </div>
        )}
      </div>

      {showResultModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Gift className="w-10 h-10 text-sky-500" />
            </div>
            <h2 className="text-3xl font-black mb-2">Reward!</h2>
            <div className="text-4xl font-black text-sky-500 mb-10 tracking-tighter">
              {showResultModal.reward?.label}
            </div>
            <Button onClick={() => setShowResultModal({ show: false })} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl">
              CONTINUE
            </Button>
          </div>
        </div>
      )}

      <ToastComponent />
      <LoaderComponent />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        .animate-marquee { animation: marquee 25s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black">{value}</p>
      </div>
    </div>
  );
}

function DevButton({ label, onClick }: DevButtonProps) {
  return (
    <button onClick={onClick} className="w-full text-left p-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
      {label}
    </button>
  );
}
