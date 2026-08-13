import { useEffect, useState, useCallback } from 'react';
import {
  MousePointer,
  Ticket,
  TrendingUp,
  DollarSign,
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { affiliateApi } from '@/services/affiliateApi';
import type { AffiliateDashboardResponse, AffiliateSaleRecord } from '@/types/affiliate';

export function AffiliateDashboard() {
  const [dashboardData, setDashboardData] = useState<AffiliateDashboardResponse | null>(null);
  const [sales, setSales] = useState<AffiliateSaleRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payout states
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    setErrorMessage(null);

    try {
      const [data, salesList] = await Promise.all([
        affiliateApi.getDashboard(),
        affiliateApi.getSales(),
      ]);
      setDashboardData(data);
      setSales(salesList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sync affiliate performance data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRequestPayout = async () => {
    setIsSubmittingPayout(true);
    setPayoutMessage(null);

    try {
      const res = await affiliateApi.requestPayout();
      setPayoutMessage({
        type: 'success',
        text: res.message || 'Payout request completed successfully.',
      });
      fetchDashboardData(true);
    } catch (err: any) {
      setPayoutMessage({
        type: 'error',
        text: err.message || 'Failed to process payout request.',
      });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const formatCurrency = (val?: string | number) => {
    if (val === undefined || val === null) return '₦0.00';
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? '₦0.00' : `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
        <p className="text-xs font-bold">Loading Financial & Marketing Data...</p>
      </div>
    );
  }

  const payableNum = dashboardData ? parseFloat(dashboardData.payable_amount || '0') : 0;
  const isPayoutEligible = payableNum > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Financial Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Real-time performance analytics & payout management.</p>
        </div>

        <button
          onClick={() => fetchDashboardData(true)}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Payout Action & Balance Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-6 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available for Payout</p>
          <h3 className="text-3xl font-black text-emerald-400">
            {formatCurrency(dashboardData?.payable_amount)}
          </h3>
          <p className="text-[11px] text-slate-400">Paid Amount: {formatCurrency(dashboardData?.paid_amount)}</p>
        </div>

        <button
          onClick={() => {
            setPayoutMessage(null);
            setIsPayoutModalOpen(true);
          }}
          disabled={!isPayoutEligible}
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Wallet className="w-4 h-4" /> Request Payout
        </button>
      </div>

      {/* Financial Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Earnings</p>
            <p className="text-2xl font-black text-amber-500">{formatCurrency(dashboardData?.pending_amount)}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payable Balance</p>
            <p className="text-2xl font-black text-emerald-500">{formatCurrency(dashboardData?.payable_amount)}</p>
          </div>
        </div>
      </div>

      {/* Marketing Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <MousePointer className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Link Clicks</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{dashboardData?.total_clicks ?? 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <Ticket className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ticket Sales</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{dashboardData?.total_sales ?? 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <TrendingUp className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Successful Count</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{dashboardData?.success_count ?? 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <DollarSign className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Paid Sales</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{dashboardData?.paid_count ?? 0}</p>
        </div>
      </div>

      {/* Recent Referral Commissions Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="font-black text-slate-800 dark:text-white text-base">Referral Sales & Commissions</h3>

        {sales.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No affiliate commissions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sales.map((sale) => (
              <div key={sale.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{sale.event_title || 'Event Referral'}</p>
                  <p className="text-[10px] text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sky-500">+{formatCurrency(sale.commission_amount)}</p>
                  <span
                    className={`text-[9px] font-bold uppercase ${
                      sale.status === 'paid' || sale.status === 'payable' || sale.status === 'success'
                        ? 'text-emerald-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Confirm Payout Request</h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You are requesting to payout your available balance of{' '}
              <strong className="text-emerald-500 font-bold">{formatCurrency(dashboardData?.payable_amount)}</strong> to your BlueSea Mobile wallet.
            </p>

            {payoutMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  payoutMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {payoutMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{payoutMessage.text}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                disabled={isSubmittingPayout}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRequestPayout}
                disabled={isSubmittingPayout}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmittingPayout ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}