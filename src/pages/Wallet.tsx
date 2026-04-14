import { useState, useEffect } from 'react';
import { Sidebar, Header, TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { postRequest, ENDPOINTS } from '@/types';
import { Copy, Check, Send, Landmark, User, ShieldCheck, Search } from 'lucide-react';

export function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- SIMULATED DEDICATED ACCOUNT ---
  const simulatedAccount = {
    bank_name: "BlueSea Microfinance Bank",
    account_number: "9023485112",
    account_name: "BLUESEA / NSINI GOLDEN"
  };

  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // --- TRANSFER MODAL STATE ---
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(1); // 1: Input, 2: PIN
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    pin: ''
  });
  
  // Simulated "User Found" state
  const [foundUser, setFoundUser] = useState<any>(null);
  const [transferError, setTransferError] = useState('');
  const [processing, setProcessing] = useState(false);

  // --- UTILS ---
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(field);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  // Simulate finding a user when recipient input changes
  useEffect(() => {
    if (transferData.recipient.length > 4) {
      setFoundUser({
        name: "Nsini Golden",
        email: "nsini@bluesea.com",
        id: "BS-88291",
        phone: "+234 812 345 6789"
      });
    } else {
      setFoundUser(null);
    }
  }, [transferData.recipient]);

  const handleTransferSubmit = async () => {
    setProcessing(true);
    setTransferError('');
    try {
      const endpoint = (ENDPOINTS as any).transfer || '/api/wallet/transfer';
      const response = await postRequest(endpoint, {
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
      setTransferError('Network error. Check connection.');
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
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* 1️⃣ THE TWO-CARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* CARD 1: FUNDING ACCOUNT (2/5 Width) */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Funding Account</h3>
                    <div className="p-2 bg-sky-500/10 rounded-full">
                      <Landmark className="h-5 w-5 text-sky-500" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <AccountDetailRow label="Bank" value={simulatedAccount.bank_name} onCopy={() => handleCopy(simulatedAccount.bank_name, 'b')} isCopied={copyStatus === 'b'} />
                    <AccountDetailRow label="Account Number" value={simulatedAccount.account_number} onCopy={() => handleCopy(simulatedAccount.account_number, 'n')} isCopied={copyStatus === 'n'} />
                    <AccountDetailRow label="Account Name" value={simulatedAccount.account_name} onCopy={() => handleCopy(simulatedAccount.account_name, 'a')} isCopied={copyStatus === 'a'} />
                  </div>
                </div>
                
                <p className="mt-6 text-[11px] text-slate-400 text-center font-medium">
                  Transfer funds to this account to top up your wallet automatically.
                </p>
              </div>

              {/* CARD 2: BALANCE & INTERNAL TRANSFER (3/5 Width) */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Balance Section */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-sky-500 dark:to-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-sky-500/10 h-full flex flex-col justify-center">
                  <div className="relative z-10">
                    <p className="text-sky-100/60 text-sm font-medium uppercase tracking-widest">Available Balance</p>
                    <h2 className="text-5xl font-bold mt-4 mb-2">₦34,650.00</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Account Active
                    </div>
                  </div>
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl" />
                </div>

                {/* Internal Transfer Trigger (Consolidated inside Card 2 area) */}
                <button 
                  onClick={() => setTransferModalOpen(true)}
                  className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 flex items-center justify-between hover:border-sky-500 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-sky-500 text-white rounded-2xl shadow-lg shadow-sky-500/20 group-hover:rotate-12 transition-transform">
                      <Send className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Internal Transfer</h3>
                      <p className="text-slate-400 text-sm">Send funds to BlueSea Users</p>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-sky-500">
                    →
                  </div>
                </button>
              </div>
            </div>

            {/* 2️⃣ TRANSACTIONS SECTION */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                <button className="text-sky-500 text-sm font-bold hover:underline">View History</button>
              </div>
              <TransactionList />
            </div>
          </div>
        </main>
      </div>

      {/* --- REFACTORED TRANSFER MODAL --- */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => !processing && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            
            <header className="mb-8 text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {transferStep === 2 ? 'Authorize Transfer' : 'Quick Transfer'}
              </h2>
              <p className="text-slate-500 text-sm">Transfer funds instantly within BlueSea</p>
            </header>

            <div className="space-y-6">
              {transferStep === 1 && (
                <div className="animate-in slide-in-from-bottom-4">
                  {/* Recipient & Amount Combined */}
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-[10px] font-black uppercase text-slate-400 absolute left-5 top-3 z-10">Recipient</label>
                      <input
                        placeholder="User ID, Email, or Phone"
                        className="w-full pl-5 pr-12 pt-8 pb-4 rounded-3xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-bold"
                        value={transferData.recipient}
                        onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                      />
                      <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>

                    <div className="relative">
                      <label className="text-[10px] font-black uppercase text-slate-400 absolute left-5 top-3 z-10">Amount (₦)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full pl-5 pr-4 pt-8 pb-4 rounded-3xl border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-3xl font-black text-slate-900 dark:text-white"
                        value={transferData.amount}
                        onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* USER DISCOVERY PREVIEW */}
                  {foundUser && (
                    <div className="mt-6 p-5 bg-sky-500/5 border border-sky-500/20 rounded-[2rem] animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                          {foundUser.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{foundUser.name}</h4>
                          <p className="text-xs text-slate-500">{foundUser.email} • {foundUser.id}</p>
                          <p className="text-xs text-slate-500">{foundUser.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {transferStep === 2 && (
                <div className="animate-in slide-in-from-bottom-4 text-center">
                  <div className="mb-6">
                    <div className="h-20 w-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-500">
                      <ShieldCheck className="h-10 w-10" />
                    </div>
                    <p className="text-sm text-slate-500">Confirm transfer of <span className="font-bold text-slate-900 dark:text-white text-lg">₦{transferData.amount}</span> to <span className="font-bold text-slate-900 dark:text-white">{foundUser?.name || 'User'}</span></p>
                  </div>
                  
                  <div className="max-w-[200px] mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="• • • •"
                      className="w-full px-4 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none text-center text-3xl tracking-[1rem] font-black"
                      value={transferData.pin}
                      onChange={(e) => setTransferData({...transferData, pin: e.target.value.replace(/\D/g, '')})}
                    />
                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter 4-Digit PIN</p>
                  </div>
                </div>
              )}

              {transferError && <p className="text-red-500 text-xs font-bold text-center px-4">{transferError}</p>}

              <div className="flex flex-col gap-3 mt-4">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-8 text-lg font-black shadow-xl shadow-sky-500/20 transition-all active:scale-[0.98]"
                  disabled={processing || (transferStep === 1 && (!transferData.amount || !foundUser))}
                  onClick={() => {
                    if (transferStep === 1) setTransferStep(2);
                    else handleTransferSubmit();
                  }}
                >
                  {processing ? <LoadingSpinner size="sm" /> : transferStep === 1 ? 'Verify & Continue' : 'Confirm Transfer'}
                </Button>
                {!processing && (
                  <button 
                    onClick={() => transferStep === 2 ? setTransferStep(1) : setTransferModalOpen(false)} 
                    className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-200 py-2"
                  >
                    {transferStep === 2 ? 'Go Back' : 'Cancel'}
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

// Visual Row Component for Accounts
function AccountDetailRow({ label, value, onCopy, isCopied }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/50 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors hover:border-sky-500/30">
      <div className="min-w-0 flex-1 mr-2">
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-tighter mb-0.5">{label}</p>
        <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-100 truncate">{value}</p>
      </div>
      <button onClick={onCopy} className="p-2 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-xl transition-all flex-shrink-0">
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-300 hover:text-sky-500" />}
      </button>
    </div>
  );
                      }
