import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  Header, 
  Toast, 
  LoadingSpinner, 
  BalanceCard, 
  PinModal, 
  TransactionModal 
} from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postRequest, getRequest, ENDPOINTS } from '@/types';
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
  Plus, 
  ShieldCheck, 
  History, 
  UserCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface TransactionRecord {
  id?: string | number;
  reference?: string;
  amount: number | string;
  type?: string;
  transaction_type?: string;
  category?: string;
  status?: string;
  created_at?: string;
  date?: string;
  description?: string;
  recipient_bank?: string;
  account_number?: string;
}

export function Withdraw() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form State
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Verification & Processing States
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Transaction History State
  const [history, setHistory] = useState<TransactionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Security PIN & Modal Feedback Hooks
  const { showPinModal, PinComponent, message } = PinModal();
  const { ToastComponent, showToast } = Toast();

  const [pinValue, setPinValue] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Balance Calculation
  const rawBalance = user?.balance;
  const balance = typeof rawBalance === 'string'
    ? Number(rawBalance.replace(/[^0-9.-]+/g, '')) || 0
    : typeof rawBalance === 'number'
    ? rawBalance
    : 0;

  // Service charge and balance check computations
  const numericAmount = Number(withdrawAmount) || 0;
  const serviceCharge = numericAmount >= 10000 ? 15 : 0;
  const totalDeduction = numericAmount + serviceCharge;
  const isOverBalance = numericAmount > 0 && totalDeduction > balance;

  // Handler for "Withdraw All" with Service Charge Safety Guard
  const handleWithdrawAll = () => {
    if (balance <= 0) {
      setWithdrawAmount('0');
      return;
    }
    let maxAmount = balance;
    if (balance >= 10015) {
      maxAmount = balance - 15;
    } else if (balance >= 10000) {
      maxAmount = 9999;
    } else {
      maxAmount = balance;
    }
    setWithdrawAmount(maxAmount.toString());
  };

  // Reset form state after successful execution
  const resetFormState = useCallback(() => {
    setSelectedBank('');
    setBankSearch('');
    setAccountNumber('');
    setAccountName('');
    setWithdrawAmount('');
    setAccountVerified(false);
    setVerifyingAccount(false);
    setVerificationError(null);
    setSubmitting(false);
  }, []);

  // Fetch Transaction History
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await getRequest(ENDPOINTS.history);
      const records = Array.isArray(response) 
        ? response 
        : response?.results || response?.data || [];

      const withdrawalsOnly = records.filter((tx: TransactionRecord) => {
        const typeStr = (tx.type || tx.transaction_type || tx.category || '').toLowerCase();
        const descStr = (tx.description || '').toLowerCase();
        return typeStr.includes('withdraw') || descStr.includes('withdraw') || typeStr === 'debit';
      });

      setHistory(withdrawalsOnly.length > 0 ? withdrawalsOnly : records);
    } catch (err: any) {
      console.error('Error fetching withdrawal history:', err);
      const errText = err?.message || err?.data?.message || 'Unable to load transaction history';
      setHistoryError(errText);
      showToast(errText);
    } finally {
      setHistoryLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Automatic Account Verification
  const verifyAccount = useCallback(async (num: string, bankCode: string) => {
    setVerifyingAccount(true);
    setVerificationError(null);
    setAccountVerified(false);
    setAccountName('');

    try {
      const payload = {
        account_number: num,
        bank_code: bankCode,
      };
      const response = await postRequest(ENDPOINTS.verify_account_name, payload);
      
      if (response && (response.success || response.status === 'success' || response.account_name)) {
        setAccountName(response.account_name);
        setAccountVerified(true);
      } else {
        const errDetail = response?.message || response?.error || 'Unable to verify account details';
        setVerificationError(errDetail);
        setAccountVerified(false);
        showToast(errDetail);
      }
    } catch (err: any) {
      console.error('Account verification error:', err);
      const errMsg = err?.message || err?.data?.message || 'Verification failed due to a network error.';
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

  // PIN Modal Response & Error Capture
  useEffect(() => {
    if (message) {
      setIsOpen(true);
      const msg = message as Record<string, any>;
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
        fetchHistory();
      } else {
        showToast(serverMessage);
        setToastMessage(serverMessage);
        setSubmitting(false);
        setTxStatus(false);
      }
    }
  }, [message, showToast, resetFormState, fetchHistory]);

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
          ? `Insufficient balance. Amount + ₦15 service charge exceeds your available balance.`
          : 'Insufficient wallet balance'
      );
      return;
    }

    setSubmitting(true);
    setPinValue({
      account_name: accountName,
      account_number: accountNumber,
      bank_code: selectedBank,
      bank_name: NIGERIAN_BANKS.find(b => b.code === selectedBank)?.name || '',
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
            subtitle="Manage your bank withdrawal"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* BREADCRUMB HEADER */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Wallet</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-500 rounded-full text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure Bank Transfer</span>
              </div>
            </div>

            {/* RESPONSIVE GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT SECTION: WITHDRAWAL FORM */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 md:p-7 shadow-sm space-y-6">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      Bank Destination
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Enter account details for automatic verification
                    </p>
                  </div>

                  <div className="space-y-4">
                    
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

                    {/* BANK SELECTOR */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
                        Select Destination Bank
                      </Label>
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Filter bank name..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-white/5 rounded-t-2xl h-11 text-xs font-medium pl-10 focus:ring-sky-500"
                          />
                        </div>
                        <select
                          value={selectedBank}
                          onChange={(e) => {
                            setSelectedBank(e.target.value);
                            setBankSearch('');
                          }}
                          className="w-full h-13 px-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5 rounded-b-2xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-sm appearance-none cursor-pointer"
                        >
                          <option value="">Choose bank</option>
                          {NIGERIAN_BANKS.filter(b => 
                            bankSearch === '' || b.name.toLowerCase().includes(bankSearch.toLowerCase())
                          ).map((bank) => (
                            <option key={bank.code} value={bank.code}>{bank.name}</option>
                          ))}
                        </select>
                      </div>
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

                      {/* 15 NAIRA SERVICE CHARGE UI NOTICE */}
                      {numericAmount >= 10000 && !isOverBalance && (
                        <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-between text-sky-700 dark:text-sky-300 animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-sky-500 shrink-0" />
                            <span className="text-xs font-bold">₦15 Service Charge Applies</span>
                          </div>
                          <span className="text-xs font-black">
                            Total Debit: ₦{totalDeduction.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* INSUFFICIENT BALANCE INLINE UI ERROR */}
                      {isOverBalance && (
                        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2 text-rose-600 dark:text-rose-400 animate-in fade-in">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div className="text-xs font-bold leading-tight">
                            {serviceCharge > 0 ? (
                              <>
                                Amount exceeds available balance including service charge.
                                <br />
                                <span className="font-normal text-[11px] opacity-90">
                                  Required: ₦{numericAmount.toLocaleString()} + ₦15 charge = <strong>₦{totalDeduction.toLocaleString()}</strong> (Available: ₦{balance.toLocaleString()})
                                </span>
                              </>
                            ) : (
                              `Entered amount (₦${numericAmount.toLocaleString()}) exceeds your available balance of ₦${balance.toLocaleString()}`
                            )}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* MAIN CTA BUTTON */}
                    <Button
                      type="button"
                      onClick={handleInitiateWithdrawal}
                      disabled={!isFormValid || submitting}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
                    >
                      {submitting ? (
                        <LoadingSpinner size="sm" />
                      ) : numericAmount > 0 ? (
                        `Withdraw ₦${numericAmount.toLocaleString()}${serviceCharge > 0 ? ' (+₦15 Fee)' : ''}`
                      ) : (
                        'Withdraw Funds'
                      )}
                    </Button>

                  </div>
                </div>

                {/* SAVED BENEFICIARIES */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Saved Beneficiaries
                      </h3>
                      <p className="text-[10px] text-slate-400">Quick transfer to frequent bank accounts</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => showToast('Beneficiary management coming in a future update')}
                      className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full w-fit mx-auto text-slate-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      No saved beneficiaries yet
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                      Your frequently used withdrawal destinations will automatically appear here.
                    </p>
                  </div>
                </div>

              </div>

              {/* RIGHT SECTION: BALANCE & WITHDRAWAL HISTORY */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                  <BalanceCard showActions={false} className="h-full" />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-sky-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Withdrawal Activity
                      </h3>
                    </div>
                    <button 
                      onClick={() => navigate('/transaction-history')}
                      className="text-[10px] font-bold text-sky-500 hover:underline flex items-center gap-0.5"
                    >
                      <span>Full History</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {historyLoading ? (
                    <div className="py-8 flex justify-center items-center">
                      <LoadingSpinner size="md" text="Loading history..." />
                    </div>
                  ) : historyError ? (
                    <p className="text-center text-xs text-rose-500 py-6">{historyError}</p>
                  ) : history.length === 0 ? (
                    <div className="text-center py-8 space-y-1">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No withdrawal history</p>
                      <p className="text-[10px] text-slate-400">Your completed withdrawals will be listed here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-hide">
                      {history.slice(0, 5).map((item, index) => (
                        <div 
                          key={item.id || item.reference || index}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                              <Landmark className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {item.recipient_bank || item.description || 'Bank Withdrawal'}
                              </p>
                              <p className="text-[9px] text-slate-400 font-medium">
                                {item.created_at || item.date || 'Recent'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-rose-500">
                              -₦{Number(item.amount).toLocaleString()}
                            </p>
                            <span className="text-[8px] uppercase tracking-wider font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                              {item.status || 'Completed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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