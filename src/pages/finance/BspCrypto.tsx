import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useAuth } from '@/context/AuthContext';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Bitcoin, ArrowUpRight, ArrowDownRight, Gift, Zap, TrendingUp, Shield, Lock, Send, Plus, Minus, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const bspChartData = [
  { time: '00:00', price: 1.0 }, { time: '04:00', price: 1.02 }, { time: '08:00', price: 0.98 },
  { time: '12:00', price: 1.05 }, { time: '16:00', price: 1.08 }, { time: '20:00', price: 1.12 }, { time: '23:59', price: 1.15 },
];

const earnMethods = [
  { icon: Zap, label: 'Bill Payments', desc: 'Earn 5 BSP per ₦1000 spent', action: 'Pay Bills', reward: 50 },
  { icon: Gift, label: 'Affiliate Sales', desc: 'Earn 100 BSP per referral', action: 'Share Link', reward: 100 },
  { icon: TrendingUp, label: 'Savings Milestones', desc: 'Earn up to 500 BSP', action: 'Save Now', reward: 500 },
  { icon: Sparkles, label: 'Daily Streak', desc: 'Earn 10 BSP per day', action: 'Claim', reward: 10 },
];

export function BspCrypto() {
  const { user } = useAuth();
  const { bspActivities, addBSPActivity, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showSend, setShowSend] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

  const handleSend = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0 || !recipient) return;
    const current = Number(localStorage.getItem('bsp_balance') || '0');
    if (current < amt) { showToast('Insufficient BSP balance', true); return; }
    localStorage.setItem('bsp_balance', String(current - amt));
    addBSPActivity({ type: 'transfer', amount: amt, description: `BSP sent to ${recipient}`, balance: current - amt });
    addNotification({ title: 'BSP Transfer Sent', subtitle: `${amt} BSP sent to ${recipient}`, category: 'crypto', read: false });
    showToast(`${amt} BSP sent successfully!`);
    setShowSend(false);
    setAmount('');
    setRecipient('');
  };

  const handleBuy = () => {
    const ngnAmount = Number(buyAmount);
    if (!ngnAmount || ngnAmount <= 0) return;
    const bspAmount = Math.floor(ngnAmount / 1.15);
    addTransaction({ transaction_type: 'DEBIT', amount: ngnAmount, description: `BSP Purchase - ${bspAmount} BSP`, status: 'successful', category: 'crypto', payment_method: 'Wallet' });
    addBSPActivity({ type: 'earn', amount: bspAmount, description: `Purchased ${bspAmount} BSP for ₦${ngnAmount.toLocaleString()}`, balance: Number(user?.bspBalance || 0) + bspAmount });
    addNotification({ title: 'BSP Purchased', subtitle: `${bspAmount} BSP added to your wallet`, category: 'crypto', read: false, amount: bspAmount });
    showToast(`${bspAmount} BSP purchased successfully!`);
    setShowBuy(false);
    setBuyAmount('');
  };

  const handleEarn = (method: typeof earnMethods[0]) => {
    const current = Number(localStorage.getItem('bsp_balance') || '0');
    localStorage.setItem('bsp_balance', String(current + method.reward));
    addBSPActivity({ type: 'earn', amount: method.reward, description: `${method.label} - ${method.desc}`, balance: current + method.reward });
    showToast(`+${method.reward} BSP earned from ${method.label}!`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="BSP Crypto" subtitle="BlueSea Points Ecosystem" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* BSP Balance Card */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">BSP Balance</p>
                  <p className="text-3xl font-black">{user?.bspBalance?.toLocaleString() || 0} <span className="text-sm text-slate-400">BSP</span></p>
                </div>
              </div>
              <div className="flex gap-1 px-3 py-1.5 bg-emerald-500/20 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">+15%</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">≈ ₦{((user?.bspBalance || 0) * 1.15).toLocaleString()} NGN</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSend(true)} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send
              </button>
              <button onClick={() => setShowBuy(true)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Buy
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">BSP Price (24h)</h3>
              <span className="text-xs font-bold text-emerald-500">1 BSP = ₦1.15</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={bspChartData}>
                <defs><linearGradient id="bspGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['dataMin - 0.05', 'dataMax + 0.05']} tickFormatter={(v) => `₦${v.toFixed(2)}`} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} fill="url(#bspGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Earn BSP */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Earn BSP</h3>
            {earnMethods.map(method => (
              <div key={method.label} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <method.icon className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{method.label}</p>
                  <p className="text-[10px] text-slate-400">{method.desc}</p>
                </div>
                <button onClick={() => handleEarn(method)} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                  +{method.reward} BSP
                </button>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">BSP Activity</h3>
            {bspActivities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No BSP activity yet</p>
            ) : (
              bspActivities.slice(0, 10).map(act => (
                <div key={act.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${act.type === 'earn' || act.type === 'receive' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      {act.type === 'earn' || act.type === 'receive' ? <ArrowDownRight className="w-4 h-4 text-emerald-500" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{act.description}</p>
                      <p className="text-[9px] text-slate-400">{new Date(act.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`text-xs font-bold ${act.type === 'earn' || act.type === 'receive' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {act.type === 'earn' || act.type === 'receive' ? '+' : '-'}{act.amount} BSP
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Send BSP Modal */}
      {showSend && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowSend(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-sm shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Send BSP</h3>
            <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient email or username" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 mb-3" />
            <Input value={amount} onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="Amount (BSP)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 text-center font-black mb-4" />
            <Button onClick={handleSend} disabled={!recipient || !amount} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white h-14 rounded-2xl text-sm font-black disabled:opacity-50 active:scale-95">Send BSP</Button>
          </div>
        </div>
      )}

      {/* Buy BSP Modal */}
      {showBuy && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowBuy(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-sm shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Buy BSP</h3>
            <p className="text-xs text-slate-400 mb-3">1 BSP = ₦1.15 NGN</p>
            <Input value={buyAmount} onChange={e => setBuyAmount(e.target.value.replace(/\D/g, ''))} placeholder="Amount in NGN (₦)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 text-center font-black mb-3" />
            {buyAmount && <p className="text-sm font-bold text-cyan-500 text-center mb-4">You will receive ≈ {Math.floor(Number(buyAmount) / 1.15).toLocaleString()} BSP</p>}
            <Button onClick={handleBuy} disabled={!buyAmount} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white h-14 rounded-2xl text-sm font-black disabled:opacity-50 active:scale-95">Buy Now</Button>
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  );
}
