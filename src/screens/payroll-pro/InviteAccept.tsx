import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Building2, Check, Loader2, X } from 'lucide-react';
import { Toast } from '@/components/ui-custom';
import { useInviteByToken, useAcceptInvite, useDeclineInvite } from '@/lib/payrollApi';

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();

  const { data: invite, isLoading, isError, error } = useInviteByToken(token ?? '');
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();

  useEffect(() => {
    if (isError) {
      showToast((error as any)?.message ?? 'Invitation not found or expired');
    }
  }, [isError, error, showToast]);

  const handleDecline = () => {
    if (!invite) return;
    declineInvite.mutate(invite.id, {
      onSuccess: () => {
        showToast('Invitation declined');
        navigate('/payroll-pro');
      },
      onError: (e) => showToast(e?.message ?? 'Could not decline'),
    });
  };

  const handleAccept = () => {
    if (!invite) return;
    acceptInvite.mutate(invite.id, {
      onSuccess: () => {
        showToast('You now have payroll access');
        navigate(`/payroll-pro/company/${invite.companyId}`);
      },
      onError: (e) => showToast(e?.message ?? 'Could not accept'),
    });
  };

  const isPending = invite?.status === 'pending';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <ToastComponent />
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>

          {isLoading && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              <p className="text-xs text-slate-500">Loading invitation…</p>
            </div>
          )}

          {!isLoading && !invite && (
            <div className="space-y-3">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Invitation unavailable</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This link is invalid or has expired. Ask the person who invited you to send a new one.
              </p>
              <button
                onClick={() => navigate('/payroll-pro')}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
              >
                Go to Payroll Pro
              </button>
            </div>
          )}

          {!isLoading && invite && (
            <>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-500 mb-1">Payroll Invitation</p>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{invite.companyName}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <strong>{invite.inviterName}</strong> invited you to manage payroll for this company on BlueSea Mobile.
                </p>
              </div>

              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 p-4 text-left text-xs text-sky-800 dark:text-sky-300 space-y-1.5">
                <p className="font-bold">As a payroll controller you will be able to:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Add and manage employees and branches</li>
                  <li>Create and approve payroll runs</li>
                  <li>Disburse salaries to employees</li>
                </ul>
              </div>

              {isPending ? (
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleAccept}
                    disabled={acceptInvite.isPending || declineInvite.isPending}
                    className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-sky-500/10"
                  >
                    {acceptInvite.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    Accept & take control
                  </button>
                  <button
                    onClick={handleDecline}
                    disabled={acceptInvite.isPending || declineInvite.isPending}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {declineInvite.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                    Decline
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This invitation is <strong className="capitalize">{invite.status}</strong>.
                  </p>
                  <button
                    onClick={() => navigate('/payroll-pro')}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    Go to Payroll Pro
                  </button>
                </div>
              )}

              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Expires {new Date(invite.expiresAt).toLocaleDateString()} · Declining cannot be undone.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
