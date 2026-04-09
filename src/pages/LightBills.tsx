import { useState, useRef, useEffect } from 'react';
import { Sidebar, Header, Toast, TransactionModal, PinModal, Loader} from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, postRequest } from '@/types';
import { Users, Plus, X, RefreshCw } from 'lucide-react';
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
const BILLER_NAME:BillerName = {
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
  const { PinComponent, showPinModal, modalData, message } = PinModal()
  const { user } = useAuth()
  const {LoaderComponent, showLoader, hideLoader}= Loader()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState('')
  const { showToast, ToastComponent } = Toast()
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('')

  // Group payment state
  const [isGroupPayment, setIsGroupPayment] = useState(false);
  const [inviteMembers, setInviteMembers] = useState<string[]>(['']);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  const pricePerUnit = 70;
  const units = amount ? Math.floor(Number(amount) / pricePerUnit) : 0;
  const payload = isGroupPayment ? {
    name: groupName,
    description: groupDescription,
    service_type: 'lightbill',
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
  }
  
  
  const handleContinue = async() => {
    if (!meterNumber || !meterType || !biller || !amount) {
      showToast('Please fill in all fields');
      return;
    }
    else if (!user?.pin_is_set) {
      navigate('/settings');
      navigate('/pin');
      return
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
      showToast("Searching For Customer ...", 3000)
      showLoader()
    const data =  {
          meter_number: Number(meterNumber),
          meter_type: meterType.toLowerCase(),
            biller: BILLER_NAME[biller as keyof BillerName]
      }
      const response = await postRequest(ENDPOINTS.electricity_user, data)
      hideLoader()
      if (response.success) {
        setCustomer(`Customer: ${response.response.Customer_Name}`)
        showPinModal();
      } else {
        showToast(response.error)
      };

    }
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
        console.log(message)
        setIsOpen(true)
        
        if (message?.success || message?.code === '000') {
          showToast(message?.response_description || message?.message || '')
          setToastMessage(message?.response_description || message?.message || '')
          setTxStatus(true)
          
          if (isGroupPayment) {
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
          title="Light Bills" 
          subtitle="Buy Smarter & Cheaper"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Meter Profile */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Meter Profile
                      <br />
                      
                        {customer}
                      </h3>
                 
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meterNumber">Meter Number</Label>
                      <Input
                        id="meterNumber"
                        type='text'
                        inputMode='numeric'
                        placeholder="Enter meter number"
                        value={meterNumber}
                        onChange={(e) => setMeterNumber(e.target.value)}
                      />
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

                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Price per unit</span>
                        <span className="font-medium">₦{pricePerUnit}/unit</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Units you'll receive</span>
                        <span className="font-medium text-sky-500">{units}</span>
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
                      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
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
                      disabled={!meterNumber || !meterType || !biller || !amount}
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
      { isOpen &&(
        <TransactionModal isSuccess={txStatus} onClose={()=> setIsOpen(false)} toastMessage={toastMessage} />)}
      </div>
  );
}
