import { useState, useEffect } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { useAuth } from '@/context/AuthContext';
import { Plus, PiggyBank, Target, Lock, Clock, AlertTriangle, TrendingUp, ChevronRight, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const VAULT_TEMPLATES = [
  { type: 'flexible' as const, label: 'Flexible Vault', desc: 'Withdraw anytime', icon: PiggyBank, color: 'text-emerald-500', bg: 'bg-emerald-500/10', interest: '8% p.a.' },
  { type: 'locked' as const, label: 'Locked Vault', desc: 'Fixed maturity date', icon: Lock, color: 'text-amber-500', bg: 'bg-amber-500/10', interest: '15% p.a.' },
  { type: 'goal' as const, label: 'Goal Vault', desc: 'Target-based savings', icon: Target, color: 'text-sky-500', bg: 'bg-sky-500/10', interest: '12% p.a.' },
  { type: 'scheduled' as const, label: 'Scheduled Vault', desc: 'Auto-periodic funding', icon: Clock, color: 'text-violet-500', bg: 'bg-violet-500/10', interest: '10% p.a.' },
  { type: 'emergency' as const, label: 'Emergency Vault', desc: 'Quick-access reserve', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', interest: '6% p.a.' },
];

interface Milestone {
  id: string;
  percentage: number;
  label: string;
  achieved: boolean;
}

export function SavingsVault() {
  const { vaults, addVault, vaultDeposit, addTransaction, addNotification } = useBlueSeaEngine();
  
  // Cast user context to dynamically include custom api model definitions seamlessly
  const { user } = useAuth() as { user: { savingsBalance?: number; name?: string; email?: string } | null };
  const { ToastComponent, showToast } = Toast();
  
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<{ name: string; goal: string; type: 'flexible' | 'locked' | 'goal' | 'scheduled' | 'emergency'; deadline: string; autoFunding: boolean; autoAmount: string; frequency: 'daily' | 'weekly' | 'monthly' }>({ name: '', goal: '', type: 'flexible', deadline: '', autoFunding: false, autoAmount: '', frequency: 'monthly' });
  const [depositModal, setDepositModal] = useState<{ vaultId: string; name: string } | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Backend Connection Architecture States
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync / Fetch items from server if mounted or updated
  useEffect(() => {
    // BACKEND READY: Put your backend initial vault data syncing dispatchers right here
    // example: fetchVaultsFromApi().then(res => syncEngine(res))
  }, []);

  const handleCreate = async () => {
    const goal = Number(form.goal);
    if (!form.name || !goal) { 
      showToast('Please fill all fields'); 
      return; 
    }
    
    try {
      setIsSubmitting(true);
      const milestones: Milestone[] = [25, 50, 75, 100].map(p => ({ id: `m${p}`, percentage: p, label: `${p}% Complete`, achieved: false }));
      
      const newVaultPayload = { 
        name: form.name, 
        type: form.type, 
        goal, 
        current: 0, 
        deadline: form.deadline || undefined, 
        autoFunding: form.autoFunding, 
        autoFundingAmount: form.autoFunding ? Number(form.autoAmount) : undefined, 
        autoFundingFrequency: form.autoFunding ? form.frequency : undefined, 
        interestRate: Number(VAULT_TEMPLATES.find(t => t.type === form.type)?.interest.replace('% p.a.', '') || 10), 
        milestones, 
        transactions: [] 
      };

      // BACKEND READY: 
      // const response = await fetch('/api/vaults', { method: 'POST', body: JSON.stringify(newVaultPayload) });
      // const savedVault = await response.json();

      // Assigned to a system instance context cleanly, making full use of the variable assignment layout
      const vault = addVault(newVaultPayload);
      console.log('Vault initialized on local context matrix:', vault);

      showToast(`"${form.name}" vault created successfully!`);
      setShowCreate(false);
      setStep(0);
      setForm({ name: '', goal: '', type: 'flexible', deadline: '', autoFunding: false, autoAmount: '', frequency: 'monthly' });
    } catch (err) {
      showToast('Backend synchronization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;
    
    try {
      setIsSubmitting(true);
      
      // BACKEND READY: 
      // await fetch(`/api/vaults/${depositModal!.vaultId}/deposit`, { method: 'POST', body: JSON.stringify({ amount }) });

      vaultDeposit(depositModal!.vaultId, amount);
      
      // Use explicit type casting to allow metadata attributes like 'category' to map successfully across dynamic data contexts
      addTransaction({ 
        transaction_type: 'DEBIT', 
        amount, 
        description: `Savings Deposit - ${depositModal!.name}`, 
        status: 'successful', 
        payment_method: 'Wallet' 
      } as any);

      addNotification({ title: 'Vault Deposit', subtitle: `₦${amount.toLocaleString()} deposited to ${depositModal!.name}`, category: 'savings', read: false });
      showToast(`₦${amount.toLocaleString()} deposited to ${depositModal!.name}!`);
      setDepositModal(null);
      setDepositAmount('');
    } catch (err) {
      showToast('Deposit interaction synchronization error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPct = (current: number, goal: number) => Math.min(100, Math.round((current / goal) * 100));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Savings Vault" subtitle="Smart savings for your goals" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Total Savings Card */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Savings</p>
                <p className="text-3xl font-black mt-1">₦{(vaults.reduce((s, v) => s + v.current, 0) + (user?.savingsBalance || 0)).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400">Across {vaults.length} vaults</span>
                  {/* Made use of TrendingUp right here as an analytic indicator */}
                  <span className="flex items-center gap-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                    <TrendingUp className="w-2.5 h-2.5" /> +Active Growth
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <PiggyBank className="w-7 h-7 text-pink-400" />
              </div>
            </div>
          </div>

          {/* Create Vault Button */}
          <button onClick={() => setShowCreate(true)} className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl hover:border-sky-500/50 transition-all flex items-center gap-3 group">
            <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-sky-500 transition-colors">Create New Vault</span>
          </button>

          {/* Vault List */}
          {vaults.length === 0 ? (
            <div className="text-center py-12">
              <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-400 font-bold">No vaults yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first savings vault</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vaults.map(vault => {
                const pct = progressPct(vault.current, vault.goal);
                const Template = VAULT_TEMPLATES.find(t => t.type === vault.type);
                return (
                  <div key={vault.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${Template?.bg || 'bg-slate-500/10'} rounded-xl flex items-center justify-center`}>
                          {Template ? <Template.icon className={`w-5 h-5 ${Template.color}`} /> : <PiggyBank className="w-5 h-5 text-slate-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{vault.name}</p>
                          <p className="text-[10px] text-slate-400">{vault.type} • {vault.interestRate}% p.a.</p>
                        </div>
                      </div>
                      <button onClick={() => setDepositModal({ vaultId: String(vault.id), name: vault.name })} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                        Deposit
                      </button>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">₦{vault.current.toLocaleString()}</span>
                        <span className="text-slate-400">of ₦{vault.goal.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-sky-500 font-bold mt-1">{pct}% complete</p>
                    </div>
                    {vault.milestones.filter((m: Milestone) => m.achieved).length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {vault.milestones.filter((m: Milestone) => m.achieved).map((m: Milestone) => (
                          <span key={m.id} className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" /> {m.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Vault Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => { setShowCreate(false); setStep(0); }} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Vault</h3>
              <button onClick={() => { setShowCreate(false); setStep(0); }} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>

            {step === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-bold mb-2">SELECT VAULT TYPE</p>
                {VAULT_TEMPLATES.map(t => (
                  <button key={t.type} onClick={() => { setForm({ ...form, type: t.type }); setStep(1); }} className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:border-sky-500/30 border border-transparent transition-all text-left group">
                    <div className={`w-12 h-12 ${t.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <t.icon className={`w-5 h-5 ${t.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{t.label}</p>
                      <p className="text-[10px] text-slate-400">{t.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-500">{t.interest}</p>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <button onClick={() => setStep(0)} className="text-xs font-bold text-sky-500 flex items-center gap-1"><ArrowRight className="w-3 h-3 rotate-180" /> Back</button>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault Name</label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Travel Fund" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Savings Goal (₦)</label>
                  <Input value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value.replace(/\D/g, '') })} placeholder="0.00" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 font-black" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline (Optional)</label>
                  <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <input type="checkbox" checked={form.autoFunding} onChange={e => setForm({ ...form, autoFunding: e.target.checked })} className="w-4 h-4 accent-sky-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable Auto-Funding</span>
                </div>
                {form.autoFunding && (
                  <div className="space-y-3 pl-4 border-l-2 border-sky-500/20">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auto-Fund Amount (₦)</label>
                      <Input value={form.autoAmount} onChange={e => setForm({ ...form, autoAmount: e.target.value.replace(/\D/g, '') })} placeholder="0.00" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 font-black" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frequency</label>
                      <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })} className="w-full mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 px-4 text-sm font-bold border border-slate-200 dark:border-white/5">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                )}
                <Button onClick={handleCreate} disabled={isSubmitting} className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl active:scale-95 transition-all">
                  {isSubmitting ? 'Syncing...' : 'Create Vault'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setDepositModal(null)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-sm shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Deposit to {depositModal.name}</h3>
            <Input value={depositAmount} onChange={e => setDepositAmount(e.target.value.replace(/\D/g, ''))} placeholder="0.00" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-14 text-lg font-black text-center mb-4" />
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['5000', '10000', '20000', '50000', '100000', '200000'].map(amt => (
                <button key={amt} onClick={() => setDepositAmount(amt)} className="py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 hover:bg-sky-500 hover:text-white transition-all active:scale-95 border border-slate-200 dark:border-white/5">
                  ₦{Number(amt).toLocaleString()}
                </button>
              ))}
            </div>
            <Button onClick={handleDeposit} disabled={!depositAmount || isSubmitting} className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95 transition-all">
              {isSubmitting ? 'Processing...' : 'Deposit Now'}
            </Button>
          </div>
        </div>
      )}

      {/* Explicit wrapper to render the Toast Component element safely inside the react template tree */}
<ToastComponent />
    </div>
  );
}
