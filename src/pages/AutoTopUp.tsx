import { useState, useEffect } from 'react';
import { Sidebar, Header, Toast, PinModal, Loader, useConfirm} from '@/components/ui-custom';
import { getRequest, postRequest, deleteRequest, ENDPOINTS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, X, RefreshCw, Clock, Trash2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AutoTopUp {
  id: number;
  service_type: string;
  amount: string;
  phone_number: string;
  network: string;
  plan: string;
  start_date: string;
  repeat_days: number;
  is_active: boolean;
  next_run: string;
  locked_amount: string;
  total_runs: number;
  created_at: string;
}

const networks = ['MTN', 'GLO', 'AIRTEL', '9mobile'];
const repeatOptions = [
  { value: '0', label: 'One-time' },
  { value: '7', label: 'Every 7 days' },
  { value: '14', label: 'Every 14 days' },
  { value: '30', label: 'Every 30 days' },
];

export function AutoTopUp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [autoTopUps, setAutoTopUps] = useState<AutoTopUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [serviceType, setServiceType] = useState<'airtime' | 'data'>('airtime');
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone ? '0'+ user?.phone.slice(-10,) : '');
  const [amount, setAmount] = useState('');
  const [repeatDays, setRepeatDays] = useState('0');
  const [startDate, setStartDate] = useState('');
  const { showToast, ToastComponent } = Toast();
  const { showPinModal, PinComponent, message } = PinModal();
  const { showLoader, hideLoader, LoaderComponent} = Loader();
  const { confirm, ConfirmComponent: ConfirmDialog } = useConfirm();

  const dataPlans: Record<string, string[]> = {
    MTN: ['MTN10GB', 'MTN20GB', 'MTN50GB', 'MTN100GB'],
    GLO: ['GLO10GB', 'GLO20GB', 'GLO50GB'],
    AIRTEL: ['AIRTEL10GB', 'AIRTEL20GB', 'AIRTEL50GB'],
    '9mobile': ['9MOBILE10GB', '9MOBILE20GB'],
  };

  useEffect(() => {
    fetchAutoTopUps();
  }, []);

  useEffect(() => {
    if (message) {
      if (message.is_active || message.code === '000') {
        showToast(message.response_description || 'Auto top-up created successfully');
        fetchAutoTopUps();
        setShowCreateModal(false);
        resetForm();
      } else {
        showToast(message.error || message.response_description || 'Failed to create auto top-up');
      }
    }
  }, [message, showToast]);

  const fetchAutoTopUps = async () => {
    try {
      const data = await getRequest(ENDPOINTS.auto_topup_list);
      if (data) {
        setAutoTopUps(data);
      }
    } catch (error) {
      console.log(error)
      showToast('Failed to fetch auto top-ups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!phoneNumber || !amount) {
      showToast('Please fill in all required fields');
      return;
    }

    if (!user?.pin_is_set) {
      navigate('/settings');
      navigate('/pin');
      return;
    }

    setPinActionType('create');
    showPinModal();
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Delete Auto Top-Up',
      message: 'Are you sure you want to delete this auto top-up? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    
    if (!confirmed) return;

    showLoader()
    try {
      await deleteRequest(ENDPOINTS.auto_topup_details(id.toString()));
      showToast('Auto top-up deleted');
      fetchAutoTopUps();
    } catch (error) {
      console.log(error)
      showToast('Failed to delete auto top-up');
    }
    finally {
      
      hideLoader()
    }
  };

  const handleCancel = async (id: number) => {
    showLoader()
    try {
      await postRequest(ENDPOINTS.auto_topup_cancel(id.toString()), {});
      showToast('Auto top-up cancelled');
      fetchAutoTopUps();
    } catch (error) {
      console.log(error)
      showToast('Failed to cancel auto top-up');
    }
    finally {
      hideLoader()
    }
  };

  const [selectedReactivateId, setSelectedReactivateId] = useState<number | null>(null);
  const [pinActionType, setPinActionType] = useState<'create' | 'reactivate' | null>(null);

  const resetForm = () => {
    setServiceType('airtime');
    setSelectedNetwork('MTN');
    setSelectedPlan('');
    setPhoneNumber('');
    setAmount('');
    setRepeatDays('0');
    setStartDate('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Auto Top-Up"
          subtitle="Automate your airtime and data purchases"
          showBackButton={true}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6 mb-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Auto Top-Up
            </Button>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : autoTopUps.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No auto top-ups yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {autoTopUps.map((topup) => (
                  <div
                    key={topup.id}
                    className={cn(
                      'p-4 rounded-2xl border transition-all',
                      topup.is_active
                        ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            topup.service_type === 'airtime'
                              ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                              : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          )}>
                            {topup.service_type === 'airtime' ? 'Airtime' : 'Data'}
                          </span>
                          {!topup.is_active && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                              Cancelled
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          ₦{parseFloat(topup.amount).toLocaleString()} {topup.service_type === 'data' && `(${topup.network})`}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {topup.phone_number}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {topup.repeat_days === 0 ? 'One-time' : `Every ${topup.repeat_days} days`}
                          </span>
                          <span>Next: {formatDate(topup.next_run)}</span>
                          <span>Locked: ₦{parseFloat(topup.locked_amount).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {topup.is_active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(topup.id)}
                            className="text-orange-500 border-orange-500 hover:bg-orange-50"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!user?.pin_is_set) {
                                navigate('/settings');
                                navigate('/pin');
                                return;
                              }
                              setSelectedReactivateId(topup.id);
                              setPinActionType('reactivate');
                              showPinModal();
                            }}
                            className="text-green-500 border-green-500 hover:bg-green-50"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(topup.id)}
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Auto Top-Up</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={serviceType} onValueChange={(v) => setServiceType(v as 'airtime' | 'data')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airtime">Airtime</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {networks.map((network) => (
                        <SelectItem key={network} value={network}>{network}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="08012345678"
                  maxLength={11}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (₦)</Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {serviceType === 'data' && (
                <div className="space-y-2">
                  <Label>Data Plan</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataPlans[selectedNetwork]?.map((plan) => (
                        <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Repeat</Label>
                <Select value={repeatDays} onValueChange={setRepeatDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {repeatOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCreate}
                className="w-full rounded-full bg-sky-500 hover:bg-sky-600 py-6"
              >
                Create Auto Top-Up
              </Button>
            </div>
          </div>


    

      {pinActionType === 'create' && (
        <PinComponent 
        type="auto-topup" 
        value={{
          service_type: serviceType,
          phone_number: phoneNumber,
            amount: parseFloat(amount),
            network: selectedNetwork ,
            plan: serviceType === 'data' ? selectedPlan : undefined,
            repeat_days: parseInt(repeatDays),
            start_date: startDate || new Date().toISOString(),
            is_active: true,
          }} 
            />
          
        )}
        

      {pinActionType === 'reactivate' && (
        <PinComponent 
        type="auto-topup-reactivate" 
        value={{
          id: selectedReactivateId,
        }} 
        />
      )}
      </div>
    )}

      <ToastComponent />
      <LoaderComponent />
      <ConfirmDialog />
    </div>
  );
}
