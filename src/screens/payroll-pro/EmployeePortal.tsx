import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, Building2, Briefcase, MapPin, Calendar, Wallet, 
  TreePine, FileText, Shield, AlertTriangle, Star, ThumbsUp, MessageSquare 
} from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';
import { employees, bonuses, deductions, leaveRequests, performanceRecords } from '@/mocks/payroll-data';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

type Tab = 'overview' | 'payroll' | 'leave' | 'performance' | 'documents' | 'verification';

export default function EmployeePortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Find the current user's employment at this company
  const employee = employees.find(e => e.userId === 'user_001' && e.companyId === companyId) || 
                   employees.find(e => e.companyId === companyId);

  if (!employee) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
          <Header title="Access Panel" subtitle="Employee Access Verification" onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-2xl max-w-sm w-full shadow-sm">
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
      {/* Universal Component Variable Custom Mapping Layer */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tm-text-main: #0f172a;
          --tm-text-muted: #475569;
          --tm-border: #e2e8f0;
          --tm-success: #16a34a;
          --tm-danger: #dc2626;
        }
        .dark {
          --tm-text-main: #f1f5f9;
          --tm-text-muted: #94a3b8;
          --tm-border: rgba(255, 255, 255, 0.08);
          --tm-success: #4ade80;
          --tm-danger: #f87171;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />  

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />  

      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 transition-colors duration-300">  
        <Header  
          title="Employee Self-Service"  
          subtitle="Personal Workforce Dashboard"  
          onMenuClick={() => setSidebarOpen(true)}  
        />  

        {/* Global Action Registry & Identification Context Bar */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center font-extrabold text-lg text-white shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">{employee.fullName}</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 capitalize">
                {employee.role.replace('_', ' ')} · {employee.department.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/payroll-pro')} 
            className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors self-start sm:self-auto px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Payroll Pro
          </button>
        </div>

        {/* Uniform Subnavigation Controls */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 px-4 md:px-6">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.key 
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Display Port Container */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">  
          <div className="max-w-4xl mx-auto">  

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-slide-up">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Current Monthly Salary</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">&#8358;{employee.salary.toLocaleString()}</p>
                  
                  <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-transparent">
                      +&#8358;{totalBonuses.toLocaleString()} bonuses
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-transparent">
                      -&#8358;{totalDeductions.toLocaleString()} deductions
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Take Home</p>
                    <p className="text-xl font-black text-sky-600 dark:text-sky-400 mt-0.5">&#8358;{netSalary.toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-3.5 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-0.5 mb-1">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-transparent rounded-xl">
                      <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Company</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">ABC Logistics Nigeria Ltd</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-transparent rounded-xl">
                      <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Position</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate capitalize">{employee.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-transparent rounded-xl">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Branch</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{employee.branchName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-transparent rounded-xl">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Employment Date</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{new Date(employee.employmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => setActiveTab('payroll')} className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/70 dark:hover:bg-slate-900/70 border border-slate-200 dark:border-white/5 p-4 text-center rounded-2xl transition-all active:scale-95 shadow-sm">
                    <Wallet className="w-5 h-5 text-sky-500 dark:text-sky-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Salary History</p>
                  </button>
                  <button onClick={() => setActiveTab('leave')} className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/70 dark:hover:bg-slate-900/70 border border-slate-200 dark:border-white/5 p-4 text-center rounded-2xl transition-all active:scale-95 shadow-sm">
                    <TreePine className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">My Leave</p>
                  </button>
                  <button onClick={() => setActiveTab('documents')} className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/70 dark:hover:bg-slate-900/70 border border-slate-200 dark:border-white/5 p-4 text-center rounded-2xl transition-all active:scale-95 shadow-sm">
                    <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Documents</p>
                  </button>
                  <button onClick={() => setActiveTab('verification')} className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/70 dark:hover:bg-slate-900/70 border border-slate-200 dark:border-white/5 p-4 text-center rounded-2xl transition-all active:scale-95 shadow-sm">
                    <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Verification</p>
                  </button>
                </div>
              </div>
            )}

            {/* PAYROLL TAB */}
            {activeTab === 'payroll' && (
              <div className="space-y-5 animate-slide-up">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-3.5 px-0.5">Salary Breakdown</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-600 dark:text-slate-400">Base Salary</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">&#8358;{employee.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-600 dark:text-slate-400">Total Bonuses</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+&#8358;{totalBonuses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-slate-600 dark:text-slate-400">Total Deductions</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">-&#8358;{totalDeductions.toLocaleString()}</span>
                    </div>
                    <div className="pt-2.5 flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-slate-100">Net Salary</span>
                      <span className="font-black text-sky-600 dark:text-sky-400 text-base">&#8358;{netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {empBonuses.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Bonuses</h3>
                    {empBonuses.map(b => (
                      <div key={b.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">{b.type.replace('_', ' ')} Bonus</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.reason}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+&#8358;{b.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {empDeductions.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Deductions</h3>
                    {empDeductions.map(d => (
                      <div key={d.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">{d.type.replace('_', ' ')}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.reason}</p>
                        </div>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">-&#8358;{d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LEAVE TAB */}
            {activeTab === 'leave' && (
              <div className="space-y-5 animate-slide-up">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(employee.leaveBalance).map(([type, days]) => (
                    <div key={type} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-3.5 text-center shadow-sm">
                      <p className="text-xl font-black text-slate-900 dark:text-white">{days}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mt-1">{type.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>

    {empLeaves.length > 0 ? (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Leave History</h3>
                    <div className="space-y-3">
                      {empLeaves.map(leave => (
                        <div key={leave.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-4 mb-1.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">{leave.type.replace('_', ' ')} Leave</span>
                            <StatusBadge status={leave.status} size="sm" />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{leave.reason}</p>
                          <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 pt-2 border-t border-slate-100 dark:border-white/5">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <EmptyState type="general" title="No Leave Records" description="You haven't taken any leave yet." />
                  </div>
                )}

                <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-sm mt-2">
                  Request Leave
                </button>
              </div>
            )}

            {/* PERFORMANCE TAB */}
            {activeTab === 'performance' && (
              <div className="space-y-3 animate-slide-up">
                {empPerformance.length > 0 ? (
                  empPerformance.map(record => (
                    <div key={record.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          record.type === 'warning' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-transparent' :
                          record.type === 'commendation' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-transparent' :
                          'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-transparent'
                        }`}>
                          {performanceIcons[record.type as keyof typeof performanceIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{record.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{record.description}</p>
                          {record.rating && (
                            <div className="flex items-center gap-0.5 mt-2.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < record.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4">
                    <EmptyState type="general" title="No Performance Records" description="No performance data available yet." />
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="animate-slide-up">
                {employee.documents.length > 0 ? (
                  <div className="space-y-2.5">
                    {employee.documents.map(doc => (
                      <div key={doc.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm">
                        <div className="w-9 h-9 bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400 border border-sky-100 dark:border-transparent rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize font-medium">{doc.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4">
                    <EmptyState type="documents" />
                  </div>
                )}
              </div>
            )}

            {/* VERIFICATION TAB */}
            {activeTab === 'verification' && (
              <div className="space-y-4 animate-slide-up">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-transparent flex items-center justify-center mx-auto mb-3.5 shadow-inner">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">Employment Verified</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Your secure credentials are ready to be exported</p>
                  
                  <div className="text-left space-y-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-inner">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Company</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">ABC Logistics Nigeria Ltd</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Position</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{employee.role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Department</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">{employee.department.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Branch</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{employee.branchName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Employment Date</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{new Date(employee.employmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</span>
                      <StatusBadge status={employee.status} size="sm" />
                    </div>
                    <div className="flex justify-between items-center py-1.5 last:border-0">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Verification Code</span>
                      <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">VER-2026-ABC-001</span>
                    </div>
                  </div>

                  <button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm mt-5">
                    <Shield className="w-4 h-4" />
                    Generate Verification Letter
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>  
      </div>
    </div>
  );
}