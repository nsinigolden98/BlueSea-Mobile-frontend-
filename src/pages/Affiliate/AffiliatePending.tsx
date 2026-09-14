import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { affiliateApi } from '@/services/affiliateApi';

export function AffiliatePending() {
  const navigate = useNavigate();

  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    if (isChecking) {
      return;
    }

    setIsChecking(true);
    setErrorMessage(null);

    try {
      const statusData = await affiliateApi.getStatus();

      if (
        statusData.is_approved ||
        statusData.status === 'approved'
      ) {
        navigate('/affiliate/dashboard', { replace: true });
        return;
      }

      if (statusData.status === 'rejected') {
        setErrorMessage(
          statusData.rejected_reason
            ? `Application rejected: ${statusData.rejected_reason}`
            : 'Your application was unfortunately not approved at this time.'
        );
        return;
      }

      if (statusData.status === 'pending') {
        setErrorMessage(null);
        return;
      }

      setErrorMessage(
        'No active affiliate application was found. Please return to the affiliate registration page and try again.'
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to check application status. Please try again.';

      setErrorMessage(message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 my-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-6 shadow-xl">
      <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <Clock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Pending Review
        </span>

        <h2 className="text-2xl font-black text-slate-800 dark:text-white">
          Application Submitted
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Our team is currently reviewing your affiliate application. Once
          approved, you will be able to access your dashboard and create
          unique tracking links.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 text-left"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleCheckStatus}
          disabled={isChecking}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              isChecking ? 'animate-spin' : ''
            }`}
          />

          {isChecking
            ? 'Checking Status...'
            : 'Refresh Application Status'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />

          Return to Marketplace
        </button>
      </div>
    </div>
  );
}