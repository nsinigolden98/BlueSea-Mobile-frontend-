import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, Wallet, 
  TreePine, Star, FileText, Clock, AlertTriangle, ThumbsUp, MessageSquare 
} from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';
import { useEmployee } from '@/hooks/usePayrollPro';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

type Tab = 'employment' | 'payroll' | 'leave' | 'performance' | 'documents' | 'timeline';

export default function EmployeeProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('employment');
  const { employee, bonuses, deductions, leaves, performance } = useEmployee(employeeId || '');

  if (!employee) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
            <Header title="Profile Error" subtitle="Workforce Profile Registry" onMenuClick={() => setSidebarOpen(true)} />
          </div>
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-sm">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Employee record not found</p>
              <button 
                onClick={() => navigate(-1)} 
                className="mt-4 w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
              >
                Go Back
              </button>
            </div>
          </main>
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
    review: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30',
    warning: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30',
    commendation: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30',
    note: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30',
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Universal Contrast & Legacy Property Alignment Layer */}
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

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />  

      <div className="flex-1 flex flex-col h-full min-w-0 relative">  
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Employee Profile" 
            subtitle={`${employee.fullName} · Profile File`} 
            onMenuClick={() => setSidebarOpen(true)} 
          />  
        </div>

        {/* Profile Identity Context Section Bar */}
        <div className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center font-extrabold text-lg text-white shadow-sm flex-shrink-0">
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
              <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-wide mt-1 uppercase">{employee.employeeId}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all self-start sm:self-auto px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Roster
          </button>
        </div>

        {/* Tab Selection Row Framework Container */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 shrink-0">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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

        {/* Core Layout Data Rendering Window */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide pb-24 z-10">  
          <div className="max-w-4xl mx-auto">  
            
            {/* ─── EMPLOYMENT TAB ─── */}
            {activeTab === 'employment' && (
              <div className="space-y-4 animate-slide-up">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1 shadow-sm">
                  <DetailRow label="Employee ID" value={employee.employeeId} />
                  <DetailRow label="Department" value={employee.department.replace('_', ' ')} />
                  <DetailRow label="Role" value={employee.role.replace('_', ' ')} />
                  <DetailRow label="Employment Type" value={employee.employmentType.replace('_', '-')} />
                  <DetailRow label="Employment Date" value={new Date(employee.employmentDate).toLocaleDateString()} />
                  <DetailRow label="Branch" value={employee.branchName} />
                  {employee.managerName && <DetailRow label="Manager" value={employee.managerName} />}
                  <DetailRow label="Status" value={<StatusBadge status={employee.status} size="sm" />} />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3.5 px-0.5">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2.5 text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{employee.email}</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-2.5 text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{employee.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/40 rounded-xl">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{employee.branchName}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3 px-0.5">Bank Details</h3>
                  <div className="space-y-1">
                    <DetailRow label="Bank Name" value={employee.bankName || 'Not set'} />
                    <DetailRow label="Account Number" value={employee.bankAccountNumber || 'Not set'} />
                    <DetailRow label="Account Name" value={employee.bankAccountName || 'Not set'} />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3 px-0.5">Government IDs</h3>
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
              <div className="space-y-5 animate-slide-up">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Current Monthly Salary</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">₦{employee.salary.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 capitalize font-medium">{employee.employmentType.replace('_', '-')} · {employee.department.replace('_', ' ')}</p>
                </div>

                {bonuses.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Bonuses ({bonuses.length})</h3>
                    <div className="space-y-2.5">
                      {bonuses.map(bonus => (
                        <div key={bonus.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{bonus.type.replace('_', ' ')} Bonus</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{bonus.reason}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+₦{bonus.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {deductions.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Deductions ({deductions.length})</h3>
                    <div className="space-y-2.5">
                      {deductions.map(ded => (
                        <div key={ded.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{ded.type.replace('_', ' ')}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ded.reason}</p>
                          </div>
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">-₦{ded.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bonuses.length === 0 && deductions.length === 0 && (
                  <div className="py-6">
                    <EmptyState type="general" title="No Payroll Adjustments" description="No bonuses or deductions recorded yet." />
                  </div>
                )}
              </div>
            )}

            {/* ─── LEAVE TAB ─── */}
            {activeTab === 'leave' && (
              <div className="space-y-5 animate-slide-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(employee.leaveBalance).map(([type, days]) => (
                    <div key={type} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-sm">
                      <p className="text-xl font-black text-slate-900 dark:text-white">{days}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mt-1">{type.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>

                {leaves.length > 0 ? (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Leave History</h3>
                    <div className="space-y-3">
                      {leaves.map(leave => (
                        <div key={leave.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-4 mb-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{leave.type.replace('_', ' ')} Leave</span>
                            <StatusBadge status={leave.status} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">{leave.reason}</p>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{leave.days} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <EmptyState type="general" title="No Leave Records" description="No leave requests found." />
                  </div>
                )}
              </div>
            )}

            {/* ─── PERFORMANCE TAB ─── */}
            {activeTab === 'performance' && (
              <div className="space-y-3 animate-slide-up">
                {performance.length > 0 ? (
                  performance.map(record => (
                    <div key={record.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${performanceColors[record.type as keyof typeof performanceColors]}`}>
                          {performanceIcons[record.type as keyof typeof performanceIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 capitalize">{record.type}</h3>
                            {record.rating && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < record.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-900 dark:text-slate-100 font-extrabold">{record.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{record.description}</p>
                          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>By {record.createdByName}</span>
                            <span>·</span>
                            <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6">
                    <EmptyState type="general" title="No Performance Records" description="No reviews, warnings, or commendations yet." />
                  </div>
                )}
              </div>
            )}

            {/* ─── DOCUMENTS TAB ─── */}
            {activeTab === 'documents' && (
              <div className="animate-slide-up">
                {employee.documents.length > 0 ? (
                  <div className="space-y-2.5">
                    {employee.documents.map(doc => (
                      <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm">
                        <div className="w-9 h-9 bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400 border border-sky-100 dark:border-transparent rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize font-medium">{doc.type.replace('_', ' ')} · {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6">
                    <EmptyState type="documents" actionLabel="Upload Document" onAction={() => {}} />
                  </div>
                )}
              </div>
            )}

            {/* ─── TIMELINE TAB ─── */}
            {activeTab === 'timeline' && (
              <div className="animate-slide-up">
                {employee.timeline.length > 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
                    {employee.timeline.map((event) => (
                      <div key={event.id} className="flex gap-4 group relative last:pb-0 pb-1">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-500 dark:text-sky-400 border border-sky-100 dark:border-transparent flex items-center justify-center z-10">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 group-last:hidden my-1" />
                        </div>
                        <div className="flex-1 min-w-0 pb-4 border-b border-slate-100 dark:border-slate-800/60 group-last:border-0 group-last:pb-0">
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{event.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            <span className="text-sky-600 dark:text-sky-400 font-bold">{new Date(event.date).toLocaleDateString()}</span>
                            <span>·</span>
                            <span>by {event.actor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6">
                    <EmptyState type="general" title="No Timeline Events" description="Employee journey will appear here." />
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