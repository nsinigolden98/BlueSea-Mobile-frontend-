import { useState, useEffect } from 'react';
import { Sidebar, Header, TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { postRequest, ENDPOINTS } from '@/types';
import { Copy, Check, Send, Landmark, User, ShieldCheck, Search, ChevronRight } from 'lucide-react';

// --- VERCEL BUILD SAFETY ---
// We define these as local constants to prevent the TS2339 "Property does not exist" error
const PATH_DEDICATED_ACC = '/api/wallet/dedicated-account';
const PATH_TRANSFER = '/api/wallet/transfer';

export function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- SIMULATED DATA ---
  const simulatedAccount = {
    bank_name: "BlueSea Microfinance Bank",
    account_number: "9023485112",
    account_name: "BLUESEA / NSINI GOLDEN"
  };

  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // --- TRANSFER MODAL STATE ---
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(1); // 1: Inputs, 2: 4-Digit PIN
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    pin: ''
  });
  
  const [foundUser, setFoundUser] = useState<any>(null);
  const [transferError, setTransferError] = useState('');
  const [processing, setProcessing] = useState(false);

  // --- LOGIC ---
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(field);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  // Simulate user discovery logic
  useEffect(() => {
    if (transferData.recipient.length >= 5) {
      // Simulate API finding a user
      setFoundUser({
        name: "Nsini Golden",
        email: "nsini@bluesea.com",
        id: "BS-88291",
        phone: "08123456789"
      });
    } else {
      setFoundUser(null);
    }
  }, [transferData.recipient]);

  const handleTransferSubmit = async () => {
    setProcessing(true);
    setTransferError('');
    try {
      // Use the safe constant instead of ENDPOINTS object to pass Vercel build
      const response = await postRequest(PATH_TRANSFER, {
        recipient: transferData.recipient,
        amount: Number(transferData.amount),
        pin: transferData.pin
      });

      if (response.success) {
        setTransferModalOpen(false);
        setTransferStep(1);
        setTransferData({ recipient: '', amount: '', pin: '' });
        window.location.reload(); 
      } else {
        setTransferError(response.message || 'Transfer failed. Check PIN.');
      }
    } catch (error) {
      setTransferError('Connection error. Please try again.');
    } finally {
      setProcessing(false);
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
            
            {/* 1️⃣ THE TWO-CARD LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* CARD 1: FUNDING ACCOUNT (Simulated) */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Funding Details</h3>
                    <Landmark className="h-5 w-5 text-sky-500" />
                  </div>

                  <div className="space-y-3">
                    <AccountDetailRow label="Bank" value={simulatedAccount.bank_name} onCopy={() => handleCopy(simulatedAccount.bank_name, 'b')} isCopied={copyStatus === 'b'} />
                    <AccountDetailRow label="Account Number" value={simulatedAccount.account_number} onCopy={() => handleCopy(simulatedAccount.account_number, 'n')} isCopied={copyStatus === 'n'} />
                    <AccountDetailRow label="Account Name" value={simulatedAccount.account_name} onCopy={() => handleCopy(simulatedAccount.account_name, 'a')} isCopied={copyStatus === 'a'} />
                  </div>
                </div>
                <p className="mt-6 text-[10px] text-slate-400 text-center font-bold uppercase tracking-tighter">
                  Automated Wallet Funding Enabled
                </p>
              </div>

              {/* CARD 2: BALANCE & TRANSFER PANEL */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Balance Area */}
                <div className="bg-slate-900 dark:bg-sky-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl h-full flex flex-col justify-center border border-slate-800 dark:border-sky-500">
                  <div className="relative z-10">
                    <p className="text-sky-200/60 text-xs font-bold uppercase tracking-[0.2em]">Current Balance</p>
                    <h2 className="text-5xl md:text-6xl font-black mt-4 mb-3 tracking-tight">₦34,650.00</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Verified Account
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                </div>

                {/* Internal Transfer Trigger */}
                <button 
                  onClick={() => setTransferModalOpen(true)}
                  className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 flex items-center justify-between hover:shadow-lg transition-all active:scale-[0.98]"
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
              </div>
            </div>

            {/* 2️⃣ TRANSACTIONS LIST */}
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

      {/* --- SINGLE MODAL: RECIPIENT & AMOUNT ON ONE SCREEN --- */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !processing && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            
            <header className="mb-8 text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {transferStep === 2 ? 'Verify Identity' : 'Transfer Funds'}
              </h2>
              <div className="h-1.5 w-10 bg-sky-500 mx-auto rounded-full mt-2" />
            </header>

            <div className="space-y-6">
              {transferStep === 1 && (
                <div className="animate-in slide-in-from-bottom-4 space-y-5">
                  {/* Recipient Input */}
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase text-slate-400 absolute left-5 top-3 z-10">Recipient ID / Email / Phone</label>
                    <input
                      placeholder="Enter details..."
                      className="w-full pl-5 pr-12 pt-8 pb-4 rounded-3xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-bold"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                    />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  </div>

                  {/* Amount Input */}
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

                  {/* USER PREVIEW (Dynamic) */}
                  {foundUser && (
                    <div className="p-5 bg-sky-500/5 border border-sky-500/10 rounded-[2rem] flex items-center gap-4 animate-in fade-in zoom-in-95">
                      <div className="h-12 w-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-black">
                        {foundUser.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{foundUser.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{foundUser.id} • {foundUser.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4-DIGIT PIN STEP */}
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
                  disabled={processing || (transferStep === 1 && (!transferData.amount || !foundUser))}
                  onClick={() => {
                    if (transferStep === 1) setTransferStep(2);
                    else handleTransferSubmit();
                  }}
                >
                  {processing ? <LoadingSpinner size="sm" /> : transferStep === 1 ? 'Verify Transaction' : 'Confirm & Pay'}
                </Button>
                {!processing && (
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

function AccountDetailRow({ label, value, onCopy, isCopied }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
      <div className="min-w-0 mr-2">
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-0.5">{label}</p>
        <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 truncate">{value}</p>
      </div>
      <button onClick={onCopy} className="p-2 hover:bg-sky-50 dark:hover:bg-sky-900/40 rounded-xl transition-all flex-shrink-0">
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-300" />}
      </button>
    </div>
  );
            }
                    
