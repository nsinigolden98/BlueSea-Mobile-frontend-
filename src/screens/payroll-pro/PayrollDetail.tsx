import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Wallet, Users, Check, Clock } from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';
import { payrollRecords } from '@/mocks/payroll-data';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

export default function PayrollDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { payrollId } = useParams<{ payrollId: string }>();
  const navigate = useNavigate();
  
  const payroll = payrollRecords.find(p => p.id === payrollId);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Universal Design System Theme & Variable Mapping Layer */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tm-text-main: #0f172a; /* slate-900 */
          --tm-text-muted: #475569; /* slate-600 */
          --tm-border: #e2e8f0; /* slate-200 */
          --tm-success: #16a34a; /* emerald-600 */
          --tm-danger: #dc2626; /* red-600 */
        }
        .dark {
          --tm-text-main: #f1f5f9; /* slate-100 */
          --tm-text-muted: #94a3b8; /* slate-400 */
          --tm-border: rgba(255, 255, 255, 0.08); /* white/8 */
          --tm-success: #4ade80; /* emerald-400 */
          --tm-danger: #f87171; /* red-400 */
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
            title={payroll ? payroll.name : "Payroll Detail"} 
            subtitle="Payroll Processing & Verification"  
            onMenuClick={() => setSidebarOpen(true)}  
          />  
        </div>

        {/* Unified spacing content viewport wrapper */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">  
          <div className="max-w-4xl mx-auto space-y-5">  

            {/* Handle missing data gracefully within global layout context */}
            {!payroll ? (
              <div className="flex items-center justify-center py-12">
                <EmptyState 
                  type="general" 
                  title="Payroll Not Found" 
                  actionLabel="Go Back" 
                  onAction={() => navigate(-1)} 
                />
              </div>
            ) : (
              <>
                {/* Visual Demarcation Header Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Payroll
                  </button>
                  
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm self-start sm:self-auto">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                      {payroll.name}
                    </span>
                    <StatusBadge status={payroll.status} size="sm" />
                  </div>
                </div>

                {/* Summary Financial Metric Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-slide-up">
                  <div className="text-center mb-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Net Payout</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">
                      &#8358;{payroll.status === 'draft' ? '0' : payroll.totalNetSalary.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gross</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">&#8358;{payroll.totalGrossSalary.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Bonuses</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+&#8358;{payroll.totalBonuses.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Deductions</p>
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">-&#8358;{payroll.totalDeductions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Core Parameters Specification Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm animate-slide-up">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Payroll Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-400">Pay Period</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{new Date(payroll.payPeriodStart).toLocaleDateString()} - {new Date(payroll.payPeriodEnd).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-400">Pay Date</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{new Date(payroll.payDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-400">Total Employees</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        {payroll.totalEmployees}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-400">Type</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{payroll.type}</span>
                    </div>
                    {payroll.processedBy && (
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/60">
                        <span className="text-slate-600 dark:text-slate-400">Processed By</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{payroll.processedBy}</span>
                      </div>
                    )}
                    {payroll.approvedBy && (
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-600 dark:text-slate-400">Approved By</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{payroll.approvedBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Status Timeline Tracking Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-slide-up">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-4">Processing Status</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Draft Created', done: true, time: '3 days ago' },
                      { label: 'Pending Approval', done: payroll.status !== 'draft', time: payroll.status !== 'draft' ? '2 days ago' : 'Waiting' },
                      { label: 'Approved', done: ['approved', 'processing', 'completed'].includes(payroll.status), time: payroll.approvedAt ? new Date(payroll.approvedAt).toLocaleDateString() : 'Pending' },
                      { label: 'Processing', done: ['processing', 'completed'].includes(payroll.status), time: payroll.processedAt ? new Date(payroll.processedAt).toLocaleDateString() : 'Pending' },
                      { label: 'Completed', done: payroll.status === 'completed', time: payroll.status === 'completed' ? 'Done' : 'Pending' },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                          step.done ? 'bg-emerald-500 dark:bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}>
                          {step.done ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0 border-b border-slate-100 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0">
                          <p className={`text-sm font-bold transition-colors ${step.done ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>{step.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submission CTA Block */}
                {payroll.status === 'draft' && (
                  <div className="flex gap-3 pt-2 animate-slide-up">
                    <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-sky-500/10">
                      <Check className="w-5 h-5" />
                      Submit for Approval
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>  
      </div>
    </div>
  );
}