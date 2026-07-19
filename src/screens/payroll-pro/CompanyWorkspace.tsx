import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, Building2, Users, MapPin, Wallet, 
  ClipboardCheck, BarChart3, Settings, Plus, Search 
} from 'lucide-react';
import { useCompany } from '@/hooks/usePayrollPro';
import MetricCard from '@/components/payroll-pro/MetricCard';
import EmployeeCard from '@/components/payroll-pro/EmployeeCard';
import BranchCard from '@/components/payroll-pro/BranchCard';
import ApprovalCard from '@/components/payroll-pro/ApprovalCard';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';
import { Sidebar, Header } from '@/components/ui-custom';

type Tab = 'overview' | 'branches' | 'employees' | 'payroll' | 'approvals' | 'reports' | 'settings';

export default function CompanyWorkspace() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { company, employees, branches, payrolls, pendingApprovals, stats } = useCompany(companyId || '');

  if (!company) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Company registry node could not be resolved.</p>
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
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Universal Design System Theme & Variable Mapping Layer */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tm-bg: #ffffff;
          --tm-text-main: #0f172a; /* slate-900 */
          --tm-text-muted: #475569; /* slate-600 */
          --tm-border: #e2e8f0; /* slate-200 */
          --tm-border-light: #f1f5f9; /* slate-100 */
          --tm-sky-main: #0ea5e9;
          --tm-sky-dark: #0284c7;
          --tm-sky-light: #e0f2fe;
          --tm-success: #16a34a;
          --tm-success-light: #dcfce7;
          --tm-warning: #d97706;
          --tm-warning-light: #fef3c7;
          --tm-purple: #9333ea;
          --tm-purple-light: #f3e8ff;
          --tm-danger: #dc2626;
        }
        .dark {
          --tm-bg: #0f172a; /* slate-900 */
          --tm-text-main: #f1f5f9; /* slate-100 */
          --tm-text-muted: #94a3b8; /* slate-400 */
          --tm-border: rgba(255, 255, 255, 0.08); /* white/8 */
          --tm-border-light: rgba(255, 255, 255, 0.04);
          --tm-sky-light: rgba(14, 165, 233, 0.15);
          --tm-success-light: rgba(22, 163, 74, 0.15);
          --tm-warning-light: rgba(217, 119, 6, 0.15);
          --tm-purple-light: rgba(147, 51, 234, 0.15);
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* Global Sidebar component integration */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title={company.name} 
            subtitle="Corporate Infrastructure Workspace" 
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* Structural Navigation Context Anchor Row */}
        <div className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-sky-500/10">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{company.name}</span>
                <StatusBadge status={company.verification.status} size="sm" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{company.address}</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/payroll-pro')} 
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Hub Root
          </button>
        </div>

        {/* Horizontal Sticky Sub-Tab Nav Bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
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

        {/* Primary Workspace Tab Panel Viewport Content Frame */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide max-w-4xl w-full mx-auto pb-24 z-10">
          
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-slide-up">
              {/* Core Corporate Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                <MetricCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="sky" />
                <MetricCard title="Active Capacity" value={stats.activeEmployees} icon={Users} color="success" trend={{ value: 2.4, positive: true }} />
                <MetricCard title="On Leave" value={stats.onLeaveEmployees} icon={Users} color="warning" />
                <MetricCard title="Operating Branches" value={stats.totalBranches} icon={MapPin} color="purple" />
                <MetricCard title="Monthly Allocation" value={`₦${(stats.totalPayrollCost / 1000000).toFixed(1)}M`} icon={Wallet} color="sky" trend={{ value: 5.2, positive: true }} />
                <MetricCard title="Pending Review" value={stats.pendingRequests} icon={ClipboardCheck} color={stats.pendingRequests > 0 ? 'warning' : 'success'} />
              </div>

              {/* Fast-Track Actions Hub */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3">Workspace Controls</h3>
                <div className="grid grid-cols-2 gap-3.5">
                  <button onClick={() => setActiveTab('branches')} className="flex flex-col items-start text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:shadow-sm group">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 border border-purple-100 dark:border-transparent">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Create Branch</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Map new operating facility nodes.</span>
                  </button>

                  <button onClick={() => setActiveTab('employees')} className="flex flex-col items-start text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:shadow-sm group">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 border border-sky-100 dark:border-transparent">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Onboard Employee</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Register new staff resources.</span>
                  </button>

                  <button onClick={() => setActiveTab('payroll')} className="flex flex-col items-start text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:shadow-sm group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-100 dark:border-transparent">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Run Payroll Engine</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Compile monthly salary workflows.</span>
                  </button>

                  <button onClick={() => setActiveTab('approvals')} className="flex flex-col items-start text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:shadow-sm group">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-100 dark:border-transparent">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Review Approvals</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.pendingRequests} records requiring verification.</span>
                  </button>
                </div>
              </div>

              {/* Historic Security Audit & Activity Logs */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3">Recent Ledger Activity</h3>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-sm">
                  {[
                    { action: 'Payroll Processed', detail: 'June 2026 payroll completed for 42 employees', time: '2 days ago', color: 'sky' },
                    { action: 'Employee Added', detail: 'Chioma Eze joined as Admin Intern', time: '5 days ago', color: 'success' },
                    { action: 'Leave Approved', detail: 'Amara Obi - 90 days maternity leave', time: '10 days ago', color: 'purple' },
                    { action: 'Bonus Added', detail: 'Chinedu Okafor received performance bonus', time: '15 days ago', color: 'success' },
                    { action: 'Warning Issued', detail: 'System flag - internal operational rule audit notice', time: '20 days ago', color: 'danger' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        activity.color === 'sky' ? 'bg-sky-500' :
                        activity.color === 'success' ? 'bg-emerald-500' :
                        activity.color === 'purple' ? 'bg-purple-500' :
                        'bg-rose-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{activity.action}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{activity.detail}</p>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex-shrink-0">{activity.time}</span>
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
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">{branches.length} Registered Node{branches.length !== 1 ? 's' : ''}</p>
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
              
              {/* Modern Standardized Floating Action Trigger Anchor */}
              <button 
                onClick={() => navigate(`/payroll-pro/company/${companyId}/create-branch`)}
                className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/20 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── EMPLOYEES TAB ─── */}
          {activeTab === 'employees' && (
            <div className="space-y-4 animate-slide-up">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm" 
                  placeholder="Filter personnel roster logs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredEmployees.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1">{filteredEmployees.length} Matching Personnel Record{filteredEmployees.length !== 1 ? 's' : ''}</p>
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
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── PAYROLL TAB ─── */}
          {activeTab === 'payroll' && (
            <div className="space-y-4 animate-slide-up">
              {payrolls.length > 0 ? (
                <div className="space-y-3">
                  {payrolls.map(payroll => (
                    <div 
                      key={payroll.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-sky-500/30 hover:shadow-sm transition-all" 
                      onClick={() => navigate(`/payroll-pro/payroll/${payroll.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{payroll.name}</h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {new Date(payroll.payPeriodStart).toLocaleDateString()} — {new Date(payroll.payPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                        <StatusBadge status={payroll.status} size="sm" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Staff</p>
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{payroll.totalEmployees}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Gross Aggregate</p>
                          <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">₦{(payroll.totalGrossSalary / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Net Disbursed</p>
                          <p className="text-xs font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">₦{(payroll.totalNetSalary / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState type="payroll" actionLabel="Run Payroll" onAction={() => {}} />
              )}
              
              <button className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/20 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── APPROVALS TAB ─── */}
          {activeTab === 'approvals' && (
            <div className="space-y-4 animate-slide-up">
              {pendingApprovals.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] px-1">
                    {pendingApprovals.length} Pipeline Item{pendingApprovals.length !== 1 ? 's' : ''} Pending Action
                  </p>
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
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { title: 'Payroll Summary', icon: Wallet, color: 'sky', desc: 'Monthly breakdown logs' },
                  { title: 'Salary Trends', icon: BarChart3, color: 'success', desc: '6-month rolling analysis' },
                  { title: 'Employee Growth', icon: Users, color: 'purple', desc: 'Organizational headcount' },
                  { title: 'Leave Reports', icon: ClipboardCheck, color: 'warning', desc: 'Utilization balance history' },
                ].map((report, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center hover:border-sky-500/30 hover:shadow-sm transition-all cursor-pointer group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                      report.color === 'sky' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' :
                      report.color === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' :
                      report.color === 'purple' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600' :
                      'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                    }`}>
                      <report.icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">{report.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{report.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-slide-up">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-sm">
                {[
                  { label: 'Company Settings', desc: 'Core name profiles, addresses, and tax identifiers' },
                  { label: 'Payroll Settings', desc: 'Recurrent distribution targets, currencies, and integrations' },
                  { label: 'Approval Workflow', desc: 'Establish chain-of-command authorization nodes' },
                  { label: 'Role Management', desc: 'Configure security profiles and ACL scopes' },
                  { label: 'Branch Settings', desc: 'Establish structural operational defaults for branches' },
                  { label: 'Employee Rules', desc: 'Configure time-off matrices, accrual policies, and filters' },
                ].map((setting, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <div className="pr-4">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">{setting.label}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{setting.desc}</p>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-all rotate-180 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}