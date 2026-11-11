import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Wallet, Users, Check, CheckCircle2, AlertCircle, Loader2, Trash2, X } from 'lucide-react';
import { Sidebar, Header, Toast, PinModal } from '@/components/ui-custom';
import { useRun, useSubmitRun, useCancelRun, useRejectRun } from '@/lib/payrollApi';
import StatusBadge from '@/components/payroll-pro/StatusBadge';
import EmptyState from '@/components/payroll-pro/EmptyState';

const STEPS = ['Draft', 'Pending approval', 'Completed'] as const;

const METHOD_LABEL: Record<string, string> = {
  wallet: 'Wallet',
  bank: 'Bank transfer',
  skipped: 'Skipped',
};

const LINE_STYLE: Record<string, string> = {
  paid: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
  failed: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30',
  pending: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
  skipped: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
};

export default function PayrollDetail() {
  const { payrollId } = useParams<{ payrollId: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { PinComponent, showPinModal, message } = PinModal();

  const { data: payroll, isLoading, refetch, error } = useRun(payrollId);
  const submitRun = useSubmitRun(payrollId ?? '', payroll?.companyId ?? '');
  const cancelRun = useCancelRun(payrollId ?? '', payroll?.companyId ?? '');
  const rejectRun = useRejectRun(payrollId ?? '', payroll?.companyId ?? '');

  // Show the outcome of PIN-confirmed actions (approve / retry).
  useEffect(() => {
    if (!message) return;
    if (message.success || (!message.error && message.message)) {
      const paid = (message as any)?.paid;
      const failed = (message as any)?.failed;
      const pending = (message as any)?.pending;
      if (paid !== undefined) {
        showToast(`Payout finished: ${paid} paid${failed ? `, ${failed} failed` : ''}${pending ? `, ${pending} pending` : ''}`);
      } else {
        showToast('Done');
      }
      void refetch();
    } else {
      showToast(message.error || message.message || 'Action failed');
    }
  }, [message, showToast, refetch]);

  const lines = payroll?.lines ?? [];
  const pendingLines = useMemo(() => lines.filter(l => l.status === 'pending'), [lines]);
  const failedLines = useMemo(() => lines.filter(l => l.status === 'failed'), [lines]);
  const paidLines = useMemo(() => lines.filter(l => l.status === 'paid'), [lines]);

  const canSubmit = payroll?.status === 'draft';
  const canApprove = payroll?.status === 'pending_approval';
  const canRetry = payroll?.status === 'partially_completed' || payroll?.status === 'failed';
  const canCancel = payroll?.status === 'draft';

  const handleSubmit = () => {
    if (!payrollId || !payroll) return;
    submitRun.mutate(undefined, {
      onSuccess: () => showToast('Submitted for approval'),
      onError: (e) => showToast(e?.message ?? 'Could not submit'),
    });
  };

  const handleCancel = () => {
    if (!window.confirm('Delete this draft run?')) return;
    cancelRun.mutate(undefined, {
      onSuccess: () => {
        showToast('Draft cancelled');
        navigate(-1);
      },
      onError: (e) => showToast(e?.message ?? 'Could not cancel'),
    });
  };

  const handleReject = () => {
    if (!window.confirm('Send this run back to draft? Bonuses/deductions stay attached to it.')) return;
    rejectRun.mutate({ reason: 'Rejected by reviewer' }, {
      onSuccess: () => showToast('Sent back to draft'),
      onError: (e) => showToast(e?.message ?? 'Could not reject'),
    });
  };

  const handleApprove = () => showPinModal();
  const handleRetry = () => showPinModal();

  if (isLoading || !payroll) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : (
          <EmptyState type="general" title="Payroll not found" description={(error as any)?.message ?? 'This run could not be loaded.'} actionLabel="Go Back" onAction={() => navigate(-1)} />
        )}
      </div>
    );
  }

  const stepIndex = payroll.status === 'draft' ? 0 : payroll.status === 'pending_approval' ? 1 : 3;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />
      <PinComponent type={canApprove ? 'payroll-approve' : 'payroll-retry'} value={{ id: payroll.id }} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title={payroll.name || 'Payroll Run'}
            subtitle={`${payroll.companyName} · Payroll Processing`}
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Top action row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{payroll.name}</span>
                <StatusBadge status={payroll.status} size="sm" />
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-slide-up">
              <div className="text-center mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Net Payout</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">
                  &#8358;{payroll.status === 'draft' ? '0' : payroll.totalNetSalary.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Bonuses &amp; deductions are already baked into the net figure.</p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <div className="text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Gross</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">&#8358;{payroll.totalGrossSalary.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Bonuses</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">+&#8358;{payroll.totalBonuses.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Deductions</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">-&#8358;{payroll.totalDeductions.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Progress tracker */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-slide-up">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-4">Progress</h3>
              <div className="flex items-center">
                {STEPS.map((label, i) => {
                  const done = stepIndex > i;
                  const current = stepIndex === i;
                  return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          done ? 'bg-emerald-500 text-white' :
                          current ? 'bg-sky-500 text-white' :
                          'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {done ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 text-center">{label}</p>
                      </div>
                      {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />}
                    </div>
                  );
                })}
              </div>
              {payroll.payPeriodStart && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  Period: {new Date(payroll.payPeriodStart).toLocaleDateString()} — {payroll.payPeriodEnd ? new Date(payroll.payPeriodEnd).toLocaleDateString() : '—'}
                  {payroll.payDate && <> · Pay date {new Date(payroll.payDate).toLocaleDateString()}</>}
                </p>
              )}
              {payroll.rejectionReason && (
                <p className="text-[11px] text-rose-500 mt-2 flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> {payroll.rejectionReason}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {canSubmit && (
                <button
                  onClick={handleSubmit}
                  disabled={submitRun.isPending}
                  className="flex-1 sm:flex-none bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {submitRun.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Submit for Approval
                </button>
              )}
              {canApprove && (
                <button
                  onClick={handleApprove}
                  className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Approve & Disburse
                </button>
              )}
              {canApprove && (
                <button
                  onClick={handleReject}
                  className="flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Send Back
                </button>
              )}
              {canRetry && (
                <button
                  onClick={handleRetry}
                  className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <AlertCircle className="w-4 h-4" />
                  Retry Failed ({failedLines.length})
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  className="flex-none text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Draft
                </button>
              )}
            </div>

            {/* Lines */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Payslips ({lines.length})
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <span className="text-emerald-500">{paidLines.length} paid</span>
                  {pendingLines.length > 0 && <span className="text-amber-500">{pendingLines.length} pending</span>}
                  {failedLines.length > 0 && <span className="text-rose-500">{failedLines.length} failed</span>}
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[640px] text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="text-left px-4 py-2.5">Employee</th>
                      <th className="text-left px-4 py-2.5">Method</th>
                      <th className="text-right px-4 py-2.5">Bonus</th>
                      <th className="text-right px-4 py-2.5">Net</th>
                      <th className="text-left px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {lines.map(line => (
                      <tr key={line.id}>
                        <td className="px-4 py-2.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{line.employeeName}</p>
                          {line.failReason && <p className="text-[10px] text-rose-500 mt-0.5">{line.failReason}</p>}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                          {METHOD_LABEL[line.method] ?? line.method}
                          {line.method === 'bank' && line.bankName && (
                            <p className="text-[10px] text-slate-400">{line.bankName}{line.bankAccountNumber ? ` ••${line.bankAccountNumber.slice(-4)}` : ''}</p>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{line.bonusCents > 0 ? `+₦${(line.bonusCents / 100).toLocaleString()}` : '—'}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-slate-100">₦{(line.netCents / 100).toLocaleString()}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${LINE_STYLE[line.status] ?? LINE_STYLE.skipped}`}>
                            {line.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {lines.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No lines in this run.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
