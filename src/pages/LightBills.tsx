import { useState, useRef, useEffect } from 'react';
import { Sidebar, Toast, TransactionModal, PinModal, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, postRequest } from '@/types';
import { Users, Plus, X, RefreshCw, ChevronLeft, ChevronDown, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const meterTypes = ['Prepaid', 'Postpaid'];
interface BillerName {
  'Ikeja Electric(IKEDC)': string;
  'Eko Electric(EKEDC)': string;
  'Kano Electric(KEDCO)': string;
  'Port-harcourt Electric(PHED)': string;
  'Jos Electric(JED)': string;
  'Ibadan Electric(IBEDC)': string;
  'Kaduna Electric(KAEDCO)': string;
  'Abuja Electric(AEDC)': string;
  'Enugu Electric(EEDC)': string;
  'Benin Electric(BEDC)': string;
  'Aba Electric(ABA)': string;
  'Yola Electric(YEDC)': string;
}
const BILLER_NAME: BillerName = {
  'Ikeja Electric(IKEDC)': 'ikeja-electric',
  'Eko Electric(EKEDC)': 'eko-electric',
  'Kano Electric(KEDCO)': 'kano-electric',
  'Port-harcourt Electric(PHED)': 'portharcourt-electric',
  'Jos Electric(JED)': 'jos-electric',
  'Ibadan Electric(IBEDC)': 'ibadan-electric',
  'Kaduna Electric(KAEDCO)': 'kaduna-electric',
  'Abuja Electric(AEDC)': 'abuja-electric',
  'Enugu Electric(EEDC)': 'enugu-electric',
  'Benin Electric(BEDC)': 'benin-electric',
  'Aba Electric(ABA)': 'aba-electric',
  'Yola Electric(YEDC)': 'yola-electric'
};
const billers = Object.keys(BILLER_NAME);

export function LightBills() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('');
  const [biller, setBiller] = useState('');
  const [amount, setAmount] = useState('');
  const { PinComponent, showPinModal, modalData, message } = PinModal();
  const { user, refreshUser } = useAuth();
  const { LoaderComponent, showLoader, hideLoader } = Loader();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState('');
  const { showToast, ToastComponent } = Toast();
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // New UX Loading States for State-Sync Consistency
  const [isLoading, setIsLoading] = useState(false);
  const [recentMeters, setRecentMeters] = useState<string[]>([]);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group payment state
  const [isGroupPayment, setIsGroupPayment] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<string[]>(['']);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const pricePerUnit = 70;
  const units = amount ? Math.floor(Number(amount) / pricePerUnit) : 0;
  
  // Points logic: 100 Naira = 1 point
  const pointsEarned = Number(amount || 0) / 100;

  const payload = isGroupPayment ? {
    name: groupName,
    description: groupDescription,
    service_type: 'electricity',
    sub_number: meterNumber,
    target_amount: Number(amount),
    invite_members: inviteMembers.filter(e => e.trim()).join(','),
    plan: BILLER_NAME[biller as keyof BillerName],
    plan_type: meterType.toLowerCase()
  } : {
    billerCode: meterNumber,
    amount: Number(amount),
    biller_name: BILLER_NAME[biller as keyof BillerName],
    meter_type: meterType.toLowerCase(),
  };

  // Load recent meters on mount
  useEffect(() => {
    const stored = localStorage.getItem('light_recent_meters');
    if (stored) {
      setRecentMeters(JSON.parse(stored));
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
    const updated = [num, ...recentMeters.filter(item => item !== num)].slice(0, 3);
    setRecentMeters(updated);
    localStorage.setItem('light_recent_meters', JSON.stringify(updated));
  };

  const handleContinue = async () => {
    if (!meterNumber || !meterType || !biller || !amount) {
      showToast('Please fill in all fields');
      return;
    }
    else if (!user?.pin_is_set) {
      navigate('/settings');
      navigate('/pin');
      return;
    }
    else if (isGroupPayment) {
      if (!groupName) {
        showToast('Please enter a group name');
        return;
      }
      if (!meterNumber) {
        showToast('Please enter meter number');
        return;
      }
      const memberEmails = inviteMembers.filter(e => e.trim());
      if (memberEmails.length === 0) {
        showToast('Please add at least one member to invite');
        return;
      }

      showPinModal();
      return;
    }
    else {
      showToast("Searching For Customer ...", 3000);
      showLoader();
      const data = {
        meter_number: Number(meterNumber),
        meter_type: meterType.toLowerCase(),
        biller: BILLER_NAME[biller as keyof BillerName]
      };
      const response = await postRequest(ENDPOINTS.electricity_user, data);
      hideLoader();
      if (response.success) {
        setCustomer(`Customer: ${response.response.Customer_Name}`);
        showPinModal();
      } else {
        showToast(response.error);
      }
    }
  };

  const bodyDivRef = useRef<HTMLDivElement>(null);

  const hidePaymentModal = () => {
    if (bodyDivRef.current) {
      bodyDivRef.current.style.opacity = '1';
    }
  };

  const showPaymentModal = () => {
    if (bodyDivRef.current) {
      bodyDivRef.current.style.opacity = '0.5';
    }
  };

  if (!modalData.visible) {
    hidePaymentModal();
  }
  else {
    showPaymentModal();
  }

  // Production-Grade Unified Success Pipeline Tracking Effect Block
  useEffect(() => {
    if (message) {
      setIsLoading(true);
      
      // UX Processing transition delay mapping exactly to working reference implementation
      const timer = setTimeout(async () => {
        setIsLoading(false);
        setIsOpen(true);

        // Safe dynamic cast protecting build-step from strict payload validation limits
        const targetPayload = message as any;
        const isSuccess = 
          targetPayload?.success === true || 
          targetPayload?.success === 'true' ||
          targetPayload?.code === '000' || 
          targetPayload?.code === '200' || 
          targetPayload?.code === 200 ||
          targetPayload?.status === 'success' || 
          targetPayload?.status === '000' || 
          targetPayload?.state === 'success';

        if (isSuccess) {
          saveToRecent(meterNumber);
          showToast(message?.response_description || message?.message || 'Success');
          setToastMessage(message?.response_description || message?.message || 'Success');
          setTxStatus(true);

          // Proactively refresh user data and wallet balance values within context
          await refreshUser();

          if (isGroupPayment) {
            setIsGroupPayment(false);
            setGroupName('');
            setInviteMembers(['']);
          }
        } else {
          showToast(message?.error || message?.response_description || message?.message || 'Failed');
          setToastMessage(message?.error || message?.response_description || message?.message || 'Failed');
          setTxStatus(false);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [message, meterNumber]);

  return (
    <div>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex" ref={bodyDivRef}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Custom Header Consistency */}
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-6 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Light Bills</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Buy Smarter & Cheaper</p>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Meter Profile */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Meter Profile
                        <br />
                        <span className="text-sm font-normal text-sky-500">{customer}</span>
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2 relative" ref={dropdownRef}>
                        <Label htmlFor="meterNumber">Meter Number</Label>
                        <div className="relative">
                          <Input
                            id="meterNumber"
                            type='text'
                            maxLength={15}
                            placeholder="Enter meter number"
                            value={meterNumber}
                            onChange={(e) => setMeterNumber(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                          >
                            <ChevronDown className={cn("w-5 h-5 transition-transform", showRecentDropdown && "rotate-180")} />
                          </button>
                        </div>

                        {showRecentDropdown && recentMeters.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                            <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                              <History className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-bold uppercase text-slate-400">Recent Meters</span>
                            </div>
                            {recentMeters.map((num, index) => (
                              <button
                                key={index}
                                className="w-full text-left px-4 py-3 text-sm hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-700 dark:text-slate-300 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700"
                                onClick={() => {
                                  setMeterNumber(num);
                                  setShowRecentDropdown(false);
                                }}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Meter Type</Label>
                        <Select value={meterType} onValueChange={setMeterType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meter type" />
                          </SelectTrigger>
                          <SelectContent>
                            {meterTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Biller</Label>
                        <Select value={biller} onValueChange={setBiller}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Biller" />
                          </SelectTrigger>
                          <SelectContent>
                            {billers.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Units */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      Purchase Units
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₦)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Price per unit</span>
                          <span className="font-medium">₦{pricePerUnit}/unit</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Units you'll receive</span>
                          <span className="font-medium text-slate-900 dark:text-white">{units}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                          <span className="text-sky-600 font-medium italic">Points Earned</span>
                          <span className="font-bold text-sky-500">
                            +{pointsEarned.toFixed(1).replace(/\.0$/, '')} pts
                          </span>
                        </div>
                      </div>

                      {/* Group Payment Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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

                      {/* Group Payment Details */}
                      {isGroupPayment && (
                        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <Label htmlFor="groupName">Group Name</Label>
                            <Input
                              id="groupName"
                              placeholder="e.g., Family Light Bill"
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
                            <Label>Invite Members (Email addresses)</Label>
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

                      <Button
                        onClick={handleContinue}
                        className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-7 text-lg font-bold active:scale-95 transition-transform"
                        disabled={!meterNumber || !meterType || !biller || !amount || isLoading}
                      >
                        {isLoading ? "Processing..." : "Continue Payment"}
                      </Button>

                      {/* Auto Top-Up Button */}
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/auto-topup?service_type=lightbill&network=${BILLER_NAME[biller as keyof BillerName] || biller}&phone_number=${meterNumber}&amount=${amount}`)}
                        className="w-full rounded-full py-6 mt-3 border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/10 active:scale-95 transition-transform"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Set Up Auto Top-Up
                      </Button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <LoaderComponent />
      <PinComponent type={isGroupPayment ? "group-lightbill" : "light"} value={payload} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal 
          isSuccess={txStatus} 
          onClose={() => {
            setIsOpen(false);
            if (txStatus) {
              // Safety fallback refresh when closing out a successful transaction context
              window.location.reload();
            }
          }} 
          toastMessage={toastMessage} 
        />
      )}
    </div>
  );
}