import { useState } from 'react';
import { Sidebar, Header } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { networks } from '@/data';
import { cn } from '@/lib/utils';
import { RefreshCw, Smartphone, CheckCircle2 } from 'lucide-react';
import type { Network } from '@/types';

export function AirtimeBuyback() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');

  const conversionRate = 0.9; // 90% conversion rate
  const walletCredit = Number(amount) * conversionRate;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Airtime Buyback" 
          subtitle="Convert Unused Airtime to Wallet Credit"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {step === 'input' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
                {/* Info Banner */}
                <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4 flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sky-700 dark:text-sky-400">How it works</h4>
                    <p className="text-sm text-sky-600 dark:text-sky-300 mt-1">
                      Enter your phone number and unused airtime amount. We'll convert it to wallet credit at a 90% rate.
                    </p>
                  </div>
                </div>

                {/* Network Selection */}
                <div className="space-y-3">
                  <Label>Select Network</Label>
                  <div className="flex flex-wrap gap-2">
                    {networks.map((network) => (
                      <button
                        key={network}
                        onClick={() => setSelectedNetwork(network)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all',
                          selectedNetwork === network
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        )}
                      >
                        {network}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number with unused airtime"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-3">
                  <Label htmlFor="amount">Unused Airtime Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to convert"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={100}
                  />
                  <p className="text-xs text-slate-500">Minimum amount: ₦100</p>
                </div>

                {/* Conversion Preview */}
                {amount && Number(amount) >= 100 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Airtime Amount</span>
                      <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Conversion Rate</span>
                      <span className="font-medium">90%</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">You'll Receive</span>
                      <span className="font-bold text-sky-500">₦{walletCredit.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full rounded-xl bg-slate-300 dark:bg-slate-700 py-6 cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>
            )}

            {step === 'confirm' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Confirm Conversion</h3>
                  <p className="text-slate-500">Please review the details before confirming</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Network</span>
                    <span className="font-medium">{selectedNetwork}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phone Number</span>
                    <span className="font-medium">{phoneNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Airtime Amount</span>
                    <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Wallet Credit</span>
                    <span className="font-bold text-sky-500 text-lg">₦{walletCredit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setStep('input')}
                    className="flex-1 rounded-xl py-6"
                  >
                    Back
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl bg-slate-300 dark:bg-slate-700 py-6 cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Conversion Successful!</h3>
                <p className="text-slate-500 mb-6">
                  ₦{walletCredit.toLocaleString()} has been added to your wallet.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    className="rounded-xl bg-slate-300 dark:bg-slate-700 px-6 cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/wallet'}
                    className="rounded-xl bg-sky-500 hover:bg-sky-600 px-6"
                  >
                    View Wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
