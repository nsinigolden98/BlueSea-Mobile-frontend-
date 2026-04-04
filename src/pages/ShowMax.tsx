import { useState, useRef, useEffect } from 'react';
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

const showmaxPlans: Record<string, [string, number]> = {
  "Full - N8,400 - 3 Months": ["full_3", 8400],
  "Mobile Only - N3,800 - 3 Months": ["mobile_only_3", 3800],
  "Sports Mobile Only - N12,000 - 3 Months": ["sports_mobile_only_3", 12000],
  "Sports Only - N3,200": ["sports-only-1", 3200],
  "Sports Only 3 months - N9,600": ["sports-only-3", 9600],
  "Full Sports Mobile Only - 3 months - N16,200": ["full-sports-mobile-only-3", 16200],
  "Mobile Only - N6,700 - 6 Months": ["mobile-only-6", 6700],
  "Full - 6 months - 14,700": ["full-only-6", 14700],
  "Full Sports Mobile Only - 6 months - N32,400": ["full-sports-mobile-only-6", 32400],
  "Sports Mobile Only - 6 months - N24,000": ["sports-mobile-only-6", 24000],
  "Sports Only - 6 months - N18,200": ["sports-only-6", 18200],
};

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

  const planPrice = selectedPlan ? showmaxPlans[selectedPlan]?.[1] || 0 : 0;

  const payload = {
    showmax_plan: selectedPlan,
    phone_number: phoneNumber,
    is_group_payment: isGroupPayment,
    ...(isGroupPayment && {
      group_name: groupName,
      invite_members: inviteMembers.filter(e => e.trim()).join(','),
      service_type: 'showmax',
    }),
  };

  const handleContinue = async () => {
    if (!selectedPlan || !phoneNumber) {
      showToast('Please fill in all fields');
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
      const memberEmails = inviteMembers.filter(e => e.trim());
      if (memberEmails.length === 0) {
        showToast('Please add at least one member to invite');
        return;
      }
      
      try {
        const groupData = {
          name: groupName,
          service_type: 'showmax',
          sub_number: phoneNumber,
          target_amount: planPrice,
          plan: selectedPlan,
          plan_type: '',
          invite_members: memberEmails.join(','),
        };
        
        const groupResponse = await postRequest(ENDPOINTS.create_group, groupData);
        
        if (groupResponse.success) {
          showToast('Group created successfully! Members will be notified.');
          setIsGroupPayment(false);
          setGroupName('');
          setInviteMembers(['']);
        } else {
          showToast(groupResponse.error || 'Failed to create group');
        }
      } catch (error: any) {
        showToast(error?.error || 'Failed to create group');
      }
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
        showToast(message?.response_description || '');
        setToastMessage(message?.response_description || '');
        setTxStatus(true);
      } else {
        showToast(message?.error || message?.response_description || '');
        setToastMessage(message?.error || message?.response_description || '');
        setTxStatus(false);
      }
    } else {
      return;
    }
  }, [message, showToast]);

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

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Select Plan</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.keys(showmaxPlans).map((plan) => {
                          const planData = showmaxPlans[plan];
                          return (
                            <button
                              key={plan}
                              onClick={() => setSelectedPlan(plan)}
                              className={cn(
                                'p-4 rounded-xl border-2 transition-all text-center',
                                selectedPlan === plan
                                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                              )}
                            >
                              <p className="font-bold text-xs text-slate-800 dark:text-white">{plan}</p>
                              <p className="text-xs text-slate-500 mt-1">₦{planData[1].toLocaleString()}</p>
                            </button>
                          );
                        })}
                      </div>
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
                      onClick={() => navigate('/auto-topup')}
                      className="w-full rounded-full py-6 mt-3 border-sky-500 text-sky-500 hover:bg-sky-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Set Up Auto Top-Up
                    </Button>

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
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <LoaderComponent />
      <PinComponent type="showmax" value={payload} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={toastMessage} />
      )}
    </div>
  );
}
