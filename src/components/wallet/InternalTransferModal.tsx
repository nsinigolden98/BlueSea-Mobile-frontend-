// src/components/wallet/InternalTransferModal.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { postRequest, ENDPOINTS, API_BASE } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { PinModal, Toast, TransactionModal, LoadingSpinner } from '@/components/ui-custom';
import { Search, User, CheckCircle2 } from 'lucide-react';

interface FoundUser {
  email: string;
  name: string;
  image: string;
}

interface InternalTransferModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}

export function InternalTransferModal({ isOpen, open, onClose }: InternalTransferModalProps) {
  const isVisible = isOpen ?? open ?? false;
  const { user } = useAuth();

  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: ''
  });
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [transferError, setTransferError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Unified Custom PIN Modal & Toast Hooks
  const { showPinModal, PinComponent, message } = PinModal();
  const { ToastComponent, showToast } = Toast();

  const [pinValue, setPinValue] = useState<any>({});
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const resetTransferState = () => {
    setTransferData({ recipient: '', amount: '' });
    setFoundUser(null);
    setTransferError('');
    setIsFormVisible(true);
  };

  const handleClose = () => {
    resetTransferState();
    onClose();
  };

  // Listen for PIN verification transaction responses
  useEffect(() => {
    if (message) {
      setIsTxModalOpen(true);
      if (message?.success) {
        showToast(message?.message || 'Transaction successful');
        setToastMessage(message?.message || 'Transaction successful');
        setTxStatus(true);
        resetTransferState();
      } else {
        setToastMessage(message?.message || 'Transaction failed');
        setTxStatus(false);
        setIsFormVisible(true);
      }
    }
  }, [message, showToast]);

  // Recipient Lookup with debounced backend API call
  useEffect(() => {
    if (!isVisible) return;
    const lookupUser = async () => {
      if (!transferData.recipient || transferData.recipient.length < 5) {
        setFoundUser(null);
        return;
      }
      if (transferData.recipient.trim() === user?.email?.trim()) {
        setFoundUser(null);
        setTransferError('Cannot transfer to self');
        return;
      }
      setLookingUp(true);
      setTransferError('');
      try {
        const response = await postRequest(ENDPOINTS.user_lookup, { email: transferData.recipient });
        if (response?.found) {
          setFoundUser({
            email: response.email,
            name: response.name,
            image: response.image
          });
        } else {
          setFoundUser(null);
        }
      } catch (error) {
        console.log(error);
        setFoundUser(null);
      } finally {
        setLookingUp(false);
      }
    };
    const timer = setTimeout(() => {
      lookupUser();
    }, 500);
    return () => clearTimeout(timer);
  }, [transferData.recipient, user?.email, isVisible]);

  const handleStartTransfer = () => {
    if (!transferData.amount || !foundUser) return;
    setPinValue({
      email: transferData.recipient,
      recipient: transferData.recipient,
      amount: Number(transferData.amount),
      recipient_name: foundUser.name,
    });
    setIsFormVisible(false);
    showPinModal();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Transfer Form Modal */}
      {isFormVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={handleClose} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <header className="mb-10 text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Send Money</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">BlueSea Instant Transfer</p>
            </header>
            <div className="space-y-8">
              <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-6">
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute left-8 top-4 z-10">Recipient Email</label>
                  <input
                    placeholder="e.g. name@bluesea.com"
                    className="w-full pl-8 pr-14 pt-12 pb-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-black text-lg shadow-inner"
                    value={transferData.recipient}
                    onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value })}
                  />
                  <Search className="absolute right-8 bottom-8 h-5 w-5 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute left-8 top-4 z-10">Amount (₦)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-8 pr-8 pt-12 pb-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white shadow-inner"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  />
                </div>
                {foundUser && (
                  <div className="p-5 bg-sky-500/5 border border-sky-500/20 rounded-[2rem] flex items-center gap-5 animate-in zoom-in-95">
                    <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md overflow-hidden border border-sky-500/20">
                      {foundUser.image ? (
                        <img src={`${API_BASE}${foundUser.image}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-7 h-7 text-sky-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 dark:text-slate-200 truncate text-lg tracking-tight">{foundUser.name}</h4>
                        <CheckCircle2 className="w-4 h-4 text-sky-500" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{foundUser.email}</p>
                    </div>
                  </div>
                )}
                {lookingUp && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] text-center">
                    <LoadingSpinner size="sm" text="Verifying user address..." />
                  </div>
                )}
              </div>

              {transferError && (
                <p className="text-red-500 text-[10px] font-black text-center px-8 uppercase tracking-widest animate-pulse">
                  {transferError}
                </p>
              )}
              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[1.5rem] h-16 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                  disabled={!transferData.amount || !foundUser}
                  onClick={handleStartTransfer}
                >
                  Proceed to Transfer
                </Button>
                <button 
                  onClick={handleClose} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-black uppercase tracking-[0.3em] py-3 transition-colors"
                >
                  Cancel Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Status Modal */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <TransactionModal 
            isSuccess={txStatus} 
            onClose={() => {
              setIsTxModalOpen(false);
              onClose();
            }} 
            toastMessage={toastMessage} 
          />
        </div>
      )}

      <ToastComponent />

      {/* PIN Verification Modal */}
      <PinComponent 
        type="internal_transfer" 
        value={pinValue} 
      />
    </>
  );
}