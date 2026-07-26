import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  Header, 
  Toast, 
  TransactionList, 
  LoadingSpinner, 
  BalanceCard, 
  PinModal, 
  TransactionModal 
} from '@/components/ui-custom';
import { BlueConnectPreview } from '@/components/blueconnect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postRequest, ENDPOINTS, API_BASE } from '@/types';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { useAuth } from '@/context/AuthContext';
import { NIGERIAN_BANKS } from '@/data';

import { 
  Landmark, 
  Send, 
  X, 
  ChevronRight, 
  User, 
  Search, 
  CreditCard, 
  CheckCircle2, 
} from 'lucide-react';

interface FoundUser {
  email: string;
  name: string;
  image: string;
}

export function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- Layout State ---
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Account State ---
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountRequested, setAccountRequested] = useState(false);

  // --- Deposit State ---
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // --- Internal Transfer State ---
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: ''
  });
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [transferError, setTransferError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  // --- Withdraw State ---
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Custom Modals & Hooks (Unified PIN Modal usage)
  const { showPinModal, PinComponent, message } = PinModal();
  const { ToastComponent, showToast } = Toast();

  const [pinType, setPinType] = useState<'withdrawal' | 'internal_transfer'>('withdrawal');
  const [pinValue, setPinValue] = useState<any>({});

  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // --- Saved Card States ---
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [savedCard, setSavedCard] = useState<{ name: string; number: string; expiry: string } | null>(null);
  const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

  // Safe balance parsing
  const rawBalance = user?.balance;
  const balance = typeof rawBalance === 'string'
    ? Number(rawBalance.replace(/[^0-9.-]+/g, '')) || 0
    : typeof rawBalance === 'number'
    ? rawBalance
    : 0;

  const resetWithdrawState = () => {
    setShowWithdrawModal(false);
    setSelectedBank('');
    setBankSearch('');
    setAccountNumber('');
    setAccountName('');
    setWithdrawAmount('');
    setAccountVerified(false);
    setVerifyingAccount(false);
    setWithdrawing(false);
  };

  const resetTransferState = () => {
    setTransferModalOpen(false);
    setTransferData({ recipient: '', amount: '' });
    setFoundUser(null);
    setTransferError('');
  };

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      if (message?.success) {
        showToast(message?.message || 'Transaction successful');
        setToastMessage(message?.message || 'Transaction successful');
        setTxStatus(true);
        resetWithdrawState();
        resetTransferState();
      } else {
        setToastMessage(message?.message || 'Transaction failed');
        setWithdrawing(false);
        setTxStatus(false);
      }
    }
  }, [message, showToast]);

  // --- Internal Transfer Lookup ---
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

  // Logic handlers
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

  const handleStartTransfer = () => {
    if (!transferData.amount || !foundUser) return;
    setPinType('internal_transfer');
    setPinValue({
      email: transferData.recipient,
      recipient: transferData.recipient,
      amount: Number(transferData.amount),
      recipient_name: foundUser.name,
    });
    setTransferModalOpen(false);
    showPinModal();
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
    setPinType('withdrawal');
    setPinValue({
      account_name: accountName,
      account_number: accountNumber,
      bank_code: selectedBank,
      bank_name: NIGERIAN_BANKS.find(b => b.code === selectedBank)?.name || '',
      amount: withdrawAmount,
    });
    showPinModal();
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* REUSED SIDEBAR OVERLAY COMPONENT */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* CORE VIEWPORT CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Wallet" 
            subtitle="Manage your BlueSea funds"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* CARD 1: FUNDING DETAILS */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Funding Details</h3>
                    <div className="p-1.5 bg-sky-500/10 rounded-lg">
                      <Landmark className="h-3.5 w-3.5 text-sky-500" />
                    </div>
                  </div>
                  
                  {accountRequested ? (
                    <div className="text-center p-6 bg-sky-500/5 border border-sky-500/10 rounded-2xl animate-pulse">
                      <p className="text-sky-500 font-bold text-sm">Account Coming Soon</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Processing Request</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <Landmark className="h-6 w-6 text-sky-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Virtual Account</h4>
                        <p className="text-[11px] text-slate-500 mt-1 px-4 leading-relaxed">Generate a dedicated account for instant automated wallet funding.</p>
                      </div>
                      <Button 
                        onClick={handleRequestAccount}
                        disabled={accountLoading}
                        className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl h-11 text-xs font-bold border border-slate-200 dark:border-white/10 shadow-sm transition-all active:scale-[0.98]"
                      >
                       {accountLoading ? <LoadingSpinner size="sm" /> : 'Request Account'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: BALANCE CARD COMPONENT */}
              <div className="lg:col-span-3 relative group">
                <div className="absolute top-6 right-12 md:right-10 flex gap-2 z-20 pointer-events-auto">
                  <button 
                    onClick={() => setCardModalOpen(true)}
                    className="flex items-center gap-1.5 px-6 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-full text-[10px] font-bold text-white shadow-lg hover:bg-white/20 transition-all active:scale-90"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Card</span>
                  </button>
                </div>
                <BalanceCard
                  showActions={true}
                  onDeposit={handleDeposit}
                  onWithdraw={() => setShowWithdrawModal(true)}
                  className="h-full border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden"
                />
              </div>
            </div>

            {/* BLUESEA CONNECT PREVIEW SECTION */}
            <div
              onClick={() => navigate('/blueconnect')}
              className="cursor-pointer transition-transform active:scale-[0.98] w-full max-w-full overflow-hidden"
            >
              <div className="scale-[0.99] md:scale-100 origin-center">
                <BlueConnectPreview />
              </div>
            </div>
            
            {/* Internal Transfer Button */}
            <button 
              onClick={() => setTransferModalOpen(true)}
              className="group w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 flex items-center justify-between hover:border-sky-500/30 transition-all active:scale-[0.99] shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 text-sky-500 rounded-2xl shadow-sm group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 group-hover:rotate-12">
                  <Send className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">Internal Transfer</h3>
                  <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Instant send to BlueSea users</p>
                </div>
              </div>
              <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <ChevronRight className="h-4 w-4 text-sky-500" />
              </div>
            </button>

            {/* RECENT TRANSACTIONS (DESKTOP ONLY) */}
            <section className="hidden md:block space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  Recent Transactions
                </h3>
                <button
                  onClick={() => navigate('/transaction-history')}
                  className="text-xs font-bold text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                >
                  View History
                </button>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-1 shadow-xs">
                <TransactionList />
              </div>
            </section>
          </div>
        </main>

        {/* FIXED MOBILE BOTTOM NAVIGATION LAYER */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>

      {/* --- MODALS & DIALOGS --- */}

      {/* Card Support Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Saved Cards</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Payment Methods</p>
              </div>
              <button onClick={() => setCardModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {savedCard ? (
              <div className="space-y-8">
                <div className="relative h-48 w-full bg-slate-900 rounded-[2rem] p-8 overflow-hidden border border-white/10 shadow-2xl transform hover:rotate-1 transition-transform">
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-500/30 rounded-full blur-[80px]" />
                  <div className="flex justify-between items-start mb-12 relative z-10">
                     <div className="w-12 h-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center">
                       <div className="w-6 h-4 bg-yellow-500/50 rounded-sm" />
                    </div>
                    <CreditCard className="w-6 h-6 text-white/40" />
                   </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-white text-xl font-black tracking-[0.2em]">•••• •••• •••• {savedCard.number.slice(-4)}</p>
                    <div className="flex justify-between items-end mt-4">
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{savedCard.name}</p>
                       <p className="text-[10px] text-white/40 font-bold">{savedCard.expiry}</p>
                    </div>
                  </div>
                </div>
                 <div className="flex justify-center gap-6">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Visa</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Mastercard</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Verve</span>
                 </div>
                <Button 
                  onClick={() => setSavedCard(null)} 
                  className="w-full bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all shadow-lg shadow-red-500/5"
                >
                  Remove Card
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-4">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cardholder Name</Label>
                    <Input 
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                      placeholder="e.g. John Doe" 
                      className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</Label>
                    <Input 
                      value={newCard.number}
                      onChange={(e) => setNewCard({...newCard, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                      placeholder="0000 0000 0000 0000" 
                      className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry</Label>
                      <Input 
                        value={newCard.expiry}
                        onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                        placeholder="MM/YY" 
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</Label>
                      <Input 
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                        placeholder="000" 
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    if (newCard.number && newCard.name) {
                      setSavedCard({...newCard});
                      setNewCard({ name: '', number: '', expiry: '', cvv: '' });
                    }
                  }}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 transition-all mt-4"
                >
                  Link Card
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Withdraw</h3>
              <button onClick={resetWithdrawState} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Number</Label>
                <Input
                  type="text"
                  inputMode='numeric'
                  placeholder="0000000000"
                  className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-14 focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white font-black text-lg text-center"
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Bank</Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search bank name..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-t-2xl h-12 text-xs font-bold pl-11 focus:ring-sky-500"
                  />
                </div>
                <select
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setAccountVerified(false);
                    setAccountName('');
                    setBankSearch('');
                  }}
                  className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-white/5 rounded-b-2xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-black text-sm appearance-none cursor-pointer"
                >
                  <option value="">Choose your bank</option>
                  {NIGERIAN_BANKS.filter(b => 
                    bankSearch === '' || b.name.toLowerCase().includes(bankSearch.toLowerCase())
                  ).map((bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              {selectedBank && accountNumber.length === 10 && (
                <Button onClick={handleVerifyAccount} disabled={verifyingAccount} className="w-full bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white font-black h-12 rounded-2xl border border-sky-500/20 transition-all text-[10px] uppercase tracking-widest">
                  {verifyingAccount ? 'Verifying Account...' : 'Verify Details'}
                </Button>
              )}
              {accountVerified && (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                 <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{accountName}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount to Withdraw</Label>
                <div className="relative group">
                   <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-16 text-3xl font-black focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white pl-10"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-sky-500">₦</span>
                </div>
                <div className="flex justify-between px-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Available: ₦{balance.toLocaleString()}</p>
                  <button 
                    onClick={() => setWithdrawAmount(balance.toString())}
                    className="text-[10px] text-sky-500 font-black uppercase tracking-widest hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>
              <Button
                onClick={handleConfirmWithdraw}
                disabled={withdrawing || !accountVerified || !withdrawAmount || Number(withdrawAmount) > balance}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[1.5rem] h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 mt-6 transition-all"
              >
                {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => !processing && setDepositModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                <LoadingSpinner size="lg" text="Connecting to Secure Gateway..." />
              </div>
            ) : (
              <>
                <header className="mb-10 text-center">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add Funds</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Instant Wallet Funding</p>
                </header>
                <div className="space-y-8">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute left-8 top-4 z-10">Amount to Fund</label>
                    <span className="absolute left-8 bottom-6 text-3xl font-black text-slate-300 group-focus-within:text-sky-500 transition-colors">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value.replace(/\D/g, ''));
                        setDepositError('');
                      }}
                      placeholder="0.00"
                      className="w-full pl-16 pr-8 pt-12 pb-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white shadow-inner"
                    />
                    {depositError && <p className="mt-3 text-xs text-red-500 font-black px-6 animate-bounce">{depositError}</p>}
                  </div>
                  <div className="flex flex-col gap-4 pt-4">
                    <Button 
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[1.5rem] h-16 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                      onClick={handleFund}
                      disabled={depositing || !depositAmount}
                    >
                      {depositing ? <LoadingSpinner size="sm" /> : 'Proceed to Checkout'}
                    </Button>
                    {!depositing && (
                      <button onClick={handleCancelDeposit} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-black uppercase tracking-[0.3em] py-3 transition-colors">Cancel</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <header className="mb-10 text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Send Money</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">BlueSea Instant Transfer</p>
            </header>
            <div className="space-y-8">
              <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-6">
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute left-8 top-4 z-10">Recipient Email</label>
                  <input
                    placeholder="e.g. name@bluesea.com"
                    className="w-full pl-8 pr-14 pt-12 pb-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-black text-lg shadow-inner"
                    value={transferData.recipient}
                    onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                  />
                  <Search className="absolute right-8 bottom-8 h-5 w-5 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute left-8 top-4 z-10">Amount (₦)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-8 pr-8 pt-12 pb-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white shadow-inner"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                  />
                </div>
                {foundUser && (
                  <div className="p-5 bg-sky-500/5 border border-sky-500/20 rounded-[2rem] flex items-center gap-5 animate-in zoom-in-95">
                    <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md overflow-hidden border border-sky-500/20">
                      {foundUser.image ? (
                        <img src={`${API_BASE}${foundUser.image}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-sky-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                         <h4 className="font-black text-slate-800 dark:text-slate-200 truncate text-lg tracking-tight">{foundUser.name}</h4>
                         <CheckCircle2 className="w-4 h-4 text-sky-500" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{foundUser.email}</p>
                    </div>
                  </div>
                )}
                {lookingUp && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] text-center">
                     <LoadingSpinner size="sm" text="Verifying user address..." />
                  </div>
                )}
              </div>

              {transferError && <p className="text-red-500 text-[10px] font-black text-center px-8 uppercase tracking-widest animate-pulse">{transferError}</p>}
              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[1.5rem] h-16 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                  disabled={!transferData.amount || !foundUser}
                  onClick={handleStartTransfer}
                >
                  Proceed to Transfer
                </Button>
                <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-black uppercase tracking-[0.3em] py-3 transition-colors">
                  Cancel Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GLOBAL OVERLAYS & FEEDBACK PROVIDERS --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={toastMessage} />
        </div>
      )}
      <ToastComponent />
      
      {/* Single imported PinModal handling both withdrawals & internal transfers */}
      <PinComponent 
        type={pinType} 
        value={pinValue} 
      />
    </div>
  );
}