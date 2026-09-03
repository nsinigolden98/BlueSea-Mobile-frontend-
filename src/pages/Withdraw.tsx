import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  Header, 
  Toast, 
  LoadingSpinner, 
  PinModal, 
  TransactionModal 
} from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postRequest, ENDPOINTS } from '@/types';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { useAuth } from '@/context/AuthContext';
import { NIGERIAN_BANKS } from '@/data';
import { 
  Landmark, 
  CheckCircle2, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  ShieldCheck, 
  UserCheck,
  Info,
  ChevronDown,
  X,
  Wallet
} from 'lucide-react';

interface Bank {
  name: string;
  code: string;
}

interface PinPayload {
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  amount: string;
  service_charge: number;
}

interface PinModalMessage {
  success?: boolean;
  state?: boolean;
  error?: string;
  code?: string;
  status?: string | boolean;
  message?: string;
  data?: { message?: string };
}

interface ApiErrorResponse {
  message?: string;
  data?: { message?: string };
}

interface VerifyAccountResponse {
  success?: boolean;
  status?: string;
  account_name?: string;
  message?: string;
  error?: string;
}

export function Withdraw() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const verificationRequestId = useRef(0);

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form State
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Verification & Processing States
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Security PIN & Modal Feedback Hooks
  const { showPinModal, PinComponent, message } = PinModal();
  const { ToastComponent, showToast } = Toast();

  const [pinValue, setPinValue] = useState<PinPayload | Record<string, never>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Wallet Balance Verification & Extraction
  const rawBalance = user?.balance;
  const balance = typeof rawBalance === 'string'
    ? Number(rawBalance.replace(/[^0-9.-]+/g, '')) || 0
    : typeof rawBalance === 'number'
    ? rawBalance
    : 0;

  // Service charge and balance safety calculations
  const numericAmount = Number(withdrawAmount) || 0;
  const serviceCharge = numericAmount >= 10000 ? 50 : 0;
  const totalDeduction = numericAmount + serviceCharge;
  const isOverBalance = numericAmount > 0 && totalDeduction > balance;

  // Bank Filtering Logic
  const filteredBanks = useMemo(() => {
    const query = bankSearch.trim().toLowerCase();
    if (!query) return NIGERIAN_BANKS;
    return NIGERIAN_BANKS.filter((b: Bank) => 
      b.name.toLowerCase().includes(query)
    );
  }, [bankSearch]);

  const selectedBankObj = useMemo(() => {
    return NIGERIAN_BANKS.find((b: Bank) => b.code === selectedBank);
  }, [selectedBank]);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank.code);
    setBankSearch(bank.name);
    setIsBankDropdownOpen(false);
  };

  const handleBankKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredBanks.length > 0) {
        handleSelectBank(filteredBanks[0]);
      }
    }
  };

  // Handler for "Withdraw All" with Service Charge Guard
  const handleWithdrawAll = () => {
    if (balance <= 0) {
      setWithdrawAmount('0');
      return;
    }
    let maxAmount = balance;
    if (balance >= 10050) {
      maxAmount = balance - 50;
    } else if (balance >= 10000) {
      maxAmount = 9999;
    } else {
      maxAmount = balance;
    }
    setWithdrawAmount(maxAmount.toString());
  };

  // Reset form state after successful transaction
  const resetFormState = useCallback(() => {
    setSelectedBank('');
    setBankSearch('');
    setIsBankDropdownOpen(false);
    setAccountNumber('');
    setAccountName('');
    setWithdrawAmount('');
    setAccountVerified(false);
    setVerifyingAccount(false);
    setVerificationError(null);
    setSubmitting(false);
  }, []);

  // Automatic Account Verification
  const verifyAccount = useCallback(async (num: string, bankCode: string) => {
    const requestId = ++verificationRequestId.current;
    setVerifyingAccount(true);
    setVerificationError(null);
    setAccountVerified(false);
    setAccountName('');

    try {
      const payload = {
        account_number: num,
        bank_code: bankCode,
      };
      const response = (await postRequest(
        ENDPOINTS.verify_account_name, 
        payload
      )) as VerifyAccountResponse;

      if (requestId !== verificationRequestId.current) return;
      
      if (response && (response.success || response.status === 'success' || response.account_name)) {
        setAccountName(response.account_name || '');
        setAccountVerified(true);
      } else {
        const errDetail = response?.message || response?.error || 'Unable to verify account details';
        setVerificationError(errDetail);
        setAccountVerified(false);
        showToast(errDetail);
      }
    } catch (err: unknown) {
      if (requestId !== verificationRequestId.current) return;
      console.error('Account verification error:', err);
      const errorObj = err as ApiErrorResponse;
      const errMsg = errorObj?.message || errorObj?.data?.message || 'Verification failed due to a network error.';
      setVerificationError(errMsg);
      setAccountVerified(false);
      showToast(errMsg);
    } finally {
      setVerifyingAccount(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      const timer = setTimeout(() => {
        verifyAccount(accountNumber, selectedBank);
      }, 350);

      return () => clearTimeout(timer);
    } else {
      setAccountVerified(false);
      setAccountName('');
      setVerificationError(null);
    }
  }, [accountNumber, selectedBank, verifyAccount]);

  // PIN Modal Response & Status Handling
  useEffect(() => {
    if (message) {
      setIsOpen(true);
      const msg = message as PinModalMessage;
      const isSuccess = Boolean(
        msg?.success === true ||
        msg?.state === true ||
        (!msg?.error && msg?.code === '00') ||
        msg?.status === 'success' ||
        msg?.status === true
      );

      const serverMessage = msg?.message || msg?.error || msg?.data?.message || (isSuccess ? 'Withdrawal request successful' : 'Withdrawal failed');

      if (isSuccess) {
        showToast(serverMessage);
        setToastMessage(serverMessage);
        setTxStatus(true);
        resetFormState();
      } else {
        showToast(serverMessage);
        setToastMessage(serverMessage);
        setSubmitting(false);
        setTxStatus(false);
      }
    }
  }, [message, showToast, resetFormState]);

  const handleInitiateWithdrawal = () => {
    if (!accountVerified || !selectedBank || accountNumber.length !== 10) {
      showToast('Please specify a verified bank account');
      return;
    }
    if (!withdrawAmount || isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid amount');
      return;
    }
    if (isOverBalance) {
      showToast(
        serviceCharge > 0 
          ? 'Insufficient balance. Amount + ₦50 service charge exceeds your available balance.'
          : 'Insufficient wallet balance'
      );
      return;
    }

    setSubmitting(true);
    setPinValue({
      account_name: accountName,
      account_number: accountNumber,
      bank_code: selectedBank,
      bank_name: selectedBankObj?.name || '',
      amount: withdrawAmount,
      service_charge: serviceCharge,
    });
    showPinModal();
  };

  const isFormValid = 
    accountVerified && 
    !verifyingAccount && 
    numericAmount > 0 && 
    !isOverBalance;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* APPLICATION SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* CORE VIEWPORT */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* APP HEADER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Withdrawal" 
            subtitle="Transfer funds directly to your bank account"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* BREADCRUMB HEADER */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Wallet</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-500 rounded-full text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Instant Bank Transfer</span>
              </div>
            </div>

            {/* WALLET BALANCE SUMMARY DISPLAY */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-3xl p-5 md:p-6 shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sky-100/80 text-xs font-bold uppercase tracking-wider">
                  <Wallet className="w-4 h-4" />
                  <span>Available Wallet Balance</span>
                </div>
                <div className="text-2xl md:text-3xl font-black tracking-tight">
                  ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="hidden sm:block text-right text-xs text-sky-100/70 font-medium">
                Verified Account
              </div>
            </div>

            {/* WITHDRAWAL FORM CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 md:p-7 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Bank Destination
                </h2>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a bank and enter 10 digits for instant verification
                </p>
              </div>

              <div className="space-y-5">
                
                {/* OPAY-STYLE DYNAMIC BANK SEARCH SELECTOR */}
                <div className="space-y-1.5 relative">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                    Select Destination Bank
                  </Label>

                  {/* Selected Bank Banner or Search Input */}
                  {selectedBank && !isBankDropdownOpen ? (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-sky-500/30 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-xs">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">
                            {selectedBankObj?.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Bank Code: {selectedBank}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBank('');
                          setBankSearch('');
                          setIsBankDropdownOpen(true);
                          setAccountVerified(false);
                        }}
                        className="p-1.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search bank name (e.g. OPay, GTBank, Kuda)..."
                        value={bankSearch}
                        onFocus={() => setIsBankDropdownOpen(true)}
                        onChange={(e) => {
                          setBankSearch(e.target.value);
                          setIsBankDropdownOpen(true);
                        }}
                        onKeyDown={handleBankKeyDown}
                        className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/5 rounded-2xl h-13 text-xs font-bold pl-10 pr-10 focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                      />
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  )}

                  {/* DYNAMIC SEARCH DROPDOWN LIST */}
                  {isBankDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-64 overflow-y-auto scrollbar-hide divide-y divide-slate-100 dark:divide-slate-700/50">
                      
                      {/* Search Match Feedback Bar */}
                      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex justify-between items-center sticky top-0 backdrop-blur-md">
                        <span>
                          {bankSearch.trim() 
                            ? `Found ${filteredBanks.length} matching bank${filteredBanks.length === 1 ? '' : 's'}`
                            : 'All Supported Banks'}
                        </span>
                        {filteredBanks.length > 0 && bankSearch.trim() && (
                          <span className="text-sky-500 text-[9px]">Press Enter to select top result</span>
                        )}
                      </div>

                      {filteredBanks.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 font-medium">
                          No bank found matching &quot;{bankSearch}&quot;
                        </div>
                      ) : (
                        filteredBanks.map((bank, index) => (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => handleSelectBank(bank)}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors cursor-pointer ${
                              index === 0 && bankSearch.trim() ? 'bg-sky-500/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                                {bank.name.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {bank.name}
                              </span>
                            </div>
                            {index === 0 && bankSearch.trim() && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">
                                Auto-select
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* ACCOUNT NUMBER INPUT */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                    Account Number
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="10-digit account number"
                    className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/5 rounded-2xl h-13 focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white font-bold text-base"
                    value={accountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAccountNumber(val);
                    }}
                    maxLength={10}
                  />
                </div>

                {/* ACCOUNT VERIFICATION FEEDBACK */}
                {verifyingAccount && (
                  <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <span className="text-xs font-bold text-sky-500">Verifying account details...</span>
                  </div>
                )}

                {!verifyingAccount && accountVerified && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Account Verified
                        </p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {accountName}
                        </p>
                      </div>
                    </div>
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                )}

                {!verifyingAccount && verificationError && (
                  <button
                    type="button"
                    onClick={() => verifyAccount(accountNumber, selectedBank)}
                    className="w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-left group hover:bg-rose-500/15 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                          Verification Error
                        </p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {verificationError}
                        </p>
                      </div>
                    </div>
                    <RefreshCw className="w-4 h-4 text-rose-500 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                )}

                {/* AMOUNT INPUT SECTION */}
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Withdrawal Amount
                    </Label>
                    <button 
                      type="button"
                      onClick={handleWithdrawAll}
                      className="text-[10px] text-sky-500 font-bold uppercase tracking-wider hover:underline cursor-pointer"
                    >
                      Withdraw All
                    </button>
                  </div>

                  <div className="relative group">
                    <Input
                      type="number"
                      placeholder="0.00"
                      disabled={!accountVerified}
                      className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/5 rounded-2xl h-16 text-2xl font-black focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white pl-10"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">
                      ₦
                    </span>
                  </div>

                  <div className="flex justify-between px-2 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      Available: ₦{balance.toLocaleString()}
                    </span>
                  </div>

                  {/* SERVICE CHARGE NOTICE */}
                  {numericAmount >= 10000 && !isOverBalance && (
                    <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-between text-sky-700 dark:text-sky-300 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-sky-500 shrink-0" />
                        <span className="text-xs font-bold">₦50 Service Charge Applies</span>
                      </div>
                      <span className="text-xs font-black">
                        Total Debit: ₦{totalDeduction.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* INSUFFICIENT BALANCE INLINE ERROR */}
                  {isOverBalance && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2 text-rose-600 dark:text-rose-400 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-xs font-bold leading-tight">
                        {serviceCharge > 0 ? (
                          <>
                            Amount exceeds available balance including service charge.
                            <br />
                            <span className="font-normal text-[11px] opacity-90">
                              Required: ₦{numericAmount.toLocaleString()} + ₦50 charge = <strong>₦{totalDeduction.toLocaleString()}</strong> (Available: ₦{balance.toLocaleString()})
                            </span>
                          </>
                        ) : (
                          `Entered amount (₦${numericAmount.toLocaleString()}) exceeds your available balance of ₦${balance.toLocaleString()}`
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* MAIN SUBMIT BUTTON */}
                <Button
                  type="button"
                  onClick={handleInitiateWithdrawal}
                  disabled={!isFormValid || submitting}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
                >
                  {submitting ? (
                    <LoadingSpinner size="sm" />
                  ) : numericAmount > 0 ? (
                    `Withdraw ₦${numericAmount.toLocaleString()}${serviceCharge > 0 ? ' (+₦50 Fee)' : ''}`
                  ) : (
                    'Withdraw Funds'
                  )}
                </Button>

              </div>
            </div>

          </div>
        </main>

        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>

      </div>

      {/* FEEDBACK OVERLAYS */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <TransactionModal 
            isSuccess={txStatus} 
            onClose={() => setIsOpen(false)} 
            toastMessage={toastMessage} 
          />
        </div>
      )}
      <ToastComponent />

      <PinComponent 
        type="withdrawal" 
        value={pinValue} 
      />

    </div>
  );
}