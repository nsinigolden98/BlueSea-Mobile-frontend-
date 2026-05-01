import { useState, useRef, useEffect } from 'react';
import { Sidebar, Header, PinModal, TransactionModal, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { networks, dataPlanFunction } from '@/data';
import { cn } from '@/lib/utils';
import type { Network, DataPlan } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X, RefreshCw, ChevronDown, History } from 'lucide-react';

type PlanType = 'Daily' | 'Weekly' | 'Monthly' | 'Extravalue';

const planTypes: { value: PlanType; label: string }[] = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Extravalue', label: 'Extravalue' },
];

export function Data() {
  const { user } = useAuth();
  const defaultNumber = user?.phone ? "0" + user.phone.slice(-10) : '';
  const navigate = useNavigate();
  const { PinComponent, modalData, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();

  // Existing State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('MTN');
  const [phoneNumber, setPhoneNumber] = useState(defaultNumber);
  const [selectedPlanType, setSelectedPlanType] = useState<PlanType>('Daily');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // New UX State
  const [isLoading, setIsLoading] = useState(false);
  const [recentNumbers, setRecentNumbers] = useState<string[]>([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);

  // Group payment state (Untouched)
  const [isGroupPayment, setIsGroupPayment] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<string[]>(['']);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  
  const dataPlans = dataPlanFunction();
  const filteredPlans = dataPlans.filter(
    plan => plan.network === selectedNetwork && plan.planType === selectedPlanType
  );

  // Refs
  const bodyDivRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Points Calculation Consistency
  const pointsEarned = (selectedPlan?.price || 0) / 100;

  // Load recent numbers on mount
  useEffect(() => {
    const stored = localStorage.getItem('data_recent_numbers');
    if (stored) {
      setRecentNumbers(JSON.parse(stored));
    }
  }, []);

  // Dropdown click-outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRecentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveToRecent = (num: string) => {
    const updated = [num, ...recentNumbers.filter(item => item !== num)].slice(0, 3);
    setRecentNumbers(updated);
    localStorage.setItem('data_recent_numbers', JSON.stringify(updated));
  };

  const payload = isGroupPayment ? {
    name: groupName,
    description: groupDescription,
    service_type: 'data',
    sub_number: phoneNumber,
    target_amount: Number(selectedPlan?.price || 0),
    invite_members: inviteMembers.filter(e => e.trim()).join(','),
    plan: selectedPlan?.description,
    plan_type: selectedNetwork === '9mobile' ? 'etisalat': selectedNetwork.toLowerCase()
  } : {
    plan: selectedPlan?.description,
    billersCode: phoneNumber,
    phone_number: phoneNumber,
  };

  const handleBuyData = async () => {
    // Betting-level validation
    if (!phoneNumber || phoneNumber.length !== 11) {
      showToast('Please enter a valid 11-digit phone number');
      return;
    }
    if (!selectedPlan) {
      showToast('Please select a data plan');
      return;
    }

    if (!user?.pin_is_set) {
      navigate('/settings/pin');
      return;
    }
    
    if (isGroupPayment) {
      if (!groupName) {
        showToast('Please enter a group name');
        return;
      }
      const memberEmails = inviteMembers.filter(e => e.trim());
      if (memberEmails.length === 0) {
        showToast('Please add at least one member to invite');
        return;
      }
    }

    showPinModal();
  };

  useEffect(() => {
    if (modalData.visible) {
      if (bodyDivRef.current) bodyDivRef.current.style.opacity = '0.5';
    } else {
      if (bodyDivRef.current) bodyDivRef.current.style.opacity = '1';
    }
  }, [modalData.visible]);

  useEffect(() => {
    if (message) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsOpen(true);
        if (message?.success || message?.code === '000') {
          saveToRecent(phoneNumber);
          showToast(message?.response_description || message?.message || 'Success');
          setToastMessage(message?.response_description || message?.message || 'Success');
          setTxStatus(true);
          
          if (isGroupPayment) {
            setIsGroupPayment(false);
            setGroupName('');
            setInviteMembers(['']);
          }
        } else {
          showToast(message?.error || message?.response_description || 'Failed');
          setToastMessage(message?.error || message?.response_description || 'Failed');
          setTxStatus(false);
        }
      }, 1500);
    }
  }, [message]);
  
  return (
    <div>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex" ref={bodyDivRef}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            title="Data" 
            subtitle="Buy Smarter & Cheaper"
            onMenuClick={() => setSidebarOpen(true)} 
          />

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-200">
                
                {/* Network Selection */}
                <div className="space-y-3">
                  <Label>Select Network</Label>
                  <div className="flex flex-wrap gap-2">
                    {networks.map((network) => (
                      <button
                        key={network}
                        onClick={() => setSelectedNetwork(network)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95',
                          selectedNetwork === network
                            ? 'bg-sky-500 text-white ring-2 ring-sky-400 ring-offset-2'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        )}
                      >
                        {network}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone Number with Dropdown */}
                <div className="space-y-3 relative" ref={dropdownRef}>
                  <Label htmlFor="phone">Recipient's Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      maxLength={11}
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="focus:ring-2 focus:ring-sky-400 pr-10"
                    />
                    <button 
                      onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                    >
                      <ChevronDown className={cn("w-5 h-5 transition-transform", showRecentDropdown && "rotate-180")} />
                    </button>
                  </div>

                  {showRecentDropdown && recentNumbers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                        <History className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold uppercase text-slate-400">Recent Numbers</span>
                      </div>
                      {recentNumbers.map((num, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-700 dark:text-slate-300 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700"
                          onClick={() => {
                            setPhoneNumber(num);
                            setShowRecentDropdown(false);
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Select Plan Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {planTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedPlanType(type.value)}
                        className={cn(
                          'px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95',
                          selectedPlanType === type.value
                            ? 'bg-sky-500 text-white ring-2 ring-sky-400 ring-offset-2'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {filteredPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={cn(
                        'p-2 md:p-4 rounded-xl border-2 transition-all text-center active:scale-95 flex flex-col justify-between min-h-[120px]',
                        selectedPlan?.id === plan.id
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 ring-2 ring-sky-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-sky-300 shadow-sm'
                      )}
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-xs md:text-base leading-tight">{plan.size}</p>
                        <p className="text-[10px] text-slate-500 mb-2 line-clamp-2 leading-tight">
                          ₦{plan.price} - {plan.validity}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 mt-auto">
                        <span className="bg-sky-500 text-white text-[8px] md:text-xs py-0.5 rounded truncate px-1">
                          ₦{plan.price}
                        </span>
                        <span className="bg-sky-600 text-white text-[8px] md:text-xs py-0.5 rounded truncate px-1">
                          {plan.validity.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Group Payment Toggle (Untouched) */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-sky-500" />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">Group Payment</p>
                      <p className="text-xs text-slate-500">Split with friends & family</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsGroupPayment(!isGroupPayment)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      isGroupPayment ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-transform",
                      isGroupPayment ? "translate-x-6" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                {isGroupPayment && (
                  <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        placeholder="e.g., Family Data"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupDescription">Group Description</Label>
                      <Input
                        id="groupDescription"
                        placeholder="Enter a description for the payment"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Invite Members</Label>
                      {inviteMembers.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => {
                              const newMembers = [...inviteMembers];
                              newMembers[index] = e.target.value;
                              setInviteMembers(newMembers);
                            }}
                          />
                          {inviteMembers.length > 1 && (
                            <button
                              onClick={() => {
                                const newMembers = inviteMembers.filter((_, i) => i !== index);
                                setInviteMembers(newMembers);
                              }}
                              className="p-2 text-red-500 hover:scale-110 transition-transform"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setInviteMembers([...inviteMembers, ''])}
                        className="text-sm text-sky-500 flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-4 h-4" /> Add another
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Summary</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Network</span>
                    <span className="font-medium">{selectedNetwork}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Plan</span>
                    <span className="font-medium">
                      {selectedPlan ? `₦${selectedPlan.price} - ${selectedPlan.size}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Recipient</span>
                    <span className="font-medium">{phoneNumber || '-'}</span>
                  </div>

                  {selectedPlan && (
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                      <span className="text-sky-600 font-medium italic">Points Earned</span>
                      <span className="font-bold text-sky-500">
                        +{pointsEarned.toFixed(1).replace(/\.0$/, '')} pts
                      </span>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleBuyData}
                    className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-7 text-lg font-bold active:scale-95 transition-transform"
                    disabled={!phoneNumber || phoneNumber.length !== 11 || !selectedPlan || isLoading}
                  >
                    {isLoading ? "Processing..." : "Buy Data Now"}
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/auto-topup?service_type=data&network=${selectedNetwork.toLowerCase()}&phone_number=${phoneNumber}&amount=${selectedPlan?.price || ''}&plan=${selectedPlan?.description || ''}`)}
                    className="w-full rounded-full py-6 border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 active:scale-95 transition-transform"
                    disabled={!phoneNumber || !selectedPlan}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Set Up Auto Top-Up
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <button 
        onClick={() => navigate('/airtime')}
        className="fixed right-4 top-24 z-50 bg-sky-500 text-white rounded-full px-6 py-2 shadow-lg hover:bg-sky-600 transition-all duration-200 active:scale-95 flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
      >
        <span className="font-medium text-sm">Airtime</span>
        <span>→</span>
      </button>

      <PinComponent type={isGroupPayment ? "group-data" : `data-${selectedPlan?.network}`} value={payload} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={toastMessage} />
        )}
        </div>
        );
}