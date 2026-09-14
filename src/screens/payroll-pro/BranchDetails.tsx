import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Users, UserCog, Wallet, Settings, Plus } from 'lucide-react';
import { useBranch } from '@/hooks/usePayrollPro';
import EmployeeCard from '@/components/payroll-pro/EmployeeCard';
import EmptyState from '@/components/payroll-pro/EmptyState';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import { Sidebar, Header } from '@/components/ui-custom';

type Tab = 'employees' | 'payroll' | 'settings';

export default function BranchDetails() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { branch, employees, payrolls } = useBranch(branchId || '');

  if (!branch) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="text-center max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Branch infrastructure node not found.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'employees', label: 'Employees', icon: Users },
    { key: 'payroll', label: 'Payroll Logs', icon: Wallet },
    { key: 'settings', label: 'Branch Settings', icon: Settings },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Compatibility Injection Layer for Backwards Compatibility with Internal Cards */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tm-bg: #ffffff;
          --tm-text-main: #0f172a;
          --tm-text-muted: #475569;
          --tm-border: #e2e8f0;
          --tm-border-light: #f1f5f9;
          --tm-sky-dark: #0284c7;
          --tm-danger: #dc2626;
        }
        .dark {
          --tm-bg: #0f172a;
          --tm-text-main: #f1f5f9;
          --tm-text-muted: #94a3b8;
          --tm-border: rgba(255, 255, 255, 0.08);
          --tm-border-light: rgba(255, 255, 255, 0.04);
          --tm-danger: #f87171;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title={branch.name} 
            subtitle="Branch Operations Control" 
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* Structural Navigation Context Anchor Row */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/10">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{branch.name}</span>
                <StatusBadge status={branch.status} size="sm" />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{branch.address}</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>

        {/* Primary Workspace Viewport Panel */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide max-w-3xl w-full mx-auto pb-24 z-10">
          
          {/* Branch Meta Context Overview Matrix Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-5 shadow-sm animate-slide-up">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Branch Manager</p>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <UserCog className="w-3.5 h-3.5 text-slate-400" />
                  {branch.managerName || 'Not assigned'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Staff Allocation</p>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {branch.employeeCount} assigned
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Estimated Monthly Payroll</p>
                <p className="text-sm font-extrabold text-sky-600 dark:text-sky-400 mt-1">
                  ₦{branch.monthlyPayrollEstimate.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Operational State</p>
                <StatusBadge status={branch.status} size="sm" />
              </div>
            </div>
            {branch.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                {branch.description}
              </p>
            )}
          </div>

          {/* Sub-Tab Navigation Bar Control Matrix */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-sky-500 text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ─── EMPLOYEES TAB PANEL ─── */}
          {activeTab === 'employees' && (
            <div className="space-y-3 animate-slide-up">
              {employees.length > 0 ? (
                <>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                    {employees.length} Personnel Registered Node{employees.length !== 1 ? 's' : ''}
                  </p>
                  {employees.map(emp => (
                    <EmployeeCard key={emp.id} employee={emp} showBranch={false} />
                  ))}
                </>
              ) : (
                <EmptyState type="employees" actionLabel="Add Employee" onAction={() => {}} />
              )}
            </div>
          )}

          {/* ─── PAYROLL TAB PANEL ─── */}
          {activeTab === 'payroll' && (
            <div className="space-y-3 animate-slide-up">
              {payrolls.length > 0 ? (
                payrolls.map(payroll => (
                  <div key={payroll.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-sky-500/30 transition-all shadow-sm">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{payroll.name}</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Disbursed Local Node Statement</p>
                    </div>
                    <StatusBadge status={payroll.status} size="sm" />
                  </div>
                ))
              ) : (
                <EmptyState type="payroll" actionLabel="Run Payroll" onAction={() => {}} />
              )}
            </div>
          )}

          {/* ─── SETTINGS TAB PANEL ─── */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-slide-up">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
                <button className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">Edit Branch Core Record</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Update name descriptors, physical facility address, and credentials.</p>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-all rotate-180 flex-shrink-0" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">Assign Station Commander</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Modify or set designated head branch operations manager.</p>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-all rotate-180 flex-shrink-0" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 transition-colors">Inter-Branch Roster Transfer</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Migrate staff personnel parameters between distinct corporate locations.</p>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-all rotate-180 flex-shrink-0" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 text-left bg-rose-50/20 dark:bg-rose-950/10 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-colors group">
                  <div>
                    <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">Archive Facility Infrastructure Node</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Temporarily suspend operational sync tasks across this facility directory.</p>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-all rotate-180 flex-shrink-0" />
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Standardized Floating Action Button */}
      <button className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/20 transition-all">
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}