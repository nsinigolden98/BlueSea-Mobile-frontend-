import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Check, ChevronRight, UserPlus } from 'lucide-react';

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
    <div className="tm-page">
      <div className="tm-nav-header px-4 py-4">
        <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          {step === 'personal' ? 'Back' : 'Previous'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {(['personal', 'employment', 'payroll'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s ? 'bg-[var(--tm-sky-main)] text-white' :
                (['personal', 'employment', 'payroll'].indexOf(step) > i) ? 'bg-[var(--tm-success)] text-white' :
                'bg-[var(--tm-border)] text-[var(--tm-text-muted)]'
              }`}>
                {(['personal', 'employment', 'payroll'].indexOf(step) > i) ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && <div className={`flex-1 h-1 rounded-full ${
                (['personal', 'employment', 'payroll'].indexOf(step) > i) ? 'bg-[var(--tm-success)]' : 'bg-[var(--tm-border)]'
              }`} />}
            </div>
          ))}
        </div>

        {step === 'personal' && (
          <div className="animate-slide-up">
            <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-1">Personal Information</h2>
            <p className="text-sm text-[var(--tm-text-muted)] mb-6">Enter the employee's basic details</p>
            <div className="space-y-4">
              <div>
                <label className="tm-label">Full Name</label>
                <input type="text" className="tm-input" placeholder="e.g. John Doe" value={formData.fullName} onChange={e => updateField('fullName', e.target.value)} />
              </div>
              <div>
                <label className="tm-label">Email Address</label>
                <input type="email" className="tm-input" placeholder="e.g. john@company.ng" value={formData.email} onChange={e => updateField('email', e.target.value)} />
              </div>
              <div>
                <label className="tm-label">Phone Number</label>
                <input type="tel" className="tm-input" placeholder="+234 800 000 0000" value={formData.phone} onChange={e => updateField('phone', e.target.value)} />
              </div>
              <button onClick={handleNext} className="tm-btn-primary w-full mt-4">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'employment' && (
          <div className="animate-slide-up">
            <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-1">Employment Details</h2>
            <p className="text-sm text-[var(--tm-text-muted)] mb-6">Set their role and department</p>
            <div className="space-y-4">
              <div>
                <label className="tm-label">Department</label>
                <select className="tm-input" value={formData.department} onChange={e => updateField('department', e.target.value)}>
                  {departments.map(d => <option key={d} value={d}>{d.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label className="tm-label">Role</label>
                <select className="tm-input" value={formData.role} onChange={e => updateField('role', e.target.value)}>
                  <option value="employee">Employee</option>
                  <option value="branch_manager">Branch Manager</option>
                  <option value="hr">HR Manager</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="tm-label">Employment Type</label>
                <select className="tm-input" value={formData.employmentType} onChange={e => updateField('employmentType', e.target.value)}>
                  {employmentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="tm-label">Employment Date</label>
                <input type="date" className="tm-input" value={formData.employmentDate} onChange={e => updateField('employmentDate', e.target.value)} />
              </div>
              <button onClick={handleNext} className="tm-btn-primary w-full mt-4">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'payroll' && (
          <div className="animate-slide-up">
            <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-1">Payroll Information</h2>
            <p className="text-sm text-[var(--tm-text-muted)] mb-6">Set salary and bank details</p>
            <div className="space-y-4">
              <div>
                <label className="tm-label">Monthly Salary (&#8358;)</label>
                <input type="number" className="tm-input" placeholder="e.g. 200000" value={formData.salary} onChange={e => updateField('salary', e.target.value)} />
              </div>
              <div>
                <label className="tm-label">Branch</label>
                <select className="tm-input" value={formData.branch} onChange={e => updateField('branch', e.target.value)}>
                  <option value="branch_001">Apapa Head Office</option>
                  <option value="branch_002">Ikeja Operations Center</option>
                  <option value="branch_003">Port Harcourt Branch</option>
                </select>
              </div>
              <div>
                <label className="tm-label">Bank Name</label>
                <input type="text" className="tm-input" placeholder="e.g. GTBank" value={formData.bankName} onChange={e => updateField('bankName', e.target.value)} />
              </div>
              <div>
                <label className="tm-label">Account Number</label>
                <input type="text" className="tm-input" placeholder="10 digit account number" value={formData.bankAccountNumber} onChange={e => updateField('bankAccountNumber', e.target.value)} />
              </div>
              <button onClick={handleNext} className="tm-btn-primary w-full mt-4">
                <UserPlus className="w-5 h-5" />
                Save Employee
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-pop-in text-center py-8">
            <div className="w-20 h-20 rounded-full bg-[var(--tm-success-light)] flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-[var(--tm-success)]" />
            </div>
            <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-2">Employee Added</h2>
            <p className="text-sm text-[var(--tm-text-muted)] mb-6">{formData.fullName || 'Employee'} has been successfully added.</p>
            <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
              <button onClick={() => { setFormData({ fullName: '', email: '', phone: '', department: 'operations', role: 'employee', employmentType: 'full_time', employmentDate: '', salary: '', branch: 'branch_001', manager: '', bankName: '', bankAccountNumber: '', bankAccountName: '' }); setStep('personal'); }} className="tm-btn-primary">
                <UserPlus className="w-5 h-5" />
                Add Another Employee
              </button>
              <button onClick={() => navigate(`/payroll-pro/company/${companyId}`)} className="tm-btn-secondary">
                Back to Company
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
