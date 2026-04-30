import { useState, useRef, useEffect } from 'react';
import { Sidebar, TransactionModal, PinModal, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ChevronDown, History } from 'lucide-react';

// --- CONSTANTS ---
const bettingProviders = [
  {
    name: "SportyBet",
    type: "phone",
    label: "Phone Number",
    placeholder: "Enter your SportyBet phone number",
    maxLength: 11
  },
  {
    name: "Bet9ja",
    type: "id",
    label: "User ID",
    placeholder: "Enter your Bet9ja User ID",
    maxLength: 10
  },
  {
    name: "1xBet",
    type: "id",
    label: "User ID",
    placeholder: "Enter your 1xBet ID",
    maxLength: 9
  },
  {
    name: "NairaBet",
    type: "id",
    label: "User ID",
    placeholder: "Enter your NairaBet ID",
    maxLength: 10
  }
];

const bettingAmounts = [100, 500, 1000, 2000];

export function Betting() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { PinComponent, showPinModal, modalData, message } = PinModal();
  const { showToast, ToastComponent } = Toast();

  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(bettingProviders[0]);
  const [identifier, setIdentifier] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Recent Identifiers State
  const [recentIdentifiers, setRecentIdentifiers] = useState<string[]>([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);

  // Refs
  const bodyDivRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent identifiers
  useEffect(() => {
    const stored = localStorage.getItem('betting_recent_identifiers');
    if (stored) {
      setRecentIdentifiers(JSON.parse(stored));
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Points Calculation
  const finalAmount = selectedAmount || Number(customAmount) || 0;
  const pointsEarned = finalAmount / 100;

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const saveToRecent = (id: string) => {
    const updated = [id, ...recentIdentifiers.filter(item => item !== id)].slice(0, 3);
    setRecentIdentifiers(updated);
    localStorage.setItem('betting_recent_identifiers', JSON.stringify(updated));
  };

  const handleFundWallet = async () => {
    if (!identifier || identifier.length !== selectedProvider.maxLength) {
      showToast(`Invalid ${selectedProvider.label} length`);
      return;
    }
    if (finalAmount < 100) {
      showToast('Minimum amount is ₦100');
      return;
    }

    if (!user?.pin_is_set) {
      navigate('/settings/pin');
      return;
    }

    showPinModal();
  };

  // Payload for the system
  const payload = {
    provider: selectedProvider.name.toLowerCase(),
    identifier: identifier,
    amount: String(finalAmount)
  };

  // Handle transaction feedback
  useEffect(() => {
    if (message) {
      setIsLoading(true);
      // Simulate API processing delay as per requirements
      setTimeout(() => {
        setIsLoading(false);
        if (message?.success || message?.code === '000') {
          saveToRecent(identifier);
          setToastMessage(message?.response_description || 'Funding Successful');
          setTxStatus(true);
          setIsOpen(true);
        } else {
          setToastMessage(message?.error || 'Transaction Failed');
          setTxStatus(false);
          setIsOpen(true);
        }
      }, 1500);
    }
  }, [message]);

  // Modal Visibility effect (Sync with Airtime page logic)
  useEffect(() => {
    if (bodyDivRef.current) {
      bodyDivRef.current.style.opacity = modalData.visible ? '0.5' : '1';
    }
  }, [modalData.visible]);

  return (
    <div className="relative">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex" ref={bodyDivRef}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Back Arrow replacement */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4 md:px-6 flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Betting</h1>
              <p className="text-xs text-slate-500">Fund Your Betting Wallet</p>
            </div>
          </div>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-200">
                
                {/* Provider Selection (Horizontal Scroll) */}
                <div className="space-y-3">
                  <Label>Select Betting Provider</Label>
                  <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-1 px-1">
                    {bettingProviders.map((provider) => (
                      <button
                        key={provider.name}
                        onClick={() => {
                          setSelectedProvider(provider);
                          setIdentifier('');
                        }}
                        className={cn(
                          'flex-shrink-0 px-6 py-4 rounded-xl border-2 transition-all active:scale-95 text-left min-w-[140px]',
                          selectedProvider.name === provider.name
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-400'
                            : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                        )}
                      >
                        <p className={cn(
                          "font-bold",
                          selectedProvider.name === provider.name ? "text-sky-600 dark:text-sky-400" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {provider.name}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1 font-medium">Provider</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Identifier Input with Recent Dropdown */}
                <div className="space-y-3 relative" ref={dropdownRef}>
                  <Label htmlFor="identifier">{selectedProvider.label}</Label>
                  <div className="relative">
                    <Input
                      id="identifier"
                      type={selectedProvider.type === 'phone' ? 'tel' : 'text'}
                      placeholder={selectedProvider.placeholder}
                      maxLength={selectedProvider.maxLength}
                      value={identifier}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length <= selectedProvider.maxLength) {
                          setIdentifier(val);
                        }
                      }}
                      className="focus:ring-2 focus:ring-sky-400 pr-10"
                    />
                    <button 
                      onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                    >
                      <ChevronDown className={cn("w-5 h-5 transition-transform", showRecentDropdown && "rotate-180")} />
                    </button>
                  </div>

                  {/* Dropdown List */}
                  {showRecentDropdown && recentIdentifiers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                        <History className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold uppercase text-slate-400">Recent Accounts</span>
                      </div>
                      {recentIdentifiers.map((id, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-700 dark:text-slate-300 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700"
                          onClick={() => {
                            setIdentifier(id);
                            setShowRecentDropdown(false);
                          }}
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Amount Presets */}
                <div className="space-y-3">
                  <Label>Select Funding Amount (₦)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {bettingAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountSelect(amount)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-center active:scale-95',
                          selectedAmount === amount
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-400'
                            : 'border-slate-200 dark:border-slate-700 hover:border-sky-300 shadow-sm'
                        )}
                      >
                        <p className="font-bold text-slate-800 dark:text-white">₦{amount}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-3">
                  <Label htmlFor="custom">Or enter custom amount (Min 100)</Label>
                  <Input
                    id="custom"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    min={100}
                    className="focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                {/* Summary Section */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 space-y-3 border border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Transaction Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Provider</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedProvider.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Account</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{identifier || '---'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Amount</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">₦{finalAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-sm pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                      <span className="text-sky-600 font-medium italic">Points Earned</span>
                      <div className="text-right">
                        <span className="font-bold text-sky-500">+{pointsEarned.toFixed(1).replace(/\.0$/, '')} BSP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleFundWallet}
                    className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-7 text-lg font-bold active:scale-95 transition-transform"
                    disabled={!identifier || identifier.length !== selectedProvider.maxLength || finalAmount < 100 || isLoading}
                  >
                    {isLoading ? "Processing..." : `Fund ${selectedProvider.name}`}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/auto-topup?service_type=betting&provider=${selectedProvider.name.toLowerCase()}&identifier=${identifier}&amount=${finalAmount}`)}
                    className="w-full rounded-full py-6 border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 active:scale-95 transition-transform"
                    disabled={!identifier || finalAmount < 100}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Set Auto Funding
                  </Button>
                </div>

              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Components from library */}
      <PinComponent type="betting" value={payload} />
      <ToastComponent />
      
      {isOpen && (
        <TransactionModal 
          isSuccess={txStatus} 
          onClose={() => setIsOpen(false)} 
          toastMessage={toastMessage} 
        />
      )}
    </div>
  );
}
