import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, Briefcase, MapPin, Calendar, Wallet, Loader2, Receipt,
} from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';
import { usePayrollPortal } from '@/lib/payrollApi';
import EmptyState from '@/components/payroll-pro/EmptyState';

type Tab = 'overview' | 'payroll' | 'payslips';

export default function EmployeePortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const { data, isLoading, error, refetch } = usePayrollPortal();

  const employment = useMemo(
    () => (data?.employments ?? []).find(e => e.companyId === companyId) ?? null,
    [data, companyId],
  );
  const bonuses = useMemo(
    () => (data?.bonuses ?? []).filter(b => !companyId || b.companyId === companyId),
    [data, companyId],
  );
  const deductions = useMemo(
    () => (data?.deductions ?? []).filter(d => !companyId || d.companyId === companyId),
    [data, companyId],
  );
  const payslips = useMemo(
    () => (data?.recentPayslips ?? []).filter(p => !companyId || p.companyId === companyId),
    [data, companyId],
  );

  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const base = employment?.salary ?? 0;
  const netSalary = base + totalBonuses - totalDeductions;

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-sm text-rose-500">{(error as any)?.message ?? 'Could not load your portal.'}</p>
          <button className="mt-3 text-xs underline text-sky-500" onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!employment) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
            <Header title="Access Panel" subtitle="Employee Access Verification" onMenuClick={() => setSidebarOpen(true)} />
          </div>
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-sm">
              <EmptyState
                type="general"
                title="No Employment Found"
                description="You don't have an employment record at this company."
                actionLabel="Go Back"
                onAction={() => navigate(-1)}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const initials = employment.companyName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const tabs: { key: Tab; label: string; icon: typeof Briefcase }[] = [
    { key: 'overview', label: 'Overview', icon: Briefcase },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
    { key: 'payslips', label: 'Payslips', icon: Receipt },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Employee Self-Service"
            subtitle={employment.companyName}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center font-extrabold text-lg text-white shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{employment.companyName}</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 capitalize">
                {employment.role.replace('_', ' ')} · {employment.department.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all self-start sm:self-auto px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 shrink-0">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as Tab)}
                className={`py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide pb-24 z-10">
          <div className="max-w-4xl mx-auto">

            {activeTab === 'overview' && (
              <div className="space-y-4 animate-slide-up">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Monthly Salary</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">₦{employment.salary.toLocaleString()}</p>

                  <div className="flex items-center justify-center gap-4 mt-4 text-[11px] font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-transparent">
                      +₦{totalBonuses.toLocaleString()} bonuses
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-transparent">
                      -₦{totalDeductions.toLocaleString()} deductions
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Net Take Home</p>
                    <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-0.5">₦{netSalary.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-0.5 mb-2">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Company</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{employment.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Position</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate capitalize">{employment.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Branch</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{employment.branchName ?? 'Head office'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Start Date</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{new Date(employment.employmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payroll' && (
              <div className="space-y-5 animate-slide-up">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3.5 px-0.5">Salary Breakdown</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-400">Base Salary</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">₦{employment.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-400">Total Bonuses</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+₦{totalBonuses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-400">Total Deductions</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">-₦{totalDeductions.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Net Salary</span>
                      <span className="font-black text-sky-600 dark:text-sky-400 text-sm">₦{netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {bonuses.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Bonuses</h3>
                    {bonuses.map(b => (
                      <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{b.type.replace('_', ' ')} Bonus</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{b.reason || 'No reason given'}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">+₦{b.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {deductions.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Deductions</h3>
                    {deductions.map(d => (
                      <div key={d.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{d.type.replace('_', ' ')}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{d.reason}</p>
                        </div>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">-₦{d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {bonuses.length === 0 && deductions.length === 0 && (
                  <EmptyState type="general" title="No Adjustments" description="No bonuses or deductions recorded for your account." />
                )}
              </div>
            )}

            {activeTab === 'payslips' && (
              <div className="space-y-4 animate-slide-up">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-sky-500" />
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Recent Payslips</h3>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payslips.length === 0 ? (
                      <div className="p-6 text-center">
                        <EmptyState type="payroll" title="No Payslips" description="Payroll runs that pay you will appear here." />
                      </div>
                    ) : (
                      payslips.map(p => (
                        <div key={p.id} className="px-4 py-3.5 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{p.runName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.companyName} · {new Date(p.paidAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">₦{p.net.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">paid</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
