import { useNavigate } from 'react-router';
import { Building2, Users, Briefcase, Plus, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { usePayrollPro } from '@/hooks/usePayrollPro';
import { currentUser } from '@/mocks/payroll-data';
import CompanyCard from '@/components/payroll-pro/CompanyCard';
import StatusBadge from '@/components/payroll-pro/StatusBadge';

export default function PayrollProHome() {
  const navigate = useNavigate();
  const { ownedCompanies, employments, isNewUser, isOwner, isEmployee } = usePayrollPro();

  return (
    <div className="tm-page">
      {/* Header */}
      <div className="tm-nav-header px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[var(--tm-text-main)]">Payroll Pro</h1>
            <p className="text-xs text-[var(--tm-text-muted)] font-medium">Workforce Management</p>
          </div>
          <div className="tm-avatar">
            {currentUser.fullName.split(' ').map((n: string) => n[0]).join('')}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* ─── SCENARIO A: NEW USER ─── */}
        {isNewUser && (
          <div className="animate-slide-up">
            <div className="tm-card p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--tm-sky-main)] to-[var(--tm-sky-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-[var(--tm-text-main)] mb-2">Welcome to Payroll Pro</h2>
              <p className="text-sm text-[var(--tm-text-muted)] mb-6 max-w-[320px] mx-auto">
                Manage employees, branches, payroll, approvals, workforce records, 
                employment verification and salary automation — all in one place.
              </p>
              <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
                <button onClick={() => navigate('/payroll-pro/create-company')} className="tm-btn-primary">
                  <Plus className="w-5 h-5" />
                  Create Company
                </button>
                <button className="tm-btn-secondary">
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
                <div key={i} className="tm-card p-4 text-center animate-slide-up" style={{ animationDelay: `${0.1 * (i + 1)}s` }}>
                  <feature.icon className="w-6 h-6 text-[var(--tm-sky-main)] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[var(--tm-text-main)]">{feature.label}</p>
                  <p className="text-[0.65rem] text-[var(--tm-text-muted)] mt-0.5">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SCENARIO C & D: OWNER (COMPANIES) ─── */}
        {isOwner && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h2 className="tm-section-title mb-0">My Companies</h2>
              <button 
                onClick={() => navigate('/payroll-pro/create-company')}
                className="text-xs font-bold text-[var(--tm-sky-main)] flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Company
              </button>
            </div>
            <div className="space-y-3">
              {ownedCompanies.map(company => (
                <CompanyCard key={company.id} company={company} role="owner" />
              ))}
            </div>
          </div>
        )}

        {/* ─── SCENARIO B & D: EMPLOYEE (EMPLOYMENTS) ─── */}
        {isEmployee && (
          <div className="animate-slide-up">
            <h2 className="tm-section-title">My Employments</h2>
            <div className="space-y-3">
              {employments.filter(emp => !emp.isOwner).map(employment => (
                <div 
                  key={employment.id}
                  onClick={() => navigate(`/payroll-pro/portal/${employment.companyId}`)}
                  className="tm-card p-4 tm-card-hover cursor-pointer animate-slide-up"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[var(--tm-text-main)] truncate">{employment.companyName}</h3>
                        <StatusBadge status={employment.status} size="sm" />
                      </div>
                      <p className="text-xs text-[var(--tm-text-muted)] mb-1 capitalize">
                        {employment.role.replace('_', '')} · {employment.department.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-[var(--tm-text-muted)]">{employment.branchName}</p>
                      <div className="mt-2 pt-2 border-t border-[var(--tm-border-light)] flex items-center justify-between">
                        <span className="text-xs text-[var(--tm-text-muted)]">Since {new Date(employment.employmentDate).toLocaleDateString()}</span>
                        <span className="text-sm font-bold text-[var(--tm-sky-dark)]">
                          &#8358;{employment.salary.toLocaleString()}
                          <span className="text-[0.65rem] font-medium text-[var(--tm-text-muted)]">/mo</span>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--tm-text-muted)] flex-shrink-0 self-center" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SCENARIO D: OWNER + EMPLOYEE ─── */}
        {isOwner && isEmployee && (
          <div className="mt-6 p-4 rounded-xl bg-[var(--tm-sky-light)] border border-[var(--tm-sky-main)]/20 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--tm-sky-main)] flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--tm-sky-dark)]">Managing Multiple Roles</p>
                <p className="text-xs text-[var(--tm-text-muted)]">
                  You own {ownedCompanies.length} compan{ownedCompanies.length === 1 ? 'y' : 'ies'} and work at {employments.filter(e => !e.isOwner).length} other{employments.filter(e => !e.isOwner).length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
