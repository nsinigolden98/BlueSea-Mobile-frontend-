import { useState } from 'react';
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
import { postRequest, ENDPOINTS } from '@/types';
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

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected Method
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>('paystack');

  // Paystack Form State
  const [rawAmount, setRawAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Account Modal & Request State
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  // KYC verification check
  const isKycComplete = Boolean(
    userData?.is_verified ||
    userData?.kyc_status === 'verified' ||
    userData?.kyc_status === 'approved' ||
    userData?.bvn
  );

  // Dedicated account details are supplied by the authenticated user's backend profile.
  // Never use the user's personal account fields for DVA display.
  const dvaAccount = userData?.has_DVA === true ? userData?.dva_account ?? null : null;
  const hasVirtualAccount = Boolean(dvaAccount?.account_number);

  // Calculation Utilities
  const numericAmount = Number(rawAmount.replace(/\D/g, '')) || 0;
  
  // Paystack: 1.5% fee on top
  const paystackFee = Math.round(numericAmount * 0.015 * 100) / 100;
  const paystackTotal = numericAmount + paystackFee;

  // Virtual Account: 1.0% fee on top
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
    if (!isKycComplete) {
      navigate('/identity-verification');
      return;
    }

    if (hasVirtualAccount) {
      setAccountModalOpen(true);
      return;
    }

    // Request account using real backend endpoint if available
    setAccountLoading(true);
    try {
      if (ENDPOINTS.requestVirtualAccount) {
        await postRequest(ENDPOINTS.requestVirtualAccount, {});
      }
      const authCtx = user as any;
      const refreshFn = authCtx?.refreshUser || authCtx?.checkAuth || authCtx?.fetchUserData;
      if (typeof refreshFn === 'function') {
        await refreshFn();
      }
    } catch (err) {
      console.error('Account request failed:', err);
    } finally {
      setAccountLoading(false);
      setAccountModalOpen(true);
    }
  };

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
                  Fee: 1.5%
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
                  Fee: 1.0%
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
                        Processing fee (1.5%)
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
                    A 1.5% processing fee will be added to your deposit amount before payment is completed. Your wallet will be credited with exact requested amount of <strong>{formatNaira(numericAmount)}</strong>.
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
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Dedicated Virtual Account
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Transfer money directly from any banking app
                  </p>
                </div>

                {/* KYC / Eligibility Status Card */}
                {!isKycComplete ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        Identity Verification Required
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Complete your identity verification before requesting a dedicated virtual account.
                    </p>
                    <Button
                      onClick={() => navigate('/identity-center')}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Complete Verification</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Sample Calculator Preview */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        Estimated Transfer Calculator
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">
                          ₦
                        </span>
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
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Transfer amount
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatNaira(numericAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Processing fee (1.0%)
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {formatNaira(virtualFee)}
                          </span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center text-sm font-black">
                          <span className="text-slate-900 dark:text-white">Total required transfer</span>
                          <span className="text-sky-500">{formatNaira(virtualTotal)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        A 1% processing fee will be added to your deposit amount when the transfer is processed.
                      </p>
                    </div>

                    <Button
                      onClick={handleVirtualAccountAction}
                      disabled={accountLoading}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {accountLoading ? (
                        <LoadingSpinner size="sm" text="Processing..." />
                      ) : hasVirtualAccount ? (
                        'View Account Details'
                      ) : (
                        'Request Dedicated Account'
                      )}
                    </Button>
                  </>
                )}
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
      />
    </div>
  );
}