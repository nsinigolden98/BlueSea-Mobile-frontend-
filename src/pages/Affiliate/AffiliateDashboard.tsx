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
  Copy,
  Check,
  User,
  ShieldCheck,
  Clock,
  XCircle,
} from 'lucide-react';
import { affiliateApi } from '@/services/affiliateApi';
import { useAuth } from '@/context/AuthContext';
import type {
  AffiliateDashboardResponse,
  AffiliateSaleRecord,
  AffiliateStatusResponse,
} from '@/types/affiliate';

type ViewState =
  | 'loading'
  | 'unauthenticated'
  | 'not_affiliate'
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'error';

export function AffiliateDashboard() {
  const auth = useAuth() as any;
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const isAuthLoading = auth?.isLoading ?? auth?.authLoading ?? false;

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [affiliateStatus, setAffiliateStatus] = useState<AffiliateStatusResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<AffiliateDashboardResponse | null>(null);
  const [sales, setSales] = useState<AffiliateSaleRecord[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [regForm, setRegForm] = useState({
    affiliate_name: '',
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    agreement: false,
  });
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }
    if (typeof error === 'string' && error.trim()) {
      return error;
    }
    if (error && typeof error === 'object') {
      const errObj = error as Record<string, unknown>;
      if (typeof errObj.detail === 'string' && errObj.detail.trim()) {
        return errObj.detail;
      }
      if (typeof errObj.message === 'string' && errObj.message.trim()) {
        return errObj.message;
      }
    }
    return fallback;
  };

  const fetchAffiliateStatus = async (): Promise<AffiliateStatusResponse> => {
    const api = affiliateApi as any;
    if (typeof api.getStatus === 'function') {
      return await api.getStatus();
    }
    if (typeof api.getAffiliateStatus === 'function') {
      return await api.getAffiliateStatus();
    }
    throw new Error('Affiliate status endpoint not found on API service.');
  };

  const submitApplication = async (payload: {
    affiliate_name: string;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    tiktok: string | null;
    agreement: boolean;
  }): Promise<AffiliateStatusResponse> => {
    const api = affiliateApi as any;
    if (typeof api.apply === 'function') {
      return await api.apply(payload);
    }
    if (typeof api.applyAffiliate === 'function') {
      return await api.applyAffiliate(payload);
    }
    throw new Error('Affiliate application endpoint not found on API service.');
  };

  const loadDashboardFinancials = async (isMounted = true, showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      const [dashRes, salesRes] = await Promise.all([
        affiliateApi.getDashboard(),
        affiliateApi.getSales(),
      ]);

      if (!isMounted) return;

      setDashboardData(dashRes);
      setSales(Array.isArray(salesRes) ? salesRes : []);
    } catch (error: unknown) {
      if (!isMounted) return;
      setErrorMessage(getErrorMessage(error, 'Unable to sync affiliate performance data.'));
    } finally {
      if (isMounted) {
        setIsRefreshing(false);
      }
    }
  };

  const checkStatusAndInitialize = useCallback(
    async (isMounted = true) => {
      if (isAuthLoading) return;

      if (!isAuthenticated && !user) {
        if (isMounted) setViewState('unauthenticated');
        return;
      }

      if (isMounted) {
        setViewState('loading');
        setErrorMessage(null);
      }

      try {
        const statusRes = await fetchAffiliateStatus();
        if (!isMounted) return;

        setAffiliateStatus(statusRes);

        if (statusRes.status === 'pending') {
          setViewState('pending');
        } else if (statusRes.status === 'rejected') {
          setViewState('rejected');
        } else if (statusRes.status === 'approved' || statusRes.is_approved) {
          setViewState('approved');
          await loadDashboardFinancials(isMounted);
        } else {
          setViewState('pending');
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        const statusNumber = (err as any)?.status || (err as any)?.response?.status;
        const msg = typeof (err as any)?.message === 'string' ? (err as any).message : '';

        if (statusNumber === 404 || msg.includes('404') || msg.includes('No AffiliateProfile matches')) {
          setAffiliateStatus(null);
          setViewState('not_affiliate');
        } else if (statusNumber === 401) {
          setViewState('unauthenticated');
        } else {
          setErrorMessage(getErrorMessage(err, 'Failed to verify affiliate profile status.'));
          setViewState('error');
        }
      }
    },
    [isAuthLoading, isAuthenticated, user]
  );

  useEffect(() => {
    let isMounted = true;
    checkStatusAndInitialize(isMounted);
    return () => {
      isMounted = false;
    };
  }, [checkStatusAndInitialize]);

  const handleCopyAffiliateName = async () => {
    if (!affiliateStatus?.affiliate_name) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(affiliateStatus.affiliate_name);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = affiliateStatus.affiliate_name;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error: unknown) {
      console.error('Failed to copy affiliate name:', error);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const name = regForm.affiliate_name.trim();
    if (!name) {
      setRegError('Affiliate name is required.');
      return;
    }
    if (name.length > 13) {
      setRegError('Affiliate name must not exceed 13 characters.');
    }
    if (!/^[A-Za-z0-9]+$/.test(name)) {
      setRegError('Affiliate name must contain only letters and numbers.');
      return;
    }
    if (!regForm.agreement) {
      setRegError('You must agree to the affiliate terms.');
      return;
    }

    setIsSubmittingReg(true);

    try {
      const response = await submitApplication({
        affiliate_name: name,
        facebook: regForm.facebook.trim() || null,
        instagram: regForm.instagram.trim() || null,
        twitter: regForm.twitter.trim() || null,
        tiktok: regForm.tiktok.trim() || null,
        agreement: true,
      });

      setAffiliateStatus(response);

      if (response.status === 'pending') {
        setViewState('pending');
      } else if (response.status === 'approved' || response.is_approved) {
        setViewState('approved');
        await loadDashboardFinancials(true);
      } else if (response.status === 'rejected') {
        setViewState('rejected');
      }
    } catch (err: unknown) {
      setRegError(getErrorMessage(err, 'Failed to submit application. Please try again.'));
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const handleRequestPayout = async () => {
    if (isSubmittingPayout) return;

    setIsSubmittingPayout(true);
    setPayoutMessage(null);

    try {
      const res = await affiliateApi.requestPayout();

      setPayoutMessage({
        type: 'success',
        text: (res as any)?.message || 'Payout request completed successfully.',
      });

      await loadDashboardFinancials(true, true);
      setIsPayoutModalOpen(false);
    } catch (error: unknown) {
      setPayoutMessage({
        type: 'error',
        text: getErrorMessage(error, 'Failed to process payout request.'),
      });
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const getUserRegisteredName = (): string => {
    if (!user) return 'Registered User';
    const first = user.firstName || user.first_name || '';
    const last = user.surname || user.lastName || user.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || user.name || user.email || 'Registered User';
  };

  const formatCurrency = (value?: string | number | null): string => {
    if (value === undefined || value === null || value === '') {
      return '₦0.00';
    }
    const numericValue = typeof value === 'number' ? value : Number.parseFloat(String(value));
    if (!Number.isFinite(numericValue)) {
      return '₦0.00';
    }
    return `₦${numericValue.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const parseAmount = (value?: string | null): number => {
    if (!value) return 0;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  if (viewState === 'loading' || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-2" />
        <p className="text-xs font-bold">Loading Affiliate Dashboard...</p>
      </div>
    );
  }

  if (viewState === 'unauthenticated') {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Authentication Required</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Please log in to your BlueSea Mobile account to access or register for the affiliate program.
        </p>
      </div>
    );
  }

  if (viewState === 'not_affiliate') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Become a BlueSea Affiliate</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Promote events and earn competitive commissions. Choose a unique affiliate name to get started.
            </p>
          </div>

          {regError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Affiliate Name (Letters and numbers only, max 13 chars)
              </label>
              <input
                type="text"
                required
                maxLength={13}
                value={regForm.affiliate_name}
                onChange={(e) =>
                  setRegForm({ ...regForm, affiliate_name: e.target.value.replace(/[^A-Za-z0-9]/g, '') })
                }
                placeholder="e.g. JohnPartner01"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Facebook Handle / URL (Optional)</label>
                <input
                  type="text"
                  value={regForm.facebook}
                  onChange={(e) => setRegForm({ ...regForm, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourhandle"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Instagram Handle / URL (Optional)</label>
                <input
                  type="text"
                  value={regForm.instagram}
                  onChange={(e) => setRegForm({ ...regForm, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">X / Twitter Handle / URL (Optional)</label>
                <input
                  type="text"
                  value={regForm.twitter}
                  onChange={(e) => setRegForm({ ...regForm, twitter: e.target.value })}
                  placeholder="https://x.com/yourhandle"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">TikTok Handle / URL (Optional)</label>
                <input
                  type="text"
                  value={regForm.tiktok}
                  onChange={(e) => setRegForm({ ...regForm, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@yourhandle"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                required
                checked={regForm.agreement}
                onChange={(e) => setRegForm({ ...regForm, agreement: e.target.checked })}
                className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                I accept the BlueSea Mobile Affiliate Partner Agreement.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmittingReg}
              className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmittingReg ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Affiliate Application'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewState === 'pending') {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4 my-8 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Application Pending Review</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your affiliate profile for <strong className="text-slate-800 dark:text-slate-200">{affiliateStatus?.affiliate_name}</strong> is under review by our administration team.
        </p>
        <button
          type="button"
          onClick={() => checkStatusAndInitialize(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Check Application Status
        </button>
      </div>
    );
  }

  if (viewState === 'rejected') {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-4 my-8 animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Application Not Approved</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {affiliateStatus?.rejected_reason || 'Your affiliate application was not approved.'}
        </p>
        <button
          type="button"
          onClick={() => setViewState('not_affiliate')}
          className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors"
        >
          Re-apply for Affiliate Program
        </button>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-4 max-w-md mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Connection Error</h3>
        <p className="text-xs text-rose-500 dark:text-rose-400">{errorMessage}</p>
        <button
          type="button"
          onClick={() => checkStatusAndInitialize(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const payableNum = parseAmount(dashboardData?.payable_amount);
  const isPayoutEligible = payableNum > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            Financial Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time performance analytics & payout management.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboardFinancials(true, true)}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Registered Account
            </p>
            <p className="text-sm font-extrabold text-slate-800 dark:text-white">
              {getUserRegisteredName()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
              Affiliate Identity
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-3 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-black text-xs">
                {affiliateStatus?.affiliate_name || 'N/A'}
              </span>
              <button
                type="button"
                onClick={handleCopyAffiliateName}
                disabled={!affiliateStatus?.affiliate_name}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Copy Affiliate Name"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-6 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available for Payout
          </p>
          <h3 className="text-3xl font-black text-emerald-400">
            {formatCurrency(dashboardData?.payable_amount)}
          </h3>
          <p className="text-[11px] text-slate-400">
            Paid Amount: {formatCurrency(dashboardData?.paid_amount)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPayoutMessage(null);
            setIsPayoutModalOpen(true);
          }}
          disabled={!isPayoutEligible}
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Wallet className="w-4 h-4" />
          Request Payout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Earnings
            </p>
            <p className="text-2xl font-black text-amber-500">
              {formatCurrency(dashboardData?.pending_amount)}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Payable Balance
            </p>
            <p className="text-2xl font-black text-emerald-500">
              {formatCurrency(dashboardData?.payable_amount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <MousePointer className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Link Clicks</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {dashboardData?.total_clicks ?? 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <Ticket className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ticket Sales</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {dashboardData?.total_sales ?? 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <TrendingUp className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Successful Count</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {dashboardData?.success_count ?? 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <DollarSign className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Paid Sales</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {dashboardData?.paid_count ?? 0}
          </p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="font-black text-slate-800 dark:text-white text-base">
          Referral Sales & Commissions
        </h3>

        {sales.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No affiliate commissions recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sales.map((sale) => {
              const saleDate = new Date(sale.created_at);
              const formattedDate = Number.isNaN(saleDate.getTime())
                ? 'Date unavailable'
                : saleDate.toLocaleDateString('en-NG');

              return (
                <div key={sale.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {sale.event_title || 'Event Referral'}
                    </p>
                    <p className="text-[10px] text-slate-400">{formattedDate}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-sky-500">
                      +{formatCurrency(sale.commission_amount)}
                    </p>
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
              );
            })}
          </div>
        )}
      </div>

      {isPayoutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payout-dialog-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 id="payout-dialog-title" className="text-lg font-black text-slate-900 dark:text-white">
              Confirm Payout Request
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You are requesting to payout your available balance of{' '}
              <strong className="text-emerald-500 font-bold">
                {formatCurrency(dashboardData?.payable_amount)}
              </strong>{' '}
              to your BlueSea Mobile wallet.
            </p>

            {payoutMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  payoutMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {payoutMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
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
                disabled={isSubmittingPayout || !isPayoutEligible}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmittingPayout ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirm Payout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}