import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, UserPlus, Loader2 } from 'lucide-react';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { useBranches, useCreateEmployee } from '@/lib/payrollApi';

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
  const { ToastComponent } = Toast();
  const [step, setStep] = useState<Step>('personal');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [linkToAccount, setLinkToAccount] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { data: branches } = useBranches(companyId);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    department: 'operations', role: 'employee', employmentType: 'full_time',
    employmentDate: '', salary: '', branchId: '',
    bankName: '', bankCode: '', bankAccountNumber: '', bankAccountName: '',
    linkEmail: '',
  });

  const createEmployee = useCreateEmployee(companyId ?? '', {
    onError: (error) => setSubmitError(error?.message ?? 'Could not create employee.'),
    onSuccess: () => {
      setFormData({
        fullName: '', email: '', phone: '',
        department: 'operations', role: 'employee', employmentType: 'full_time',
        employmentDate: '', salary: '', branchId: '',
        bankName: '', bankCode: '', bankAccountNumber: '', bankAccountName: '',
        linkEmail: '',
      });
      setLinkToAccount(false);
      setSubmitError('');
      setStep('success');
    },
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError('');
  };

  const canProceedPersonal = formData.fullName.trim().length >= 2;
  const canProceedEmployment = !!formData.department && !!formData.employmentType;

  const handleNext = () => {
    setStep(s => s === 'personal' ? 'employment' : s === 'employment' ? 'payroll' : s);
  };

  const handleBack = () => {
    if (step === 'employment') setStep('personal');
    else if (step === 'payroll') setStep('employment');
    else navigate(-1);
  };

  const bankDigits = useMemo(
    () => formData.bankAccountNumber.replace(/\D/g, ''),
    [formData.bankAccountNumber],
  );

  const handleSubmit = () => {
    if (!companyId) return;
    setSubmitError('');
    const payload: Record<string, unknown> = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase() || undefined,
      phone: formData.phone.trim() || undefined,
      department: formData.department,
      role: formData.role,
      employment_type: formData.employmentType,
      employment_date: formData.employmentDate || undefined,
      salary: formData.salary ? Number(formData.salary) : 0,
      branch_id: formData.branchId ? Number(formData.branchId) : undefined,
      bank_name: formData.bankName.trim() || undefined,
      bank_code: formData.bankCode.trim() || undefined,
      bank_account_number: bankDigits || undefined,
      bank_account_name: formData.bankAccountName.trim() || undefined,
    };
    if (linkToAccount && formData.linkEmail.trim()) {
      payload.link_contact = formData.linkEmail.trim().toLowerCase();
    }
    createEmployee.mutate(payload);
  };

  const branchOptions = (branches ?? []).map(b => ({ id: b.id, name: b.name }));

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <Header
            title="Onboard Personnel"
            subtitle="Add an employee to this company"
            onMenuClick={() => setSidebarOpen(true)}
          />
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
                Step: <span className="text-sky-500 font-extrabold">{step}</span>
              </span>
            </div>
          )}
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10 flex justify-center">
          <div className="max-w-xl w-full mx-auto space-y-6">

            {step !== 'success' && (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                {(['personal', 'employment', 'payroll'] as Step[]).map((s, i) => {
                  const order: Step[] = ['personal', 'employment', 'payroll'];
                  const currentIdx = order.indexOf(step);
                  const isCompleted = currentIdx > i;
                  const isActive = step === s;
                  return (
                    <div key={s} className="flex items-center gap-3 flex-1 last:flex-initial">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                        isActive ? 'bg-sky-500 text-white shadow-md' :
                        isCompleted ? 'bg-emerald-500 text-white' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <p className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider flex-1 ${
                        isActive ? 'text-sky-500' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                      }`}>{s}</p>
                      {i < 2 && <div className={`flex-1 h-0.5 rounded-full min-w-[20px] ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`} />}
                    </div>
                  );
                })}
              </div>
            )}

            {submitError && (
              <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2">{submitError}</p>
            )}

            {/* STEP 1: PERSONAL */}
            {step === 'personal' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Personal Details</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Basic identity and contact information.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Full Name *</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" placeholder="e.g. John Doe" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Email</label>
                    <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" placeholder="e.g. john@company.ng" value={formData.email} onChange={e => updateField('email', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">Phone</label>
                    <input type="tel" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" placeholder="+234 800 000 0000" value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
                  </div>

                  {/* Optional account link */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-sky-500 rounded"
                        checked={linkToAccount}
                        onChange={e => { setLinkToAccount(e.target.checked); setSubmitError(''); }}
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Link to a BlueSea account</span>
                    </label>
                    {linkToAccount && (
                      <input
                        type="email"
                        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                        placeholder="Account email (must already have a BlueSea account)"
                        value={formData.linkEmail}
                        onChange={e => updateField('linkEmail', e.target.value)}
                      />
                    )}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Linked employees get salary paid straight to their BlueSea wallet.</p>
                  </div>

                  <button onClick={handleNext} disabled={!canProceedPersonal} className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 active:scale-[0.98] text-white text-sm font-bold px-4 py-3 rounded-xl transition-all shadow-md shadow-sky-500/10">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: EMPLOYMENT */}
            {step === 'employment' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Employment Details</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Department, role and classification.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Department</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.department} onChange={e => updateField('department', e.target.value)}>
                      {departments.map(d => <option key={d} value={d}>{d.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Role</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.role} onChange={e => updateField('role', e.target.value)}>
                      <option value="employee">Standard Employee</option>
                      <option value="branch_manager">Branch Manager</option>
                      <option value="hr">HR Administrator</option>
                      <option value="finance">Finance Controller</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Employment Type</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.employmentType} onChange={e => updateField('employmentType', e.target.value)}>
                      {employmentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Start Date</label>
                    <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.employmentDate} onChange={e => updateField('employmentDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Branch</label>
                    <select className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" value={formData.branchId} onChange={e => updateField('branchId', e.target.value)}>
                      <option value="">No branch / head office</option>
                      {branchOptions.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <button onClick={handleNext} disabled={!canProceedEmployment} className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 active:scale-[0.98] text-white text-sm font-bold px-4 py-3 rounded-xl transition-all shadow-md shadow-sky-500/10">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYROLL */}
            {step === 'payroll' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Payroll & Bank</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Salary and settlement details (salary is optional at creation).</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Monthly Salary (₦)</label>
                    <input type="number" min="0" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" placeholder="e.g. 200000" value={formData.salary} onChange={e => updateField('salary', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Bank Name</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" placeholder="e.g. GTBank" value={formData.bankName} onChange={e => updateField('bankName', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Bank Code</label>
                      <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-sky-500 transition-all" placeholder="e.g. 058" value={formData.bankCode} onChange={e => updateField('bankCode', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Account Number</label>
                      <input type="tel" inputMode="numeric" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" placeholder="10 digits" value={formData.bankAccountNumber} onChange={e => updateField('bankAccountNumber', e.target.value)} />
                    </div>
                  </div>
                  {bankDigits.length > 0 && bankDigits.length !== 10 && (
                    <p className="text-[10px] text-rose-500">Account number must be exactly 10 digits when provided.</p>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Account Name</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-all" placeholder="As shown by the bank" value={formData.bankAccountName} onChange={e => updateField('bankAccountName', e.target.value)} />
                  </div>

                  <button onClick={handleSubmit} disabled={createEmployee.isPending || (bankDigits.length > 0 && bankDigits.length !== 10)} className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 active:scale-[0.98] text-white text-sm font-bold px-4 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10">
                    {createEmployee.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {createEmployee.isPending ? 'Saving…' : 'Save Employee'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm max-w-md mx-auto mt-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 border border-emerald-100 dark:border-transparent flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Employee Added</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                  The employee record is saved. Salary disbursement happens on approval of each payroll run.
                </p>
                <div className="flex flex-col gap-2.5 pt-4 max-w-[260px] mx-auto border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setStep('personal')} className="inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm">
                    <UserPlus className="w-3.5 h-3.5" />
                    Add Another
                  </button>
                  <button onClick={() => navigate(`/payroll-pro/company/${companyId}`)} className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm">
                    Return to Company
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
