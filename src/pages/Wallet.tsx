import { useState } from 'react';
import { Sidebar, Header, BalanceCard, TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { postRequest, ENDPOINTS } from '@/types';

export function Wallet() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleDeposit = () => {
    setDepositModalOpen(true);
    setDepositAmount('');
    setDepositError('');
  };

  const handleWithdraw = () => {
    // Handle withdraw
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
            {/* Balance Card with Actions */}
            <BalanceCard 
              showActions 
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />

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
              Withdrawal Not Available
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
    </div>
  );
}
