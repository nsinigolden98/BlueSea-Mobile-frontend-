import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Check, MapPin } from 'lucide-react';

export default function CreateBranch() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', manager: '', expectedEmployees: '', description: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="tm-page">
      <div className="tm-nav-header px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {!submitted ? (
          <div className="animate-slide-up">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-1">Create Branch</h2>
              <p className="text-sm text-[var(--tm-text-muted)]">Add a new office location</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="tm-label">Branch Name</label>
                <input type="text" className="tm-input" placeholder="e.g. Ikeja Office" value={formData.name} onChange={e => updateField('name', e.target.value)} />
              </div>
              <div>
                <label className="tm-label">Branch Address</label>
                <textarea className="tm-input min-h-[80px] resize-none" placeholder="Full office address" value={formData.address} onChange={e => updateField('address', e.target.value)} />
              </div>
              <div>
                <label className="tm-label">Branch Manager</label>
                <select className="tm-input" value={formData.manager} onChange={e => updateField('manager', e.target.value)}>
                  <option value="">Select manager (optional)</option>
                  <option value="emp_001">Ngozi Okonkwo</option>
                  <option value="emp_007">Emeka Nwosu</option>
                  <option value="emp_009">Amina Ibrahim</option>
                </select>
              </div>
              <div>
                <label className="tm-label">Expected Staff Count</label>
                <input type="number" className="tm-input" placeholder="e.g. 15" value={formData.expectedEmployees} onChange={e => updateField('expectedEmployees', e.target.value)} />
              </div>
              <div>
                <label className="tm-label">Description (Optional)</label>
                <textarea className="tm-input min-h-[60px] resize-none" placeholder="Brief description of this branch" value={formData.description} onChange={e => updateField('description', e.target.value)} />
              </div>
              <button onClick={handleSubmit} className="tm-btn-primary w-full mt-4">
                <MapPin className="w-5 h-5" />
                Create Branch
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-pop-in text-center py-8">
            <div className="w-20 h-20 rounded-full bg-[var(--tm-success-light)] flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-[var(--tm-success)]" />
            </div>
            <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-2">Branch Created</h2>
            <p className="text-sm text-[var(--tm-text-muted)] mb-2"><strong>{formData.name || 'New Branch'}</strong> has been created successfully.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--tm-warning-light)] text-[var(--tm-warning)] text-sm font-bold mb-6">
              <Check className="w-4 h-4" />
              Pending Activation
            </div>
            <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
              <button onClick={() => navigate(`/payroll-pro/company/${companyId}`)} className="tm-btn-primary">
                Back to Company
              </button>
              <button onClick={() => { setFormData({ name: '', address: '', manager: '', expectedEmployees: '', description: '' }); setSubmitted(false); }} className="tm-btn-secondary">
                Create Another Branch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
