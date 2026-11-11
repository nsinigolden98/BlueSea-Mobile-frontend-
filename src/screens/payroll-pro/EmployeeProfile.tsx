import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Mail, Phone, Briefcase, Wallet,
  Loader2, Check, Ban, Pencil, X,
} from 'lucide-react';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import {
  useEmployee,
  useBranches,
  useBonuses,
  useDeductions,
  useUpdateEmployee,
  useTerminateEmployee,
  useLinkEmployee,
  useUnlinkEmployee,
} from '@/lib/payrollApi';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

type Tab = 'employment' | 'payroll';

const DEPARTMENTS = [
  'operations', 'finance', 'hr', 'engineering', 'sales', 'marketing',
  'customer_service', 'logistics', 'admin', 'legal', 'it', 'other',
];

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'intern', 'temporary'];
const STATUSES = ['active', 'suspended', 'on_leave', 'resigned', 'terminated'];

export default function EmployeeProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [activeTab, setActiveTab] = useState<Tab>('employment');
  const [editing, setEditing] = useState(false);
  const [linkEmail, setLinkEmail] = useState(false);

  const { data: employee, isLoading, error, refetch } = useEmployee(employeeId);
  const { data: branches } = useBranches(employee?.companyId);
  const { data: bonuses } = useBonuses(employee?.companyId);
  const { data: deductions } = useDeductions(employee?.companyId);

  const [form, setForm] = useState({
    salary: '', email: '', phone: '', role: '', department: '', employmentType: '', status: '',
    branchId: '', taxId: '',
    bankName: '', bankCode: '', bankAccountNumber: '', bankAccountName: '',
  });

  const companyId = employee?.companyId ?? '';
  const updateEmployee = useUpdateEmployee(employeeId ?? '', companyId);
  const terminateEmployee = useTerminateEmployee(employeeId ?? '', companyId);
  const linkEmployee = useLinkEmployee(employeeId ?? '', companyId);
  const unlinkEmployee = useUnlinkEmployee(employeeId ?? '', companyId);

  const openEdit = () => {
    if (!employee) return;
    setForm({
      salary: String(employee.salary),
      email: employee.email ?? '',
      phone: employee.phone ?? '',
      role: employee.role,
      department: employee.department,
      employmentType: employee.employmentType,
      status: employee.status,
      branchId: employee.branchId ?? '',
      taxId: employee.taxId ?? '',
      bankName: employee.bankName ?? '',
      bankCode: employee.bankCode ?? '',
      bankAccountNumber: employee.bankAccountNumber ?? '',
      bankAccountName: employee.bankAccountName ?? '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    if (!employee) return;
    updateEmployee.mutate({
      salary: form.salary ? Number(form.salary) : undefined,
      email: form.email.trim().toLowerCase() || null,
      phone: form.phone.trim() || null,
      role: form.role,
      department: form.department,
      employment_type: form.employmentType,
      status: form.status,
      branch_id: form.branchId ? Number(form.branchId) : null,
      tax_id: form.taxId.trim() || null,
      bank_name: form.bankName.trim() || null,
      bank_code: form.bankCode.trim() || null,
      bank_account_number: form.bankAccountNumber.replace(/\D/g, '') || null,
      bank_account_name: form.bankAccountName.trim() || null,
    }, {
      onSuccess: () => {
        setEditing(false);
        void refetch();
        showToast('Employee updated');
      },
      onError: (err) => showToast(err?.message ?? 'Update failed'),
    });
  };

  const handleTerminate = () => {
    if (!window.confirm(`Terminate ${employee?.fullName}? This keeps salary history but stops future runs.`)) return;
    terminateEmployee.mutate(undefined, {
      onSuccess: () => {
        showToast('Employee terminated');
        void refetch();
      },
      onError: (err) => showToast(err?.message ?? 'Could not terminate'),
    });
  };

  const handleLinkSubmit = (email: string) => {
    if (!email.trim()) return;
    linkEmployee.mutate(email.trim().toLowerCase(), {
      onSuccess: () => {
        setLinkEmail(false);
        void refetch();
        showToast('Account linked');
      },
      onError: (err) => showToast(err?.message ?? 'No account matches that email'),
    });
  };

  const handleUnlink = () => {
    if (!window.confirm('Unlink this account? Payroll will fall back to bank transfer for this employee.')) return;
    unlinkEmployee.mutate(undefined, {
      onSuccess: () => {
        void refetch();
        showToast('Account unlinked');
      },
      onError: (err) => showToast(err?.message ?? 'Could not unlink'),
    });
  };

  if (isLoading || !employee) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : (
          <EmptyState type="general" title="Employee not found" description={(error as any)?.message ?? 'This employee could not be loaded.'} actionLabel="Go Back" onAction={() => navigate(-1)} />
        )}
      </div>
    );
  }

  const initials = employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const empBonuses = (bonuses ?? []).filter(b => b.employeeId === employee.id);
  const empDeductions = (deductions ?? []).filter(d => d.employeeId === employee.id);

  const tabs: { key: Tab; label: string; icon: typeof Briefcase }[] = [
    { key: 'employment', label: 'Employment', icon: Briefcase },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title={employee.fullName}
            subtitle="Employee Record"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center font-extrabold text-lg text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{employee.fullName}</h1>
                <StatusBadge status={employee.status} size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 capitalize">
                {employee.role.replace('_', ' ')} · {employee.department.replace('_', ' ')}
              </p>
              <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wide mt-1 uppercase">{employee.employeeId}{employee.linked && ' · Linked'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white self-start sm:self-auto px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 shrink-0">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === tab.key ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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

            {activeTab === 'employment' && (
              <div className="space-y-4 animate-slide-up">
                {/* Actions row */}
                <div className="flex flex-wrap gap-2">
                  {!editing ? (
                    <button onClick={openEdit} className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  ) : (
                    <>
                      <button onClick={handleSave} disabled={updateEmployee.isPending} className="inline-flex items-center gap-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 rounded-xl px-4 py-2 transition-all">
                        {updateEmployee.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                      </button>
                      <button onClick={() => setEditing(false)} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                        <X className="w-4 h-4" /> Cancel
                      </button>
                    </>
                  )}
                  {employee.status !== 'terminated' && (
                    <button onClick={handleTerminate} className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl px-3.5 py-2 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all">
                      <Ban className="w-4 h-4" /> Terminate
                    </button>
                  )}
                </div>

                {/* Account link */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-2">Account Link</h3>
                  {employee.linked ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Linked to a BlueSea account</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Salary will be paid to the wallet of that account.</p>
                      </div>
                      <button onClick={handleUnlink} className="text-[11px] font-bold text-rose-500 border border-rose-200 dark:border-rose-900/50 rounded-lg px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all">Unlink</button>
                    </div>
                  ) : linkEmail ? (
                    <form onSubmit={e => { e.preventDefault(); const v = (e.currentTarget.elements.namedItem('linkEmail') as HTMLInputElement).value; handleLinkSubmit(v); }} className="flex gap-2">
                      <input name="linkEmail" type="email" autoFocus placeholder="Account email" className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500" />
                      <button type="submit" disabled={linkEmployee.isPending} className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-bold px-4 rounded-xl">
                        {linkEmployee.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Link'}
                      </button>
                      <button type="button" onClick={() => setLinkEmail(false)} className="text-slate-400 px-2"><X className="w-5 h-5" /></button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Not linked to a BlueSea account</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Salary will be paid by bank transfer.</p>
                      </div>
                      <button onClick={() => setLinkEmail(true)} className="text-[11px] font-bold text-sky-500 border border-sky-200 dark:border-sky-900/50 rounded-lg px-3 py-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-all">Link account</button>
                    </div>
                  )}
                </div>

                {editing ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Salary (₦)</label><input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Email</label><input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Phone</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Role</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Department</label><select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>{DEPARTMENTS.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}</select></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Employment type</label><select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))}>{EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Status</label><select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{STATUSES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Branch</label><select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}><option value="">Head office</option>{(branches ?? []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                      <div className="md:col-span-2"><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Tax ID (TIN)</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.taxId} onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Bank name</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Bank code</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.bankCode} onChange={e => setForm(f => ({ ...f, bankCode: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Account number</label><input inputMode="numeric" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.bankAccountNumber} onChange={e => setForm(f => ({ ...f, bankAccountNumber: e.target.value }))} /></div>
                      <div><label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Account name</label><input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={form.bankAccountName} onChange={e => setForm(f => ({ ...f, bankAccountName: e.target.value }))} /></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
                      <DetailRow label="Employee ID" value={employee.employeeId} />
                      <DetailRow label="Department" value={employee.department.replace('_', ' ')} />
                      <DetailRow label="Role" value={employee.role.replace('_', ' ')} />
                      <DetailRow label="Employment Type" value={employee.employmentType.replace('_', '-')} />
                      <DetailRow label="Start Date" value={new Date(employee.employmentDate).toLocaleDateString()} />
                      <DetailRow label="Branch" value={employee.branchName ?? 'Head office'} />
                      <DetailRow label="Status" value={<StatusBadge status={employee.status} size="sm" />} />
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3 px-0.5">Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {employee.email && (
                          <div className="flex items-center gap-2.5 text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{employee.email}</span>
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center gap-2.5 text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{employee.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3 px-0.5">Bank & Tax</h3>
                      <div className="space-y-1">
                        <DetailRow label="Bank Name" value={employee.bankName ?? 'Not set'} />
                        <DetailRow label="Account Number" value={employee.bankAccountNumber ?? 'Not set'} />
                        <DetailRow label="Account Name" value={employee.bankAccountName ?? 'Not set'} />
                        <DetailRow label="Tax ID (TIN)" value={employee.taxId ?? 'Not set'} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'payroll' && (
              <div className="space-y-5 animate-slide-up">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Current Monthly Salary</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">₦{employee.salary.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 capitalize font-medium">{employee.employmentType.replace('_', '-')} · {employee.department.replace('_', ' ')}</p>
                </div>

                {empBonuses.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Bonuses ({empBonuses.length})</h3>
                    {empBonuses.map(bonus => (
                      <div key={bonus.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{bonus.type.replace('_', ' ')} Bonus</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{bonus.reason}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">+₦{bonus.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {empDeductions.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Deductions ({empDeductions.length})</h3>
                    {empDeductions.map(ded => (
                      <div key={ded.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{ded.type.replace('_', ' ')}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{ded.reason}</p>
                        </div>
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">-₦{ded.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {empBonuses.length === 0 && empDeductions.length === 0 && (
                  <div className="py-6">
                    <EmptyState type="general" title="No Adjustments" description="No bonuses or deductions recorded for this employee." />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 text-right">{value}</span>
    </div>
  );
}
