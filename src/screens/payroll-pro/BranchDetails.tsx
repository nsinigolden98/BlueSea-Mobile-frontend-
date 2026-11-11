import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Users, UserCog, Wallet, Loader2, Check } from 'lucide-react';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { useBranch, useEmployees, useRuns, useUpdateBranch } from '@/lib/payrollApi';
import EmployeeCard from '@/components/payroll-pro/EmployeeCard';
import EmptyState from '@/components/payroll-pro/EmptyState';
import StatusBadge from '@/components/payroll-pro/StatusBadge';

type Tab = 'employees' | 'payroll' | 'settings';

export default function BranchDetails() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: branch, isLoading: branchLoading, error: branchError, refetch } = useBranch(branchId);
  const companyId = branch?.companyId;

  const { data: employees, isLoading: employeesLoading } = useEmployees(companyId);
  const branchEmployees = (employees ?? []).filter(e => e.branchId === branchId);

  const { data: runs } = useRuns(companyId);
  const branchRuns = (runs ?? []).filter(r => r.branchId === branchId);

  const [form, setForm] = useState({ name: '', address: '', description: '', status: 'active' });
  const [formLoadedFor, setFormLoadedFor] = useState<string | null>(null);
  const updateBranch = useUpdateBranch(branchId ?? '', companyId ?? '');

  useEffect(() => {
    if (branch && formLoadedFor !== branch.id) {
      setForm({
        name: branch.name,
        address: branch.address ?? '',
        description: branch.description ?? '',
        status: branch.status,
      });
      setFormLoadedFor(branch.id);
    }
  }, [branch, formLoadedFor]);

  const handleSave = () => {
    if (!branch || !branch.name.trim()) return;
    updateBranch.mutate({
      name: form.name.trim(),
      address: form.address.trim() || null,
      description: form.description.trim() || null,
      status: form.status,
    }, {
      onSuccess: () => {
        void refetch();
        showToast('Branch updated');
      },
      onError: (err) => showToast(err?.message ?? 'Update failed'),
    });
  };

  if (branchLoading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (branchError || !branch) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="text-center max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Branch could not be loaded.</p>
          <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'employees', label: 'Employees', icon: Users },
    { key: 'payroll', label: 'Payroll Runs', icon: Wallet },
    { key: 'settings', label: 'Settings', icon: MapPin },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header title={branch.name} subtitle="Branch Details" onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <div className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/10">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{branch.name}</span>
                <StatusBadge status={branch.status} size="sm" />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{branch.address ?? 'No address recorded'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Go Back
          </button>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide max-w-3xl w-full mx-auto pb-24 z-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-5 shadow-sm animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Manager</p>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <UserCog className="w-3.5 h-3.5 text-slate-400" />
                  {branch.managerId ? `Assigned (ID ${branch.managerId.slice(0, 8)}…)` : 'Not assigned'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Staff</p>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {branch.employeeCount} assigned
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estimated Monthly Payroll</p>
                <p className="text-sm font-extrabold text-sky-600 dark:text-sky-400 mt-1">₦{branch.monthlyPayrollEstimate.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</p>
                <StatusBadge status={branch.status} size="sm" />
              </div>
            </div>
            {branch.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                {branch.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'employees' && (
            <div className="space-y-3 animate-slide-up">
              {employeesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : branchEmployees.length > 0 ? (
                <>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                    {branchEmployees.length} Personnel Assigned
                  </p>
                  {branchEmployees.map(emp => (
                    <EmployeeCard key={emp.id} employee={emp} showBranch={false} />
                  ))}
                </>
              ) : (
                <EmptyState type="employees" title="No Staff Assigned" description="Employees assigned to this branch will appear here." />
              )}
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="space-y-3 animate-slide-up">
              {branchRuns.length > 0 ? (
                branchRuns.map(run => (
                  <button
                    key={run.id}
                    onClick={() => navigate(`/payroll-pro/payroll/${run.id}`)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-sky-500/30 transition-all shadow-sm text-left"
                  >
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{run.name}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">₦{run.totalNetSalary.toLocaleString()} net · {run.status.replace('_', ' ')}</p>
                    </div>
                    <StatusBadge status={run.status} size="sm" />
                  </button>
                ))
              ) : (
                <EmptyState type="payroll" title="No Payroll Runs" description="Runs created for this branch will appear here." />
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-slide-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Edit Branch</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Update the branch record.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Branch Name</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Address</label>
                  <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm min-h-[70px] resize-none" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Description</label>
                  <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm min-h-[70px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Status</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={updateBranch.isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                {updateBranch.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Branch
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
