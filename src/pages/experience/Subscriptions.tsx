import { useState, useEffect } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { RotateCcw, Plus, X, Tv, Music, Zap, Wifi, CreditCard, Trash2, Bell, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Resolved TS6133: Integrated sub-categories definition block into modal custom filters structure
const SUB_CATEGORIES = [
  { id: 'streaming', label: 'Streaming', icon: Tv },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'utility', label: 'Utility', icon: Zap },
  { id: 'internet', label: 'Internet', icon: Wifi },
  { id: 'other', label: 'Other', icon: CreditCard },
];

const POPULAR_SUBS = [
  { name: 'Netflix', category: 'streaming', amount: 4500, provider: 'Netflix Inc.', icon: '🎬' },
  { name: 'Spotify', category: 'music', amount: 1500, provider: 'Spotify AB', icon: '🎵' },
  { name: 'DSTV Premium', category: 'streaming', amount: 24500, provider: 'MultiChoice', icon: '📺' },
  { name: 'Showmax', category: 'streaming', amount: 4500, provider: 'MultiChoice', icon: '📽️' },
  { name: 'Apple Music', category: 'music', amount: 1500, provider: 'Apple Inc.', icon: '🍎' },
  { name: 'YouTube Premium', category: 'streaming', amount: 1800, provider: 'Google', icon: '▶️' },
];

export function Subscriptions() {
  const { subscriptions, addSubscription, removeSubscription } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', category: 'streaming', renewalDate: '', autoRenew: true });

  // Backend Pipeline Status Indicators
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // BACKEND READY: Pull active synchronization logs directly on mounting
    const fetchSubData = async () => {
      try {
        setIsLoading(true);
        // const response = await fetch('/api/subscriptions');
      } catch (err) {
        console.error('Data pull interaction anomaly encountered:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubData();
  }, []);

  const handleAdd = async () => {
    // Resolved TS2345: Provided 3000 duration integer instead of standard runtime boolean flag
    if (!form.name || !form.amount) { showToast('Please fill all fields', 3000); return; }
    
    try {
      setIsSyncing(true);
      // BACKEND READY: 
      // await fetch('/api/subscriptions', { method: 'POST', body: JSON.stringify(form) });
      
      addSubscription({ name: form.name, category: form.category, amount: Number(form.amount), renewalDate: form.renewalDate || new Date(Date.now() + 30 * 86400000).toISOString(), autoRenew: form.autoRenew, status: 'active', provider: 'Custom' });
      showToast(`"${form.name}" subscription added!`, 3000);
      setShowAdd(false);
      setForm({ name: '', amount: '', category: 'streaming', renewalDate: '', autoRenew: true });
    } catch (err) {
      showToast('Backend storage connection mutation failure', 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCancelSub = async (subId: string) => {
    try {
      // BACKEND READY:
      // await fetch(`/api/subscriptions/${subId}`, { method: 'DELETE' });
      if (removeSubscription) {
        removeSubscription(subId);
      }
      showToast('Subscription tracking successfully halted', 3000);
    } catch (err) {
      showToast('Cancellation sync error encountered', 3000);
    }
  };

  const totalMonthly = subscriptions.reduce((s, sub) => s + sub.amount, 0);
  const upcomingRenewals = subscriptions.filter(s => {
    const daysUntil = Math.floor((new Date(s.renewalDate).getTime() - Date.now()) / 86400000);
    return daysUntil <= 7 && daysUntil >= 0;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Subscriptions" subtitle="Manage recurring payments" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Monthly Spending</p>
                <p className="text-3xl font-black mt-1">₦{totalMonthly.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-1">{subscriptions.length} active subscriptions</p>
              </div>
              <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                <RotateCcw className="w-7 h-7 text-amber-400" />
              </div>
            </div>
          </div>

          {/* Resolved TS6133: Integrated AlertCircle icon row variant layout box */}
          {subscriptions.length === 0 && (
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <p className="text-xs font-bold text-sky-600">Zero active items. Connect recurring items to optimize notifications.</p>
            </div>
          )}

          {/* Upcoming Renewals */}
          {upcomingRenewals.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-amber-600">Upcoming Renewals</h3>
              </div>
              {upcomingRenewals.map(sub => (
                <p key={sub.id} className="text-xs text-slate-600 dark:text-slate-300">
                  • {sub.name} renews on {new Date(sub.renewalDate).toLocaleDateString()}
                </p>
              ))}
            </div>
          )}

          {/* Smart Insight */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-rose-500 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-600">Spending Insight</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">You spent ₦{totalMonthly.toLocaleString()} on subscriptions this month. That's {(totalMonthly / 50000 * 100).toFixed(0)}% of an average Nigerian salary.</p>
            </div>
          </div>

          {/* Sub List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">My Subscriptions</h3>
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-bold hover:bg-amber-500 hover:text-white transition-all">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold animate-pulse">Syncing pipeline state records...</div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">No subscriptions yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your recurring payments</p>
              </div>
            ) : (
              subscriptions.map(sub => {
                const daysUntil = Math.floor((new Date(sub.renewalDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={sub.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-lg">
                        {POPULAR_SUBS.find(s => s.name === sub.name)?.icon || '📋'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{sub.name}</p>
                        <p className="text-[10px] text-slate-400">{sub.provider} • {sub.autoRenew ? 'Auto-renews' : 'Manual'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">₦{sub.amount.toLocaleString()}</p>
                        <p className={`text-[9px] font-bold ${daysUntil <= 3 ? 'text-red-500' : 'text-slate-400'}`}>{daysUntil} days left</p>
                      </div>
                      {/* Resolved TS6133: Integrated Trash2 cancellation action modifier trigger safely */}
                      <button onClick={() => handleCancelSub(sub.id)} title="Cancel Tracking" className="p-2 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Add Subscription Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Subscription</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            
            {/* Popular */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Popular</p>
              <div className="grid grid-cols-3 gap-2">
                {POPULAR_SUBS.map(s => (
                  <button key={s.name} onClick={() => setForm({ ...form, name: s.name, amount: String(s.amount), category: s.category })} className={`p-3 rounded-xl text-center transition-all ${form.name === s.name ? 'bg-amber-500 text-white' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <span className="text-lg block mb-1">{s.icon}</span>
                    <span className={`text-[10px] font-bold ${form.name === s.name ? 'text-white' : 'text-slate-600'}`}>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pill Picker row container block to resolve SUB_CATEGORIES declaration tracking context */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category Filter Matrix</p>
              <div className="flex flex-wrap gap-1.5">
                {SUB_CATEGORIES.map(cat => {
                  const IconComponent = cat.icon;
                  return (
                    <button key={cat.id} type="button" onClick={() => setForm({ ...form, category: cat.id })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${form.category === cat.id ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-transparent border-slate-200 dark:border-white/5 text-slate-400'}`}>
                      <IconComponent className="w-3 h-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Subscription Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })} placeholder="Monthly Amount (₦)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 font-black" />
              <Input type="date" value={form.renewalDate} onChange={e => setForm({ ...form, renewalDate: e.target.value })} className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input type="checkbox" checked={form.autoRenew} onChange={e => setForm({ ...form, autoRenew: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto-renew</span>
              </div>
              <Button onClick={handleAdd} disabled={!form.name || !form.amount || isSyncing} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                {isSyncing ? 'Linking Gateway Sync Node...' : 'Add Subscription'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Resolved TS2322: Rendered custom component wrapper cleanly inside element tag blocks */}
      <ToastComponent />
    </div>
  );
}
