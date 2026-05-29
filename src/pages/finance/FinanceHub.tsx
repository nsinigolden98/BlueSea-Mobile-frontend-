import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/ui-custom';
import { useAuth } from '@/context/AuthContext';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { PiggyBank, CreditCard, Bitcoin, Landmark, ShieldCheck, TrendingUp, ChevronRight, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const chartData = [
  { name: 'Jan', income: 420000, expense: 280000 },
  { name: 'Feb', income: 380000, expense: 320000 },
  { name: 'Mar', income: 550000, expense: 290000 },
  { name: 'Apr', income: 480000, expense: 350000 },
  { name: 'May', income: 620000, expense: 310000 },
  { name: 'Jun', income: 710000, expense: 380000 },
];

export function FinanceHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vaults, cards, pensionPlans, insurancePlans } = useBlueSeaEngine();

  const totalSavings = vaults.reduce((sum, v) => sum + v.current, 0) + (user?.savingsBalance || 0);
  const totalPension = pensionPlans.reduce((sum, p) => sum + p.totalContribution, 0) + (user?.pensionBalance || 0);
  const activeInsurance = insurancePlans.filter(i => i.status === 'active').length;
  const cardCount = cards.length;

  const modules = [
    { label: 'Savings Vault', icon: PiggyBank, path: '/finance/savings', color: 'text-pink-500', bg: 'bg-pink-500/10', desc: `${vaults.length} active vaults`, amount: `₦${totalSavings.toLocaleString()}` },
    { label: 'Cards', icon: CreditCard, path: '/finance/cards', color: 'text-blue-500', bg: 'bg-blue-500/10', desc: `${cardCount} cards`, amount: cardCount > 0 ? `₦${cards.reduce((s, c) => s + c.balance, 0).toLocaleString()}` : 'Get your card' },
    { label: 'BSP Crypto', icon: Bitcoin, path: '/finance/crypto', color: 'text-cyan-500', bg: 'bg-cyan-500/10', desc: 'BlueSea Points Coin', amount: `${user?.bspBalance?.toLocaleString() || 0} BSP` },
    { label: 'Pension', icon: Landmark, path: '/finance/pension', color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Retirement planning', amount: `₦${totalPension.toLocaleString()}` },
    { label: 'Insurance', icon: ShieldCheck, path: '/finance/insurance', color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: `${activeInsurance} active plans`, amount: activeInsurance > 0 ? `${activeInsurance} Plans` : 'Explore plans' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Finance Hub" subtitle="Your complete financial ecosystem" showBackButton />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Financial Overview */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Net Worth</p>
                <p className="text-3xl font-black mt-1">{user?.balance || '₦0.00'}</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 rounded-full">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400">+12.5%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Savings</p>
                <p className="text-sm font-black mt-1">₦{totalSavings.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">BSP Coins</p>
                <p className="text-sm font-black mt-1">{user?.bspBalance?.toLocaleString() || 0}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Pension</p>
                <p className="text-sm font-black mt-1">₦{totalPension.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Financial Overview</h3>
              <div className="flex gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Income</span>
                <span className="flex items-center gap-1 text-red-400"><div className="w-2 h-2 rounded-full bg-red-400" /> Expense</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Finance Modules */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Financial Services</h3>
            {modules.map((mod) => (
              <button key={mod.label} onClick={() => navigate(mod.path)} className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-sky-500/30 transition-all text-left group active:scale-[0.99]">
                <div className={`w-12 h-12 ${mod.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <mod.icon className={`w-5 h-5 ${mod.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{mod.label}</p>
                  <p className="text-[10px] text-slate-400">{mod.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{mod.amount}</p>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors ml-auto" />
                </div>
              </button>
            ))}
          </div>

          {/* Smart Insights */}
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Smart Insights</h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">• You spent ₦125,000 on subscriptions this month</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">• Your savings increased by 18% this month</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">• You earned ₦12,000 in affiliate commissions this week</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
