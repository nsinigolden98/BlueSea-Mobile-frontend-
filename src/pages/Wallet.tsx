import { useState, useEffect } from 'react';
import { TransactionList, LoadingSpinner, BalanceCard } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postRequest, ENDPOINTS, API_BASE } from '@/types';
import { Landmark, Send, X, ChevronRight, User, ShieldCheck, Search, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { NIGERIAN_BANKS } from '@/data';
import { useNavigate } from 'react-router-dom';

export function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- States for the layout ---
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountRequested, setAccountRequested] = useState(false);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(1);
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    pin: ''
  });

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  const { showPinModal, PinComponent, message } = PinModal();
  const { ToastComponent, showToast } = Toast();
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      if (message?.success) {
        showToast(message?.message || '');
        setToastMessage(message?.message || '');
        setTxStatus(true);
        setWithdrawing(false);
        setShowWithdrawModal(false);
      } else {
        setToastMessage(message?.message || '');
        setWithdrawing(false);
        setTxStatus(false);
      }
    }
  }, [message, showToast]);

  interface FoundUser {
    email: string;
    name: string;
    image: string;
  }

  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [transferError, setTransferError] = useState('');
  const [transferProcessing, setTransferProcessing] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  // --- Logic ---
  const handleRequestAccount = () => {
    setAccountLoading(true);
    setTimeout(() => {
      setAccountLoading(false);
      setAccountRequested(true);
    }, 1500);
  };

  const handleDeposit = () => {
    setDepositModalOpen(true);
    setDepositAmount('');
    setDepositError('');
  };

  const handleFund = async () => {
    const amount = Number(depositAmount.replace(/,/g, ''));
    if (amount < 100) {
      setDepositError('Amount must be more than ₦100.00');
      return;
    }
    setDepositing(true);
    setDepositError('');
    setProcessing(true);
    try {
      const response = await postRequest(ENDPOINTS.fund, { amount });
      if (response.success) {
        setProcessing(false);
        window.location.href = response.authorization_url;
      } else {
        setProcessing(false);
        setDepositing(false);
        setDepositError('Wallet funding error. Please try again.');
      }
    } catch (error) {
      console.log(error);
      setProcessing(false);
      setDepositing(false);
      setDepositError('Wallet funding error. Please try again.');
    }
  };

  const handleCancelDeposit = () => {
    setDepositModalOpen(false);
    setDepositAmount('');
    setDepositError('');
    setDepositing(false);
    setProcessing(false);
  };

  const balance = Number(user?.balance.slice(1).replaceAll(',', '')) || 0;

  useEffect(() => {
    const lookupUser = async () => {
      if (!transferData.recipient || transferData.recipient.length < 5) {
        setFoundUser(null);
        return;
      }
      if (transferData.recipient.trim() === user?.email?.trim()) {
        setFoundUser(null);
        setTransferError('Cannot transfer to self');
        return;
      }
      setLookingUp(true);
      setTransferError('');
      try {
        const response = await postRequest(ENDPOINTS.user_lookup, { email: transferData.recipient });
        if (response?.found) {
          setFoundUser({
            email: response.email,
            name: response.name,
            image: response.image
          });
        } else {
          setFoundUser(null);
        }
      } catch (error) {
        console.log(error);
        setFoundUser(null);
      } finally {
        setLookingUp(false);
      }
    };
    const timer = setTimeout(() => {
      lookupUser();
    }, 500);
    return () => clearTimeout(timer);
  }, [transferData.recipient, user?.email]);

  const handleTransferSubmit = async () => {
    setTransferProcessing(true);
    setTransferError('');
    try {
      const response = await postRequest(ENDPOINTS.internal_transfer, {
        email: transferData.recipient,
        amount: Number(transferData.amount),
        transaction_pin: transferData.pin
      });
      if (response.success) {
        setTransferModalOpen(false);
        setTransferStep(1);
        setTransferData({ recipient: '', amount: '', pin: '' });
        window.location.reload();
      } else {
        setTransferError(response.error || 'Transfer failed. Check PIN.');
      }
    } catch (error) {
      console.log(error);
      setTransferError('Connection error. Please try again.');
    } finally {
      setTransferProcessing(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length !== 10) return;
    setVerifyingAccount(true);
    setAccountName('');
    setAccountVerified(false);
    try {
      const payload = {
        account_number: accountNumber,
        bank_code: selectedBank,
      };
      const response = await postRequest(ENDPOINTS.verify_account_name, payload);
      if (response.success) {
        setAccountName(response.account_name);
        setAccountVerified(true);
      } else {
        showToast(response.message || 'Failed to verify account');
      }
    } catch (error) {
      console.error('Verify failed:', error);
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleConfirmWithdraw = () => {
    if (!accountVerified || !withdrawAmount) {
      showToast('Missing Fields');
      return;
    }
    setWithdrawing(true);
    showPinModal();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* MATCHED CART HEADER */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Wallet</h1>
            <p className="text-xs text-slate-500">Manage your BlueSea funds</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* CARD 1: FUNDING DETAILS */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Funding Details</h3>
                  <Landmark className="h-4 w-4 text-sky-500" />
                </div>
                
                {accountRequested ? (
                  <div className="text-center p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl">
                    <p className="text-sky-500 font-bold text-sm">Account Coming Soon</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Processing Request</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Landmark className="h-5 w-5 text-sky-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Request account number</h4>
                    <p className="text-[11px] text-slate-500 px-2 leading-relaxed">Get a dedicated virtual account for automated funding.</p>
                    <Button 
                      onClick={handleRequestAccount}
                      disabled={accountLoading}
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl h-10 text-xs font-bold border border-slate-200 dark:border-white/5"
                    >
                      {accountLoading ? <LoadingSpinner size="sm" /> : 'Request Account'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
             {/* CARD 2: REUSED BALANCE CARD COMPONENT */}
            <div className="lg:col-span-3">
              <BalanceCard
                showActions={true}
                onDeposit={handleDeposit}
                onWithdraw={() => setShowWithdrawModal(true)}
                className="h-full border border-slate-200 dark:border-white/5"
              />
            </div>
          </div>

          {/* Internal Transfer Button */}
          <button 
            onClick={() => setTransferModalOpen(true)}
            className="group w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-sky-500/30 transition-all active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Send className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Internal Transfer</h3>
                <p className="text-slate-500 text-[11px]">Instant send to BlueSea users</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-sky-500 transition-colors" />
          </button>

          {/* History Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Transaction History</h3>
              <button className="text-sky-500 text-[11px] font-bold hover:underline uppercase tracking-wider">See All</button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-1 shadow-sm">
              <TransactionList />
            </div>
          </div>
        </div>
      </main>

      {/* Modals remain unchanged as requested */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Account Number</Label>
                <Input
                  type="text"
                  inputMode='numeric'
                  placeholder="0000000000"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-12 focus:ring-sky-500 text-slate-900 dark:text-white font-bold"
                  value={accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setAccountNumber(val);
                    setAccountVerified(false);
                    setAccountName('');
                  }}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Select Bank</Label>
                <Input
                  type="text"
                  placeholder="Search bank name..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="mb-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-10 text-xs focus:ring-sky-500"
                />
                <select
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setAccountVerified(false);
                    setAccountName('');
                    setBankSearch('');
                  }}
                  className="w-full h-12 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-sm"
                >
                  <option value="">Select bank</option>
                  {NIGERIAN_BANKS.filter(b => 
                    bankSearch === '' || b.name.toLowerCase().includes(bankSearch.toLowerCase())
                  ).map((bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              {selectedBank && accountNumber.length === 10 && (
                <Button onClick={handleVerifyAccount} disabled={verifyingAccount} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-500 dark:text-sky-400 font-bold border border-sky-500/20">
                  {verifyingAccount ? 'Verifying...' : 'Verify Account'}
                </Button>
              )}
              {accountVerified && (
                <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl">
                  <p className="text-xs font-bold text-sky-500 dark:text-sky-400 uppercase tracking-wider">{accountName}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Amount (₦)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-14 text-2xl font-black focus:ring-sky-500 text-slate-900 dark:text-white"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 font-bold ml-1">AVAILABLE: ₦{balance.toLocaleString()}</p>
              </div>
              <Button
                onClick={handleConfirmWithdraw}
                disabled={withdrawing || !accountVerified || !withdrawAmount || Number(withdrawAmount) > balance}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl h-12 font-black shadow-lg shadow-sky-500/20 active:scale-95 mt-4 transition-all"
              >
                {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </div>
          { isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <TransactionModal isSuccess={txStatus} onClose={()=> setIsOpen(false)} toastMessage={toastMessage} />
            </div>
          )}
          <ToastComponent />
          <PinComponent type="withdrawal" value={{
            account_name: accountName,
            account_number: accountNumber,
            bank_code: selectedBank,
            bank_name: NIGERIAN_BANKS.find(b => b.code === selectedBank)?.name || '',
            amount: withdrawAmount,
          }} />
        </div>
      )}

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 dark:bg-slate-950/80">
          <div className="absolute inset-0" onClick={() => !processing && setDepositModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" text="Processing payment..." />
              </div>
            ) : (
              <>
                <header className="mb-8 text-center">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deposit Funds</h2>
                  <div className="h-1.5 w-10 bg-sky-500 mx-auto rounded-full mt-2" />
                </header>
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 absolute left-6 top-3 z-10">Amount (₦)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value.replace(/\D/g, ''));
                        setDepositError('');
                      }}
                      placeholder="0.00"
                      className="w-full pl-6 pr-4 pt-9 pb-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white"
                    />
                    {depositError && <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-bold px-4">{depositError}</p>}
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <Button 
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                      onClick={handleFund}
                      disabled={depositing || !depositAmount}
                    >
                      {depositing ? <LoadingSpinner size="sm" /> : 'Confirm & Proceed'}
                    </Button>
                    {!depositing && (
                      <button onClick={handleCancelDeposit} className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] py-3">Cancel</button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Internal Transfer Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 dark:bg-slate-950/80">
          <div className="absolute inset-0" onClick={() => !transferProcessing && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <header className="mb-8 text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {transferStep === 2 ? 'Verify Identity' : 'Transfer Funds'}
              </h2>
              <div className="h-1.5 w-10 bg-sky-500 mx-auto rounded-full mt-2" />
            </header>
            <div className="space-y-6">
              {transferStep === 1 && (
                <div className="animate-in slide-in-from-bottom-4 space-y-5">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 absolute left-6 top-3 z-10">Email</label>
                    <input
                      placeholder="user@bluesea.com"
                      className="w-full pl-6 pr-12 pt-9 pb-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-bold"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                    />
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 absolute left-6 top-3 z-10">Amount (₦)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-6 pr-4 pt-9 pb-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    />
                  </div>
                  {foundUser && (
                    <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white font-black overflow-hidden border border-slate-200 dark:border-white/5">
                        {foundUser.image ? (
                          <img src={`${API_BASE}${foundUser.image}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-sky-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{foundUser.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{foundUser.email}</p>
                      </div>
                    </div>
                  )}
                  {lookingUp && <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Looking up user...</div>}
                </div>
              )}
              {transferStep === 2 && (
                <div className="animate-in slide-in-from-bottom-4 text-center">
                  <div className="mb-6">
                    <div className="h-16 w-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
                      <ShieldCheck className="h-8 w-8 text-sky-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Confirm <span className="font-black text-slate-900 dark:text-white">₦{transferData.amount}</span> to <span className="font-bold text-sky-500">{foundUser?.name}</span></p>
                  </div>
                  <div className="max-w-[220px] mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      inputMode="numeric"
                      className="w-full px-4 py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none text-center text-4xl tracking-[1.5rem] font-black text-slate-900 dark:text-white"
                      value={transferData.pin}
                      onChange={(e) => setTransferData({...transferData, pin: e.target.value.replace(/\D/g, '')})}
                    />
                    <p className="mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Enter 4-Digit PIN</p>
                  </div>
                </div>
              )}
              {transferError && <p className="text-red-500 dark:text-red-400 text-[10px] font-bold text-center px-4 uppercase tracking-wider">{transferError}</p>}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                  disabled={transferProcessing || (transferStep === 1 && (!transferData.amount || !foundUser))}
                  onClick={() => transferStep === 1 ? setTransferStep(2) : handleTransferSubmit()}
                >
                  {transferProcessing ? <LoadingSpinner size="sm" /> : transferStep === 1 ? 'Verify Transaction' : 'Confirm & Pay'}
                </Button>
                {!transferProcessing && (
                  <button onClick={() => transferStep === 2 ? setTransferStep(1) : setTransferModalOpen(false)} className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] py-3 transition-colors hover:text-slate-700 dark:hover:text-slate-300">
                    {transferStep === 2 ? 'Go Back' : 'Close'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}