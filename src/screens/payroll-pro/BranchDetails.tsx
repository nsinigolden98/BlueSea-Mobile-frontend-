import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Users, UserCog, Wallet, Settings, Plus } from 'lucide-react';
import { useBranch } from '@/hooks/usePayrollPro';
import EmployeeCard from '@/components/payroll-pro/EmployeeCard';
import EmptyState from '@/components/payroll-pro/EmptyState';
import StatusBadge from '@/components/payroll-pro/StatusBadge';

type Tab = 'employees' | 'payroll' | 'settings';

export default function BranchDetails() {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('employees');
  const { branch, employees, payrolls } = useBranch(branchId || '');

  if (!branch) {
    return (
      <div className="tm-page flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--tm-text-muted)]">Branch not found</p>
          <button onClick={() => navigate(-1)} className="tm-btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'employees', label: 'Employees', icon: Users },
    { key: 'payroll', label: 'Payroll', icon: Wallet },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="tm-page">
      <div className="tm-nav-header px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors mb-3">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-lg font-extrabold text-[var(--tm-text-main)] truncate">{branch.name}</h1>
              <StatusBadge status={branch.status} size="sm" />
            </div>
            <p className="text-xs text-[var(--tm-text-muted)] truncate">{branch.address}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
        {/* Branch Info Card */}
        <div className="tm-card p-4 mb-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--tm-text-muted)]">Branch Manager</p>
              <p className="text-sm font-bold text-[var(--tm-text-main)] flex items-center gap-1">
                <UserCog className="w-3.5 h-3.5" />
                {branch.managerName || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--tm-text-muted)]">Staff Count</p>
              <p className="text-sm font-bold text-[var(--tm-text-main)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {branch.employeeCount} employees
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--tm-text-muted)]">Monthly Payroll</p>
              <p className="text-sm font-bold text-[var(--tm-sky-dark)]">
                &#8358;{branch.monthlyPayrollEstimate.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--tm-text-muted)]">Status</p>
              <StatusBadge status={branch.status} size="sm" />
            </div>
          </div>
          {branch.description && (
            <p className="text-xs text-[var(--tm-text-muted)] mt-3 pt-3 border-t border-[var(--tm-border-light)]">{branch.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="tm-tab-bar mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tm-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-3 animate-slide-up">
            {employees.length > 0 ? (
              <>
                <p className="text-sm text-[var(--tm-text-muted)]">{employees.length} employee{employees.length !== 1 ? 's' : ''}</p>
                {employees.map(emp => (
                  <EmployeeCard key={emp.id} employee={emp} showBranch={false} />
                ))}
              </>
            ) : (
              <EmptyState type="employees" actionLabel="Add Employee" onAction={() => {}} />
            )}
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="space-y-3 animate-slide-up">
            {payrolls.length > 0 ? (
              payrolls.map(payroll => (
                <div key={payroll.id} className="tm-card p-4">
                  <h3 className="font-bold text-[var(--tm-text-main)]">{payroll.name}</h3>
                  <StatusBadge status={payroll.status} size="sm" />
                </div>
              ))
            ) : (
              <EmptyState type="payroll" actionLabel="Run Payroll" onAction={() => {}} />
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-slide-up">
            <div className="tm-card divide-y divide-[var(--tm-border-light)]">
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--tm-border-light)]/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">Edit Branch</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">Update name, address, manager</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-[var(--tm-text-muted)] rotate-180" />
              </button>
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--tm-border-light)]/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">Assign Manager</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">Set or change branch manager</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-[var(--tm-text-muted)] rotate-180" />
              </button>
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--tm-border-light)]/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-[var(--tm-text-main)]">Transfer Employee</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">Move staff between branches</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-[var(--tm-text-muted)] rotate-180" />
              </button>
              <button className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--tm-danger-light)]/30 transition-colors">
                <div>
                  <p className="text-sm font-bold text-[var(--tm-danger)]">Archive Branch</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">Suspend this branch temporarily</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-[var(--tm-danger)] rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="tm-fab">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
