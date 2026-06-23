import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Wallet, TreePine, Star, FileText, Clock, AlertTriangle, ThumbsUp, MessageSquare } from 'lucide-react';
import { useEmployee } from '@/hooks/usePayrollPro';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

type Tab = 'employment' | 'payroll' | 'leave' | 'performance' | 'documents' | 'timeline';

export default function EmployeeProfile() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('employment');
  const { employee, bonuses, deductions, leaves, performance } = useEmployee(employeeId || '');

  if (!employee) {
    return (
      <div className="tm-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--tm-text-muted)]">Employee not found</p>
          <button onClick={() => navigate(-1)} className="tm-btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  const initials = employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase();

  const tabs: { key: Tab; label: string; icon: typeof Briefcase }[] = [
    { key: 'employment', label: 'Employment', icon: Briefcase },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
    { key: 'leave', label: 'Leave', icon: TreePine },
    { key: 'performance', label: 'Performance', icon: Star },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'timeline', label: 'Timeline', icon: Clock },
  ];

  const performanceIcons = {
    review: <Star className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    commendation: <ThumbsUp className="w-4 h-4" />,
    note: <MessageSquare className="w-4 h-4" />,
  };

  const performanceColors = {
    review: 'bg-[var(--tm-sky-light)] text-[var(--tm-sky-main)]',
    warning: 'bg-[var(--tm-danger-light)] text-[var(--tm-danger)]',
    commendation: 'bg-[var(--tm-success-light)] text-[var(--tm-success)]',
    note: 'bg-[var(--tm-warning-light)] text-[var(--tm-warning)]',
  };

  return (
    <div className="tm-page">
      {/* Header */}
      <div className="tm-nav-header px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors mb-3">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-4">
          <div className="tm-avatar tm-avatar-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-extrabold text-[var(--tm-text-main)] truncate">{employee.fullName}</h1>
              <StatusBadge status={employee.status} size="sm" />
            </div>
            <p className="text-sm text-[var(--tm-text-muted)]">{employee.role.replace('_', ' ')} · {employee.department.replace('_', ' ')}</p>
            <p className="text-xs text-[var(--tm-sky-dark)] font-bold mt-0.5">{employee.employeeId}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[140px] z-30 bg-[var(--tm-bg)] px-4 py-2">
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
        {/* ─── EMPLOYMENT TAB ─── */}
        {activeTab === 'employment' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-card p-4 space-y-1">
              <DetailRow label="Employee ID" value={employee.employeeId} />
              <DetailRow label="Department" value={employee.department.replace('_', ' ')} />
              <DetailRow label="Role" value={employee.role.replace('_', ' ')} />
              <DetailRow label="Employment Type" value={employee.employmentType.replace('_', '-')} />
              <DetailRow label="Employment Date" value={new Date(employee.employmentDate).toLocaleDateString()} />
              <DetailRow label="Branch" value={employee.branchName} />
              {employee.managerName && <DetailRow label="Manager" value={employee.managerName} />}
              <DetailRow label="Status" value={<StatusBadge status={employee.status} size="sm" />} />
            </div>

            <div className="tm-card p-4">
              <h3 className="text-sm font-bold text-[var(--tm-text-main)] mb-3">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[var(--tm-text-muted)]" />
                  <span className="text-[var(--tm-text-main)]">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[var(--tm-text-muted)]" />
                    <span className="text-[var(--tm-text-main)]">{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[var(--tm-text-muted)]" />
                  <span className="text-[var(--tm-text-main)]">{employee.branchName}</span>
                </div>
              </div>
            </div>

            <div className="tm-card p-4">
              <h3 className="text-sm font-bold text-[var(--tm-text-main)] mb-3">Bank Details</h3>
              <div className="space-y-1">
                <DetailRow label="Bank Name" value={employee.bankName || 'Not set'} />
                <DetailRow label="Account Number" value={employee.bankAccountNumber || 'Not set'} />
                <DetailRow label="Account Name" value={employee.bankAccountName || 'Not set'} />
              </div>
            </div>

            <div className="tm-card p-4">
              <h3 className="text-sm font-bold text-[var(--tm-text-main)] mb-3">Government IDs</h3>
              <div className="space-y-1">
                <DetailRow label="Tax ID (TIN)" value={employee.taxId || 'Not set'} />
                <DetailRow label="Pension ID" value={employee.pensionId || 'Not set'} />
                <DetailRow label="NIN" value={employee.nin || 'Not set'} />
              </div>
            </div>
          </div>
        )}

        {/* ─── PAYROLL TAB ─── */}
        {activeTab === 'payroll' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-card p-4 text-center">
              <p className="text-xs text-[var(--tm-text-muted)] mb-1">Current Monthly Salary</p>
              <p className="text-3xl font-black text-[var(--tm-text-main)]">&#8358;{employee.salary.toLocaleString()}</p>
              <p className="text-xs text-[var(--tm-text-muted)] mt-1">{employee.employmentType.replace('_', '-')} · {employee.department.replace('_', ' ')}</p>
            </div>

            {bonuses.length > 0 && (
              <div>
                <h3 className="tm-section-title">Bonuses ({bonuses.length})</h3>
                <div className="space-y-2">
                  {bonuses.map(bonus => (
                    <div key={bonus.id} className="tm-card p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[var(--tm-text-main)] capitalize">{bonus.type.replace('_', ' ')} Bonus</p>
                        <p className="text-xs text-[var(--tm-text-muted)]">{bonus.reason}</p>
                      </div>
                      <span className="text-sm font-bold text-[var(--tm-success)]">+&#8358;{bonus.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deductions.length > 0 && (
              <div>
                <h3 className="tm-section-title">Deductions ({deductions.length})</h3>
                <div className="space-y-2">
                  {deductions.map(ded => (
                    <div key={ded.id} className="tm-card p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[var(--tm-text-main)] capitalize">{ded.type.replace('_', ' ')}</p>
                        <p className="text-xs text-[var(--tm-text-muted)]">{ded.reason}</p>
                      </div>
                      <span className="text-sm font-bold text-[var(--tm-danger)]">-&#8358;{ded.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bonuses.length === 0 && deductions.length === 0 && (
              <EmptyState type="general" title="No Payroll Adjustments" description="No bonuses or deductions recorded yet." />
            )}
          </div>
        )}

        {/* ─── LEAVE TAB ─── */}
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

            {leaves.length > 0 ? (
              <div className="space-y-2">
                <h3 className="tm-section-title">Leave History</h3>
                {leaves.map(leave => (
                  <div key={leave.id} className="tm-card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[var(--tm-text-main)] capitalize">{leave.type.replace('_', ' ')} Leave</span>
                      <StatusBadge status={leave.status} size="sm" />
                    </div>
                    <p className="text-xs text-[var(--tm-text-muted)] mb-1">{leave.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-[var(--tm-text-muted)]">
                      <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                      <span className="font-bold">{leave.days} days</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="general" title="No Leave Records" description="No leave requests found." />
            )}
          </div>
        )}

        {/* ─── PERFORMANCE TAB ─── */}
        {activeTab === 'performance' && (
          <div className="space-y-3 animate-slide-up">
            {performance.length > 0 ? (
              performance.map(record => (
                <div key={record.id} className="tm-card p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${performanceColors[record.type]}`}>
                      {performanceIcons[record.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-[var(--tm-text-main)] capitalize">{record.type}</h3>
                        {record.rating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < record.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[var(--tm-text-main)] font-semibold">{record.title}</p>
                      <p className="text-xs text-[var(--tm-text-muted)] mt-1">{record.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[var(--tm-text-muted)]">
                        <span>By {record.createdByName}</span>
                        <span>·</span>
                        <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState type="general" title="No Performance Records" description="No reviews, warnings, or commendations yet." />
            )}
          </div>
        )}

        {/* ─── DOCUMENTS TAB ─── */}
        {activeTab === 'documents' && (
          <div className="animate-slide-up">
            {employee.documents.length > 0 ? (
              <div className="space-y-2">
                {employee.documents.map(doc => (
                  <div key={doc.id} className="tm-card p-3 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[var(--tm-sky-main)]" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[var(--tm-text-main)]">{doc.name}</p>
                      <p className="text-xs text-[var(--tm-text-muted)] capitalize">{doc.type.replace('_', ' ')} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="documents" actionLabel="Upload Document" onAction={() => {}} />
            )}
          </div>
        )}

        {/* ─── TIMELINE TAB ─── */}
        {activeTab === 'timeline' && (
          <div className="animate-slide-up">
            {employee.timeline.length > 0 ? (
              <div className="tm-card p-4">
                {employee.timeline.map((event, i) => (
                  <div key={event.id} className={`tm-timeline-item ${i === employee.timeline.length - 1 ? '' : ''}`}>
                    <div className="tm-timeline-dot">
                      <Clock className="w-3 h-3 text-[var(--tm-sky-main)]" />
                    </div>
                    <div className="tm-timeline-content">
                      <p className="tm-timeline-title">{event.title}</p>
                      <p className="text-xs text-[var(--tm-text-muted)] mt-0.5">{event.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="tm-timeline-date">{new Date(event.date).toLocaleDateString()}</span>
                        <span className="text-xs text-[var(--tm-text-muted)]">by {event.actor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="general" title="No Timeline Events" description="Employee journey will appear here." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="tm-detail-row">
      <span className="tm-detail-label">{label}</span>
      <span className="tm-detail-value">{value}</span>
    </div>
  );
}
