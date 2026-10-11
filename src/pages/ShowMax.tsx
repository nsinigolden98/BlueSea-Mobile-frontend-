import { useState, useRef, useEffect, useMemo } from 'react';
import { Sidebar, Header, Toast, TransactionModal, PinModal, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { postRequest, ENDPOINTS } from '@/types';
import { usePlans, toCablePlans } from '@/hooks/usePlans';

const PROVIDER_KEY = 'showmax' as const;

export function ShowMax() {
  const { user } = useAuth();
  const defaultPhone = user?.phone ? "0" + user.phone.slice(-10) : '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [selectedPlan, setSelectedPlan] = useState('');
  const { PinComponent, showPinModal, modalData, message } = PinModal();
  const { LoaderComponent } = Loader();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const [isGroupPayment, setIsGroupPayment] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<string[]>(['']);
  const [groupName, setGroupName] = useState('');
  const [groupDescripition, setGroupDescription] = useState('');

  const { plans: livePlans, unavailable: plansUnavailable } = usePlans();
  const cablePlans = useMemo(() => toCablePlans(livePlans[PROVIDER_KEY] ?? []), [livePlans]);
  const planPrice = selectedPlan ? cablePlans.find((p) => p.value === selectedPlan)?.price || 0 : 0;
  const [verifiedCustomer, setVerifiedCustomer] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const payload = isGroupPayment ? {
    name: groupName,
    description: groupDescripition,
    service_type:'showmax',
    sub_number: phoneNumber,
    target_amount : planPrice,
    invite_members: inviteMembers.filter(e => e.trim()).join(','),
    plan: selectedPlan,
    plan_id: selectedPlan,

  }: {
    showmax_plan: selectedPlan,
    phone_number: phoneNumber,
  };
  
  

  const handleVerify = async () => {
    if (phoneNumber.length < 11) {
      showToast('Please enter a valid phone number');
      return;
    }
    setVerifying(true);
    setVerifiedCustomer(null);
    setConfirmed(false);
    try {
      const res: any = await postRequest(ENDPOINTS.cable_lookup, {
        provider: 'showmax',
        smart_card_number: phoneNumber,
      });
      const customer = res?.customer ?? res?.data ?? null;
      const name = customer?.Customer_Name ?? customer?.customer_name ?? customer?.name ?? null;
      if (res?.success && name) {
        setVerifiedCustomer(String(name));
      } else {
        showToast(res?.message || 'Account not found');
      }
    } catch (e) {
      showToast('Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedPlan || phoneNumber.length < 11 ) {
      showToast('Please fill in all fields');
      return;
    }
    if (!verifiedCustomer) {
      showToast('Verify the account first');
      return;
    }
    if (!confirmed) {
      showToast('Confirm these details belong to the intended customer');
      return;
    }
    if (!user?.pin_is_set) {
      navigate('/settings');
      navigate('/pin');
      return;
    }
    
    if (isGroupPayment) {
      if (!groupName) {
        showToast('Please enter a group name');
        return;
      }
      if (!phoneNumber) {
        showToast('Please enter phone number');
        return;
      }
      const memberEmails = inviteMembers.filter(e => e.trim());
      if (memberEmails.length === 0) {
        showToast('Please add at least one member to invite');
        return;
      }
      
      showPinModal();
    } else {
      showPinModal();
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
  } else {
    showPaymentModal();
  }

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      if (message?.success || message?.code === '000') {
        showToast(message?.response_description || message?.message || '');
        setToastMessage(message?.response_description || message?.message || '');
        setTxStatus(true);
        
        if (isGroupPayment) {
          setIsGroupPayment(false);
          setGroupName('');
          setInviteMembers(['']);
        }
      } else {
        showToast(message?.error || message?.response_description || '');
        setToastMessage(message?.error || message?.response_description || '');
        setTxStatus(false);
      }
    } else {
      return;
    }
  }, [message, showToast, isGroupPayment]);

  return (
    <div>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex" ref={bodyDivRef}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            title="ShowMax"
            subtitle="Subscribe to ShowMax packages"
            showBackButton={true}
          />

          <main className="flex-1 p-4 md:p-6 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:[scrollbar-width:auto] md:[&::-webkit-scrollbar]:block">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="text"
                        maxLength={11}
                        inputMode="numeric"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <Button
                        type="button"
                        onClick={handleVerify}
                        disabled={verifying || phoneNumber.length < 11}
                        className="shrink-0"
                      >
                        {verifying ? 'Verifying…' : verifiedCustomer ? 'Verified ✓' : 'Verify Account'}
                      </Button>
                    </div>
                    {verifiedCustomer && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm">
                        <p className="text-slate-500">Customer</p>
                        <p className="font-medium">{verifiedCustomer}</p>
                        <label className="mt-2 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="mt-0.5"
                          />
                          I confirm these details belong to the intended customer.
                        </label>
                      </div>
                    )}
                    <div className="space-y-3">
                      <Label>Select Plan</Label>
{plansUnavailable && cablePlans.length === 0 ? (
                          <p className="text-xs text-amber-600 font-medium">
                            Live plans unavailable — check connection
                          </p>
                        ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {cablePlans.map((plan) => (
                          <button
                            key={plan.value}
                            onClick={() => { setSelectedPlan(plan.value); setVerifiedCustomer(null); setConfirmed(false); }}
                              className={cn(
                                'p-4 rounded-xl border-2 transition-all text-center',
selectedPlan === plan.value
                                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                              )}
                            >
                              <p className="font-bold text-xs text-slate-800 dark:text-white">{plan.label}</p>
                              <p className="text-xs text-slate-500 mt-1">₦{plan.price.toLocaleString()}</p>
                            </button>
                        ))}
                        </div>
                        )}
                    </div>

                    {selectedPlan && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Selected Plan</span>
                          <span className="font-medium">{selectedPlan}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-slate-500">Amount</span>
                          <span className="font-medium text-sky-500">₦{planPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

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

                    {isGroupPayment && (
                      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <div className="space-y-2">
                          <Label htmlFor="groupName">Group Name</Label>
                          <Input
                            id="groupName"
                            placeholder="e.g., Family ShowMax"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="groupDescription">Group Description</Label>
                          <Input
                            id="groupDescription"
                            placeholder="Enter group description"
                            value={groupDescripition}
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
                                  className="p-2 text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => setInviteMembers([...inviteMembers, ''])}
                            className="text-sm text-sky-500 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Add another
                          </button>
                        </div>
                      </div>
                    )}


                    <Button
                      onClick={handleContinue}
                      className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
                      disabled={!selectedPlan || !phoneNumber}
                    >
                      Continue Payment
                    </Button>

                    {/* Auto Top-Up Button */}
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/auto-topup?service_type=showmax&network=showmax&phone_number=${phoneNumber}&amount=${planPrice}&plan=${selectedPlan}`)}
                      className="w-full rounded-full py-6 mt-3 border-sky-500 text-sky-500 hover:bg-sky-50"
                      disabled={!phoneNumber || !selectedPlan}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Set Up Auto Top-Up
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <LoaderComponent />
      <PinComponent type={isGroupPayment ? "group-showmax" : "showmax"} value={payload} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={toastMessage} />
      )}
    </div>
  );
}