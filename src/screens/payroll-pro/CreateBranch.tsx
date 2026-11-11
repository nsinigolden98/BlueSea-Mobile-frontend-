import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Check, MapPin, Loader2 } from 'lucide-react';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { useCreateBranch } from '@/lib/payrollApi';

export default function CreateBranch() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { ToastComponent } = Toast();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({ name: '', address: '', description: '' });

  const createBranch = useCreateBranch(companyId ?? '', {
    onError: (error) => setSubmitError(error?.message ?? 'Could not create the branch.'),
    onSuccess: () => {
      setSubmitError('');
      setSubmitted(true);
    },
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitError('');
  };

  const canSubmit = formData.name.trim().length >= 2;

  const handleSubmit = () => {
    if (!companyId || !canSubmit) return;
    createBranch.mutate({
      name: formData.name.trim(),
      address: formData.address.trim() || undefined,
      description: formData.description.trim() || undefined,
    });
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Branch Management"
            subtitle="Add an operating branch"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <div className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
            Location
          </span>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide max-w-xl w-full mx-auto pb-24 z-10">
          {!submitted ? (
            <div className="animate-slide-up space-y-5">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Create Branch</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Map a branch to this company.</p>
              </div>

              {submitError && (
                <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2">{submitError}</p>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Branch Name *</label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm"
                    placeholder="e.g. Ikeja Office"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Address</label>
                  <textarea
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all min-h-[85px] resize-none shadow-sm"
                    placeholder="Full address"
                    value={formData.address}
                    onChange={e => updateField('address', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Description (Optional)</label>
                  <textarea
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all min-h-[70px] resize-none shadow-sm"
                    placeholder="What this branch does"
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || createBranch.isPending}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-sky-500/10 mt-6"
                >
                  {createBranch.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  {createBranch.isPending ? 'Saving…' : 'Create Branch'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 text-center shadow-sm animate-pop-in max-w-md mx-auto mt-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-transparent flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1">Branch Created</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200 font-bold">{formData.name}</strong> is now available on this company.
              </p>
              <div className="flex flex-col gap-3 max-w-[280px] mx-auto border-t border-slate-100 dark:border-slate-800/60 pt-5 mt-5">
                <button
                  onClick={() => navigate(`/payroll-pro/company/${companyId}`)}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-sm shadow-sky-500/10"
                >
                  Return to Company
                </button>
                <button
                  onClick={() => {
                    setFormData({ name: '', address: '', description: '' });
                    setSubmitted(false);
                  }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 dark:border-slate-800 transition-all active:scale-95 shadow-sm"
                >
                  Add Another Branch
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
