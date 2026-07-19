import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, UserPlus, FileCheck } from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';

type Step = 'personal' | 'employment' | 'payroll' | 'success';

const departments = [
  'operations', 'finance', 'hr', 'engineering', 'sales', 'marketing',
  'customer_service', 'logistics', 'admin', 'legal', 'it', 'other',
];

const employmentTypes = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
  { value: 'temporary', label: 'Temporary' },
];

export default function AddEmployee() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('personal');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    department: 'operations', role: 'employee', employmentType: 'full_time',
    employmentDate: '', salary: '', branch: 'branch_001', manager: '',
    bankName: '', bankAccountNumber: '', bankAccountName: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 'personal') setStep('employment');
    else if (step === 'employment') setStep('payroll');
    else if (step === 'payroll') setStep('success');
  };

  const handleBack = () => {
    if (step === 'employment') setStep('personal');
    else if (step === 'payroll') setStep('employment');
    else navigate(-1);
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <Header 
            title="Onboard Personnel" 
            subtitle="Directory Registry Wizard" 
            onMenuClick={() => setSidebarOpen(true)} 
          />
          
          {/* Dynamic Navigation Top Bar */}
          {step !== 'success' && (
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 md:px-6 py-2.5 flex items-center justify-between">
              <button 
                onClick={handleBack} 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {step === 'personal' ? 'Cancel & Exit' : 'Previous Step'}
              </button>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                Form Context: <span className="text-sky-500 font-extrabold">{step}</span>
              </span>
            </div>
          )}
        </div>

        {/* ISOLATED SCROLLABLE CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10 flex justify-center">
          <div className="max-w-xl w-full mx-auto space-y-6">
            
            {/* Progress Indicator Track */}
            {step !== 'success' && (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                {(['personal', 'employment', 'payroll'] as Step[]).map((s, i) => {
                  const stepOrder: Step[] = ['personal', 'employment', 'payroll'];
                  const currentIdx = stepOrder.indexOf(step);
                  const isCompleted = currentIdx > i;
                  const isActive = step === s;

                  return (
                    <div key={s} className="flex items-center gap-3 flex-1 last:flex-initial">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                        isActive 
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-105' 
                          : isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : i + 1}
                      </div>

                      <div className="hidden sm:block min-w-0 flex-1">
                        <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${
                          isActive ? 'text-sky-500' : isCompleted ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {s === 'personal' ? 'Identity' : s === 'employment' ? 'Duty' : 'Ledger'}
                        </p>
                      </div>
                      
                      {i < 2 && (
                        <div className={`flex-1 h-0.5 rounded-full min-w-[20px] ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 'personal' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Personal Description</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Enter the personnel node entity's basic communication details.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Full Legal Name</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. John Doe" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Corporate Email Address</label>
                    <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. john@company.ng" value={formData.email} onChange={e => updateField('email', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Mobile Phone Vector</label>
                    <input type="tel" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="+234 800 000 0000" value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
                  </div>
                  
                  <button onClick={handleNext} className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white text-sm font-bold px-4 py-3 rounded-xl transition-all shadow-md shadow-sky-500/10">
                    Continue Operation <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: EMPLOYMENT DETAILS */}
            {step === 'employment' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Employment Assignment</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Configure operational unit allocation and hierarchy metrics.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Operational Department</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.department} onChange={e => updateField('department', e.target.value)}>
                      {departments.map(d => <option key={d} value={d} className="bg-white dark:bg-slate-900">{d.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Access Role Tier</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.role} onChange={e => updateField('role', e.target.value)}>
                      <option value="employee" className="bg-white dark:bg-slate-900">Standard Employee</option>
                      <option value="branch_manager" className="bg-white dark:bg-slate-900">Branch Manager Node</option>
                      <option value="hr" className="bg-white dark:bg-slate-900">HR Administrator</option>
                      <option value="finance" className="bg-white dark:bg-slate-900">Finance Controller</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Classification Framework</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.employmentType} onChange={e => updateField('employmentType', e.target.value)}>
                      {employmentTypes.map(t => <option key={t.value} value={t.value} className="bg-white dark:bg-slate-900">{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Activation Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.employmentDate} onChange={e => updateField('employmentDate', e.target.value)} />
                  </div>
                  
                  <button onClick={handleNext} className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white text-sm font-bold px-4 py-3 rounded-xl transition-all shadow-md shadow-sky-500/10">
                    Continue Allocation <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYROLL INFORMATION */}
            {step === 'payroll' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Financial Ledger Sync</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Map base salary values and clearing settlement configurations.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Base Monthly Remuneration (₦)</label>
                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. 200000" value={formData.salary} onChange={e => updateField('salary', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Target Allocation Facility</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.branch} onChange={e => updateField('branch', e.target.value)}>
                      <option value="branch_001" className="bg-white dark:bg-slate-900">Apapa Head Office</option>
                      <option value="branch_002" className="bg-white dark:bg-slate-900">Ikeja Operations Center</option>
                      <option value="branch_003" className="bg-white dark:bg-slate-900">Port Harcourt Branch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Settlement Institution Name</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. GTBank" value={formData.bankName} onChange={e => updateField('bankName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Ledger Settlement Account Number</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="10 digit numeric string" value={formData.bankAccountNumber} onChange={e => updateField('bankAccountNumber', e.target.value)} />
                  </div>
                  
                  <button onClick={handleNext} className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm font-bold px-4 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10">
                    <UserPlus className="w-4 h-4" /> Save Directory Entry
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS OVERLAY BANNER */}
            {step === 'success' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm max-w-md mx-auto mt-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 border border-emerald-100 dark:border-transparent flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Personnel Vector Synced</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed mt-1">
                    Core identity variables for <strong className="text-slate-700 dark:text-slate-200 font-bold">{formData.fullName || 'New Node'}</strong> have populated the environment database states.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 text-xs font-bold shadow-sm">
                  <FileCheck className="w-3.5 h-3.5" />
                  Ledger Connection Activated
                </div>
                
                <div className="flex flex-col gap-2.5 pt-4 max-w-[260px] mx-auto border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => { 
                      setFormData({ fullName: '', email: '', phone: '', department: 'operations', role: 'employee', employmentType: 'full_time', employmentDate: '', salary: '', branch: 'branch_001', manager: '', bankName: '', bankAccountNumber: '', bankAccountName: '' }); 
                      setStep('personal'); 
                    }} 
                    className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Register Another Node
                  </button>
                  <button 
                    onClick={() => navigate(`/payroll-pro/company/${companyId}`)} 
                    className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm"
                  >
                    Return to Company Log
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