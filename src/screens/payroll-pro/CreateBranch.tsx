import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Check, MapPin } from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';

export default function CreateBranch() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
      {/* Compatibility Injection Layer */}
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
          title="Branch Management" 
          subtitle="Establish Corporate Sub-Stations" 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        {/* Structural Navigation Context Anchor Row */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 px-4 md:px-6 py-3.5 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Context: Location Infrastructure
          </span>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>

        {/* Primary Form Viewport Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide flex justify-center">
          <div className="max-w-xl w-full mx-auto">
            
            {!submitted ? (
              <div className="animate-slide-up space-y-5">
                <div className="border-b border-slate-100 dark:border-white/5 pb-3">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Create Branch Location</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Map an authorized operating facility to your company registration file.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Branch Office Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm" 
                      placeholder="e.g. Ikeja Office" 
                      value={formData.name} 
                      onChange={e => updateField('name', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Physical Facility Address</label>
                    <textarea 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all min-h-[85px] resize-none shadow-sm" 
                      placeholder="Full geographical station address coordinates" 
                      value={formData.address} 
                      onChange={e => updateField('address', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Station Managing Director / Head</label>
                    <select 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all shadow-sm" 
                      value={formData.manager} 
                      onChange={e => updateField('manager', e.target.value)}
                    >
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-400">Select allocated manager (optional)</option>
                      <option value="emp_001" className="bg-white dark:bg-slate-900">Ngozi Okonkwo</option>
                      <option value="emp_007" className="bg-white dark:bg-slate-900">Emeka Nwosu</option>
                      <option value="emp_009" className="bg-white dark:bg-slate-900">Amina Ibrahim</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Expected Allocated Staff Capacity</label>
                    <input 
                      type="number" 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm" 
                      placeholder="e.g. 15" 
                      value={formData.expectedEmployees} 
                      onChange={e => updateField('expectedEmployees', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Operational Scope Notes (Optional)</label>
                    <textarea 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all min-h-[70px] resize-none shadow-sm" 
                      placeholder="Brief descriptive overview outlining primary branch functionalities" 
                      value={formData.description} 
                      onChange={e => updateField('description', e.target.value)} 
                    />
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-sky-500/10 mt-6"
                  >
                    <MapPin className="w-4 h-4" />
                    Provision Location Record
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-8 text-center shadow-sm animate-pop-in max-w-md mx-auto mt-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-transparent flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Check className="w-6 h-6" />
                </div>
                
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1">Branch Infrastructure Established</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                  The facility file context for <strong className="text-slate-800 dark:text-slate-200 font-bold">{formData.name || 'New Branch Asset'}</strong> has updated successfully.
                </p>

                <div className="my-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 text-xs font-bold shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                  Awaiting Node Activation
                </div>

                <div className="flex flex-col gap-3 max-w-[280px] mx-auto border-t border-slate-200 dark:border-white/5 pt-5">
                  <button 
                    onClick={() => navigate(`/payroll-pro/company/${companyId}`)} 
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all active:scale-95 shadow-sm"
                  >
                    Return to Company Control
                  </button>
                  <button 
                    onClick={() => { 
                      setFormData({ name: '', address: '', manager: '', expectedEmployees: '', description: '' }); 
                      setSubmitted(false); 
                    }} 
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-sm border border-slate-200 dark:border-white/5 transition-all active:scale-95"
                  >
                    Map Additional Branch
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
