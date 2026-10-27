import { useState, useRef, useEffect } from 'react';
import { Sidebar, Header, Toast, TransactionModal, PinModal, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, postRequest } from '@/types';
import { Users, Plus, X, RefreshCw, ChevronDown, History, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  MeterNumber?: string;
  Customer_Phone?: string;
  Customer_Arrears?: number | string;
  Meter_Type?: string;
  Service?: string;
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
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const lookupSeq = useRef(0);

  const { PinComponent, showPinModal, modalData, message } = PinModal();
  const { user, refreshUser } = useAuth();
  const { LoaderComponent } = Loader();
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
    setVerificationData(null);
    setCustomer('');
    setShowMoreDetails(false);
    setVerifyError(null);
  }, [meterNumber, meterType, biller]);

  // Auto-lookup: fire when the meter number reaches 11 digits with type + biller set.
  useEffect(() => {
    const digits = meterNumber.replace(/\D/g, '');
    if (digits.length < 11 || !meterType || !biller) {
      if (digits.length < 11) {
        setIsVerified(false);
        setVerificationData(null);
        setCustomer('');
      }
      setVerifyError(null);
      setVerifying(false);
      return;
    }
    const seq = ++lookupSeq.current;
    setVerifying(true);
    setVerifyError(null);
    const t = setTimeout(async () => {
      try {
        const data = {
          meter_number: Number(digits),
          meter_type: meterType.toLowerCase(),
          biller: BILLER_NAME[biller as keyof BillerName]
        };
        const response = await postRequest(ENDPOINTS.electricity_user, data);
        if (lookupSeq.current !== seq) return;
        if (response.success) {
          const customerDetails = response.response || response.data || {};
          if (customerDetails.Customer_Name || customerDetails.Customer_Number || customerDetails.Address) {
            setVerificationData(customerDetails);
            setCustomer(`Customer: ${customerDetails.Customer_Name || 'Verified'}`);
            setIsVerified(true);
          } else {
            setVerifyError('Customer not found. Please check the meter details and try again.');
            setIsVerified(false);
            setVerificationData(null);
            setCustomer('');
          }
        } else {
          setVerifyError(response.error || 'Failed to verify meter details.');
          setIsVerified(false);
          setVerificationData(null);
          setCustomer('');
        }
      } catch (e) {
        if (lookupSeq.current !== seq) return;
        setVerifyError('Verification failed. Try again.');
        setIsVerified(false);
        setVerificationData(null);
        setCustomer('');
      } finally {
        if (lookupSeq.current === seq) setVerifying(false);
      }
    }, 600);
    return () => clearTimeout(t);
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

    // Normal Payment Flow - verified automatically; proceed to PIN.
    if (!isVerified) {
      showToast(verifyError || 'Verifying meter details — please wait');
      return;
    }

    // Normal Payment Flow: Trigger PIN Modal
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
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden" ref={bodyDivRef}>
      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Light Bills" 
            subtitle="Buy Smarter & Cheaper"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* ISOLATED SCROLLABLE CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden z-10">
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
                      {verifying && (
                        <p className="text-xs text-slate-500">Verifying meter…</p>
                      )}
                      {!verifying && verifyError && meterNumber.replace(/\D/g, '').length >= 11 && (
                        <p className="text-xs text-red-500">{verifyError}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">Meter Type</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'Prepaid', hint: 'Pay as you go' },
                          { value: 'Postpaid', hint: 'Pay monthly bill' },
                        ].map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setMeterType(t.value)}
                            className={cn(
                              'p-4 rounded-xl border-2 transition-all text-center',
                              meterType === t.value
                                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                            )}
                          >
                            <p className="font-bold text-sm text-slate-800 dark:text-white">{t.value}</p>
                            <p className="text-xs text-slate-500 mt-1">{t.hint}</p>
                          </button>
                        ))}
                      </div>
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
                          isGroupPayment ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"
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
                      <div className="mt-6 mb-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/40 px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm">
                                Meter Successfully Verified
                              </h4>
                              {verificationData.Customer_Name && (
                                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {verificationData.Customer_Name}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {verificationData.Service && (
                              <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-emerald-100 dark:border-slate-700">
                                {verificationData.Service}
                              </span>
                            )}
                            {verificationData.Meter_Type && (
                              <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-emerald-100 dark:border-slate-700">
                                {verificationData.Meter_Type}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {verificationData.Meter_Number && (
                              <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                  Meter Number
                                </p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono break-all">
                                  {verificationData.Meter_Number}
                                </p>
                              </div>
                            )}

                            {verificationData.Customer_Number && (
                              <div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                  Customer Number
                                </p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono break-all">
                                  {verificationData.Customer_Number}
                                </p>
                              </div>
                            )}
                          </div>

                          {verificationData.Address && (
                            <div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                Customer Address
                              </p>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                {verificationData.Address}
                              </p>
                            </div>
                          )}

                          {verificationData.Customer_Arrears !== undefined &&
                            verificationData.Customer_Arrears !== null &&
                            verificationData.Customer_Arrears !== '' && (
                              <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-900/10 px-4 py-3.5">
                                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">
                                  Customer Arrears
                                </p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                  ₦{Number(verificationData.Customer_Arrears).toLocaleString('en-NG', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </p>
                              </div>
                            )}

                          <button
                            type="button"
                            onClick={() => setShowMoreDetails(!showMoreDetails)}
                            className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span>{showMoreDetails ? 'Hide more details' : 'View more details'}</span>
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                showMoreDetails && "rotate-90"
                              )}
                            />
                          </button>

                          {showMoreDetails && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in slide-in-from-top-1">
                              {verificationData.Customer_Phone && (
                                <div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    Customer Phone
                                  </p>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 font-mono">
                                    {verificationData.Customer_Phone}
                                  </p>
                                </div>
                              )}

                              {verificationData.Meter_Type && (
                                <div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    Meter Type
                                  </p>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {verificationData.Meter_Type}
                                  </p>
                                </div>
                              )}

                              {verificationData.Service && (
                                <div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                                    Service Provider
                                  </p>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {verificationData.Service}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Main Action Button */}
                    <Button
                      onClick={handleContinue}
                      className={cn(
                        "w-full rounded-full py-7 text-lg font-bold transition-all duration-200 shadow-sm mt-2",
                        "bg-sky-500 hover:bg-sky-600 text-white active:scale-[0.98]"
                      )}
                      disabled={!meterNumber || !meterType || !biller || !amount || isLoading || (!isGroupPayment && !isVerified)}
                    >
                      {isLoading
                        ? "Processing..."
                        : "Continue Payment"}
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

      {/* Global layouts and alerts */}
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