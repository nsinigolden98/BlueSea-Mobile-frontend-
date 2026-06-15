import { useState, useEffect, useRef } from 'react';
import { TransactionList, LoadingSpinner, BalanceCard } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postRequest, ENDPOINTS, API_BASE } from '@/types';
import { connectApi } from '@/services/connectApi';
import type { Partner, VerifiedUser } from '@/services/connectApi';

import { 
  Landmark, 
  Send, 
  X, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  Search, 
  ChevronLeft, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Globe, 
  Wallet as WalletIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PinModal, Toast, TransactionModal, } from '@/components/ui-custom';

import { NIGERIAN_BANKS } from '@/data';
import { useNavigate } from 'react-router-dom';

export function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- States for the layout ---
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountRequested, setAccountRequested] = useState(false);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState(1);
  const [transferData, setTransferData] = useState({
    recipient: '',
    amount: '',
    pin: ''
  });

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  const { showPinModal, PinComponent, message } = PinModal();
  const { ToastComponent, showToast } = Toast();

  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // --- BlueSea Connect States (Backend Driven) ---
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [connectIdentifier, setConnectIdentifier] = useState('');
  const [verifiedPartnerUser, setVerifiedPartnerUser] = useState<VerifiedUser | null>(null);
  const [isVerifyingPartner, setIsVerifyingPartner] = useState(false);
  const [connectAmount, setConnectAmount] = useState('');
  const [isConnectConfirmOpen, setIsConnectConfirmOpen] = useState(false);
  const [connectPin, setConnectPin] = useState('');
  const [connectStatus, setConnectStatus] = useState<'idle' | 'loading' | 'success' | 'failure'>('idle');
  const [transactionMessage, setTransactionMessage] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  // --- Card Support States ---
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [savedCard, setSavedCard] = useState<{ name: string; number: string; expiry: string } | null>(null);
  const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

  // --- Staged Flow Visibility ---
  const [showConnectForm, setShowConnectForm] = useState(false);

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      if (message?.success) {
        showToast(message?.message || '');
        setToastMessage(message?.message || '');
        setTxStatus(true);
        setWithdrawing(false);
        setShowWithdrawModal(false);
      } else {
        setToastMessage(message?.message || '');
        setWithdrawing(false);
        setTxStatus(false);
      }
    }
  }, [message, showToast]);

  interface FoundUser {
    email: string;
    name: string;
    image: string;
  }

  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [transferError, setTransferError] = useState('');
  const [transferProcessing, setTransferProcessing] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  // --- Logic ---
  const handleRequestAccount = () => {
    setAccountLoading(true);
    setTimeout(() => {
      setAccountLoading(false);
      setAccountRequested(true);
    }, 1500);
  };

  const handleDeposit = () => {
    setDepositModalOpen(true);
    setDepositAmount('');
    setDepositError('');
  };

  const handleFund = async () => {
    const amount = Number(depositAmount.replace(/,/g, ''));
    if (amount < 100) {
      setDepositError('Amount must be more than ₦100.00');
      return;
    }
    setDepositing(true);
    setDepositError('');
    setProcessing(true);
    try {
      const response = await postRequest(ENDPOINTS.fund, { amount });
      if (response.success) {
        setProcessing(false);
        window.location.href = response.authorization_url;
      } else {
        setProcessing(false);
        setDepositing(false);
        setDepositError('Wallet funding error. Please try again.');
      }
    } catch (error) {
      console.log(error);
      setProcessing(false);
      setDepositing(false);
      setDepositError('Wallet funding error. Please try again.');
    }
  };

  const handleCancelDeposit = () => {
    setDepositModalOpen(false);
    setDepositAmount('');
    setDepositError('');
    setDepositing(false);
    setProcessing(false);
  };

  const balance = Number(user?.balance.slice(1).replaceAll(',', '')) || 0;

  useEffect(() => {
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
  }, [transferData.recipient, user?.email]);

  const handleTransferSubmit = async () => {
    setTransferProcessing(true);
    setTransferError('');
    try {
      const response = await postRequest(ENDPOINTS.internal_transfer, {
        email: transferData.recipient,
        amount: Number(transferData.amount),
        transaction_pin: transferData.pin
      });
      if (response.success) {
        setTransferModalOpen(false);
        setTransferStep(1);
        setTransferData({ recipient: '', amount: '', pin: '' });
        window.location.reload();
      } else {
        setTransferError(response.error || 'Transfer failed. Check PIN.');
      }
    } catch (error) {
      console.log(error);
      setTransferError('Connection error. Please try again.');
    } finally {
      setTransferProcessing(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length !== 10) return;
    setVerifyingAccount(true);
    setAccountName('');
    setAccountVerified(false);
    try {
      const payload = {
        account_number: accountNumber,
        bank_code: selectedBank,
      };
      const response = await postRequest(ENDPOINTS.verify_account_name, payload);
      if (response.success) {
        setAccountName(response.account_name);
        setAccountVerified(true);
      } else {
        showToast(response.message || 'Failed to verify account');
      }
    } catch (error) {
      console.error('Verify failed:', error);
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleConfirmWithdraw = () => {
    if (!accountVerified || !withdrawAmount) {
      showToast('Missing Fields');
      return;
    }
    setWithdrawing(true);
    showPinModal();
  };

  // --- Connect Integration (Backend Flow) ---
  
  // Fetch Partners on mount
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const data = await connectApi.fetchPartners();
        setPartners(data);
      } catch (err) {
        showToast('Failed to load partners. Please try again.');
      } finally {
        setPartnersLoading(false);
      }
    };
    loadPartners();
  }, [showToast]);

  // Debounced Provider User Verification
  useEffect(() => {
    if (!selectedPartner || connectIdentifier.length < 3) {
      setVerifiedPartnerUser(null);
      return;
    }
    
    const verifyUser = async () => {
      setIsVerifyingPartner(true);
      try {
        const user = await connectApi.verifyUser(selectedPartner.id, connectIdentifier);
        setVerifiedPartnerUser(user);
      } catch (err) {
        setVerifiedPartnerUser(null);
      } finally {
        setIsVerifyingPartner(false);
      }
    };
    
    const delayVerify = setTimeout(() => {
      verifyUser();
    }, 800);
    
    return () => clearTimeout(delayVerify);
  }, [selectedPartner, connectIdentifier]);

  // Progressive Disclosure for Connect Flow
  useEffect(() => {
    if (selectedPartner) {
      setTimeout(() => setShowConnectForm(true), 50);
    } else {
      setShowConnectForm(false);
    }
  }, [selectedPartner]);

  // API Driven Connect Payment
  const handleConnectPayment = async () => {
    setConnectStatus('loading');
    
    try {
      const response = await connectApi.pay({
        partner: selectedPartner!.id,
        identifier: connectIdentifier,
        amount: Number(connectAmount),
        pin: connectPin
      });
      
      if (response.success) {
        setConnectStatus('success');
        setTransactionMessage(response.message || 'Payment processed successfully.');
      } else {
        setConnectStatus('failure');
        setTransactionMessage(response.message || 'Transaction failed.');
      }
    } catch (error: any) {
      setConnectStatus('failure');
      setTransactionMessage(error.message || 'Connection error. Please try again.');
    }
  };

  const resetConnect = () => {
    setSelectedPartner(null);
    setConnectIdentifier('');
    setConnectAmount('');
    setConnectPin('');
    setIsConnectConfirmOpen(false);
    setConnectStatus('idle');
    setShowConnectForm(false);
    setTransactionMessage('');
  };

  // Carousel Scroll Listener
  const handleCarouselScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = 128 + 16;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveCarouselIndex(index);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-center { scroll-snap-align: center; }
      ` }} />

      {/* MATCHED CART HEADER */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Wallet</h1>
            <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-slate-400 dark:text-slate-500">Manage your BlueSea funds</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* CARD 1: FUNDING DETAILS */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Funding Details</h3>
                  <div className="p-1.5 bg-sky-500/10 rounded-lg">
                    <Landmark className="h-3.5 w-3.5 text-sky-500" />
                  </div>
                </div>
                
                {accountRequested ? (
                  <div className="text-center p-6 bg-sky-500/5 border border-sky-500/10 rounded-2xl animate-pulse">
                    <p className="text-sky-500 font-bold text-sm">Account Coming Soon</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Processing Request</p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <Landmark className="h-6 w-6 text-sky-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Virtual Account</h4>
                      <p className="text-[11px] text-slate-500 mt-1 px-4 leading-relaxed">Generate a dedicated account for instant automated wallet funding.</p>
                    </div>
                    <Button 
                      onClick={handleRequestAccount}
                      disabled={accountLoading}
                      className="w-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl h-11 text-xs font-bold border border-slate-200 dark:border-white/10 shadow-sm transition-all active:scale-[0.98]"
                    >
                     {accountLoading ? <LoadingSpinner size="sm" /> : 'Request Account'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: REUSED BALANCE CARD COMPONENT */}
            <div className="lg:col-span-3 relative group">
              {/* BALANCE CARD ENHANCEMENT: PREMIUM UTILITY CHIPS */}
              <div className="absolute top-6 right-12 md:right-10 flex gap-2 z-20 pointer-events-auto">
                <button 
                  onClick={() => setCardModalOpen(true)}
                  className="flex items-center gap-3 px-3 py-1.5 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-full text-[10px] font-bold text-white shadow-lg hover:bg-white/20 transition-all active:scale-90"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Card</span>
                </button>
              </div>
              <BalanceCard
                showActions={true}
                onDeposit={handleDeposit}
                onWithdraw={() => setShowWithdrawModal(true)}
                className="h-full border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden"
              />
            </div>
          </div>

          {/* BlueSea Connect Section */}
          <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm transition-all duration-300">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">BlueSea Connect</h3>
                  <p className="text-slate-500 text-[10px] font-medium">Instant partner platform payments</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSeeAllOpen(true)}
                className="text-[10px] font-bold text-sky-500 bg-sky-500/10 hover:bg-sky-500 hover:text-white rounded-lg px-3 py-1.5 transition-all active:scale-95"
              >
                See all
              </button>
            </div>

            {/* Featured Partners */}
            <div className="px-6 pb-6">
              {partnersLoading ? (
                <div className="flex justify-center p-6">
                  <LoadingSpinner size="sm" text="Loading Partners..." />
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
                  {partners.slice(0, 3).map((partner) => (
                    <button
                      key={partner.id}
                      onClick={() => setSelectedPartner(partner)}
                      className={`flex-shrink-0 flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                        selectedPartner?.id === partner.id 
                        ? 'bg-white dark:bg-slate-800 border-sky-500 shadow-xl shadow-sky-500/10 scale-105 z-10' 
                        : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                      } min-w-[130px]`}
                    >
                      <div className="relative">
                        <div 
                          className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner"
                        >
                          <img 
                            src={partner.logo} 
                            alt={partner.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${partner.name}&background=random`;
                            }}
                          />
                        </div>
                        {selectedPartner?.id === partner.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none">{partner.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{partner.helper}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Inline Expandable Panel - Progressive Disclosure */}
              {selectedPartner && showConnectForm && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 space-y-5 animate-in slide-in-from-top-4 fade-in duration-500 ease-out">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                        {selectedPartner.label || selectedPartner.verification_type}
                      </Label>
                      <div className="relative group">
                        <Input
                          value={connectIdentifier}
                          onChange={(e) => setConnectIdentifier(e.target.value)}
                          placeholder={selectedPartner.placeholder || `Enter ${selectedPartner.verification_type}`}
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-2xl h-12 text-xs font-bold focus:ring-sky-500 transition-all group-hover:border-sky-500/50"
                        />
                        {connectIdentifier.length > 2 && !verifiedPartnerUser && !isVerifyingPartner && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-red-400 uppercase tracking-tighter">Not Found</span>
                        )}
                        {isVerifyingPartner && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <LoadingSpinner size="sm" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Amount (₦)</Label>
                      <div className="relative group">
                        <Input
                          type="number"
                          value={connectAmount}
                          onChange={(e) => setConnectAmount(e.target.value)}
                          placeholder="0.00"
                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 rounded-2xl h-12 text-sm font-black focus:ring-sky-500 transition-all group-hover:border-sky-500/50"
                        />
                        <WalletIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </div>
                  </div>

                  {verifiedPartnerUser && (
                    <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-sky-500/20">
                          <User className="w-5 h-5 text-sky-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{verifiedPartnerUser.name}</p>
                            <CheckCircle2 className="w-3 h-3 text-sky-500" />
                          </div>
                          <p className="text-[10px] font-bold text-slate-400">{verifiedPartnerUser.identifier}</p>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className="px-2 py-1 bg-sky-500 text-white rounded text-[8px] font-black uppercase tracking-widest">Verified Recipient</div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setSelectedPartner(null)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setIsConnectConfirmOpen(true)}
                      disabled={!verifiedPartnerUser || !connectAmount}
                      className="flex-[2] bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-12 text-xs font-black shadow-lg shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
          
          {/* Internal Transfer Button */}
          <button 
            onClick={() => setTransferModalOpen(true)}
            className="group w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-6 flex items-center justify-between hover:border-sky-500/30 transition-all active:scale-[0.99] shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white dark:bg-slate-800 text-sky-500 rounded-2xl shadow-sm group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 group-hover:rotate-12">
                <Send className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">Internal Transfer</h3>
                <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Instant send to BlueSea users</p>
              </div>
            </div>
            <div className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <ChevronRight className="h-4 w-4 text-sky-500" />
            </div>
          </button>

          {/* History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Recent Activity</h3>
               <Globe className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-2 shadow-sm">
              <TransactionList />
            </div>
          </div>
        </div>
      </main>

      {/* --- PREMIUM CAROUSEL MODAL (SEE ALL) --- */}
      {isSeeAllOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40 transition-all duration-500">
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => setIsSeeAllOpen(false)} 
          />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[3rem] rounded-t-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-10 duration-500 border-t sm:border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Select Partner</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Connection</p>
              </div>
              <button 
                onClick={() => setIsSeeAllOpen(false)} 
                className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              onScroll={handleCarouselScroll}
              className="flex gap-4 overflow-x-auto snap-x scrollbar-hide py-12 px-[35%] transition-all"
            >
              {partners.map((partner, index) => {
                const isActive = activeCarouselIndex === index;
                return (
                  <button
                    key={partner.id}
                    onClick={() => {
                      if (isActive) {
                        setSelectedPartner(partner);
                        setIsSeeAllOpen(false);
                      } else {
                        scrollRef.current?.scrollTo({
                          left: index * (128 + 16),
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`flex-shrink-0 snap-center flex flex-col items-center gap-6 w-32 transition-all duration-500 ease-out ${
                      isActive ? 'scale-125 opacity-100 translate-y-[-8px]' : 'scale-90 opacity-40 grayscale-[0.5]'
                    }`}
                  >
                    <div className="relative group">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center p-0.5 overflow-hidden transition-all duration-500 ${
                        isActive 
                        ? 'bg-sky-500 shadow-2xl shadow-sky-500/40 rotate-0' 
                        : 'bg-slate-200 dark:bg-slate-800 rotate-[-10deg]'
                      }`}>
                        <img 
                          src={partner.logo} 
                          alt={partner.name}
                          className="w-full h-full object-cover rounded-[1.8rem]"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-t from-sky-500/40 to-transparent" />
                        )}
                      </div>
                      {isActive && (
                         <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 rounded-full p-1 shadow-lg border border-sky-100 dark:border-white/10">
                            <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500/10" />
                         </div>
                      )}
                    </div>
                    <div className={`text-center transition-all duration-500 ${isActive ? 'translate-y-2' : ''}`}>
                      <p className={`text-xs font-black tracking-tight ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {partner.name}
                      </p>
                      {isActive && (
                        <p className="text-[9px] font-bold text-sky-500 uppercase tracking-tighter mt-1 animate-in fade-in slide-in-from-top-1">
                          Tap to select
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex gap-1.5">
                {partners.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      activeCarouselIndex === i ? 'w-6 bg-sky-500' : 'w-1.5 bg-slate-200 dark:bg-slate-800'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Swipe to explore</p>
            </div>
          </div>
        </div>
      )}

      

      {/* BlueSea Connect Confirmation Modal */}
      {isConnectConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            {connectStatus === 'idle' ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
                    <ShieldCheck className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Confirm Payment</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorization Required</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-4 mb-8 border border-slate-200 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <img src={selectedPartner?.logo} alt="" className="w-20 h-20 object-contain" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Platform</span>
                    <div className="flex items-center gap-2">
                       <img src={selectedPartner?.logo} className="w-4 h-4 rounded-full object-cover" alt="" />
                       <span className="text-slate-900 dark:text-white font-black text-xs">{selectedPartner?.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Recipient</span>
                    <span className="text-slate-900 dark:text-white font-black text-xs">{verifiedPartnerUser?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Reference</span>
                    <span className="text-slate-900 dark:text-white font-bold text-xs">{verifiedPartnerUser?.identifier}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Total Amount</span>
                    <span className="text-sky-500 font-black text-xl">₦{Number(connectAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="max-w-[240px] mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      className="w-full h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center text-3xl tracking-[0.8em] font-black focus:ring-2 focus:ring-sky-500 outline-none border-none transition-all"
                      value={connectPin}
                      onChange={(e) => setConnectPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Enter Transaction PIN</p>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setIsConnectConfirmOpen(false)} 
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </Button>
                    <Button 
                      disabled={connectPin.length < 4}
                      onClick={handleConnectPayment}
                      className="flex-[2] bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              </>
            ) : connectStatus === 'loading' ? (
              <div className="py-16 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                  <Zap className="absolute inset-0 m-auto w-8 h-8 text-sky-500 animate-pulse" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-black tracking-tight">Processing Payment</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Please do not close this window</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${
                  connectStatus === 'success' ? 'bg-green-500 shadow-2xl shadow-green-500/20' : 'bg-red-500 shadow-2xl shadow-red-500/20'
                }`}>
                  {connectStatus === 'success' 
                    ? <CheckCircle2 className="w-12 h-12 text-white" /> 
                    : <AlertCircle className="w-12 h-12 text-white" />
                  }
                </div>
                <h3 className="text-2xl font-black tracking-tight">
                  {connectStatus === 'success' ? 'Payment Sent!' : 'Payment Failed'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 px-8 leading-relaxed font-medium">
                  {connectStatus === 'success' 
                    ? transactionMessage || `Successfully processed ₦${Number(connectAmount).toLocaleString()} for ${verifiedPartnerUser?.name} on ${selectedPartner?.name}.`
                    : transactionMessage || 'We encountered an error while processing your payment. Please check your balance or try again later.'}
                </p>
                <Button 
                  onClick={resetConnect} 
                  className="w-full mt-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                >
                  Return to Wallet
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Support Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Saved Cards</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Payment Methods</p>
              </div>
              <button onClick={() => setCardModalOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {savedCard ? (
              <div className="space-y-8">
                <div className="relative h-48 w-full bg-slate-900 rounded-[2rem] p-8 overflow-hidden border border-white/10 shadow-2xl transform hover:rotate-1 transition-transform">
                  <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-500/30 rounded-full blur-[80px]" />
                  <div className="flex justify-between items-start mb-12 relative z-10">
                     <div className="w-12 h-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-center">
                       <div className="w-6 h-4 bg-yellow-500/50 rounded-sm" />
                    </div>
                    <CreditCard className="w-6 h-6 text-white/40" />
                   </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-white text-xl font-black tracking-[0.2em]">•••• •••• •••• {savedCard.number.slice(-4)}</p>
                    <div className="flex justify-between items-end mt-4">
                        <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">{savedCard.name}</p>
                       <p className="text-[10px] text-white/40 font-bold">{savedCard.expiry}</p>
                    </div>
                  </div>
                </div>
                 <div className="flex justify-center gap-6">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Visa</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Mastercard</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Verve</span>
                 </div>
                <Button 
                  onClick={() => setSavedCard(null)} 
                  className="w-full bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all shadow-lg shadow-red-500/5"
                >
                  Remove Card
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-4">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cardholder Name</Label>
                    <Input 
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                      placeholder="e.g. John Doe" 
                      className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</Label>
                    <Input 
                      value={newCard.number}
                      onChange={(e) => setNewCard({...newCard, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                      placeholder="0000 0000 0000 0000" 
                      className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry</Label>
                      <Input 
                        value={newCard.expiry}
                        onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                        placeholder="MM/YY" 
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</Label>
                      <Input 
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                        placeholder="000" 
                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-12 text-xs font-bold" 
                      />
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    if (newCard.number && newCard.name) {
                      setSavedCard({...newCard});
                      setNewCard({ name: '', number: '', expiry: '', cvv: '' });
                    }
                  }}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 transition-all mt-4"
                >
                  Link Card
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Withdraw</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all active:scale-90">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Number</Label>
                <Input
                  type="text"
                  inputMode='numeric'
                  placeholder="0000000000"
                  className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-14 focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white font-black text-lg text-center"
                  value={accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setAccountNumber(val);
                    setAccountVerified(false);
                    setAccountName('');
                  }}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Bank</Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search bank name..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-t-2xl h-12 text-xs font-bold pl-11 focus:ring-sky-500"
                  />
                </div>
                <select
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setAccountVerified(false);
                    setAccountName('');
                    setBankSearch('');
                  }}
                  className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-white/5 rounded-b-2xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-black text-sm appearance-none cursor-pointer"
                >
                  <option value="">Choose your bank</option>
                  {NIGERIAN_BANKS.filter(b => 
                    bankSearch === '' || b.name.toLowerCase().includes(bankSearch.toLowerCase())
                  ).map((bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              {selectedBank && accountNumber.length === 10 && (
                <Button onClick={handleVerifyAccount} disabled={verifyingAccount} className="w-full bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white font-black h-12 rounded-2xl border border-sky-500/20 transition-all text-[10px] uppercase tracking-widest">
                  {verifyingAccount ? 'Verifying Account...' : 'Verify Details'}
                </Button>
              )}
              {accountVerified && (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                 <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{accountName}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount to Withdraw</Label>
                <div className="relative group">
                   <Input
                    type="number"
                    placeholder="0.00"
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl h-16 text-3xl font-black focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white pl-10"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 group-focus-within:text-sky-500">₦</span>
                </div>
                <div className="flex justify-between px-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Available: ₦{balance.toLocaleString()}</p>
                  <button 
                    onClick={() => setWithdrawAmount(balance.toString())}
                    className="text-[10px] text-sky-500 font-black uppercase tracking-widest hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>
              <Button
                onClick={handleConfirmWithdraw}
                disabled={withdrawing || !accountVerified || !withdrawAmount || Number(withdrawAmount) > balance}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[1.5rem] h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 mt-6 transition-all"
              >
                {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
              </Button>
            </div>
          </div>
          { isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <TransactionModal isSuccess={txStatus} onClose={()=> setIsOpen(false)} toastMessage={toastMessage} />
            </div>
          )}
          <ToastComponent />
          <PinComponent type="withdrawal" value={{
            account_name: accountName,
            account_number: accountNumber,
            bank_code: selectedBank,
            bank_name: NIGERIAN_BANKS.find(b => b.code === selectedBank)?.name || '',
            amount: withdrawAmount,
          }} />
        </div>
      )}

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => !processing && setDepositModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-12 gap-6">
                <LoadingSpinner size="lg" text="Connecting to Secure Gateway..." />
              </div>
            ) : (
              <>
                <header className="mb-10 text-center">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Add Funds</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Instant Wallet Funding</p>
                </header>
                <div className="space-y-8">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute left-8 top-4 z-10">Amount to Fund</label>
                    <span className="absolute left-8 bottom-6 text-3xl font-black text-slate-300 group-focus-within:text-sky-500 transition-colors">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value.replace(/\D/g, ''));
                        setDepositError('');
                      }}
                      placeholder="0.00"
                      className="w-full pl-16 pr-8 pt-12 pb-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white shadow-inner"
                    />
                    {depositError && <p className="mt-3 text-xs text-red-500 font-black px-6 animate-bounce">{depositError}</p>}
                  </div>
                  <div className="flex flex-col gap-4 pt-4">
                    <Button 
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[1.5rem] h-16 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                      onClick={handleFund}
                      disabled={depositing || !depositAmount}
                    >
                      {depositing ? <LoadingSpinner size="sm" /> : 'Proceed to Checkout'}
                    </Button>
                    {!depositing && (
                      <button onClick={handleCancelDeposit} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-black uppercase tracking-[0.3em] py-3 transition-colors">Cancel</button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Internal Transfer Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => !transferProcessing && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <header className="mb-10 text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {transferStep === 2 ? 'Authorize' : 'Send Money'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">BlueSea Instant Transfer</p>
            </header>
            <div className="space-y-8">
              {transferStep === 1 && (
                <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-6">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 absolute left-8 top-4 z-10">Recipient Email</label>
                    <input
                      placeholder="e.g. name@bluesea.com"
                      className="w-full pl-8 pr-14 pt-12 pb-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-black text-lg shadow-inner"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
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
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
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
              )}
              {transferStep === 2 && (
                <div className="animate-in slide-in-from-bottom-8 duration-500 text-center">
                  <div className="mb-10">
                    <div className="h-24 w-24 bg-sky-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-sky-500/20 shadow-inner">
                      <ShieldCheck className="h-12 w-12 text-sky-500" />
                    </div>
                    <div className="px-8">
                       <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sending <span className="font-black text-slate-900 dark:text-white text-lg">₦{Number(transferData.amount).toLocaleString()}</span> to</p>
                       <p className="text-sky-500 font-black text-xl tracking-tight mt-1">{foundUser?.name}</p>
                    </div>
                  </div>
                  <div className="max-w-[260px] mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      inputMode="numeric"
                      className="w-full px-6 py-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none text-center text-5xl tracking-[1.2rem] font-black text-slate-900 dark:text-white shadow-inner"
                      value={transferData.pin}
                      onChange={(e) => setTransferData({...transferData, pin: e.target.value.replace(/\D/g, '')})}
                    />
                     <p className="mt-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Security Pin Required</p>
                  </div>
                </div>
              )}
              {transferError && <p className="text-red-500 text-[10px] font-black text-center px-8 uppercase tracking-widest animate-pulse">{transferError}</p>}
              <div className="flex flex-col gap-4 pt-6">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-[1.5rem] h-16 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                  disabled={transferProcessing || (transferStep === 1 && (!transferData.amount || !foundUser))}
                  onClick={() => transferStep === 1 ? setTransferStep(2) : handleTransferSubmit()}
                >
                {transferProcessing ? <LoadingSpinner size="sm" /> : transferStep === 1 ? 'Verify Destination' : 'Confirm & Send'}
                </Button>
                {!transferProcessing && (
                  <button onClick={() => transferStep === 2 ? setTransferStep(1) : setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] font-black uppercase tracking-[0.3em] py-3 transition-colors">
                    {transferStep === 2 ? 'Return to Details' : 'Cancel Transfer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
