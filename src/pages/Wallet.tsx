import { useState, useEffect } from 'react';
import { Sidebar, Header, BalanceCard, TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { postRequest, ENDPOINTS, API_BASE } from '@/types';
import { Eye, EyeOff, Send, ChevronRight, User, ShieldCheck, Search, Landmark } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [loading] = useState(false);
  
  // Balance Toggle State
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem('wallet_balance_visible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Deposit Flow States
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Dedicated Account States
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountRequested, setAccountRequested] = useState(false);

  // Internal Transfer States (from OLD CODE)
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(1);
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    pin: ''
  });
  
  interface FoundUser {
    email: string;
    name: string;
    image: string;
  }
  
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [transferError, setTransferError] = useState('');
  const [transferProcessing, setTransferProcessing] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  // Persistence for Balance Toggle
  useEffect(() => {
    localStorage.setItem('wallet_balance_visible', JSON.stringify(showBalance));
  }, [showBalance]);

  // Internal Transfer Lookup Logic (from OLD CODE)
  useEffect(() => {
    const lookupUser = async (email: string) => {
      if (!email || email.length < 5) {
        setFoundUser(null);
        return;
      }
      if (email.trim() === user?.email.trim()) {
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
        setFoundUser(null);
      } finally {
        setLookingUp(false);
      }
    };

    const timer = setTimeout(() => {
      if (transferData.recipient.length >= 5) {
        lookupUser(transferData.recipient);
      } else {
        setFoundUser(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [transferData.recipient, user?.email]);

  const handleDeposit = () => {
    setDepositModalOpen(true);
    setDepositAmount('');
    setDepositError('');
  };

  const handleWithdraw = () => {
    alert('Withdraw feature coming soon!');
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
      setTransferError('Connection error. Please try again.');
    } finally {
      setTransferProcessing(false);
    }
  };

  const handleRequestAccount = () => {
    setAccountLoading(true);
    setTimeout(() => {
      setAccountLoading(false);
      setAccountRequested(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Wallet" 
          subtitle="Buy Smarter & Cheaper"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Wallet Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* CARD 1: DEDICATED ACCOUNT SECTION */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center min-h-[200px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Funding Details</h3>
                  <Landmark className="h-5 w-5 text-sky-500" />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  {accountRequested ? (
                    <div className="animate-in fade-in zoom-in-95">
                      <p className="text-sky-600 font-bold">Dedicated account coming soon</p>
                      <p className="text-xs text-slate-400 mt-1">We are processing your request</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleRequestAccount}
                      disabled={accountLoading}
                      className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-6"
                    >
                      {accountLoading ? <LoadingSpinner size="sm" /> : 'Request Dedicated Account'}
                    </Button>
                  )}
                </div>
                
                <p className="mt-6 text-[10px] text-slate-400 text-center font-bold uppercase tracking-tighter">
                  Automated Wallet Funding
                </p>
              </div>

              {/* CARD 2: BALANCE & ACTIONS */}
              <div className="lg:col-span-3 space-y-4">
                <div className="relative group">
                  <BalanceCard 
                    showActions 
                    onDeposit={handleDeposit}
                    onWithdraw={handleWithdraw}
                  />
                  {/* Balance Toggle Button */}
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  
                  {/* Visual overlay to hide balance if toggled */}
                  {!showBalance && (
                    <div className="absolute inset-0 bg-slate-900 dark:bg-sky-600 rounded-2xl flex items-center justify-center pointer-events-none z-10 border border-slate-800 dark:border-sky-500">
                      <div className="text-center">
                        <p className="text-sky-200/60 text-xs font-bold uppercase tracking-[0.2em]">Current Balance</p>
                        <h2 className="text-4xl md:text-5xl font-black mt-2 text-white">••••••••</h2>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setTransferModalOpen(true)}
                  className="w-full group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 group-hover:bg-sky-600 transition-colors">
                      <Send className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-md font-bold text-slate-900 dark:text-white">Internal Transfer</h3>
                      <p className="text-slate-400 text-xs">Send to BlueSea users</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-500 transition-colors" />
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            {loading ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12">
                <LoadingSpinner />
              </div>
            ) : (
              <TransactionList />
            )}

            {/* Withdrawal Not Available Button */}
            <Button 
              variant="secondary" 
              className="w-full rounded-xl py-6 bg-sky-500/10 text-sky-600 hover:bg-sky-500/20"
              disabled
            >
              Withdrawal Not Available (Coming Soon)
            </Button>
          </div>
        </main>
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {processing ? (
            <div className="absolute inset-0 bg-black/50" />
          ) : (
            <div className="absolute inset-0 bg-black/50" onClick={handleCancelDeposit} />
          )}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" text="Processing payment..." />
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-center">
                  Please wait while we redirect you to payment page...
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Deposit Funds</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value.replace(/\D/g, ''));
                        setDepositError('');
                      }}
                      placeholder="Enter amount"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                    {depositError && (
                      <p className="mt-2 text-sm text-red-500">{depositError}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleFund}
                      disabled={depositing || !depositAmount}
                      className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {depositing ? 'Processing...' : 'Confirm'}
                    </button>
                    <button
                      onClick={handleCancelDeposit}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Internal Transfer Modal (from OLD CODE) */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !transferProcessing && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            
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
                    <label className="text-[10px] font-black uppercase text-slate-400 absolute left-5 top-3 z-10">Email </label>
                    <input
                      placeholder="Enter details..."
                      className="w-full pl-5 pr-12 pt-8 pb-4 rounded-3xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-bold"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                    />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  </div>

                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase text-slate-400 absolute left-5 top-3 z-10">Amount (₦)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-5 pr-4 pt-8 pb-4 rounded-3xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-3xl font-black text-slate-900 dark:text-white"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    />
                  </div>

                  {foundUser && (
                    <div className="p-5 bg-sky-500/5 border border-sky-500/10 rounded-3xl flex items-center gap-4 animate-in fade-in zoom-in-95">
                      <div className="h-12 w-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-black overflow-hidden">
                        {foundUser.image ? (
                          <img 
                            src={`${API_BASE}${foundUser.image}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{foundUser.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500">{foundUser.email}</p>
                      </div>
                    </div>
                  )}

                  {lookingUp && (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-3xl text-center">
                      <p className="text-sm text-slate-500">Looking up user...</p>
                    </div>
                  )}
                </div>
              )}

              {transferStep === 2 && (
                <div className="animate-in slide-in-from-bottom-4 text-center">
                  <div className="mb-6">
                    <div className="h-16 w-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-sky-500" />
                    </div>
                    <p className="text-sm text-slate-500">Confirm payment of <span className="font-black text-slate-900 dark:text-white">₦{transferData.amount}</span> to <span className="font-bold text-sky-500">{foundUser?.name}</span></p>
                  </div>
                  
                  <div className="max-w-[220px] mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      inputMode="numeric"
                      className="w-full px-4 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none text-center text-4xl tracking-[1.5rem] font-black"
                      value={transferData.pin}
                      onChange={(e) => setTransferData({...transferData, pin: e.target.value.replace(/\D/g, '')})}
                    />
                    <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter 4-Digit PIN</p>
                  </div>
                </div>
              )}

              {transferError && <p className="text-red-500 text-xs font-bold text-center px-4">{transferError}</p>}

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-8 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                  disabled={transferProcessing || (transferStep === 1 && (!transferData.amount || !foundUser))}
                  onClick={() => {
                    if (transferStep === 1) setTransferStep(2);
                    else handleTransferSubmit();
                  }}
                >
                  {transferProcessing ? <LoadingSpinner size="sm" /> : transferStep === 1 ? 'Verify Transaction' : 'Confirm & Pay'}
                </Button>
                {!transferProcessing && (
                  <button 
                    onClick={() => transferStep === 2 ? setTransferStep(1) : setTransferModalOpen(false)} 
                    className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 py-3"
                  >
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
