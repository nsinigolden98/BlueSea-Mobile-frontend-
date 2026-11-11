import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Building2, Users, MapPin, Wallet,
  Settings, Plus, Search, Loader2, LogOut, Trash2, UserPlus, Send, History,
} from 'lucide-react';
import {
  useCompany,
  useBranches,
  useEmployees,
  useRuns,
  useAuditLog,
  useMembers,
  useInvites,
  useRevokeInvite,
  useRemoveMember,
  useLeaveCompany,
  useUpdateCompany,
  type PayrollApiError,
} from '@/lib/payrollApi';
import { PinModal } from '@/components/ui-custom';
import MetricCard from '@/components/payroll-pro/MetricCard';
import EmployeeCard from '@/components/payroll-pro/EmployeeCard';
import BranchCard from '@/components/payroll-pro/BranchCard';
import EmptyState from '@/components/payroll-pro/EmptyState';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import { Sidebar, Header, Toast } from '@/components/ui-custom';

type Tab = 'overview' | 'branches' | 'employees' | 'payroll' | 'team' | 'settings';

const BUSINESS_TYPES = [
  ['limited_liability', 'Limited Liability Company'],
  ['partnership', 'Partnership'],
  ['sole_proprietorship', 'Sole Proprietorship'],
  ['plc', 'Public Limited Company'],
  ['ngo', 'NGO / Non-Profit'],
  ['government', 'Government Agency'],
  ['other', 'Other'],
] as const;

function apiErr(e: PayrollApiError | undefined, fallback: string): string {
  return e?.message ?? fallback;
}

export default function CompanyWorkspace() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId);
  const { data: branches, isLoading: branchesLoading } = useBranches(companyId);
  const { data: employees, isLoading: employeesLoading } = useEmployees(companyId);
  const { data: runs, isLoading: runsLoading } = useRuns(companyId);
  const { data: auditLog } = useAuditLog(companyId);
  const { data: members } = useMembers(companyId);
  const { data: invites } = useInvites(companyId);
  const { data: memberInvites, refetch: refetchInvites } = useInvites(companyId);

  const revokeInvite = useRevokeInvite(companyId ?? '');
  const removeMember = useRemoveMember(companyId ?? '');
  const leaveCompany = useLeaveCompany(companyId ?? '');
  const updateCompany = useUpdateCompany(companyId ?? '');
  const { PinComponent, showPinModal, message } = PinModal();

  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePayload, setInvitePayload] = useState<{ company_id: string; email: string }>({ company_id: '', email: '' });
  const [settings, setSettings] = useState({
    name: '', cacNumber: '', businessType: 'limited_liability', email: '', phone: '', address: '', website: '',
    expectedEmployeeCount: '', expectedBranchCount: '', expectedMonthlyPayroll: '',
  });
  const [settingsLoadedFor, setSettingsLoadedFor] = useState<string | null>(null);

  // Prefill settings form once the company loads (once per company).
  useEffect(() => {
    if (!company || settingsLoadedFor === company.id) return;
    setSettings({
      name: company.name,
      cacNumber: company.cacNumber ?? '',
      businessType: company.businessType,
      email: company.email ?? '',
      phone: company.phone ?? '',
      address: company.address ?? '',
      website: company.website ?? '',
      expectedEmployeeCount: company.expectedEmployeeCount?.toString() ?? '',
      expectedBranchCount: company.expectedBranchCount?.toString() ?? '',
      expectedMonthlyPayroll: company.expectedMonthlyPayroll.toString(),
    });
    setSettingsLoadedFor(company.id);
  }, [company, settingsLoadedFor]);

  // Invite submit flow: validate → PIN confirm → backend sends email.
  const handleInviteSubmit = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      showToast('Enter a valid email address');
      return;
    }
    setInvitePayload({ company_id: companyId ?? '', email });
    showPinModal();
  };

  useEffect(() => {
    if (!message) return;
    if (message.success || (!message.error && message.message)) {
      showToast(typeof message.message === 'string' ? message.message : 'Invitation sent');
      setInviteEmail('');
      void refetchInvites();
    } else {
      showToast(message.error || message.message || 'Invite failed');
    }
  }, [message, showToast, refetchInvites]);

  const handleSaveSettings = () => {
    if (!settings.name.trim()) {
      showToast('Company name is required');
      return;
    }
    updateCompany.mutate({
      name: settings.name.trim(),
      cac_number: settings.cacNumber.trim() || undefined,
      business_type: settings.businessType,
      email: settings.email.trim().toLowerCase() || undefined,
      phone: settings.phone.trim() || undefined,
      address: settings.address.trim() || undefined,
      website: settings.website.trim() || undefined,
      expected_employee_count: settings.expectedEmployeeCount ? Number(settings.expectedEmployeeCount) : undefined,
      expected_branch_count: settings.expectedBranchCount ? Number(settings.expectedBranchCount) : undefined,
      expected_monthly_payroll: settings.expectedMonthlyPayroll ? Number(settings.expectedMonthlyPayroll) : undefined,
    }, {
      onSuccess: () => showToast('Company updated'),
      onError: (err) => showToast(apiErr(err, 'Update failed')),
    });
  };

  const handleLeave = () => {
    if (!window.confirm('Leave this company and revoke your payroll access?')) return;
    leaveCompany.mutate(undefined, {
      onSuccess: () => {
        showToast('You left the company');
        navigate('/payroll-pro');
      },
      onError: (err) => showToast(apiErr(err, 'Could not leave the company')),
    });
  };

  const handleRemoveMember = (memberId: string, isOwner: boolean) => {
    if (isOwner) return;
    if (!window.confirm('Remove this controller from payroll?')) return;
    removeMember.mutate(memberId, {
      onSuccess: () => showToast('Controller removed'),
      onError: (err) => showToast(apiErr(err, 'Could not remove member')),
    });
  };

  const handleRevokeInvite = (inviteId: string) => {
    if (!window.confirm('Revoke this invitation?')) return;
    revokeInvite.mutate(inviteId, {
      onSuccess: () => showToast('Invitation revoked'),
      onError: (err) => showToast(apiErr(err, 'Could not revoke invitation')),
    });
  };

  const errorMessage = companyError ? apiErr(companyError as unknown as PayrollApiError, 'Could not load company') : null;

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'branches', label: 'Branches', icon: MapPin },
    { key: 'employees', label: 'Employees', icon: Users },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
    { key: 'team', label: 'Team', icon: UserPlus },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return employees ?? [];
    return (employees ?? []).filter(e =>
      e.fullName.toLowerCase().includes(q)
      || (e.email ?? '').toLowerCase().includes(q)
      || e.employeeId.toLowerCase().includes(q),
    );
  }, [employees, searchQuery]);

  if (companyLoading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (errorMessage || !company) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{errorMessage ?? 'Company not found.'}</p>
          <button
            onClick={() => navigate('/payroll-pro')}
            className="mt-4 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const monthlyPayrollNaira = company.stats.monthlyPayrollCents / 100;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <PinComponent type="payroll-invite" value={invitePayload} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title={company.name}
            subtitle="Payroll Workspace"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 max-w-4xl mx-auto">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/10'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide max-w-4xl w-full mx-auto pb-24 z-10">

          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-slide-up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <MetricCard title="Total Employees" value={company.stats.totalEmployees} icon={Users} color="sky" />
                <MetricCard title="Active" value={company.stats.activeEmployees} icon={Users} color="success" />
                <MetricCard title="Branches" value={company.stats.totalBranches} icon={MapPin} color="purple" />
                <MetricCard title="Monthly Payroll" value={`₦${monthlyPayrollNaira.toLocaleString()}`} icon={Wallet} color="sky" />
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2"><History className="w-4 h-4" /> Recent Activity</h3>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
                  {(auditLog ?? []).slice(0, 8).map(entry => (
                    <div key={entry.id} className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-sky-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{entry.action.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                          {JSON.stringify(entry.details)}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {(auditLog ?? []).length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No activity yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── BRANCHES ─── */}
          {activeTab === 'branches' && (
            <div className="space-y-4 animate-slide-up">
              {branchesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : (branches ?? []).length > 0 ? (
                <>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1">
                    {(branches ?? []).length} Registered Branch{(branches ?? []).length !== 1 ? 'es' : ''}
                  </p>
                  <div className="space-y-3">
                    {(branches ?? []).map(branch => (
                      <BranchCard key={branch.id} branch={branch} />
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  type="branches"
                  actionLabel="Create Branch"
                  onAction={() => navigate(`/payroll-pro/company/${companyId}/create-branch`)}
                />
              )}

              <button
                onClick={() => navigate(`/payroll-pro/company/${companyId}/create-branch`)}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/20 transition-all"
                aria-label="Create branch"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── EMPLOYEES ─── */}
          {activeTab === 'employees' && (
            <div className="space-y-4 animate-slide-up">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {employeesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : filteredEmployees.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1">
                    {filteredEmployees.length} Personnel Record{filteredEmployees.length !== 1 ? 's' : ''}
                  </p>
                  {filteredEmployees.map(emp => (
                    <EmployeeCard key={emp.id} employee={emp} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="employees"
                  actionLabel="Add Employee"
                  onAction={() => navigate(`/payroll-pro/company/${companyId}/add-employee`)}
                />
              )}

              <button
                onClick={() => navigate(`/payroll-pro/company/${companyId}/add-employee`)}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/20 transition-all"
                aria-label="Add employee"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── PAYROLL ─── */}
          {activeTab === 'payroll' && (
            <div className="space-y-4 animate-slide-up">
              {runsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : (runs ?? []).length > 0 ? (
                <div className="space-y-3">
                  {(runs ?? []).map(payroll => (
                    <div
                      key={payroll.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-sky-500/30 hover:shadow-sm transition-all"
                      onClick={() => navigate(`/payroll-pro/payroll/${payroll.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{payroll.name}</h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {payroll.payPeriodStart ? new Date(payroll.payPeriodStart).toLocaleDateString() : '—'} — {payroll.payPeriodEnd ? new Date(payroll.payPeriodEnd).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <StatusBadge status={payroll.status} size="sm" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Staff</p>
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{payroll.lines?.length ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Gross</p>
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">₦{payroll.totalGrossSalary.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Net</p>
                          <p className="text-xs font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">₦{payroll.totalNetSalary.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState type="payroll" actionLabel="Create Payroll" onAction={() => navigate(`/payroll-pro/company/${companyId}/run-payroll`)} />
              )}

              <button
                onClick={() => navigate(`/payroll-pro/company/${companyId}/run-payroll`)}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/20 transition-all"
                aria-label="Create payroll run"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── TEAM & INVITES ─── */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1">Invite a payroll controller</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                  Enter the BlueSea email of the person you want to share control. They receive an email and must confirm with their PIN or fingerprint.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    onClick={handleInviteSubmit}
                    disabled={!inviteEmail.trim()}
                    className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Invite
                  </button>
                </div>
              </div>

              {/* Pending invites */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 px-1">Pending Invitations</h3>
                <div className="space-y-2.5">
                  {(memberInvites ?? invites ?? []).filter(i => i.status === 'pending').map(invite => (
                    <div key={invite.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{invite.inviteeEmail}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {invite.role === 'controller' ? 'Payroll Controller' : invite.role} · expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                        aria-label="Revoke invite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(memberInvites ?? invites ?? []).filter(i => i.status === 'pending').length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 px-1 py-2">No pending invitations.</p>
                  )}
                </div>
              </div>

              {/* Current members */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 px-1">Payroll Team</h3>
                <div className="space-y-2.5">
                  {(members ?? []).map(member => (
                    <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">{member.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{member.email} · {member.isOwner ? 'Owner' : 'Controller'}</p>
                      </div>
                      {!member.isOwner && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.isOwner)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                          aria-label="Remove controller"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(members ?? []).length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 px-1 py-2">Only you are on this payroll.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── SETTINGS ─── */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-slide-up">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Company Settings</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Update the corporate profile for payroll.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Company Name</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.name} onChange={e => setSettings(s2 => ({ ...s2, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">CAC Number</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.cacNumber} onChange={e => setSettings(s2 => ({ ...s2, cacNumber: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Business Type</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.businessType} onChange={e => setSettings(s2 => ({ ...s2, businessType: e.target.value }))}>
                      {BUSINESS_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Email</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.email} onChange={e => setSettings(s2 => ({ ...s2, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Phone</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.phone} onChange={e => setSettings(s2 => ({ ...s2, phone: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Address</label>
                    <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm min-h-[70px] resize-none" value={settings.address} onChange={e => setSettings(s2 => ({ ...s2, address: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Website</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.website} onChange={e => setSettings(s2 => ({ ...s2, website: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Projected Staff</label>
                    <input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.expectedEmployeeCount} onChange={e => setSettings(s2 => ({ ...s2, expectedEmployeeCount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Projected Branches</label>
                    <input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.expectedBranchCount} onChange={e => setSettings(s2 => ({ ...s2, expectedBranchCount: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">Est. Monthly Payroll (₦)</label>
                    <input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm" value={settings.expectedMonthlyPayroll} onChange={e => setSettings(s2 => ({ ...s2, expectedMonthlyPayroll: e.target.value }))} />
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={updateCompany.isPending}
                  className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  {updateCompany.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>

              {company.membershipRole !== 'owner' && (
                <button
                  onClick={handleLeave}
                  className="w-full flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl px-4 py-3 text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Leave This Company
                </button>
              )}
            </div>
          )}
        </main>
      </div>
      <ToastComponent />
    </div>
  );
}
