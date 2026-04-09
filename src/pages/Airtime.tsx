import { useState, useRef, useEffect} from 'react';
import { Sidebar, Header, TransactionModal, PinModal, Toast} from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { networks, airtimeAmounts } from '@/data';
import { cn } from '@/lib/utils';
import type { Network } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, X, RefreshCw } from 'lucide-react';

export function Airtime() {
  const { user } = useAuth()
  const defaultNumber = user?.phone ? "0" + user.phone.slice(-10) : '';
  const navigate = useNavigate();
  const { PinComponent, showPinModal, modalData, message} = PinModal()
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('MTN');
  const [phoneNumber, setPhoneNumber] = useState(defaultNumber);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const { showToast, ToastComponent } = Toast()
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('')
  
  // Group payment state
  const [isGroupPayment, setIsGroupPayment] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<string[]>(['']);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');


  const handleRecharge = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleBuyAirtime = async() => {
    const amount = selectedAmount || Number(customAmount);
    if (!phoneNumber || !amount) {
      alert('Please fill in all fields');
      return;
    }
    else if (!user?.pin_is_set) {
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
      if (!user?.pin_is_set) {
        navigate('/settings');
        navigate('/pin');
        return;
      }
      
      showPinModal();
    } else {
      showPinModal();
    }
  };

  const finalAmount = selectedAmount || Number(customAmount) || 0;
  
  const payload = isGroupPayment ? {
    name: groupName,
    description:groupDescription,
    service_type: 'airtime',
    sub_number: phoneNumber,
    target_amount: finalAmount,
    invite_members: inviteMembers.filter(e => e.trim()).join(','),
    plan:selectedNetwork.toLowerCase() !== "9mobile" ? selectedNetwork.toLowerCase() : "etisalat",
  } : {
    amount: String(finalAmount),
    network: selectedNetwork.toLowerCase() !== "9mobile" ? selectedNetwork.toLowerCase() : "etisalat",
    phone_number: String(phoneNumber),
  };
const bodyDivRef = useRef<HTMLDivElement>(null)

  const hidePaymentModal = () => {
    if (bodyDivRef.current) {
      bodyDivRef.current.style.opacity = '1'
      
    }
  }
    const showPaymentModal = () => {
    if (bodyDivRef.current) {
      bodyDivRef.current.style.opacity = '0.5'
    }
  }
  if (!modalData.visible) {
    hidePaymentModal()
  }
  else {
    showPaymentModal()
  }

  useEffect(() => {
    if (message) {
      setIsOpen(true)
      
      if (message?.success || message?.code === '000') {
        showToast(message?.response_description || message?.message || '')
        setToastMessage(message?.response_description || message?.message || '')
        setTxStatus(true)
        
        // Reset group payment state on success
        if (isGroupPayment && message?.success) {
          setIsGroupPayment(false);
          setGroupName('');
          setInviteMembers(['']);
        }
      } else {
        showToast(message?.error || message?.response_description || '')
        setToastMessage(message?.error || message?.response_description || '')
        setTxStatus(false)
      }
    } else {
      return
    };
  }, [message, showToast, isGroupPayment]);
      
  return (
    <div>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex" ref={bodyDivRef}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Airtime" 
          subtitle="Buy Smarter & Cheaper"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
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
                <Label htmlFor="phone">Recipient's Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                    placeholder="Enter phone number"
                    maxLength={11}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* Amount Selection */}
              <div className="space-y-3">
                <Label>Select or Enter Airtime Amount (₦)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {airtimeAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleRecharge(amount)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        selectedAmount === amount
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                      )}
                    >
                      <p className="font-bold text-slate-800 dark:text-white">₦{amount}</p>
                      <p className="text-xs text-slate-500">Airtime</p>

                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-3">
                <Label htmlFor="custom">Or enter custom amount (Min 50)</Label>
                <Input
                  id="custom"
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => handleCustomAmount(e.target.value)}
                  min={50}
                />
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
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Family Airtime"
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

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Network</span>
                  <span className="font-medium">{selectedNetwork}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-medium">
                    ₦{finalAmount > 0 ? finalAmount : 0} {finalAmount > 0 && '(Min ₦50)'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Recipient ID</span>
                  <span className="font-medium">{phoneNumber || '-'}</span>
                </div>
              </div>

              {/* Buy Button */}
              <Button 
                onClick={handleBuyAirtime}
                className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
                disabled={!phoneNumber || finalAmount < 50}
              >
                Buy Airtime
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
            </div>
          </div>
        </main>
      </div>
      </div>
      <PinComponent type={isGroupPayment ? "group-airtime" : "airtime"} value={payload} />
      <ToastComponent />
      { isOpen &&(
        <TransactionModal isSuccess={txStatus} onClose={()=> setIsOpen(false)} toastMessage={toastMessage} />)}
      </div>
  );
}
