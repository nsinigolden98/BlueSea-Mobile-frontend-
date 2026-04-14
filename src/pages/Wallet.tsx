import { useState } from 'react';
import { Sidebar, Header, TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { postRequest, ENDPOINTS } from '@/types';
import { Copy, Check, Send, Landmark, User, ShieldCheck } from 'lucide-react';

// Define interface for build safety
interface DedicatedAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
}

export function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading] = useState(false); 

  // --- ACCOUNT DETAILS STATE ---
  const [accountDetails, setAccountDetails] = useState<DedicatedAccount | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // --- TRANSFER MODAL STATE ---
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(1);
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    password: ''
  });
  const [transferError, setTransferError] = useState('');
  const [processingTransfer, setProcessingTransfer] = useState(false);

  // --- UTILS ---
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(field);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const fetchDedicatedAccount = async () => {
    setLoadingAccount(true);
    try {
      // FIX: Cast ENDPOINTS to any to bypass TS2339 build error
      const endpoint = (ENDPOINTS as any).dedicatedAccount || '/api/wallet/dedicated-account';
      const response = await postRequest(endpoint, {});
      if (response.success) {
        setAccountDetails(response.data);
      }
    } catch (err) {
      console.error("Vercel Deployment Error Check:", err);
    } finally {
      setLoadingAccount(false);
    }
  };

  const handleTransferSubmit = async () => {
    setProcessingTransfer(true);
    setTransferError('');
    try {
      // FIX: Cast ENDPOINTS to any to bypass TS2339 build error
      const endpoint = (ENDPOINTS as any).transfer || '/api/wallet/transfer';
      const response = await postRequest(endpoint, {
        recipient: transferData.recipient,
        amount: Number(transferData.amount),
        password: transferData.password
      });

      if (response.success) {
        setTransferModalOpen(false);
        setTransferStep(1);
        setTransferData({ recipient: '', amount: '', password: '' });
        window.location.reload(); // Refresh to update balance/transactions
      } else {
        setTransferError(response.message || 'Transfer failed.');
      }
    } catch (error) {
      setTransferError('Network error. Check connection.');
    } finally {
      setProcessingTransfer(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Wallet" 
          subtitle="Buy Smarter & Cheaper"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* 1️⃣ TOP SECTION: ACCOUNT & BALANCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT: DEDICATED ACCOUNT INFO */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Funding Account</h3>
                  <Landmark className="h-5 w-5 text-sky-500" />
                </div>

                {!accountDetails ? (
                  <div className="py-6 flex flex-col items-center">
                    <p className="text-sm text-slate-500 mb-4 text-center">Generate account for automated funding.</p>
                    <Button 
                      onClick={fetchDedicatedAccount} 
                      disabled={loadingAccount}
                      className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl w-full py-6 shadow-lg shadow-sky-500/20"
                    >
                      {loadingAccount ? <LoadingSpinner size="sm" /> : "Request Dedicated Account"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AccountDetailRow label="Bank" value={accountDetails.bank_name} onCopy={() => handleCopy(accountDetails.bank_name, 'b')} isCopied={copyStatus === 'b'} />
                    <AccountDetailRow label="Number" value={accountDetails.account_number} onCopy={() => handleCopy(accountDetails.account_number, 'n')} isCopied={copyStatus === 'n'} />
                    <AccountDetailRow label="Name" value={accountDetails.account_name} onCopy={() => handleCopy(accountDetails.account_name, 'a')} isCopied={copyStatus === 'a'} />
                  </div>
                )}
              </div>

              {/* RIGHT: BALANCE CARD */}
              <div className="bg-gradient-to-br from-sky-400 to-sky-600 dark:from-sky-500 dark:to-blue-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-sky-500/10">
                <div className="relative z-10">
                  <p className="text-sky-100/80 text-sm font-medium">Available Balance</p>
                  <h2 className="text-4xl font-bold mt-2 mb-10">₦34,650.00</h2>
                  
                  <div className="flex gap-3">
                    <Button disabled className="flex-1 bg-white/20 border border-white/20 text-white rounded-xl py-6 backdrop-blur-md">
                      Withdrawal Not Available
                    </Button>
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
            </div>

            {/* 2️⃣ MIDDLE SECTION: INTERNAL TRANSFER PANEL */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 border border-slate-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 text-center md:text-left">
                  <div className="p-4 bg-sky-500/20 rounded-2xl">
                    <Send className="h-6 w-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Internal Transfer</h3>
                    <p className="text-slate-400 text-sm">Send funds instantly to any user.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setTransferModalOpen(true)}
                  className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-10 py-7 text-md font-bold transition-transform active:scale-95"
                >
                  Transfer Money
                </Button>
              </div>
            </div>

            {/* 3️⃣ BOTTOM SECTION: TRANSACTIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                <button className="text-sky-500 text-sm font-bold hover:underline">View All</button>
              </div>
              {loading ? <LoadingSpinner /> : <TransactionList />}
            </div>
          </div>
        </main>
      </div>

      {/* --- MULTI-STEP TRANSFER MODAL --- */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/40 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => !processingTransfer && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            
            <header className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {transferStep === 4 ? 'Secure Authorize' : 'Internal Transfer'}
              </h2>
              <div className="h-1.5 w-12 bg-sky-500 rounded-full mt-2" />
            </header>

            <div className="space-y-6">
              {transferStep === 1 && (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-3 block">Recipient</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <input
                      placeholder="ID, Email, or Phone"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500 text-center uppercase tracking-tight font-medium">Accepted: User ID • Email • Phone Number</p>
                </div>
              )}

              {transferStep === 2 && (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 mb-3 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-5 top-4 font-bold text-sky-500 text-lg">₦</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-2xl font-bold text-slate-900 dark:text-white"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {transferStep === 4 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                   <div className="flex items-center gap-3 mb-4 text-sky-500">
                     <ShieldCheck className="h-5 w-5" />
                     <p className="text-sm font-bold">Transaction PIN/Password</p>
                   </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-4 rounded-xl bg-white dark:bg-slate-900 border-none focus:ring-2 focus:ring-sky-500 outline-none text-center text-xl tracking-widest"
                    value={transferData.password}
                    onChange={(e) => setTransferData({...transferData, password: e.target.value})}
                  />
                </div>
              )}

              {transferError && <p className="text-red-500 text-xs font-bold text-center animate-bounce">{transferError}</p>}

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-7 text-lg font-bold shadow-lg shadow-sky-500/20"
                  disabled={processingTransfer}
                  onClick={() => {
                    if (transferStep === 1 && transferData.recipient) setTransferStep(2);
                    else if (transferStep === 2 && Number(transferData.amount) > 0) setTransferStep(4);
                    else if (transferStep === 4 && transferData.password) handleTransferSubmit();
                  }}
                >
                  {processingTransfer ? <LoadingSpinner size="sm" /> : transferStep === 4 ? 'Confirm Transfer' : 'Continue'}
                </Button>
                {transferStep > 1 && !processingTransfer && (
                  <button 
                    onClick={() => setTransferStep(transferStep === 4 ? 2 : 1)} 
                    className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600"
                  >
                    Back
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
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
      <div>
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-0.5">{label}</p>
        <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
      <button onClick={onCopy} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-300" />}
      </button>
    </div>
  );
                    }
