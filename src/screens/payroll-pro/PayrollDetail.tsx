import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Wallet, Users, Check, Clock } from 'lucide-react';
import { payrollRecords } from '@/mocks/payroll-data';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

export default function PayrollDetail() {
  const { payrollId } = useParams<{ payrollId: string }>();
  const navigate = useNavigate();
  const payroll = payrollRecords.find(p => p.id === payrollId);

  if (!payroll) {
    return (
      <div className="tm-page flex items-center justify-center">
        <EmptyState type="general" title="Payroll Not Found" actionLabel="Go Back" onAction={() => navigate(-1)} />
      </div>
    );
  }

  return (
    <div className="tm-page">
      <div className="tm-nav-header px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-[var(--tm-text-muted)] hover:text-[var(--tm-text-main)] transition-colors mb-3">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-[var(--tm-text-main)] truncate">{payroll.name}</h1>
            <StatusBadge status={payroll.status} size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 pb-24 space-y-4">
        {/* Summary Card */}
        <div className="tm-card p-4 animate-slide-up">
          <div className="text-center mb-4">
            <p className="text-xs text-[var(--tm-text-muted)]">Total Net Payout</p>
            <p className="text-3xl font-black text-[var(--tm-text-main)]">
              &#8358;{payroll.status === 'draft' ? '0' : payroll.totalNetSalary.toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--tm-border)]">
            <div className="text-center">
              <p className="text-xs text-[var(--tm-text-muted)]">Gross</p>
              <p className="text-sm font-bold text-[var(--tm-text-main)]">&#8358;{payroll.totalGrossSalary.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[var(--tm-success)]">Bonuses</p>
              <p className="text-sm font-bold text-[var(--tm-success)]">+&#8358;{payroll.totalBonuses.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[var(--tm-danger)]">Deductions</p>
              <p className="text-sm font-bold text-[var(--tm-danger)]">-&#8358;{payroll.totalDeductions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="tm-card p-4 space-y-3 animate-slide-up">
          <h3 className="text-sm font-bold text-[var(--tm-text-main)]">Payroll Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--tm-text-muted)]">Pay Period</span>
              <span className="font-bold">{new Date(payroll.payPeriodStart).toLocaleDateString()} - {new Date(payroll.payPeriodEnd).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--tm-text-muted)]">Pay Date</span>
              <span className="font-bold">{new Date(payroll.payDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--tm-text-muted)]">Total Employees</span>
              <span className="font-bold flex items-center gap-1"><Users className="w-3.5 h-3.5" />{payroll.totalEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--tm-text-muted)]">Type</span>
              <span className="font-bold capitalize">{payroll.type}</span>
            </div>
            {payroll.processedBy && (
              <div className="flex justify-between">
                <span className="text-[var(--tm-text-muted)]">Processed By</span>
                <span className="font-bold">{payroll.processedBy}</span>
              </div>
            )}
            {payroll.approvedBy && (
              <div className="flex justify-between">
                <span className="text-[var(--tm-text-muted)]">Approved By</span>
                <span className="font-bold">{payroll.approvedBy}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="tm-card p-4 animate-slide-up">
          <h3 className="text-sm font-bold text-[var(--tm-text-main)] mb-3">Processing Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Draft Created', done: true, time: '3 days ago' },
              { label: 'Pending Approval', done: payroll.status !== 'draft', time: payroll.status !== 'draft' ? '2 days ago' : 'Waiting' },
              { label: 'Approved', done: ['approved', 'processing', 'completed'].includes(payroll.status), time: payroll.approvedAt ? new Date(payroll.approvedAt).toLocaleDateString() : 'Pending' },
              { label: 'Processing', done: ['processing', 'completed'].includes(payroll.status), time: payroll.processedAt ? new Date(payroll.processedAt).toLocaleDateString() : 'Pending' },
              { label: 'Completed', done: payroll.status === 'completed', time: payroll.status === 'completed' ? 'Done' : 'Pending' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? 'bg-[var(--tm-success)] text-white' : 'bg-[var(--tm-border)] text-[var(--tm-text-muted)]'
                }`}>
                  {step.done ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${step.done ? 'text-[var(--tm-text-main)]' : 'text-[var(--tm-text-muted)]'}`}>{step.label}</p>
                  <p className="text-xs text-[var(--tm-text-muted)]">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {payroll.status === 'draft' && (
          <div className="flex gap-3 animate-slide-up">
            <button className="tm-btn-primary flex-1">
              <Check className="w-5 h-5" />
              Submit for Approval
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
