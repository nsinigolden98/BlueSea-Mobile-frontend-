import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Users, Briefcase, Plus, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';
import { usePayrollPro } from '@/hooks/usePayrollPro';
import CompanyCard from '@/components/payroll-pro/CompanyCard';
import StatusBadge from '@/components/payroll-pro/StatusBadge';

export default function PayrollProHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { ownedCompanies, employments, isNewUser, isOwner, isEmployee } = usePayrollPro();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex overflow-hidden transition-colors duration-300">
      {/* Design System Compatibility Layer & Layout Fixes */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tm-text-main: #0f172a; /* slate-900 */
          --tm-text-muted: #475569; /* slate-600 */
          --tm-border-light: #e2e8f0; /* slate-200 */
          --tm-sky-main: #0ea5e9; /* sky-500 */
          --tm-sky-dark: #0369a1; /* sky-700 */
          --tm-sky-light: #f0f9ff; /* sky-50 */
        }
        .dark {
          --tm-text-main: #f1f5f9; /* slate-100 */
          --tm-text-muted: #94a3b8; /* slate-400 */
          --tm-border-light: rgba(255, 255, 255, 0.08); /* white/8 */
          --tm-sky-main: #38bdf8; /* sky-400 */
          --tm-sky-dark: #0284c7; /* sky-600 */
          --tm-sky-light: rgba(14, 165, 233, 0.15); /* sky-500/15 */
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />  

      {/* Global Sidebar Integration */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />  

      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 transition-colors duration-300">  
        {/* Unified Application Header */}
        <Header  
          title="Payroll Pro"  
          subtitle="Workforce Management"  
          onMenuClick={() => setSidebarOpen(true)}  
        />  

        {/* Scrollable Layout Container matching core platform experience */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">  
          <div className="max-w-4xl mx-auto space-y-6">  
            
            {/* ─── SCENARIO A: NEW USER ─── */}
            {isNewUser && (
              <div className="animate-slide-up">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-center shadow-sm">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Welcome to Payroll Pro</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-[320px] mx-auto">
                    Manage employees, branches, payroll, approvals, workforce records, 
                    employment verification and salary automation — all in one place.
                  </p>
                  <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
                    <button 
                      onClick={() => navigate('/payroll-pro/create-company')} 
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-sky-500/10"
                    >
                      <Plus className="w-5 h-5" />
                      Create Company
                    </button>
                    <button 
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: 'Employee Management', desc: 'Onboard, track, and manage staff' },
                    { icon: Briefcase, label: 'Payroll Processing', desc: 'Automate salary payments' },
                    { icon: Shield, label: 'Compliance Ready', desc: 'Tax, pension, and NHIS support' },
                    { icon: Building2, label: 'Multi-Branch', desc: 'Manage multiple locations' },
                  ].map((feature, i) => (
                    <div 
                      key={i} 
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 text-center animate-slide-up shadow-sm" 
                      style={{ animationDelay: `${0.1 * (i + 1)}s` }}
                    >
                      <feature.icon className="w-6 h-6 text-sky-500 dark:text-sky-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{feature.label}</p>
                      <p className="text-[0.65rem] text-slate-500 dark:text-slate-400 mt-0.5">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── SCENARIO C & D: OWNER (COMPANIES) ─── */}
            {isOwner && (
              <div className="animate-slide-up space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">My Companies</h2>
                  <button 
                    onClick={() => navigate('/payroll-pro/create-company')}
                    className="text-xs font-bold text-sky-500 dark:text-sky-400 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Company
                  </button>
                </div>
                {/* Visual Demarcation: Optimized space-y-4 container for distinct items */}
                <div className="space-y-4">
                  {ownedCompanies.map(company => (
                    <div 
                      key={company.id} 
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-1 shadow-sm hover:border-sky-500/20 dark:hover:border-sky-400/20 transition-all duration-200"
                    >
                      <CompanyCard company={company} role="owner" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── SCENARIO B & D: EMPLOYEE (EMPLOYMENTS) ─── */}
            {isEmployee && (
              <div className="animate-slide-up space-y-3">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">My Employments</h2>
                <div className="space-y-4">
                  {employments.filter(emp => !emp.isOwner).map(employment => (
                    <div 
                      key={employment.id}
                      onClick={() => navigate(`/payroll-pro/portal/${employment.companyId}`)}
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer playbook-card active:scale-[0.99] shadow-sm animate-slide-up"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{employment.companyName}</h3>
                            <StatusBadge status={employment.status} size="sm" />
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 capitalize">
                            {employment.role.replace('_', ' ')} · {employment.department.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{employment.branchName}</p>
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Since {new Date(employment.employmentDate).toLocaleDateString()}</span>
                            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                              &#8358;{employment.salary.toLocaleString()}
                              <span className="text-[0.65rem] font-medium text-slate-500 dark:text-slate-400">/mo</span>
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 self-center" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── SCENARIO D: OWNER + EMPLOYEE ─── */}
            {isOwner && isEmployee && (
              <div className="mt-6 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-500/20 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500 dark:bg-sky-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sky-800 dark:text-sky-400">Managing Multiple Roles</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      You own {ownedCompanies.length} compan{ownedCompanies.length === 1 ? 'y' : 'ies'} and work at {employments.filter(e => !e.isOwner).length} other{employments.filter(e => !e.isOwner).length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>  
      </div>
    </div>
  );
}
