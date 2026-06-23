import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, ChevronRight, FileText, Send } from 'lucide-react';
import { useForm } from '@/hooks/usePayrollPro';

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
    if (!valid) {
      // Show errors - in real app would use form state
      return;
    }
    setSubmittedCompany(data.name);
    setStep('review');
  };

  const handleSubmit = () => {
    setStep('submitted');
  };

  const renderProgress = () => (
    <div className="flex items-center gap-2 mb-6">
      {(['info', 'review', 'submitted'] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            step === s ? 'bg-[var(--tm-sky-main)] text-white' :
            (['info', 'review', 'submitted'].indexOf(step) > i) ? 'bg-[var(--tm-success)] text-white' :
            'bg-[var(--tm-border)] text-[var(--tm-text-muted)]'
          }`}>
            {(['info', 'review', 'submitted'].indexOf(step) > i) ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < 2 && <div className={`flex-1 h-1 rounded-full transition-all ${
            (['info', 'review', 'submitted'].indexOf(step) > i) ? 'bg-[var(--tm-success)]' : 'bg-[var(--tm-border)]'
          }`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="tm-page">
      <div className="tm-nav-header px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {renderProgress()}

        {step === 'info' && (
          <div className="animate-slide-up">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-1">Company Information</h2>
              <p className="text-sm text-[var(--tm-text-muted)]">Enter your company details for verification</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="tm-label">Company Name</label>
                <input 
                  type="text" 
                  className="tm-input" 
                  placeholder="e.g. ABC Logistics Nigeria Ltd"
                  value={data.name}
                  onChange={e => updateField('name', e.target.value)}
                />
                {errors.name && <p className="text-xs text-[var(--tm-danger)] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="tm-label">CAC Registration Number</label>
                <input 
                  type="text" 
                  className="tm-input" 
                  placeholder="e.g. RC1234567"
                  value={data.cacNumber}
                  onChange={e => updateField('cacNumber', e.target.value)}
                />
                {errors.cacNumber && <p className="text-xs text-[var(--tm-danger)] mt-1">{errors.cacNumber}</p>}
              </div>

              <div>
                <label className="tm-label">Business Type</label>
                <select 
                  className="tm-input"
                  value={data.businessType}
                  onChange={e => updateField('businessType', e.target.value)}
                >
                  {businessTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="tm-label">Business Email</label>
                  <input 
                    type="email" 
                    className="tm-input" 
                    placeholder="hr@company.ng"
                    value={data.email}
                    onChange={e => updateField('email', e.target.value)}
                  />
                  {errors.email && <p className="text-xs text-[var(--tm-danger)] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="tm-label">Business Phone</label>
                  <input 
                    type="tel" 
                    className="tm-input" 
                    placeholder="+234 800 000 0000"
                    value={data.phone}
                    onChange={e => updateField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="tm-label">Business Address</label>
                <textarea 
                  className="tm-input min-h-[80px] resize-none" 
                  placeholder="Full business address"
                  value={data.address}
                  onChange={e => updateField('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="tm-label">Expected Staff</label>
                  <input 
                    type="number" 
                    className="tm-input" 
                    placeholder="e.g. 50"
                    value={data.expectedEmployeeCount}
                    onChange={e => updateField('expectedEmployeeCount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="tm-label">Branches</label>
                  <input 
                    type="number" 
                    className="tm-input" 
                    placeholder="e.g. 3"
                    value={data.expectedBranchCount}
                    onChange={e => updateField('expectedBranchCount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="tm-label">Monthly Payroll (&#8358;)</label>
                  <input 
                    type="number" 
                    className="tm-input" 
                    placeholder="e.g. 5000000"
                    value={data.expectedMonthlyPayroll}
                    onChange={e => updateField('expectedMonthlyPayroll', e.target.value)}
                  />
                </div>
              </div>

              <button onClick={handleReview} className="tm-btn-primary w-full mt-6">
                Review Information
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="animate-slide-up">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-1">Review Information</h2>
              <p className="text-sm text-[var(--tm-text-muted)]">Please verify all details before submission</p>
            </div>

            <div className="tm-card p-4 space-y-3 mb-6">
              <ReviewRow label="Company Name" value={data.name} />
              <ReviewRow label="CAC Number" value={data.cacNumber} />
              <ReviewRow label="Business Type" value={businessTypes.find(t => t.value === data.businessType)?.label || data.businessType} />
              <ReviewRow label="Email" value={data.email} />
              <ReviewRow label="Phone" value={data.phone} />
              <ReviewRow label="Address" value={data.address} />
              <div className="border-t border-[var(--tm-border)] pt-3 grid grid-cols-3 gap-3">
                <ReviewRow label="Expected Staff" value={data.expectedEmployeeCount} />
                <ReviewRow label="Branches" value={data.expectedBranchCount} />
                <ReviewRow label="Monthly Payroll" value={`&#8358;${Number(data.expectedMonthlyPayroll).toLocaleString()}`} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('info')} className="tm-btn-secondary flex-1">
                <ArrowLeft className="w-4 h-4" />
                Edit
              </button>
              <button onClick={handleSubmit} className="tm-btn-primary flex-1" disabled={isSubmitting}>
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}

        {step === 'submitted' && (
          <div className="animate-pop-in text-center py-8">
            <div className="w-20 h-20 rounded-full bg-[var(--tm-success-light)] flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-[var(--tm-success)]" />
            </div>
            <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-2">Verification Submitted</h2>
            <p className="text-sm text-[var(--tm-text-muted)] mb-2 max-w-[300px] mx-auto">
              <strong>{submittedCompany}</strong> has been submitted for verification.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--tm-warning-light)] text-[var(--tm-warning)] text-sm font-bold mb-6">
              <FileText className="w-4 h-4" />
              Pending Review
            </div>
            <p className="text-xs text-[var(--tm-text-muted)] mb-6 max-w-[280px] mx-auto">
              Verification typically takes 2-3 business days. You will be notified once completed.
            </p>
            <button onClick={() => navigate('/payroll-pro')} className="tm-btn-primary">
              Return to Payroll Pro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-[var(--tm-text-muted)] font-medium">{label}</span>
      <span className="text-sm font-bold text-[var(--tm-text-main)] text-right">{value}</span>
    </div>
  );
}
