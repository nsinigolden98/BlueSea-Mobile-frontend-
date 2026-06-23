import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Building2, Briefcase, MapPin, Calendar, Wallet, TreePine, FileText, Shield, AlertTriangle, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { employees, bonuses, deductions, leaveRequests, performanceRecords } from '@/mocks/payroll-data';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

type Tab = 'overview' | 'payroll' | 'leave' | 'performance' | 'documents' | 'verification';

export default function EmployeePortal() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Find the current user's employment at this company
  const employee = employees.find(e => e.userId === 'user_001' && e.companyId === companyId) || 
                   employees.find(e => e.companyId === companyId);

  if (!employee) {
    return (
      <div className="tm-page flex items-center justify-center">
        <EmptyState type="general" title="No Employment Found" description="You don't have an employment record at this company." actionLabel="Go Back" onAction={() => navigate(-1)} />
      </div>
    );
  }

  const empBonuses = bonuses.filter(b => b.employeeId === employee.id);
  const empDeductions = deductions.filter(d => d.employeeId === employee.id);
  const empLeaves = leaveRequests.filter(l => l.employeeId === employee.id);
  const empPerformance = performanceRecords.filter(p => p.employeeId === employee.id);


  const initials = employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'payroll', label: 'Payroll' },
    { key: 'leave', label: 'Leave' },
    { key: 'performance', label: 'Performance' },
    { key: 'documents', label: 'Documents' },
    { key: 'verification', label: 'Verification' },
  ];

  const totalBonuses = empBonuses.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.amount, 0);
  const totalDeductions = empDeductions.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0);
  const netSalary = employee.salary + totalBonuses - totalDeductions;

  const performanceIcons = {
    review: <Star className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    commendation: <ThumbsUp className="w-4 h-4" />,
    note: <MessageSquare className="w-4 h-4" />,
  };

  return (
    <div className="tm-page">
      <div className="tm-nav-header px-4 py-4">
        <button onClick={() => navigate('/payroll-pro')} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors mb-3">
          <ArrowLeft className="w-5 h-5" />
          Payroll Pro
        </button>
        <div className="flex items-center gap-4">
          <div className="tm-avatar tm-avatar-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-[var(--tm-text-main)] truncate">{employee.fullName}</h1>
            <p className="text-sm text-[var(--tm-text-muted)]">{employee.role.replace('_', ' ')} · {employee.department.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="sticky top-[140px] z-30 bg-[var(--tm-bg)] px-4 py-2">
        <div className="tm-tab-bar overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`tm-tab-btn ${activeTab === tab.key ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-card p-4 text-center">
              <p className="text-xs text-[var(--tm-text-muted)] mb-1">Current Monthly Salary</p>
              <p className="text-3xl font-black text-[var(--tm-text-main)]">&#8358;{employee.salary.toLocaleString()}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                <span className="text-[var(--tm-success)] font-bold">+&#8358;{totalBonuses.toLocaleString()} bonuses</span>
                <span className="text-[var(--tm-danger)] font-bold">-&#8358;{totalDeductions.toLocaleString()} deductions</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--tm-border)]">
                <p className="text-xs text-[var(--tm-text-muted)]">Net Take Home</p>
                <p className="text-xl font-black text-[var(--tm-sky-dark)]">&#8358;{netSalary.toLocaleString()}</p>
              </div>
            </div>

            <div className="tm-card p-4 space-y-3">
              <h3 className="text-sm font-bold text-[var(--tm-text-main)]">Employment Details</h3>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[var(--tm-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--tm-text-muted)]">Company</p>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">ABC Logistics Nigeria Ltd</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-[var(--tm-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--tm-text-muted)]">Position</p>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">{employee.role.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[var(--tm-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--tm-text-muted)]">Branch</p>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">{employee.branchName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[var(--tm-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--tm-text-muted)]">Employment Date</p>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">{new Date(employee.employmentDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('payroll')} className="tm-card p-4 text-center tm-card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Wallet className="w-6 h-6 text-[var(--tm-sky-main)] mx-auto mb-2" />
                <p className="text-xs font-bold">Salary History</p>
              </button>
              <button onClick={() => setActiveTab('leave')} className="tm-card p-4 text-center tm-card-hover animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <TreePine className="w-6 h-6 text-[var(--tm-success)] mx-auto mb-2" />
                <p className="text-xs font-bold">My Leave</p>
              </button>
              <button onClick={() => setActiveTab('documents')} className="tm-card p-4 text-center tm-card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <FileText className="w-6 h-6 text-[var(--tm-purple)] mx-auto mb-2" />
                <p className="text-xs font-bold">Documents</p>
              </button>
              <button onClick={() => setActiveTab('verification')} className="tm-card p-4 text-center tm-card-hover animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <Shield className="w-6 h-6 text-[var(--tm-warning)] mx-auto mb-2" />
                <p className="text-xs font-bold">Verification</p>
              </button>
            </div>
          </div>
        )}

        {/* PAYROLL TAB */}
        {activeTab === 'payroll' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-card p-4">
              <h3 className="text-sm font-bold mb-3">Salary Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Base Salary</span>
                  <span className="font-bold text-[var(--tm-text-main)]">&#8358;{employee.salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Total Bonuses</span>
                  <span className="font-bold text-[var(--tm-success)]">+&#8358;{totalBonuses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Total Deductions</span>
                  <span className="font-bold text-[var(--tm-danger)]">-&#8358;{totalDeductions.toLocaleString()}</span>
                </div>
                <div className="border-t border-[var(--tm-border)] pt-2 flex justify-between">
                  <span className="font-bold text-[var(--tm-text-main)]">Net Salary</span>
                  <span className="font-black text-[var(--tm-sky-dark)]">&#8358;{netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {empBonuses.length > 0 && (
              <div>
                <h3 className="tm-section-title">Bonuses</h3>
                {empBonuses.map(b => (
                  <div key={b.id} className="tm-card p-3 mb-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold capitalize">{b.type.replace('_', ' ')} Bonus</p>
                      <p className="text-xs text-[var(--tm-text-muted)]">{b.reason}</p>
                    </div>
                    <span className="text-sm font-bold text-[var(--tm-success)]">+&#8358;{b.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {empDeductions.length > 0 && (
              <div>
                <h3 className="tm-section-title">Deductions</h3>
                {empDeductions.map(d => (
                  <div key={d.id} className="tm-card p-3 mb-2 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold capitalize">{d.type.replace('_', ' ')}</p>
                      <p className="text-xs text-[var(--tm-text-muted)]">{d.reason}</p>
                    </div>
                    <span className="text-sm font-bold text-[var(--tm-danger)]">-&#8358;{d.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LEAVE TAB */}
        {activeTab === 'leave' && (
          <div className="space-y-4 animate-slide-up">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(employee.leaveBalance).map(([type, days]) => (
                <div key={type} className="tm-card p-3 text-center">
                  <p className="text-lg font-black text-[var(--tm-text-main)]">{days}</p>
                  <p className="text-[0.6rem] text-[var(--tm-text-muted)] uppercase font-bold">{type.replace('_', ' ')}</p>
                </div>
              ))}
            </div>

            {empLeaves.length > 0 ? (
              <div className="space-y-2">
                <h3 className="tm-section-title">Leave History</h3>
                {empLeaves.map(leave => (
                  <div key={leave.id} className="tm-card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold capitalize">{leave.type.replace('_', ' ')} Leave</span>
                      <StatusBadge status={leave.status} size="sm" />
                    </div>
                    <p className="text-xs text-[var(--tm-text-muted)]">{leave.reason}</p>
                    <p className="text-xs text-[var(--tm-text-muted)] mt-1">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="general" title="No Leave Records" description="You haven't taken any leave yet." />
            )}

            <button className="tm-btn-primary w-full">Request Leave</button>
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="space-y-3 animate-slide-up">
            {empPerformance.length > 0 ? (
              empPerformance.map(record => (
                <div key={record.id} className="tm-card p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      record.type === 'warning' ? 'bg-[var(--tm-danger-light)] text-[var(--tm-danger)]' :
                      record.type === 'commendation' ? 'bg-[var(--tm-success-light)] text-[var(--tm-success)]' :
                      'bg-[var(--tm-sky-light)] text-[var(--tm-sky-main)]'
                    }`}>
                      {performanceIcons[record.type]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--tm-text-main)]">{record.title}</p>
                      <p className="text-xs text-[var(--tm-text-muted)] mt-1">{record.description}</p>
                      {record.rating && (
                        <div className="flex items-center gap-0.5 mt-2">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < record.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState type="general" title="No Performance Records" description="No performance data available yet." />
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="animate-slide-up">
            {employee.documents.length > 0 ? (
              employee.documents.map(doc => (
                <div key={doc.id} className="tm-card p-3 flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-[var(--tm-sky-main)]" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{doc.name}</p>
                    <p className="text-xs text-[var(--tm-text-muted)] capitalize">{doc.type.replace('_', ' ')}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState type="documents" />
            )}
          </div>
        )}

        {/* VERIFICATION TAB */}
        {activeTab === 'verification' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-card p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--tm-success-light)] flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-[var(--tm-success)]" />
              </div>
              <h3 className="text-lg font-extrabold text-[var(--tm-text-main)] mb-1">Employment Verified</h3>
              <p className="text-xs text-[var(--tm-text-muted)] mb-4">Your employment is verified and can be shared</p>
              
              <div className="text-left space-y-3 bg-[var(--tm-bg)] rounded-xl p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Company</span>
                  <span className="font-bold text-[var(--tm-text-main)]">ABC Logistics Nigeria Ltd</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Position</span>
                  <span className="font-bold text-[var(--tm-text-main)]">{employee.role.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Department</span>
                  <span className="font-bold text-[var(--tm-text-main)]">{employee.department.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Branch</span>
                  <span className="font-bold text-[var(--tm-text-main)]">{employee.branchName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Employment Date</span>
                  <span className="font-bold text-[var(--tm-text-main)]">{new Date(employee.employmentDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Status</span>
                  <StatusBadge status={employee.status} size="sm" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--tm-text-muted)]">Verification Code</span>
                  <span className="font-mono font-bold text-[var(--tm-sky-dark)]">VER-2026-ABC-001</span>
                </div>
              </div>

              <button className="tm-btn-primary w-full mt-4">
                <Shield className="w-4 h-4" />
                Generate Verification Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
