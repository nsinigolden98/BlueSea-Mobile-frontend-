// src/pages/vault/views/VaultOverview.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRequest, ENDPOINTS } from '@/types';
import { 
  Sparkles, Eye, EyeOff, ArrowDownLeft, Send, Repeat, QrCode, 
  Gift, Users, BookMarked, History as HistoryIcon, CreditCard, Trophy, Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VaultViewMode } from '../VaultLayout';

interface VaultOverviewProps {
  onNavigate: (view: VaultViewMode) => void;
  showToast: (msg: string) => void;
}

export function VaultOverview({ onNavigate, showToast }: VaultOverviewProps) {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState<'NGN' | 'USDT' | 'BTC'>('NGN');
  const [bspBalance, setBspBalance] = useState<number>(0);

  const BTC_RATE_NGN = 100000000; // ≈ Market Rate per BTC

  useEffect(() => {
    getRequest(ENDPOINTS.bonus_summary)
      .then(res => {
        if (res?.data?.current_points !== undefined) {
          setBspBalance(Number(res.data.current_points) || 0);
        }
      })
      .catch(() => setBspBalance(0));
  }, []);

  const rawBalance = user?.balance;
  const ngnBalance = typeof rawBalance === 'string'
    ? Number(rawBalance.replace(/[^0-9.-]+/g, '')) || 0
    : typeof rawBalance === 'number' ? rawBalance : 0;

  const totalNgnEquivalent = ngnBalance + bspBalance;
  
  // Safely cast user to allow usdt_balance access without TS error
  const usdtBalance = Number((user as any)?.usdt_balance || 0); 
  const btcBalance = Number((totalNgnEquivalent / BTC_RATE_NGN).toFixed(6));

  const referralCode = user?.referral_code || 'BLUESEA';
  const referralLink = `https://blueseamobile.com.ng/login?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('Referral link copied to clipboard!');
  };

  const renderFormattedBalance = () => {
    if (!showBalance) return '••••••••';
    switch (displayCurrency) {
      case 'USDT':
        return `$${usdtBalance.toFixed(2)} USDT`;
      case 'BTC':
        return `₿${btcBalance.toFixed(6)} BTC`;
      case 'NGN':
      default:
        return `₦${totalNgnEquivalent.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const renderSubtextEstimate = () => {
    if (!showBalance) return 'Balance hidden';
    switch (displayCurrency) {
      case 'USDT':
        return `≈ ₦${(usdtBalance * 1550).toLocaleString()} NGN`;
      case 'BTC':
        return `≈ ₦${totalNgnEquivalent.toLocaleString()} NGN`;
      case 'NGN':
      default:
        return `≈ $${usdtBalance.toFixed(2)} USDT • ₿${btcBalance.toFixed(6)} BTC`;
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO PORTFOLIO CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-sky-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-500/30">
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-200">Total Portfolio</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/10 text-[10px] font-bold">
              {(['NGN', 'USDT', 'BTC'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setDisplayCurrency(curr)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                    displayCurrency === curr ? "bg-sky-500 text-white" : "text-slate-300 hover:text-white"
                  )}
                >
                  {curr}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 transition-all cursor-pointer"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="my-6">
          <p className="text-3xl sm:text-4xl font-black tracking-tight">
            {renderFormattedBalance()}
          </p>
          <p className="text-xs text-sky-300/80 mt-1 font-semibold">
            {renderSubtextEstimate()}
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10">
          <ActionButton icon={<ArrowDownLeft className="w-5 h-5" />} label="Receive" onClick={() => onNavigate('receive')} />
          <ActionButton icon={<Send className="w-5 h-5" />} label="Send" onClick={() => onNavigate('send')} />
          <ActionButton icon={<Repeat className="w-5 h-5" />} label="Convert" onClick={() => onNavigate('convert')} />
          <ActionButton icon={<QrCode className="w-5 h-5" />} label="Scan" onClick={() => onNavigate('send')} />
        </div>
      </div>

      {/* ASSET BALANCES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Supported Assets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AssetRow 
            icon={<span className="font-black text-xs">₮</span>} 
            name="USDT (Tether)" 
            detail="TRC20 / BEP20" 
            balance={showBalance ? `$${usdtBalance.toFixed(2)}` : '••••'} 
            fiat={`≈ ₦${(usdtBalance * 1550).toLocaleString()}`} 
            color="emerald" 
          />
          <AssetRow 
            icon={<Gift className="w-5 h-5 text-sky-500" />} 
            name="BSP Points" 
            detail="1 BSP = ₦1.00 Guaranteed" 
            balance={showBalance ? bspBalance.toLocaleString() : '••••'} 
            fiat={`≈ ₦${bspBalance.toLocaleString()}`} 
            color="sky" 
          />
        </div>
      </div>

      {/* REFERRAL CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Invite & Earn Rewards</h3>
          </div>
          <button onClick={() => onNavigate('referral')} className="text-xs font-bold text-sky-500 hover:underline cursor-pointer">
            View Details →
          </button>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Your Referral Link</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{referralLink}</p>
          </div>
          <button 
            onClick={handleCopyReferral} 
            className="p-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all cursor-pointer shrink-0"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ShortcutCard icon={<HistoryIcon className="w-5 h-5 text-amber-500" />} title="History" subtitle="All activity logs" onClick={() => onNavigate('history')} />
        <ShortcutCard icon={<BookMarked className="w-5 h-5 text-blue-500" />} title="Address Book" subtitle="Saved wallets" onClick={() => onNavigate('address_book')} />
        <ShortcutCard icon={<Trophy className="w-5 h-5 text-purple-500" />} title="Mission Center" subtitle="Earn BSP points" onClick={() => onNavigate('missions')} />
        <ShortcutCard icon={<Users className="w-5 h-5 text-emerald-500" />} title="Referrals" subtitle="Invite & earn" onClick={() => onNavigate('referral')} />
        <ShortcutCard icon={<CreditCard className="w-5 h-5 text-slate-400" />} title="Virtual Cards" subtitle="Coming soon" onClick={() => onNavigate('cards')} />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group">
      <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 group-hover:bg-sky-500 group-hover:text-white transition-all">
        {icon}
      </div>
      <span className="text-[11px] font-bold text-slate-200">{label}</span>
    </button>
  );
}

function AssetRow({ icon, name, detail, balance, fiat, color }: any) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-xs", color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500')}>
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-white text-sm">{name}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{detail}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-slate-900 dark:text-white text-sm">{balance}</p>
        <p className="text-[10px] text-slate-400 font-semibold">{fiat}</p>
      </div>
    </div>
  );
}

function ShortcutCard({ icon, title, subtitle, onClick }: any) {
  return (
    <button onClick={onClick} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer text-left">
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl mb-3 w-max">{icon}</div>
      <p className="font-bold text-xs text-slate-800 dark:text-white">{title}</p>
      <p className="text-[10px] text-slate-400 font-semibold">{subtitle}</p>
    </button>
  );
}
