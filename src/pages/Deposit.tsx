import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { 
  Sidebar, 
  Header, 
  LoadingSpinner 
} from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { useAuth } from '@/context/AuthContext';
import { getRequest, postRequest, ENDPOINTS } from '@/types';
import { openMobilePaystackCheckout } from '@/services/paystackCheckout';
import { DedicatedVirtualAccountModal } from '@/components/wallet/DedicatedVirtualAccountModal';
import { 
  CreditCard, 
  Landmark, 
  Info, 
  ArrowLeft, 
  ShieldAlert,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

type DepositMethod = 'paystack' | 'virtual_account';

export function Deposit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userData = user as any;

  // Always read the authenticated user's latest profile/DVA data from the backend.
  // This prevents stale AuthContext data from hiding an account that was created
  // after the BVN verification flow completed.
  const [backendUserData, setBackendUserData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected Method
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>('virtual_account');

  // Paystack Form State
  const [rawAmount, setRawAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Account Modal & Request State
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  const refreshBackendProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError('');

    try {
      const response = await getRequest(ENDPOINTS.user);
      const freshUser = response?.data && typeof response.data === 'object'
        ? response.data
        : response;

      if (freshUser && typeof freshUser === 'object') {
        setBackendUserData(freshUser);
        return freshUser;
      }

      setBackendUserData({});
      setProfileError('The backend did not return your account details.');
      return {};
    } catch (error) {
      console.error('Failed to refresh backend profile/DVA details:', error);
      setBackendUserData({});
      setProfileError('Unable to refresh your account details right now.');
      return {};
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshBackendProfile();

    const handleWindowFocus = () => {
      void refreshBackendProfile();
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [refreshBackendProfile]);

  // Backend profile is authoritative. AuthContext is only a safe fallback while
  // the fresh user/preference request is loading or if it has no DVA fields.
  const accountData = backendUserData || userData;

  // The backend profile is the source of truth. DVA data lives under
  // has_DVA/dva_account, so an existing account must be shown without
  // requiring another verification check.
  const dvaAccount = accountData?.dva_account ?? null;
  const hasVirtualAccount = accountData?.has_DVA === true && Boolean(dvaAccount?.account_number);

  const backendVerificationMessage =
    accountData?.message ||
    'Your verification has been checked, but the backend has not returned a Dedicated Virtual Account yet.';


  // Calculation Utilities
  const numericAmount = Number(rawAmount.replace(/\D/g, '')) || 0;
  
  // Paystack Checkout: no fee.
  const paystackFee = 0;
  const paystackTotal = numericAmount;

  // Dedicated Virtual Account: 1% processing fee.
  const virtualFee = Math.round(numericAmount * 0.01 * 100) / 100;
  const virtualTotal = numericAmount + virtualFee;

  const formatNaira = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handlePaystackCheckout = async () => {
    if (numericAmount < 100) {
      setDepositError('Minimum deposit amount is ₦100.00');
      return;
    }

    setDepositError('');
    setProcessing(true);

    try {
      // Backend expects desired deposit credit amount
      const response = await postRequest(ENDPOINTS.fund, { amount: numericAmount });

      if (response.success && response.authorization_url) {
        if (Capacitor.isNativePlatform()) {
          setProcessing(false);
          await openMobilePaystackCheckout(response.authorization_url);

          const authCtx = user as any;
          const refreshFn = authCtx?.refreshUser || authCtx?.checkAuth || authCtx?.fetchUserData;
          if (typeof refreshFn === 'function') {
            try {
              await refreshFn();
            } catch (err) {
              console.error('Error refreshing user state post checkout:', err);
            }
          }
        } else {
          setProcessing(false);
          window.location.href = response.authorization_url;
        }
      } else {
        setProcessing(false);
        setDepositError(response.message || 'Could not initiate payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Paystack checkout error:', error);
      setProcessing(false);
      setDepositError(error?.message || 'Payment initiation failed. Please check your connection.');
    }
  };

  const handleVirtualAccountAction = async () => {
    setDepositError('');
    setAccountLoading(true);

    try {
      // Always refresh the authenticated profile first. If a stakeholder has
      // already assigned the DVA, this immediately gives us the account and we
      // do NOT call the verification endpoint.
      const freshUser = await refreshBackendProfile();
      const freshDva = freshUser?.dva_account;
      const freshHasDva = freshUser?.has_DVA === true && Boolean(freshDva?.account_number);

      if (freshHasDva) {
        setAccountModalOpen(true);
        return;
      }

      // No DVA exists in the current-user response. Only now perform the
      // documented verification check for the authenticated user's email.
      const email = String(freshUser?.email || userData?.email || '').trim();
      if (!email) {
        setDepositError('Your account email is not available. Please refresh your profile and try again.');
        return;
      }

      const verificationResponse = await getRequest(ENDPOINTS.checkUserVerification(email));
      const verification = verificationResponse?.data && typeof verificationResponse.data === 'object'
        ? verificationResponse.data
        : verificationResponse;

      if (verification?.state === true) {
        // Verification is already satisfied. Retrieve the user profile one more
        // time because the stakeholder-created DVA is exposed there, not in the
        // verification endpoint response.
        const latestUser = await refreshBackendProfile();
        const latestDva = latestUser?.dva_account;
        const latestHasDva = latestUser?.has_DVA === true && Boolean(latestDva?.account_number);

        if (latestHasDva) {
          setAccountModalOpen(true);
          return;
        }

        // Do not invent a DVA creation call or pretend a pending state exists.
        // The backend simply has not returned the assigned account yet.
        setDepositError(
          'Your verification is complete, but your Dedicated Virtual Account details are not available yet. Please refresh and try again.'
        );
        return;
      }

      // Verification is not satisfied, so send the user to the existing
      // Identity Center/BVN flow.
      navigate('/identity-center');
    } catch (error: any) {
      console.error('Dedicated Virtual Account lookup failed:', error);
      setDepositError(error?.message || 'Unable to check your Dedicated Virtual Account right now. Please try again.');
    } finally {
      setAccountLoading(false);
    }
  };

  const handleRefreshAccount = useCallback(async () => {
    await refreshBackendProfile();
  }, [refreshBackendProfile]);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Deposit" 
            subtitle="Add money securely to your BlueSea wallet"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-xl mx-auto space-y-6 pb-12">
            
            {/* Back Button */}
            <button
              onClick={() => navigate('/wallet')}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Wallet</span>
            </button>

            {/* Title Banner */}
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Choose Deposit Method
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select your preferred option to fund your account instantly.
              </p>
            </div>

            {/* Method Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paystack Card Option */}
              <div
                onClick={() => setSelectedMethod('paystack')}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedMethod === 'paystack'
                    ? 'border-sky-500 bg-sky-500/5 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  {selectedMethod === 'paystack' && (
                    <CheckCircle2 className="w-5 h-5 text-sky-500" />
                  )}
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-4">
                  Paystack Checkout
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Card, Bank Transfer, USSD
                </p>
                <span className="inline-block mt-3 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  No fee
                </span>
              </div>

              {/* Dedicated Virtual Account Option */}
              <div
                onClick={() => setSelectedMethod('virtual_account')}
                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedMethod === 'virtual_account'
                    ? 'border-sky-500 bg-sky-500/5 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl">
                    <Landmark className="w-5 h-5" />
                  </div>
                  {selectedMethod === 'virtual_account' && (
                    <CheckCircle2 className="w-5 h-5 text-sky-500" />
                  )}
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-4">
                  Dedicated Account
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Direct Bank Transfer
                </p>
                <span className="inline-block mt-3 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                  Fee: 1%
                </span>
              </div>
            </div>

            {/* DETAILED METHOD PANELS */}
            
            {/* 1. PAYSTACK METHOD */}
            {selectedMethod === 'paystack' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Paystack Deposit
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fast and convenient online payment
                  </p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Deposit Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">
                      ₦
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={rawAmount}
                      onChange={(e) => {
                        setRawAmount(e.target.value.replace(/\D/g, ''));
                        setDepositError('');
                      }}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                    />
                  </div>
                  {depositError && (
                    <p className="text-xs text-red-500 font-bold mt-1">{depositError}</p>
                  )}
                </div>

                {/* Calculation Breakdown */}
                {numericAmount > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Deposit amount
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatNaira(numericAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Processing fee
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatNaira(paystackFee)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center text-sm font-black">
                      <span className="text-slate-900 dark:text-white">Total payable</span>
                      <span className="text-sky-500">{formatNaira(paystackTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Informational Fine Print */}
                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    No processing fee is charged for Paystack Checkout. Your wallet will be credited with the exact requested amount of <strong>{formatNaira(numericAmount)}</strong>.
                  </p>
                </div>

                {/* Submit Action */}
                <Button
                  onClick={handlePaystackCheckout}
                  disabled={processing || numericAmount < 100}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {processing ? (
                    <LoadingSpinner size="sm" text="Connecting to secure gateway..." />
                  ) : (
                    'Continue to Checkout'
                  )}
                </Button>
              </div>
            )}

            {/* 2. DEDICATED VIRTUAL ACCOUNT METHOD */}
            {selectedMethod === 'virtual_account' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Dedicated Virtual Account</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Transfer money directly from any banking app</p>
                </div>

                {!hasVirtualAccount && (
                  <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-sky-500 shrink-0" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        Dedicated Account Setup
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {backendVerificationMessage}
                    </p>
                  </div>
                )}

                {hasVirtualAccount && (
                  <>
                    <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dedicated Account</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            {dvaAccount?.bank_name || 'Dedicated Virtual Account'}
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      </div>
                      {dvaAccount?.account_name ? (
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account Name</p>
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">
                            {dvaAccount?.account_name}
                          </p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Account Number</p>
                        <p className="text-xl font-black text-sky-500 tracking-wider mt-1">{dvaAccount?.account_number}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">This account belongs to your authenticated BlueSea profile.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Estimated Transfer Calculator</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">₦</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={rawAmount}
                          onChange={(e) => setRawAmount(e.target.value.replace(/\D/g, ''))}
                          placeholder="10,000"
                          className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {numericAmount > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Transfer amount</span><span className="font-bold text-slate-800 dark:text-slate-200">{formatNaira(numericAmount)}</span></div>
                        <div className="flex justify-between items-center text-xs"><span className="text-slate-500 dark:text-slate-400 font-medium">Processing fee (1%)</span><span className="font-bold text-slate-800 dark:text-slate-200">{formatNaira(virtualFee)}</span></div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center text-sm font-black"><span className="text-slate-900 dark:text-white">Total required transfer</span><span className="text-sky-500">{formatNaira(virtualTotal)}</span></div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    A 1% processing fee is applied to transfers to your Dedicated Virtual Account.
                  </p>
                </div>

                {profileError && (
                  <p className="text-xs text-red-500 font-bold">{profileError}</p>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={hasVirtualAccount ? handleRefreshAccount : handleVirtualAccountAction}
                    disabled={accountLoading || profileLoading}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {accountLoading || profileLoading ? (
                      <LoadingSpinner size="sm" text="Refreshing account details..." />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>{hasVirtualAccount ? 'Refresh Account Details' : 'Get Dedicated Virtual Account'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                  {hasVirtualAccount && (
                    <Button
                      variant="outline"
                      onClick={() => setAccountModalOpen(true)}
                      className="w-full h-11 rounded-xl text-xs font-bold"
                    >
                      View Dedicated Account
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

   <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>

      {/* Shared Reusable Modal */}
      <DedicatedVirtualAccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        userData={dvaAccount}
        onRefreshAccount={handleRefreshAccount}
      />
    </div>
  );
}