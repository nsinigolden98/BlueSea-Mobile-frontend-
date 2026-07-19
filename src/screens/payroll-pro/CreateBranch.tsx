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
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Universal Design System Theme & Variable Mapping Layer */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tm-bg: #ffffff;
          --tm-text-main: #0f172a; /* slate-900 */
          --tm-text-muted: #475569; /* slate-600 */
          --tm-border: #e2e8f0; /* slate-200 */
          --tm-border-light: #f1f5f9; /* slate-100 */
          --tm-sky-main: #0ea5e9;
          --tm-sky-dark: #0284c7;
          --tm-sky-light: #e0f2fe;
          --tm-success: #16a34a;
          --tm-success-light: #dcfce7;
          --tm-warning: #d97706;
          --tm-warning-light: #fef3c7;
          --tm-purple: #9333ea;
          --tm-purple-light: #f3e8ff;
          --tm-danger: #dc2626;
        }
        .dark {
          --tm-bg: #0f172a; /* slate-900 */
          --tm-text-main: #f1f5f9; /* slate-100 */
          --tm-text-muted: #94a3b8; /* slate-400 */
          --tm-border: rgba(255, 255, 255, 0.08); /* white/8 */
          --tm-border-light: rgba(255, 255, 255, 0.04);
          --tm-sky-light: rgba(14, 165, 233, 0.15);
          --tm-success-light: rgba(22, 163, 74, 0.15);
          --tm-warning-light: rgba(217, 119, 6, 0.15);
          --tm-purple-light: rgba(147, 51, 234, 0.15);
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
            title="Branch Management" 
            subtitle="Establish Corporate Sub-Stations" 
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* Structural Navigation Context Anchor Row */}
        <div className="bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
            Context: Location Infrastructure
          </span>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>

        {/* Primary Form Viewport Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide max-w-xl w-full mx-auto pb-24 z-10">
          
          {!submitted ? (
            <div className="animate-slide-up space-y-5">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Create Branch Location</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Map an authorized operating facility to your company registration file.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Branch Office Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm" 
                    placeholder="e.g. Ikeja Office" 
                    value={formData.name} 
                    onChange={e => updateField('name', e.target.value)} 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Physical Facility Address</label>
                  <textarea 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all min-h-[85px] resize-none shadow-sm" 
                    placeholder="Full geographical station address coordinates" 
                    value={formData.address} 
                    onChange={e => updateField('address', e.target.value)} 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Station Managing Director / Head</label>
                  <select 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all shadow-sm" 
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
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Expected Allocated Staff Capacity</label>
                  <input 
                    type="number" 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm" 
                    placeholder="e.g. 15" 
                    value={formData.expectedEmployees} 
                    onChange={e => updateField('expectedEmployees', e.target.value)} 
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Operational Scope Notes (Optional)</label>
                  <textarea 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all min-h-[70px] resize-none shadow-sm" 
                    placeholder="Brief descriptive overview outlining primary branch functionalities" 
                    value={formData.description} 
                    onChange={e => updateField('description', e.target.value)} 
                  />
                </div>

                <button 
                  onClick={handleSubmit} 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-sky-500/10 mt-6"
                >
                  <MapPin className="w-4 h-4" />
                  Provision Location Record
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 text-center shadow-sm animate-pop-in max-w-md mx-auto mt-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-transparent flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              
              <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1">Branch Infrastructure Established</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                The facility file context for <strong className="text-slate-800 dark:text-slate-200 font-bold">{formData.name || 'New Branch Asset'}</strong> has updated successfully.
              </p>

              <div className="my-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 text-[10px] font-bold shadow-sm">
                <Check className="w-3.5 h-3.5" />
                Awaiting Node Activation
              </div>

              <div className="flex flex-col gap-3 max-w-[280px] mx-auto border-t border-slate-100 dark:border-slate-800/60 pt-5">
                <button 
                  onClick={() => navigate(`/payroll-pro/company/${companyId}`)} 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 shadow-sm shadow-sky-500/10"
                >
                  Return to Company Control
                </button>
                <button 
                  onClick={() => { 
                    setFormData({ name: '', address: '', manager: '', expectedEmployees: '', description: '' }); 
                    setSubmitted(false); 
                  }} 
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 dark:border-slate-800 transition-all active:scale-95 shadow-sm"
                >
                  Map Additional Branch
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}