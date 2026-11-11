import { useState, useRef, useEffect, useMemo } from 'react';
import { Sidebar, Header, Toast, TransactionModal, PinModal, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePlans, toEducationPlans } from '@/hooks/usePlans';
import { Users, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function JAMBRegistration() {
  const { user } = useAuth();
  const defaultPhone = user?.phone ? "0" + user.phone.slice(-10) : '';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [examType, setExamType] = useState('jamb-utme');
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
  const { plans } = usePlans();
  const educationPlans = useMemo(() => toEducationPlans(plans.education ?? []), [plans]);
  const examOptions = educationPlans.filter(
    (plan) =>
      plan.service === 'jamb-utme' ||
      plan.service === 'jamb-mock' ||
      plan.service === 'jamb-mock-only',
  );
  const selectedPlan = examOptions.find((plan) => plan.service === examType) ?? null;

  const examFee = selectedPlan?.price ?? null;

  const payload = {
    exam_type: examType,
    phone_number: phoneNumber,
  };
  
  const handleContinue = async () => {
    if (!selectedPlan) {
      showToast('JAMB product unavailable');
      return;
    }
    if (!phoneNumber) {
      showToast('Please enter your phone number');
      return;
    } else if (!user?.pin_is_set) {
      navigate('/settings');
      navigate('/pin');
      return;
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
      if (message?.success) {
        showToast(message?.message || '');
        setToastMessage(message?.message || '');
        setTxStatus(true);
      } else {
        showToast(message?.error || message?.message || '');
        setToastMessage(message?.error || message?.message || '');
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
            title="JAMB Registration"
            subtitle="Register for JAMB examination"
            showBackButton={true}
          />

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
                      <p className="text-sm text-sky-600 dark:text-sky-400">
                        Register for the Joint Admissions and Matriculation Board (JAMB) Unified Tertiary Matriculation Examination.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Exam Type</Label>
                      <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          {examOptions.map((plan) => (
                            <SelectItem key={plan.service} value={plan.service}>
                              {plan.name} - ₦{plan.price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Registration Fee</span>
                        <span className="font-medium">{examFee == null ? 'Unavailable' : `₦${examFee.toLocaleString()}`}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleContinue}
                      className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
                      disabled={!phoneNumber || !selectedPlan}
                    >
                      Continue Payment
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
                            placeholder="e.g., JAMB Group"
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
      <PinComponent type="jamb" value={payload} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={toastMessage} transactionData={message?.data ?? {}} />
      )}
    </div>
  );
}
