import { useState, useEffect } from 'react';
import { Sidebar, Header, TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // Assuming a standard shadcn/ui Card exists
import { postRequest, ENDPOINTS } from '@/types';
import { Copy, Check, Send, Landmark, CreditCard, User } from 'lucide-react'; // For better UI clarity

export function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- ACCOUNT DETAILS STATE ---
  const [accountDetails, setAccountDetails] = useState<any>(null);
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

  // --- ACTIONS ---

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(field);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const fetchDedicatedAccount = async () => {
    setLoadingAccount(true);
    try {
      // BACKEND NOTE: Ensure ENDPOINTS.dedicatedAccount is defined in your constants
      const response = await postRequest(ENDPOINTS.dedicatedAccount || '/api/wallet/dedicated-account', {});
      if (response.success) {
        setAccountDetails(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch account", err);
    } finally {
      setLoadingAccount(false);
    }
  };

  const handleTransferSubmit = async () => {
    setProcessingTransfer(true);
    setTransferError('');
    try {
      // BACKEND NOTE: verify endpoint name
      const response = await postRequest(ENDPOINTS.transfer || '/api/wallet/transfer', {
        recipient: transferData.recipient,
        amount: Number(transferData.amount),
        password: transferData.password
      });

      if (response.success) {
        setTransferModalOpen(false);
        setTransferStep(1);
        setTransferData({ recipient: '', amount: '', password: '' });
        // Logic to refresh balance/transactions would go here
        window.location.reload(); 
      } else {
        setTransferError(response.message || 'Transfer failed. Please check details.');
      }
    } catch (error) {
      setTransferError('A connection error occurred.');
    } finally {
      setProcessingTransfer(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Wallet" 
          subtitle="Buy Smarter & Cheaper"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* TOP SECTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1️⃣ LEFT TOP: ACCOUNT INFO */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Dedicated Account</h3>
                  <Landmark className="h-5 w-5 text-sky-500" />
                </div>

                {!accountDetails ? (
                  <div className="py-4 text-center">
                    <Button 
                      onClick={fetchDedicatedAccount} 
                      disabled={loadingAccount}
                      className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-8"
                    >
                      {loadingAccount ? <LoadingSpinner size="sm" /> : "Request Dedicated Account"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AccountDetailRow label="Bank Name" value={accountDetails.bank_name} onCopy={() => handleCopy(accountDetails.bank_name, 'bank')} isCopied={copyStatus === 'bank'} />
                    <AccountDetailRow label="Account Number" value={accountDetails.account_number} onCopy={() => handleCopy(accountDetails.account_number, 'acc')} isCopied={copyStatus === 'acc'} />
                    <AccountDetailRow label="Account Name" value={accountDetails.account_name} onCopy={() => handleCopy(accountDetails.account_name, 'name')} isCopied={copyStatus === 'name'} />
                  </div>
                )}
              </div>

              {/* 2️⃣ RIGHT TOP: WALLET STATUS */}
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sky-100 text-sm font-medium mb-1">Available Balance</p>
                  <h2 className="text-4xl font-bold mb-8">₦34,650.00</h2>
                  
                  <Button 
                    disabled 
                    className="w-full bg-white/20 border border-white/30 hover:bg-white/30 text-white rounded-xl py-6"
                  >
                    Withdrawal Not Available
                  </Button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </div>
            </div>

            {/* 3️⃣ FULL BOTTOM: TRANSFER SYSTEM */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-500/10 rounded-2xl">
                    <Send className="h-6 w-6 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Internal Transfer</h3>
                    <p className="text-sm text-slate-500">Send money instantly to other users</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setTransferModalOpen(true)}
                  className="w-full md:w-auto bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 text-white rounded-xl px-12 py-6"
                >
                  Send Money
                </Button>
              </div>
            </div>

            {/* TRANSACTIONS LIST */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
                <button className="text-sky-500 text-sm font-medium">View All</button>
              </div>
              {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12">
                  <LoadingSpinner />
                </div>
              ) : (
                <TransactionList />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* --- TRANSFER MODAL --- */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !processingTransfer && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
              {transferStep === 4 ? 'Confirm Identity' : 'Internal Transfer'}
            </h2>

            <div className="space-y-5">
              {transferStep === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Recipient</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      placeholder="User ID / Email / Phone"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 italic">You can use account ID, registered email, or phone number.</p>
                </div>
              )}

              {transferStep === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {transferStep === 4 && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Please enter your transaction password to authorize the transfer of <b>₦{transferData.amount}</b> to <b>{transferData.recipient}</b>.</p>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                    value={transferData.password}
                    onChange={(e) => setTransferData({...transferData, password: e.target.value})}
                  />
                </div>
              )}

              {transferError && <p className="text-red-500 text-sm font-medium">{transferError}</p>}

              <div className="flex gap-3 mt-6">
                {transferStep > 1 && transferStep !== 4 && (
                  <Button variant="ghost" onClick={() => setTransferStep(transferStep - 1)}>Back</Button>
                )}
                <Button 
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-6"
                  disabled={processingTransfer}
                  onClick={() => {
                    if (transferStep === 1 && transferData.recipient) setTransferStep(2);
                    else if (transferStep === 2 && Number(transferData.amount) > 0) setTransferStep(4);
                    else if (transferStep === 4 && transferData.password) handleTransferSubmit();
                  }}
                >
                  {processingTransfer ? <LoadingSpinner size="sm" /> : transferStep === 4 ? 'Confirm Transfer' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component for UI consistency
function AccountDetailRow({ label, value, onCopy, isCopied }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{label}</p>
        <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white leading-none">{value}</p>
      </div>
      <button onClick={onCopy} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-slate-400" />}
      </button>
    </div>
  );
                                                     }
                      
