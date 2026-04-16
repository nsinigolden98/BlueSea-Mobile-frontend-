import { useState, useEffect } from 'react';
import { Sidebar, Header, TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { postRequest, ENDPOINTS, API_BASE } from '@/types';
import { Landmark, Send, ChevronRight, User, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [loading] = useState(false);

  // --- States for the layout from the screenshot ---
  // 1. Funding Details (Request Account)
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountRequested, setAccountRequested] = useState(false);

  // 2. Deposit states (from light current code, user says are working)
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // 3. Internal Transfer states (user says working)
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

  const handleWithdraw = () => {
    // Handle withdraw
    alert('Withdraw feature coming soon!');
  };

  // Internal transfer lookup logic (user says works, so keep it)
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
        console.error('Lookup failed:', error);
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Wallet" 
          subtitle="Manage your BlueSea funds"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* The 2-card grid for funding details and balance card */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* CARD 1: FUNDING DETAILS (as a distinct card) */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Funding Details</h3>
                    <Landmark className="h-5 w-5 text-sky-500" />
                  </div>
                  {/* The Request Account flow from light current code is moved here to fit the new layout */}
                  {accountRequested ? (
                    <div className="text-center p-6 border-2 border-dashed border-sky-200 bg-sky-50 rounded-2xl animate-in fade-in zoom-in-95">
                      <p className="text-sky-600 font-bold">Dedicated account coming soon</p>
                      <p className="text-xs text-slate-400 mt-1">We are processing your request</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <Landmark className="h-10 w-10 text-sky-500 mx-auto" />
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Get a dedicated virtual account</h4>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">Click below to request an account number for your wallet.</p>
                      <Button 
                        onClick={handleRequestAccount}
                        disabled={accountLoading}
                        className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl mt-4 px-6"
                      >
                        {accountLoading ? <LoadingSpinner size="sm" /> : 'Request Dedicated Account'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2: BALANCE & ACTIONS (Second large card) */}
              {/* Fix: This card should be LIGHT themed to match the other cards and UI. The visual inconsistency of a dark card is the bug. I will style it consistently with other light theme components. The user has also asked to remove the toggle function. */}
              
              <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 text-slate-900 dark:text-white relative overflow-hidden shadow-sm h-full flex flex-col justify-center border border-slate-100 dark:border-slate-800">
                  <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Current Balance</p>
                    {/* Reverted the change that added balance dots and the overlay. The balance is now always shown. */}
                    <h2 className="text-5xl md:text-6xl font-black mt-4 mb-3 tracking-tight">{user?.balance || '₦0.00'}</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Verified Account
                    </div>
                  </div>
                  
                  {/* Decorative elements - adjust colors for light background */}
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-50 dark:bg-white/5 rounded-full blur-3xl" />
                  
                  {/* Deposit/Withdraw buttons are moved to this light card, similar to the light current code, to maintain design logic. The user has stated that features like deposit flow were working. I assume that with this light Wallet.tsx, the intended design logic for always showing the balance and its actions on this card is restored. */}
                  <div className="mt-8 flex gap-3">
                    <Button 
                      onClick={handleDeposit}
                      className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white"
                    >
                      Deposit
                    </Button>
                    <Button 
                      onClick={handleWithdraw}
                      variant="secondary"
                      className="flex-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Transfer Button - positioned outside the grid, like in old code and screenshot */}
            <button 
              onClick={() => setTransferModalOpen(true)}
              className="group w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 flex items-center justify-between hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="p-4 bg-sky-500 text-white rounded-2xl shadow-lg shadow-sky-500/20 group-hover:bg-sky-600 transition-colors">
                  <Send className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Internal Transfer</h3>
                  <p className="text-slate-400 text-sm">Instant send to BlueSea users</p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-sky-500 transition-colors" />
            </button>

            {/* Recent Transactions List */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">History</h3>
                <button className="text-sky-500 text-sm font-bold hover:underline">See All</button>
              </div>
              <TransactionList />
            </div>
          </div>
        </main>
      </div>

      {/* --- Deposit Modal (User says works, keep logic) --- */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !processing && setDepositModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" text="Processing payment..." />
                <p className="mt-4 text-slate-600 dark:text-slate-400 text-center text-sm">
                  Please wait while we redirect you to payment page...
                </p>
              </div>
            ) : (
              <>
                <header className="mb-8 text-center">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deposit Funds</h2>
                  <div className="h-1.5 w-10 bg-sky-500 mx-auto rounded-full mt-2" />
                </header>
                
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase text-slate-400 absolute left-5 top-3 z-10">Amount (₦)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value.replace(/\D/g, ''));
                        setDepositError('');
                      }}
                      placeholder="0.00"
                      className="w-full pl-5 pr-4 pt-8 pb-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-3xl font-black text-slate-900 dark:text-white"
                    />
                    {depositError && (
                      <p className="mt-2 text-xs text-red-500 font-bold px-4">{depositError}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button 
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-8 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                      onClick={handleFund}
                      disabled={depositing || !depositAmount}
                    >
                      {depositing ? <LoadingSpinner size="sm" /> : 'Confirm & Proceed'}
                    </Button>
                    {!depositing && (
                      <button 
                        onClick={handleCancelDeposit} 
                        className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 py-3"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- Internal Transfer Modal (User says works, keep logic) --- */}
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
                      className="w-full pl-5 pr-12 pt-8 pb-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-bold"
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
                      className="w-full pl-5 pr-4 pt-8 pb-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-3xl font-black text-slate-900 dark:text-white"
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

              {transferError && <p className="text-red-500 text-xs font-bold text-center px-4 animate-shake">{transferError}</p>}

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
