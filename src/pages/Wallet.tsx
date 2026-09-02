import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { 
  Sidebar, 
  Header, 
  TransactionList, 
  LoadingSpinner, 
  BalanceCard 
} from '@/components/ui-custom';
//import { BlueConnectPreview } from '@/components/blueconnect';
import { InternalTransferModal } from '@/components/wallet/InternalTransferModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postRequest, ENDPOINTS } from '@/types';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { useAuth } from '@/context/AuthContext';
import { openMobilePaystackCheckout } from '@/services/paystackCheckout';

import { 
  Landmark, 
  Send, 
  X, 
  ChevronRight, 
  CreditCard 
} from 'lucide-react';

export function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Type assertion for optional backend user properties
  const userData = user as (Record<string, any> & typeof user) | null;

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

  // --- Internal Transfer Modal Toggle ---
  const [transferOpen, setTransferOpen] = useState(false);

  // --- Saved Card States ---
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [savedCard, setSavedCard] = useState<{ name: string; number: string; expiry: string } | null>(null);
  const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

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
      if (response.success && response.authorization_url) {
        if (Capacitor.isNativePlatform()) {
          setProcessing(false);
          setDepositing(false);
          setDepositModalOpen(false);

          await openMobilePaystackCheckout(response.authorization_url);

          // Safely attempt user state refresh if supported by AuthContext
          const authCtx = user as any;
          const refreshFn = authCtx?.refreshUser || authCtx?.checkAuth || authCtx?.fetchUserData;
          if (typeof refreshFn === 'function') {
            try {
              await refreshFn();
            } catch (err) {
              console.error('Error refreshing user state after checkout:', err);
            }
          }
        } else {
          setProcessing(false);
          window.location.href = response.authorization_url;
        }
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

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* CORE VIEWPORT CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* APP HEADER LAYER */}
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
            
            {/* 1. BALANCE CARD */}
            <div className="relative group">
              <div className="absolute top-6 right-12 md:right-10 flex gap-2 z-20 pointer-events-auto">
                <button 
                  onClick={() => setCardModalOpen(true)}
                  className="flex items-center gap-1.5 px-6 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-full text-[10px] font-bold text-white shadow-lg hover:bg-white/20 transition-all active:scale-90 cursor-pointer"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Card</span>
                </button>
              </div>
              <BalanceCard
                showActions={true}
                onDeposit={handleDeposit}
                onWithdraw={() => navigate('/withdraw')}
                className="h-full border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden"
              />
            </div>

            {/* 2. DEDICATED ACCOUNT CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-500/10 rounded-lg">
                    <Landmark className="h-4 w-4 text-sky-500" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Dedicated Funding Account</h3>
                </div>
                <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full">Automated</span>
              </div>
              
              {accountRequested ? (
                <div className="text-center p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl animate-pulse">
                  <p className="text-sky-500 font-bold text-xs">Account Coming Soon</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">Processing Request</p>
                </div>
              ) : (userData?.account_number || userData?.bank_name) ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bank Name</p>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 truncate">{userData?.bank_name || 'Wema Bank'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Number</p>
                    <p className="text-xs font-black text-sky-500 tracking-wider mt-0.5 truncate">{userData?.account_number || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Name</p>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5 truncate">{userData?.account_name || userData?.name || '—'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Virtual Account</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Generate dedicated account details for instant automated funding</p>
                  </div>
                  <Button 
                    onClick={handleRequestAccount}
                    disabled={accountLoading}
                    className="shrink-0 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl h-9 px-4 text-[11px] font-bold border border-slate-200 dark:border-white/10 shadow-xs transition-all active:scale-[0.98]"
                  >
                   {accountLoading ? <LoadingSpinner size="sm" /> : 'Request Account'}
                  </Button>
                </div>
              )}
            </div>

            {/* 3. BLUESEA CONNECT PREVIEW SECTION */}
            <div
              onClick={() => navigate('/blueconnect')}
              className="cursor-pointer transition-transform active:scale-[0.98] w-full max-w-full overflow-hidden"
            >
              <div className="scale-[0.99] md:scale-100 origin-center">
                {/* <BlueConnectPreview /> */}
              </div>
            </div>
            
            {/* 4. INTERNAL TRANSFER CARD */}
            <button 
              onClick={() => setTransferOpen(true)}
              className="group w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 flex items-center justify-between hover:border-sky-500/30 transition-all active:scale-[0.99] shadow-sm hover:shadow-md cursor-pointer"
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

            {/* 5. RECENT TRANSACTIONS (DESKTOP ONLY) */}
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

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>

      {/* --- REUSABLE INTERNAL TRANSFER MODAL --- */}
      <InternalTransferModal 
        isOpen={transferOpen} 
        onClose={() => setTransferOpen(false)} 
      />

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

    </div>
  );
}