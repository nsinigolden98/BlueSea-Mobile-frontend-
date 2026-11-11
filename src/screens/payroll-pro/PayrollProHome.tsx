import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Users, Briefcase, Plus, ArrowRight, Sparkles, Shield, Loader2 } from 'lucide-react';
import { Sidebar, Header } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { usePayrollMe, useMyInvites, useAcceptInvite, useDeclineInvite } from '@/lib/payrollApi';
import CompanyCard from '@/components/payroll-pro/CompanyCard';
import StatusBadge from '@/components/payroll-pro/StatusBadge';

export default function PayrollProHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = usePayrollMe();
  const { data: pendingInvites } = useMyInvites();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();

  const companies = data?.companies ?? [];
  const employments = data?.employments ?? [];
  const isNewUser = !isLoading && companies.length === 0 && employments.length === 0;
  const isOwner = companies.length > 0;
  const isEmployee = employments.length > 0;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Payroll Pro"
            subtitle="Workforce Management"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {isLoading && (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 text-sm text-rose-600 dark:text-rose-400">
                {(error as any)?.message ?? 'Could not load payroll data.'}
                <button className="ml-2 underline" onClick={() => refetch()}>Retry</button>
              </div>
            )}

            {/* Pending invitations — confirm/decline without leaving the app */}
            {pendingInvites && pendingInvites.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">Invitations</h2>
                {pendingInvites.filter(i => i.status === 'pending').map(invite => (
                  <div key={invite.id} className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/50 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                      {invite.inviterName} invited you to control payroll for {invite.companyName}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={acceptInvite.isPending}
                        onClick={() => acceptInvite.mutate(invite.id, {
                          onSuccess: () => { void refetch(); },
                        })}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all disabled:opacity-50"
                      >
                        Accept & take control
                      </button>
                      <button
                        disabled={declineInvite.isPending}
                        onClick={() => declineInvite.mutate(invite.id, {
                          onSuccess: () => { void refetch(); },
                        })}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 px-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── NEW USER ─── */}
            {!isLoading && isNewUser && (
              <div className="animate-slide-up">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Welcome to Payroll Pro</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-[320px] mx-auto">
                    Manage employees, branches, payroll and disbursement — all in one place.
                  </p>
                  <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
                    <button
                      onClick={() => navigate('/payroll-pro/create-company')}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm shadow-sky-500/10"
                    >
                      <Plus className="w-5 h-5" />
                      Create Company
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: 'Employee Management', desc: 'Onboard, track, and manage staff' },
                    { icon: Briefcase, label: 'Payroll Processing', desc: 'Automate salary payments' },
                    { icon: Shield, label: 'Compliant Payouts', desc: 'Wallet or bank disbursement' },
                    { icon: Building2, label: 'Multi-Branch', desc: 'Manage multiple locations' },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center animate-slide-up shadow-sm"
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

            {/* ─── OWNED COMPANIES ─── */}
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
                <div className="space-y-4">
                  {companies.map(company => (
                    <div
                      key={company.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm hover:border-sky-500/20 dark:hover:border-sky-400/20 transition-all duration-200"
                    >
                      <CompanyCard company={company} role="owner" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── MY EMPLOYMENTS ─── */}
            {isEmployee && (
              <div className="animate-slide-up space-y-3">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 px-1">My Employments</h2>
                <div className="space-y-4">
                  {employments.map(employment => (
                    <div
                      key={employment.id}
                      onClick={() => navigate(`/payroll-pro/portal/${employment.companyId}`)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer active:scale-[0.99] shadow-sm animate-slide-up"
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
                          <p className="text-xs text-slate-500 dark:text-slate-400">{employment.branchName ?? 'Main office'}</p>
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
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

            {isOwner && isEmployee && (
              <div className="mt-6 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-500/20 dark:border-sky-400/20 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500 dark:bg-sky-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-sky-800 dark:text-sky-400">Managing Multiple Roles</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      You own {companies.length} compan{companies.length === 1 ? 'y' : 'ies'} and work at {employments.length} other{employments.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900">
          <MobileBottomNavigation />
        </div>
      </div>
    </div>
  );
}
