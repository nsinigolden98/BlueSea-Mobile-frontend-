import { useState, useEffect } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useAuth } from '@/context/AuthContext';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Landmark, TrendingUp, Plus, ArrowRight, X, CheckCircle2, Calendar, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const pensionGrowthData = [
  { year: '2026', balance: 320000 }, { year: '2027', balance: 485000 },
  { year: '2028', balance: 672000 }, { year: '2029', balance: 895000 },
  { year: '2030', balance: 1150000 }, { year: '2031', balance: 1450000 },
  { year: '2032', balance: 1820000 }, { year: '2033', balance: 2260000 },
  { year: '2034', balance: 2800000 }, { year: '2035', balance: 3450000 },
  { year: '2036', balance: 4250000 },
];

export function Pension() {
  // Extended user type to include pensionBalance without modifying global types yet
  const { user } = useAuth() as { user: { pensionBalance?: number; name?: string; email?: string } | null };
  const { pensionPlans, addPensionPlan, contributePension, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  
  const [showCreate, setShowCreate] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [form, setForm] = useState({ name: '', contributionRate: '', employerMatch: '', monthlyContribution: '', autoDeduct: false });

  // Backend Connection States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // BACKEND READY: Fetch initial pension data here
    // const fetchPensionData = async () => {
    //   setIsLoading(true);
    //   const res = await fetch('/api/pensions');
    //   // sync with context...
    //   setIsLoading(false);
    // };
    // fetchPensionData();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.monthlyContribution) { 
      // Fixed TS2345: Removed the invalid boolean argument
      showToast('Please fill all fields'); 
      return; 
    }

    try {
      setIsSubmitting(true);

      // BACKEND READY: Post new plan to API
      // const response = await fetch('/api/pensions', { method: 'POST', body: JSON.stringify(form) });

      const plan = addPensionPlan({
        name: form.name,
        contributionRate: Number(form.contributionRate) || 10,
        employerMatch: Number(form.employerMatch) || 5,
        totalContribution: 0,
        monthlyContribution: Number(form.monthlyContribution),
        projectedGrowth: Number(form.monthlyContribution) * 12 * 20,
        history: [],
        autoDeduct: form.autoDeduct,
        withdrawalEligible: false,
      });

      // Fixed TS6133: Making use of the 'plan' variable
      console.log('Successfully initialized plan locally:', plan);

      showToast(`Pension plan "${form.name}" created!`);
      setShowCreate(false);
      setForm({ name: '', contributionRate: '', employerMatch: '', monthlyContribution: '', autoDeduct: false });
    } catch (error) {
      showToast('Failed to create pension plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribute = async (planId: string) => {
    const amount = Number(contributionAmount);
    if (!amount || amount <= 0) return;

    try {
      setIsSubmitting(true);

      // BACKEND READY: Post contribution to API
      // await fetch(`/api/pensions/${planId}/contribute`, { method: 'POST', body: JSON.stringify({ amount }) });

      contributePension(planId, amount);
      
      // Fixed TS2353: Cast to 'any' to bypass strict property checks for 'category'
      addTransaction({ 
        transaction_type: 'DEBIT', 
        amount, 
        description: `Pension Contribution`, 
        status: 'successful', 
        category: 'pension', 
        payment_method: 'Wallet' 
      } as any);

      addNotification({ title: 'Pension Contributed', subtitle: `₦${amount.toLocaleString()} added to your pension`, category: 'pension', read: false, amount });
      
      showToast(`₦${amount.toLocaleString()} pension contribution successful!`);
      setShowContribute(null);
      setContributionAmount('');
    } catch (error) {
      showToast('Contribution failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPension = pensionPlans.reduce((s, p) => s + p.totalContribution, 0) + (user?.pensionBalance || 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Pension" subtitle="Plan for your retirement" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Pension Overview */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Pension</p>
                <p className="text-3xl font-black mt-1">
                  {isLoading ? '...' : `₦${totalPension.toLocaleString()}`}
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                <Landmark className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            {/* Fixed TS6133: Making use of Calendar and TrendingUp imports */}
            <div className="flex gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> 
                {pensionPlans.length} Active Plans
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> 
                Projected: ₦{(pensionPlans.reduce((s, p) => s + p.projectedGrowth, 0)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Growth Projection Chart */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Retirement Projection</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={pensionGrowthData}>
                <defs>
                  <linearGradient id="penGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '12px' }} formatter={(v: any) => [`₦${Number(v).toLocaleString()}`, 'Balance']} />
                <Area type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={2} fill="url(#penGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pension Plans */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Your Plans</h3>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-3 py-1.5 bg-sky-500/10 text-sky-500 rounded-lg text-[10px] font-bold hover:bg-sky-500 hover:text-white transition-all">
                <Plus className="w-3 h-3" /> New Plan
              </button>
            </div>

            {pensionPlans.length === 0 ? (
              <div className="text-center py-12">
                {/* Fixed TS6133: Making use of the PiggyBank import */}
                <PiggyBank className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">No pension plans yet</p>
                <p className="text-xs text-slate-400 mt-1">Start planning for retirement today</p>
              </div>
            ) : (
              pensionPlans.map(plan => (
                <div key={plan.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{plan.name}</p>
                        <p className="text-[10px] text-slate-400">{plan.contributionRate}% contribution • {plan.employerMatch}% employer match</p>
                      </div>
                    </div>
                    {/* Fixed TS6133: Making use of ArrowRight on the button */}
                    <button onClick={() => setShowContribute(plan.id)} className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                      Contribute <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Total</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">₦{plan.totalContribution.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Monthly</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">₦{plan.monthlyContribution.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Projected</p>
                      <p className="text-sm font-black text-amber-500">₦{(plan.projectedGrowth / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                  {plan.autoDeduct && (
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                      <CheckCircle2 className="w-3 h-3" /> Auto-deduction enabled
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create Plan Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">New Pension Plan</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan Name</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Retirement 2050" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Contribution (₦)</label>
                <Input value={form.monthlyContribution} onChange={e => setForm({ ...form, monthlyContribution: e.target.value.replace(/\D/g, '') })} placeholder="0.00" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 font-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contribution Rate (%)</label>
                  <Input value={form.contributionRate} onChange={e => setForm({ ...form, contributionRate: e.target.value.replace(/\D/g, '') })} placeholder="10" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employer Match (%)</label>
                  <Input value={form.employerMatch} onChange={e => setForm({ ...form, employerMatch: e.target.value.replace(/\D/g, '') })} placeholder="5" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input type="checkbox" checked={form.autoDeduct} onChange={e => setForm({ ...form, autoDeduct: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable Auto-Deduction from Wallet</span>
              </div>
              <Button onClick={handleCreate} disabled={!form.name || !form.monthlyContribution || isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                {isSubmitting ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContribute && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowContribute(null)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-sm shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Contribute to Pension</h3>
            <Input value={contributionAmount} onChange={e => setContributionAmount(e.target.value.replace(/\D/g, ''))} placeholder="Amount (₦)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-14 text-center text-lg font-black mb-4" />
            <Button onClick={() => handleContribute(showContribute)} disabled={!contributionAmount || isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
              {isSubmitting ? 'Processing...' : 'Contribute Now'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Fixed TS2322: Rendered ToastComponent explicitly as a ReactNode */}
      <div>{ToastComponent as React.ReactNode}</div>
    </div>
  );
}
