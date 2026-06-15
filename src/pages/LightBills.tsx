import { useState, useRef, useEffect } from 'react';
import { Sidebar, Toast, TransactionModal, PinModal, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, postRequest } from '@/types';
import { Users, Plus, X, RefreshCw, ChevronLeft, ChevronDown, History, Check } from 'lucide-react';
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

interface VerificationData {
  Customer_Name?: string;
  Address?: string;
  Customer_Number?: string;
  Meter_Number?: string;
  Tariff?: string;
  [key: string]: any;
}

export function LightBills() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('');
  const [biller, setBiller] = useState('');
  const [amount, setAmount] = useState('');
  
  // Verification State Management
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

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

  // Field Change Protection: Force re-verification if core meter details are altered
  useEffect(() => {
    setIsVerified(false);
    setIsConfirmed(false);
    setVerificationData(null);
    setCustomer('');
  }, [meterNumber, meterType, biller]);

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

    // Normal Payment Flow - Step 1: Customer Verification
    if (!isVerified) {
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
        const customerDetails = response.response || response.data || {};
        
        // STRICT CHECK: Ensure actual customer data was returned before verifying
        if (customerDetails.Customer_Name || customerDetails.Customer_Number || customerDetails.Address) {
          setVerificationData(customerDetails);
          setCustomer(`Customer: ${customerDetails.Customer_Name || 'Verified'}`);
          setIsVerified(true);
        } else {
          // Triggers if API returns 200 OK but payload is empty/null
          showToast('Customer not found. Please check the meter details and try again.');
          setIsVerified(false);
          setVerificationData(null);
          setCustomer('');
        }
      } else {
        showToast(response.error || 'Failed to verify meter details.');
        setIsVerified(false);
        setVerificationData(null);
        setCustomer('');
      }
      return;
    }

    // Normal Payment Flow - Step 2: Ensure User Has Confirmed Verified Data
    if (isVerified && !isConfirmed) {
      showToast("Please confirm the meter details to proceed.");
      return;
    }

    // Normal Payment Flow - Step 3: Trigger PIN Modal
    showPinModal();
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
  } else {
    showPaymentModal();
  }

  // Production-Grade Unified Success Pipeline Tracking Effect Block
  useEffect(() => {
    if (message) {
      setIsLoading(true);
      
      const timer = setTimeout(async () => {
        setIsLoading(false);
        setIsOpen(true);

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
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-6 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Light Bills</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Buy Smarter & Cheaper</p>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Desktop Layout Improved: max-w-5xl and wider gaps for better breathing room */}
            <div className="max-w-5xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 shadow-sm">
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                  
                  {/* LEFT COLUMN: Meter Profile */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white leading-tight">
                        Meter Profile
                        {customer && (
                          <span className="block mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {customer}
                          </span>
                        )}
                      </h3>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2 relative" ref={dropdownRef}>
                        <Label htmlFor="meterNumber" className="text-slate-700 dark:text-slate-300">Meter Number</Label>
                        <div className="relative">
                          <Input
                            id="meterNumber"
                            type='text'
                            maxLength={15}
                            placeholder="Enter meter number"
                            value={meterNumber}
                            onChange={(e) => setMeterNumber(e.target.value)}
                            className="pr-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          />
                          <button
                            onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            <ChevronDown className={cn("w-5 h-5 transition-transform duration-200", showRecentDropdown && "rotate-180")} />
                          </button>
                        </div>

                        {showRecentDropdown && recentMeters.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                              <History className="w-4 h-4 text-slate-400" />
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Recent Meters</span>
                            </div>
                            {recentMeters.map((num, index) => (
                              <button
                                key={index}
                                className="w-full text-left px-4 py-3.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700 font-medium"
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
                        <Label className="text-slate-700 dark:text-slate-300">Meter Type</Label>
                        <Select value={meterType} onValueChange={setMeterType}>
                          <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
                        <Label className="text-slate-700 dark:text-slate-300">Biller</Label>
                        <Select value={biller} onValueChange={setBiller}>
                          <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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

                  {/* RIGHT COLUMN: Purchase Units & Verification */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Purchase Units
                      </h3>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-slate-700 dark:text-slate-300">Amount (₦)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-12 text-lg font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 space-y-3 border border-slate-200/60 dark:border-slate-700">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Price per unit</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">₦{pricePerUnit}/unit</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Units you'll receive</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{units}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200 dark:border-slate-700 mt-1">
                          <span className="text-slate-600 dark:text-slate-400 font-medium italic">Points Earned</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">
                            +{pointsEarned.toFixed(1).replace(/\.0$/, '')} pts
                          </span>
                        </div>
                      </div>

                      {/* Group Payment Toggle */}
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white text-sm">Group Payment</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Split with friends & family</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsGroupPayment(!isGroupPayment)}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            isGroupPayment ? "bg-slate-800 dark:bg-slate-100" : "bg-slate-300 dark:bg-slate-600"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full transition-transform duration-300 shadow-sm",
                            isGroupPayment ? "translate-x-6" : "translate-x-0.5"
                          )} />
                        </button>
                      </div>

{/* Group Payment Details */}
                      {isGroupPayment && (
                        <div className="space-y-5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                          <div className="space-y-2">
                            <Label htmlFor="groupName" className="text-sm">Group Name</Label>
                            <Input
                              id="groupName"
                              placeholder="e.g., Family Light Bill"
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
                              className="h-11 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="groupDescription" className="text-sm">Group Description</Label>
                            <Input
                              id="groupDescription"
                              placeholder="Enter a description for the payment"
                              value={groupDescription}
                              onChange={(e) => setGroupDescription(e.target.value)}
                              className="h-11 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-sm">Invite Members (Email addresses)</Label>
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
                                  className="h-11 bg-white dark:bg-slate-900"
                                />
                                {inviteMembers.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newMembers = inviteMembers.filter((_, i) => i !== index);
                                      setInviteMembers(newMembers);
                                    }}
                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => setInviteMembers([...inviteMembers, ''])}
                              className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors py-2"
                            >
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                <Plus className="w-3.5 h-3.5" />
                              </div>
                              Add another member
                            </button>
                          </div>
                        </div>
                      )}

                      {/* VERIFICATION CARD */}
                      {isVerified && !isGroupPayment && verificationData && (
                        <div className="mt-6 mb-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-slate-100 dark:border-slate-700 px-5 py-3.5 flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                              Meter Successfully Verified
                            </h4>
                          </div>

                          <div className="p-5 space-y-4">
                            {verificationData.Customer_Name && (
                              <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Customer Name</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{verificationData.Customer_Name}</p>
                              </div>
                            )}
                            
                            {verificationData.Address && (
                              <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Customer Address</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">{verificationData.Address}</p>
                              </div>
                            )}
                            
                            {(verificationData.Customer_Number || verificationData.Meter_Number) && (
                              <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Customer Number</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight font-mono">{verificationData.Customer_Number || verificationData.Meter_Number}</p>
                              </div>
                            )}
                            
                            {verificationData.Tariff && (
                              <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Tariff / Rate</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">{verificationData.Tariff}</p>
                              </div>
                            )}
                          </div>

                          {/* Confirmation Action Box */}
                          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 border-t border-slate-100 dark:border-slate-700">
                            <label className="flex items-start gap-3.5 cursor-pointer group">
                              <div className="relative flex items-start mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isConfirmed}
                                  onChange={(e) => setIsConfirmed(e.target.checked)}
                                  className="peer sr-only"
                                />
                                <div className={cn(
                                  "w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center",
                                  isConfirmed 
                                    ? "bg-slate-900 border-slate-900 dark:bg-white dark:border-white" 
                                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400 dark:group-hover:border-slate-500"
                                )}>
                                  <Check 
                                    className={cn(
                                      "w-3.5 h-3.5 transition-transform duration-200 text-white dark:text-slate-900", 
                                      isConfirmed ? "scale-100" : "scale-0"
                                    )} 
                                    strokeWidth={3} 
                                  />
                                </div>
                              </div>
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium select-none leading-snug pt-0.5 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                I confirm that these meter details belong to the intended customer.
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Main Action Button */}
                      <Button
                        onClick={handleContinue}
                        className={cn(
                          "w-full rounded-full py-7 text-lg font-bold transition-all duration-200 shadow-sm mt-2",
                          (!isGroupPayment && isVerified && !isConfirmed)
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
                            : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 active:scale-[0.98]"
                        )}
                        disabled={!meterNumber || !meterType || !biller || !amount || isLoading || (!isGroupPayment && isVerified && !isConfirmed)}
                      >
                        {isLoading 
                          ? "Processing..." 
                          : (!isGroupPayment && !isVerified 
                              ? "Verify Meter Details" 
                              : "Continue Payment")}
                      </Button>

                      {/* Auto Top-Up Button */}
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/auto-topup?service_type=lightbill&network=${BILLER_NAME[biller as keyof BillerName] || biller}&phone_number=${meterNumber}&amount=${amount}`)}
                        className="w-full rounded-full py-6 mt-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all"
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
              window.location.reload();
            }
          }} 
          toastMessage={toastMessage} 
        />
      )}
    </div>
  );
}