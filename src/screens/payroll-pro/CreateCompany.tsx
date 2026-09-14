import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, FileText, Send } from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';
import { useForm } from '@/hooks/usePayrollPro';
import { cn } from '@/lib/utils';

type Step = 'info' | 'review' | 'submitted';

const businessTypes = [
  { value: 'limited_liability', label: 'Limited Liability Company' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'plc', label: 'Public Limited Company' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'government', label: 'Government Agency' },
  { value: 'other', label: 'Other' },
];

export default function CreateCompany() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('info');
  const [submittedCompany, setSubmittedCompany] = useState<string>('');
  
  const { data, updateField, errors, isSubmitting } = useForm({
    name: '', cacNumber: '', businessType: 'limited_liability' as string,
    email: '', phone: '', address: '',
    expectedEmployeeCount: '', expectedBranchCount: '', expectedMonthlyPayroll: '',
  });

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) newErrors.name = 'Company name is required';
    if (!data.cacNumber.trim()) newErrors.cacNumber = 'CAC number is required';
    if (!data.email.trim()) newErrors.email = 'Business email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Invalid email address';
    if (!data.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!data.address.trim()) newErrors.address = 'Business address is required';
    if (!data.expectedEmployeeCount) newErrors.expectedEmployeeCount = 'Required';
    if (!data.expectedBranchCount) newErrors.expectedBranchCount = 'Required';
    if (!data.expectedMonthlyPayroll) newErrors.expectedMonthlyPayroll = 'Required';
    return { valid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleReview = () => {
    const { valid } = validateStep();
    if (!valid) return;
    setSubmittedCompany(data.name);
    setStep('review');
  };

  const handleSubmit = () => {
    setStep('submitted');
  };

  const renderProgress = () => (
    <div className="flex items-center gap-3 mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
      {(['info', 'review', 'submitted'] as Step[]).map((s, i) => {
        const stepOrder: Step[] = ['info', 'review', 'submitted'];
        const currentIdx = stepOrder.indexOf(step);
        const isCompleted = currentIdx > i;
        const isActive = step === s;

        return (
          <div key={s} className="flex items-center gap-3 flex-1 last:flex-initial">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all flex-shrink-0",
              isActive ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-105' :
              isCompleted ? 'bg-emerald-500 text-white' :
              'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
            )}>
              {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            
            <div className="hidden sm:block min-w-0 flex-1">
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-wider truncate",
                isActive ? 'text-sky-500' :
                isCompleted ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
              )}>
                {s === 'info' ? 'Details' : s === 'review' ? 'Review' : 'Status'}
              </p>
            </div>

            {i < 2 && (
              <div className={cn(
                "flex-1 h-0.5 rounded-full min-w-[20px]",
                isCompleted ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <Header 
            title="Onboarding Workspace" 
            subtitle="Corporate Entity Verification Registry"
            onMenuClick={() => setSidebarOpen(true)} 
          />
          
          {/* Action Context Sub-Bar */}
          <div className="px-4 md:px-6 py-2.5 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 capitalize tracking-wide">
              Execution Step: <span className="text-sky-500 font-extrabold">{step}</span>
            </span>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cancel & Exit
            </button>
          </div>
        </div>

        {/* ISOLATED SCROLLABLE CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10 flex justify-center">
          <div className="max-w-xl w-full mx-auto space-y-6">
            
            {renderProgress()}

            {/* ─── STEP 1: INFO FORM ─── */}
            {step === 'info' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Company Information</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Provide legally authenticated corporate profile markers.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Company Legal Identity Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                      placeholder="e.g. ABC Logistics Nigeria Ltd"
                      value={data.name}
                      onChange={e => updateField('name', e.target.value)}
                    />
                    {errors.name && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Corporate Affairs Commission (CAC) Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                      placeholder="e.g. RC1234567"
                      value={data.cacNumber}
                      onChange={e => updateField('cacNumber', e.target.value)}
                    />
                    {errors.cacNumber && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.cacNumber}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Business Class Category</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-all"
                      value={data.businessType}
                      onChange={e => updateField('businessType', e.target.value)}
                    >
                      {businessTypes.map(t => <option key={t.value} value={t.value} className="bg-white dark:bg-slate-900">{t.label}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Official Operations Email Address</label>
                      <input 
                        type="email" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                        placeholder="hr@company.ng"
                        value={data.email}
                        onChange={e => updateField('email', e.target.value)}
                      />
                      {errors.email && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Official Secure Phone Line</label>
                      <input 
                        type="tel" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                        placeholder="+234 800 000 0000"
                        value={data.phone}
                        onChange={e => updateField('phone', e.target.value)}
                      />
                      {errors.phone && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Physical Headquarter Address</label>
                    <textarea 
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all min-h-[90px] resize-none" 
                      placeholder="Full business street address layout location"
                      value={data.address}
                      onChange={e => updateField('address', e.target.value)}
                    />
                    {errors.address && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block truncate uppercase tracking-wider">Staff Projection</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-all" 
                        placeholder="50"
                        value={data.expectedEmployeeCount}
                        onChange={e => updateField('expectedEmployeeCount', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block truncate uppercase tracking-wider">Branch Stations</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-all" 
                        placeholder="3"
                        value={data.expectedBranchCount}
                        onChange={e => updateField('expectedBranchCount', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block truncate uppercase tracking-wider">Est. Payroll (₦)</label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 transition-all" 
                        placeholder="5,000,000"
                        value={data.expectedMonthlyPayroll}
                        onChange={e => updateField('expectedMonthlyPayroll', e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleReview} 
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-sky-500/10 mt-6"
                  >
                    Review Document Credentials
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 2: REVIEW SUMMARY ─── */}
            {step === 'review' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Review Data Submission</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Please check all operational parameters prior to system commit execution.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-sm">
                  <ReviewRow label="Company Identity Name" value={data.name} />
                  <ReviewRow label="Official CAC Number" value={data.cacNumber} />
                  <ReviewRow label="Business Framework Type" value={businessTypes.find(t => t.value === data.businessType)?.label || data.businessType} />
                  <ReviewRow label="Contact Email" value={data.email} />
                  <ReviewRow label="Contact Mobile" value={data.phone || 'Not set'} />
                  <ReviewRow label="Operational HQ Address" value={data.address} />
                  
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3.5 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Staff</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{data.expectedEmployeeCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stations</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{data.expectedBranchCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Monthly Base</p>
                      <p className="text-sm font-bold text-sky-500 mt-0.5 truncate">₦{Number(data.expectedMonthlyPayroll).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep('info')} 
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 font-bold py-3 px-4 rounded-xl text-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Modify Details
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-sky-500/10 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Verifying Registry...' : 'Submit Verification File'}
                  </button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: SUBMITTED SUCCESS SCREEN ─── */}
            {step === 'submitted' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm max-w-md mx-auto mt-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 border border-emerald-100 dark:border-transparent flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-6 h-6" />
                </div>
                
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white mb-1">Onboarding Credentials Transmitted</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                    The verification file for <strong className="text-slate-700 dark:text-slate-200 font-bold">{submittedCompany}</strong> has entered processing pipelines.
                  </p>
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 text-xs font-bold shadow-sm">
                  <FileText className="w-3.5 h-3.5" />
                  Audit Pending Review
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[280px] mx-auto leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                  Standard compliance checking reviews clear inside 2-3 enterprise banking operating sessions. Notifications trigger on final resolution.
                </p>

                <button 
                  onClick={() => navigate('/payroll-pro')} 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all active:scale-[0.98] shadow-sm"
                >
                  Return to Main Portal
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-800 dark:text-white text-right max-w-[65%] leading-relaxed">{value}</span>
    </div>
  );
}