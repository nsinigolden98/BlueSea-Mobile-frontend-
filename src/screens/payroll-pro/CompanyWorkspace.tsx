import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Building2, Users, MapPin, Wallet, ClipboardCheck, BarChart3, Settings, Plus, Search } from 'lucide-react';
import { useCompany } from '@/hooks/usePayrollPro';
import MetricCard from '@/components/payroll-pro/MetricCard';
import EmployeeCard from '@/components/payroll-pro/EmployeeCard';
import BranchCard from '@/components/payroll-pro/BranchCard';
import ApprovalCard from '@/components/payroll-pro/ApprovalCard';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

type Tab = 'overview' | 'branches' | 'employees' | 'payroll' | 'approvals' | 'reports' | 'settings';

export default function CompanyWorkspace() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { company, employees, branches, payrolls, pendingApprovals, stats } = useCompany(companyId || '');

  if (!company) {
    return (
      <div className="tm-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--tm-text-muted)]">Company not found</p>
          <button onClick={() => navigate('/payroll-pro')} className="tm-btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'branches', label: 'Branches', icon: MapPin },
    { key: 'employees', label: 'Employees', icon: Users },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
    { key: 'approvals', label: 'Approvals', icon: ClipboardCheck },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredEmployees = employees.filter(e => 
    e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tm-page">
      {/* Header */}
      <div className="tm-nav-header px-4 py-4">
        <button onClick={() => navigate('/payroll-pro')} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors mb-3">
          <ArrowLeft className="w-5 h-5" />
          Payroll Pro
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--tm-sky-main)] to-[var(--tm-sky-dark)] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-[var(--tm-text-main)] truncate">{company.name}</h1>
              <StatusBadge status={company.verification.status} size="sm" />
            </div>
            <p className="text-xs text-[var(--tm-text-muted)] truncate">{company.address}</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-[130px] z-30 bg-[var(--tm-bg)] px-4 py-2">
        <div className="tm-tab-bar overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tm-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-slide-up">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="sky" />
              <MetricCard title="Active" value={stats.activeEmployees} icon={Users} color="success" trend={{ value: 2.4, positive: true }} />
              <MetricCard title="On Leave" value={stats.onLeaveEmployees} icon={Users} color="warning" />
              <MetricCard title="Branches" value={stats.totalBranches} icon={MapPin} color="purple" />
              <MetricCard title="Monthly Payroll" value={`\u20A6${(stats.totalPayrollCost / 1000000).toFixed(1)}M`} icon={Wallet} color="sky" trend={{ value: 5.2, positive: true }} />
              <MetricCard title="Pending Approvals" value={stats.pendingRequests} icon={ClipboardCheck} color={stats.pendingRequests > 0 ? 'warning' : 'success'} />
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="tm-section-title">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setActiveTab('branches'); }} className="tm-card p-4 text-left tm-card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="w-10 h-10 rounded-lg bg-[var(--tm-purple-light)] flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-[var(--tm-purple)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">Create Branch</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">Add a new office location</p>
                </button>
                <button onClick={() => { setActiveTab('employees'); }} className="tm-card p-4 text-left tm-card-hover animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <div className="w-10 h-10 rounded-lg bg-[var(--tm-sky-light)] flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-[var(--tm-sky-main)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">Add Employee</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">Onboard new staff</p>
                </button>
                <button onClick={() => { setActiveTab('payroll'); }} className="tm-card p-4 text-left tm-card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="w-10 h-10 rounded-lg bg-[var(--tm-success-light)] flex items-center justify-center mb-2">
                    <Wallet className="w-5 h-5 text-[var(--tm-success)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">Run Payroll</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">Process monthly salaries</p>
                </button>
                <button onClick={() => { setActiveTab('approvals'); }} className="tm-card p-4 text-left tm-card-hover animate-slide-up" style={{ animationDelay: '0.25s' }}>
                  <div className="w-10 h-10 rounded-lg bg-[var(--tm-warning-light)] flex items-center justify-center mb-2">
                    <ClipboardCheck className="w-5 h-5 text-[var(--tm-warning)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">Review Approvals</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">{stats.pendingRequests} pending requests</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="tm-section-title">Recent Activity</h3>
              <div className="tm-card p-4 space-y-3">
                {[
                  { action: 'Payroll Processed', detail: 'June 2026 payroll completed for 42 employees', time: '2 days ago', color: 'sky' },
                  { action: 'Employee Added', detail: 'Chioma Eze joined as Admin Intern', time: '5 days ago', color: 'success' },
                  { action: 'Leave Approved', detail: 'Amara Obi - 90 days maternity leave', time: '10 days ago', color: 'purple' },
                  { action: 'Bonus Added', detail: 'Chinedu Okafor received performance bonus', time: '15 days ago', color: 'success' },
                  { action: 'Warning Issued', detail: 'Bola Tinubu - data security violation', time: '2 days ago', color: 'danger' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-[var(--tm-border-light)] last:border-0 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.color === 'sky' ? 'bg-[var(--tm-sky-main)]' :
                      activity.color === 'success' ? 'bg-[var(--tm-success)]' :
                      activity.color === 'purple' ? 'bg-[var(--tm-purple)]' :
                      'bg-[var(--tm-danger)]'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--tm-text-main)]">{activity.action}</p>
                      <p className="text-xs text-[var(--tm-text-muted)]">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-[var(--tm-text-muted)] flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── BRANCHES TAB ─── */}
        {activeTab === 'branches' && (
          <div className="space-y-4 animate-slide-up">
            {branches.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--tm-text-muted)]">{branches.length} branch{branches.length !== 1 ? 'es' : ''}</p>
                </div>
                <div className="space-y-3">
                  {branches.map(branch => (
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
              className="tm-fab"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* ─── EMPLOYEES TAB ─── */}
        {activeTab === 'employees' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-search-bar">
              <Search className="w-4 h-4 text-[var(--tm-text-muted)]" />
              <input 
                type="text" 
                className="tm-search-input" 
                placeholder="Search employees..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {filteredEmployees.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--tm-text-muted)]">{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}</p>
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
              className="tm-fab"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* ─── PAYROLL TAB ─── */}
        {activeTab === 'payroll' && (
          <div className="space-y-4 animate-slide-up">
            {payrolls.length > 0 ? (
              <div className="space-y-3">
                {payrolls.map(payroll => (
                  <div key={payroll.id} className="tm-card p-4 cursor-pointer tm-card-hover" onClick={() => navigate(`/payroll-pro/payroll/${payroll.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-[var(--tm-text-main)]">{payroll.name}</h3>
                        <p className="text-xs text-[var(--tm-text-muted)]">{new Date(payroll.payPeriodStart).toLocaleDateString()} - {new Date(payroll.payPeriodEnd).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge status={payroll.status} size="sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--tm-border-light)]">
                      <div>
                        <p className="text-xs text-[var(--tm-text-muted)]">Employees</p>
                        <p className="text-sm font-bold text-[var(--tm-text-main)]">{payroll.totalEmployees}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--tm-text-muted)]">Gross</p>
                        <p className="text-sm font-bold text-[var(--tm-text-main)]">&#8358;{(payroll.totalGrossSalary / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--tm-text-muted)]">Net</p>
                        <p className="text-sm font-bold text-[var(--tm-sky-dark)]">&#8358;{(payroll.totalNetSalary / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="payroll" actionLabel="Run Payroll" onAction={() => {}} />
            )}
            <button className="tm-fab">
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* ─── APPROVALS TAB ─── */}
        {activeTab === 'approvals' && (
          <div className="space-y-4 animate-slide-up">
            {pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--tm-text-muted)]">{pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? 's' : ''}</p>
                {pendingApprovals.map(approval => (
                  <ApprovalCard 
                    key={approval.id} 
                    approval={approval}
                    onApprove={() => {}}
                    onReject={() => {}}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="approvals" />
            )}
          </div>
        )}

        {/* ─── REPORTS TAB ─── */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-slide-up">
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'Payroll Summary', icon: Wallet, color: 'sky' as const, desc: 'Monthly breakdown' },
                { title: 'Salary Trends', icon: BarChart3, color: 'success' as const, desc: '6-month analysis' },
                { title: 'Employee Growth', icon: Users, color: 'purple' as const, desc: 'Hiring metrics' },
                { title: 'Leave Reports', icon: ClipboardCheck, color: 'warning' as const, desc: 'Leave utilization' },
              ].map((report, i) => (
                <div key={i} className="tm-card p-4 text-center tm-card-hover cursor-pointer animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    report.color === 'sky' ? 'bg-[var(--tm-sky-light)]' :
                    report.color === 'success' ? 'bg-[var(--tm-success-light)]' :
                    report.color === 'purple' ? 'bg-[var(--tm-purple-light)]' :
                    'bg-[var(--tm-warning-light)]'
                  }`}>
                    <report.icon className={`w-5 h-5 ${
                      report.color === 'sky' ? 'text-[var(--tm-sky-main)]' :
                      report.color === 'success' ? 'text-[var(--tm-success)]' :
                      report.color === 'purple' ? 'text-[var(--tm-purple)]' :
                      'text-[var(--tm-warning)]'
                    }`} />
                  </div>
                  <p className="text-xs font-bold text-[var(--tm-text-main)]">{report.title}</p>
                  <p className="text-[0.65rem] text-[var(--tm-text-muted)]">{report.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-card divide-y divide-[var(--tm-border-light)]">
              {[
                { label: 'Company Settings', desc: 'Name, address, contact info' },
                { label: 'Payroll Settings', desc: 'Pay day, currency, auto-payroll' },
                { label: 'Approval Workflow', desc: 'Configure approval chains' },
                { label: 'Role Management', desc: 'Define roles and permissions' },
                { label: 'Branch Settings', desc: 'Manage branch configurations' },
                { label: 'Employee Rules', desc: 'Leave policies, probation periods' },
              ].map((setting, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--tm-border-light)]/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-[var(--tm-text-main)]">{setting.label}</p>
                    <p className="text-xs text-[var(--tm-text-muted)]">{setting.desc}</p>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[var(--tm-text-muted)] rotate-180" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
