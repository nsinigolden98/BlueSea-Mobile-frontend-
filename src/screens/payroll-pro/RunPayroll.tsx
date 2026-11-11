import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Users, Wallet, Loader2, Check } from 'lucide-react';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { useBranches, useEmployees, useCreateRun } from '@/lib/payrollApi';

export default function RunPayroll() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: branches, isLoading: branchesLoading } = useBranches(companyId);
  const { data: employees, isLoading: employeesLoading } = useEmployees(companyId, { status: 'all' });

  const [name, setName] = useState('Monthly Payroll');
  const [payPeriodStart, setPayPeriodStart] = useState('');
  const [payPeriodEnd, setPayPeriodEnd] = useState('');
  const [payDate, setPayDate] = useState('');
  const [branchId, setBranchId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitError, setSubmitError] = useState('');

  const activeEmployees = useMemo(
    () => (employees ?? []).filter(e => e.status === 'active'),
    [employees],
  );

  // Default-select all active employees once loaded.
  useEffect(() => {
    if (selectedIds.size === 0 && activeEmployees.length > 0) {
      setSelectedIds(new Set(activeEmployees.map(e => Number(e.id))));
    }
  }, [activeEmployees, selectedIds.size]);

  const selectedTotal = useMemo(
    () => activeEmployees.filter(e => selectedIds.has(Number(e.id))).reduce((sum, e) => sum + e.salary, 0),
    [activeEmployees, selectedIds],
  );

  const toggle = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSubmitError('');
  };

  const toggleAll = () => {
    setSelectedIds(prev =>
      prev.size === activeEmployees.length
        ? new Set()
        : new Set(activeEmployees.map(e => Number(e.id))),
    );
  };

  const createRun = useCreateRun(companyId ?? '', {
    onError: (error) => setSubmitError(error?.message ?? 'Could not create the payroll run.'),
    onSuccess: (run) => navigate(`/payroll-pro/payroll/${run.id}`),
  });

  const handleSubmit = () => {
    if (!companyId) return;
    setSubmitError('');
    const ids = [...selectedIds];
    if (ids.length === 0) {
      showToast('Select at least one employee');
      return;
    }
    createRun.mutate({
      name: name.trim() || 'Monthly Payroll',
      branch_id: branchId ? Number(branchId) : undefined,
      pay_period_start: payPeriodStart || undefined,
      pay_period_end: payPeriodEnd || undefined,
      pay_date: payDate || undefined,
      employee_ids: ids,
    });
  };

  const allSelected = selectedIds.size === activeEmployees.length && activeEmployees.length > 0;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <Header
            title="Run Payroll"
            subtitle="Create a payroll run from active employees"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
            Draft &rarr; Approve &rarr; Disburse
          </span>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide max-w-2xl w-full mx-auto pb-24 z-10 space-y-5">
          {submitError && (
            <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2">{submitError}</p>
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Run Name</label>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Period Start</label>
                <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm" value={payPeriodStart} onChange={e => setPayPeriodStart(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Period End</label>
                <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm" value={payPeriodEnd} onChange={e => setPayPeriodEnd(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Pay Date</label>
                <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm" value={payDate} onChange={e => setPayDate(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Limit to Branch</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm" value={branchId} onChange={e => setBranchId(e.target.value)} disabled={branchesLoading}>
                  <option value="">All branches</option>
                  {(branches ?? []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  Employees ({selectedIds.size}/{activeEmployees.length})
                </h3>
              </div>
              <button
                onClick={toggleAll}
                className="text-[11px] font-bold text-sky-500 hover:text-sky-600 transition-colors"
              >
                {allSelected ? 'Clear all' : 'Select all'}
              </button>
            </div>

            {employeesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : activeEmployees.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">No active employees. Add employees first.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto scrollbar-hide -mx-2 px-2">
                {activeEmployees.map(emp => {
                  const id = Number(emp.id);
                  const checked = selectedIds.has(id);
                  return (
                    <label key={emp.id} className="flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(id)}
                        className="w-4 h-4 accent-sky-500 rounded flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{emp.fullName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{emp.department.replace('_', ' ')} · {emp.employmentType.replace('_', ' ')}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">₦{emp.salary.toLocaleString()}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly total (selected)</p>
                <p className="text-lg font-black text-sky-600 dark:text-sky-400">₦{selectedTotal.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400"><Wallet className="w-3.5 h-3.5" /> Paid via wallet/bank on approve</div>
            </div>
          </div>
        </main>

        <div className="sticky bottom-0 z-30 shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-2xl mx-auto w-full">
            <button
              onClick={handleSubmit}
              disabled={createRun.isPending || activeEmployees.length === 0 || selectedIds.size === 0}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-sky-500/10"
            >
              {createRun.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {createRun.isPending ? 'Creating…' : `Create Run (${selectedIds.size} employees)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
