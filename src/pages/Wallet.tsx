import { useState, useEffect, useRef } from 'react';
import { TransactionList, LoadingSpinner, BalanceCard } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postRequest, ENDPOINTS, API_BASE } from '@/types';
import { Landmark, Send, X, ChevronRight, User, ShieldCheck, Search, ChevronLeft, CreditCard, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { NIGERIAN_BANKS } from '@/data';
import { useNavigate } from 'react-router-dom';

// --- BlueSea Connect Mock Data ---
const MOCK_PARTNERS = [
  { id: 1, name: 'Lumic', idType: 'username', helper: 'Pay package', label: 'Username', placeholder: 'Enter Lumic username', initials: 'LU' },
  { id: 2, name: 'HFM', idType: 'email', helper: 'Fund trading', label: 'Email', placeholder: 'Enter HFM email', initials: 'HF' },
  { id: 3, name: 'Modis', idType: 'memberId', helper: 'Top up account', label: 'Member ID', placeholder: 'Enter Modis member ID', initials: 'MO' },
  { id: 4, name: 'NovaPay', idType: 'phone', helper: 'Send payment', label: 'Phone Number', placeholder: 'Enter phone number', initials: 'NP' },
  { id: 5, name: 'LynkPro', idType: 'email', helper: 'Premium access', label: 'Email', placeholder: 'Enter email address', initials: 'LP' },
];

const MOCK_PARTNER_USERS: Record<string, { id: string, name: string }[]> = {
  'Lumic': [{ id: 'alex99', name: 'Alex Johnson' }, { id: 'sarah_m', name: 'Sarah Miller' }],
  'HFM': [{ id: 'trade@hfm.com', name: 'Global Markets Ltd' }, { id: 'invest@hfm.com', name: 'Capital Group' }],
  'Modis': [{ id: 'MOD-7721', name: 'David Chen' }, { id: 'MOD-8832', name: 'Elena Rodriguez' }],
  'NovaPay': [{ id: '08012345678', name: 'Samuel Okoro' }, { id: '09087654321', name: 'Blessing Ade' }],
  'LynkPro': [{ id: 'pro@lynk.io', name: 'Professional Services' }, { id: 'admin@lynk.io', name: 'System Admin' }],
};

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

  // --- BlueSea Connect States ---
  const [selectedPartner, setSelectedPartner] = useState<typeof MOCK_PARTNERS[0] | null>(null);
  const [isSeeAllOpen, setIsSeeAllOpen] = useState(false);
  const [connectIdentifier, setConnectIdentifier] = useState('');
  const [verifiedPartnerUser, setVerifiedPartnerUser] = useState<{ id: string, name: string } | null>(null);
  const [connectAmount, setConnectAmount] = useState('');
  const [isConnectConfirmOpen, setIsConnectConfirmOpen] = useState(false);
  const [connectPin, setConnectPin] = useState('');
  const [connectStatus, setConnectStatus] = useState<'idle' | 'loading' | 'success' | 'failure'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Card Support States ---
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [savedCard, setSavedCard] = useState<{ name: string; number: string; expiry: string } | null>(null);
  const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', cvv: '' });

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

  // --- Connect Simulation ---
  useEffect(() => {
    if (selectedPartner && connectIdentifier) {
      const users = MOCK_PARTNER_USERS[selectedPartner.name] || [];
      const match = users.find(u => u.id.toLowerCase() === connectIdentifier.toLowerCase());
      setVerifiedPartnerUser(match || null);
    } else {
      setVerifiedPartnerUser(null);
    }
  }, [selectedPartner, connectIdentifier]);

  const handleConnectPayment = () => {
    setConnectStatus('loading');
    setTimeout(() => {
      setConnectStatus(Math.random() > 0.3 ? 'success' : 'failure');
    }, 1200);
  };

  const resetConnect = () => {
    setSelectedPartner(null);
    setConnectIdentifier('');
    setConnectAmount('');
    setConnectPin('');
    setIsConnectConfirmOpen(false);
    setConnectStatus('idle');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* MATCHED CART HEADER */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Wallet</h1>
            <p className="text-xs text-slate-500">Manage your BlueSea funds</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* CARD 1: FUNDING DETAILS */}
            <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Funding Details</h3>
                  <Landmark className="h-4 w-4 text-sky-500" />
                </div>
                
                {accountRequested ? (
                  <div className="text-center p-4 bg-sky-500/5 border border-sky-500/10 rounded-xl">
                    <p className="text-sky-500 font-bold text-sm">Account Coming Soon</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Processing Request</p>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Landmark className="h-5 w-5 text-sky-500" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Request account number</h4>
                    <p className="text-[11px] text-slate-500 px-2 leading-relaxed">Get a dedicated virtual account for automated funding.</p>
                    <Button 
                      onClick={handleRequestAccount}
                      disabled={accountLoading}
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl h-10 text-xs font-bold border border-slate-200 dark:border-white/5"
                    >
                      {accountLoading ? <LoadingSpinner size="sm" /> : 'Request Account'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
                         {/* CARD 2: REUSED BALANCE CARD COMPONENT */}
            <div className="lg:col-span-3 relative">
              {/* BALANCE CARD ENHANCEMENT: UTILITY CHIPS */}
              <div className="absolute top-5 right-12 md:right-16 flex gap-1.5 z-10 pointer-events-auto">
                <button 
                  onClick={() => setCardModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full text-[9px] font-bold text-slate-700 dark:text-slate-300 hover:bg-white/60 transition-colors"
                >
                  <CreditCard className="w-2.5 h-2.5" />
                  Card
                </button>
                <button className="flex items-center gap-1 px-2 py-1 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full text-[9px] font-bold text-slate-700 dark:text-slate-300 hover:bg-white/60 transition-colors">
                  <Smartphone className="w-2.5 h-2.5" />
                  Google Pay
                </button>
              </div>
              <BalanceCard
                showActions={true}
                onDeposit={handleDeposit}
                onWithdraw={() => setShowWithdrawModal(true)}
                className="h-full border border-slate-200 dark:border-white/5"
              />
            </div>
          </div>

          {/* BlueSea Connect Section */}
          <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">BlueSea Connect</h3>
                <p className="text-slate-500 text-[11px]">Pay partner platforms from your wallet</p>
              </div>
              <button 
                onClick={() => setIsSeeAllOpen(true)}
                className="text-[10px] font-bold text-sky-500 hover:text-sky-600 px-2 py-1"
              >
                See all
              </button>
            </div>

            {/* Featured Partners */}
            <div className="px-5 pb-5">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
                {MOCK_PARTNERS.slice(0, 3).map((partner) => (
                  <button
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedPartner?.id === partner.id 
                      ? 'bg-white dark:bg-slate-800 border-sky-500 shadow-sm' 
                      : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 hover:border-slate-300'
                    } min-w-[140px]`}
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center text-[10px] font-bold border border-sky-500/20">
                      {partner.initials}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{partner.name}</p>
                      <p className="text-[9px] text-slate-500 mt-1">{partner.helper}</p>
                    </div>
                  </button>
                ))}
              </div>
 {/* Inline Expandable Panel */}
              {selectedPartner && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{selectedPartner.label}</Label>
                    <div className="relative">
                      <Input
                        value={connectIdentifier}
                        onChange={(e) => setConnectIdentifier(e.target.value)}
                        placeholder={selectedPartner.placeholder}
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-11 text-xs focus:ring-sky-500"
                      />
                      {connectIdentifier && !verifiedPartnerUser && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">User not found</span>
                      )}
                    </div>
                  </div>

                  {verifiedPartnerUser && (
                    <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{verifiedPartnerUser.name}</p>
                          <span className="text-[8px] px-1 bg-sky-500/20 text-sky-500 rounded font-bold uppercase">Verified</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{verifiedPartnerUser.id}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Amount (₦)</Label>
                    <Input
                      type="number"
                      value={connectAmount}
                      onChange={(e) => setConnectAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-11 text-sm font-bold focus:ring-sky-500"
                    />
                  </div>

                  <Button
                    onClick={() => setIsConnectConfirmOpen(true)}
                    disabled={!verifiedPartnerUser || !connectAmount}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl h-11 text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    Continue
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Internal Transfer Button */}
          <button 
            onClick={() => setTransferModalOpen(true)}
            className="group w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-sky-500/30 transition-all active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Send className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Internal Transfer</h3>
                <p className="text-slate-500 text-[11px]">Instant send to BlueSea users</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-sky-500 transition-colors" />
          </button>

          {/* History Section */}
          <div className="space-y-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 p-1 shadow-sm">
              <TransactionList />
            </div>
          </div>
        </div>
      </main>

      {/* BlueSea Connect See All Modal */}
      {isSeeAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Partners</h3>
              <button onClick={() => setIsSeeAllOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto snap-x scrollbar-hide py-4 px-10"
            >
              {MOCK_PARTNERS.map((partner) => (
                <button
                  key={partner.id}
                  onClick={() => {
                    setSelectedPartner(partner);
                    setIsSeeAllOpen(false);
                  }}
                  className="flex-shrink-0 snap-center flex flex-col items-center gap-3 w-32 transition-all active:scale-95"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black transition-all ${
                    selectedPartner?.id === partner.id 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-sky-500 border border-slate-200 dark:border-white/5'
                  }`}>
                    {partner.initials}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{partner.name}</p>
                    <p className="text-[9px] text-slate-500">{partner.helper}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Scroll to browse platforms</p>
            </div>
          </div>
        </div>
      )}

      {/* BlueSea Connect Confirmation Modal */}
      {isConnectConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            {connectStatus === 'idle' ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-bold">Confirm Payment</h3>
                  <p className="text-xs text-slate-500">Review details before proceeding</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 mb-6 border border-slate-200 dark:border-white/5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Partner</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedPartner?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Recipient</span>
                    <span className="text-slate-900 dark:text-white font-bold">{verifiedPartnerUser?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">ID</span>
                    <span className="text-slate-900 dark:text-white font-bold">{verifiedPartnerUser?.id}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Amount</span>
                    <span className="text-sky-500 font-black text-lg">₦{Number(connectAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="max-w-[200px] mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      className="w-full h-14 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-2xl tracking-[0.8em] font-black focus:ring-2 focus:ring-sky-500 outline-none"
                      value={connectPin}
                      onChange={(e) => setConnectPin(e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-[10px] text-center text-slate-400 font-bold mt-2">Enter 4-digit PIN</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => setIsConnectConfirmOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 h-12 rounded-xl text-xs font-bold">Cancel</Button>
                    <Button 
                      disabled={connectPin.length < 4}
                      onClick={handleConnectPayment}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white h-12 rounded-xl text-xs font-bold"
                    >
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              </>
            ) : connectStatus === 'loading' ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <LoadingSpinner size="lg" text="Processing..." />
              </div>
            ) : (
              <div className="text-center py-6 animate-in zoom-in-95">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  connectStatus === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {connectStatus === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                </div>
                <h3 className="text-xl font-bold">{connectStatus === 'success' ? 'Payment Successful' : 'Payment Failed'}</h3>
                <p className="text-xs text-slate-500 mt-2 px-6">
                  {connectStatus === 'success' 
                    ? `Successfully sent ₦${connectAmount} to ${verifiedPartnerUser?.name}.`
                    : 'The transaction could not be completed at this time. Please try again.'}
                </p>
                <Button onClick={resetConnect} className="w-full mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 rounded-xl text-xs font-black">
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Card Support Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Card Management</h3>
              <button onClick={() => setCardModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {savedCard ? (
              <div className="space-y-6">
                <div className="relative h-44 w-full bg-slate-900 rounded-2xl p-6 overflow-hidden border border-white/10 shadow-xl">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl" />
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-10 h-6 bg-slate-700/50 rounded-md" />
                    <CreditCard className="w-6 h-6 text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-lg font-black tracking-widest">•••• •••• •••• {savedCard.number.slice(-4)}</p>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{savedCard.name}</p>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                   <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black text-slate-500">VISA</div>
                   <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black text-slate-500">MASTERCARD</div>
                   <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black text-slate-500">VERVE</div>
                </div>
                <Button onClick={() => setSavedCard(null)} className="w-full bg-red-500/10 text-red-500 h-11 rounded-xl text-xs font-bold border border-red-500/20">Remove Card</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400 ml-1">Cardholder Name</Label>
                    <Input 
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                      placeholder="John Doe" 
                      className="bg-slate-50 dark:bg-slate-800 h-11 text-xs" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400 ml-1">Card Number</Label>
                    <Input 
                      value={newCard.number}
                      onChange={(e) => setNewCard({...newCard, number: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                      placeholder="0000 0000 0000 0000" 
                      className="bg-slate-50 dark:bg-slate-800 h-11 text-xs" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 ml-1">Expiry</Label>
                      <Input 
                        value={newCard.expiry}
                        onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                        placeholder="MM/YY" 
                        className="bg-slate-50 dark:bg-slate-800 h-11 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-slate-400 ml-1">CVV</Label>
                      <Input 
                        value={newCard.cvv}
                        onChange={(e) => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                        placeholder="000" 
                        className="bg-slate-50 dark:bg-slate-800 h-11 text-xs" 
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
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white h-12 rounded-xl text-xs font-black shadow-lg shadow-sky-500/20"
                >
                  Add Card
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals remain unchanged as requested */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Account Number</Label>
                <Input
                  type="text"
                  inputMode='numeric'
                  placeholder="0000000000"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-12 focus:ring-sky-500 text-slate-900 dark:text-white font-bold"
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
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Select Bank</Label>
                <Input
                  type="text"
                  placeholder="Search bank name..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="mb-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-10 text-xs focus:ring-sky-500"
                />
                <select
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setAccountVerified(false);
                    setAccountName('');
                    setBankSearch('');
                  }}
                  className="w-full h-12 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 outline-none font-bold text-sm"
                >
<option value="">Select bank</option>
                  {NIGERIAN_BANKS.filter(b => 
                    bankSearch === '' || b.name.toLowerCase().includes(bankSearch.toLowerCase())
                  ).map((bank) => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              
              {selectedBank && accountNumber.length === 10 && (
                <Button onClick={handleVerifyAccount} disabled={verifyingAccount} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-500 dark:text-sky-400 font-bold border border-sky-500/20">
                  {verifyingAccount ? 'Verifying...' : 'Verify Account'}
                </Button>
              )}
              {accountVerified && (
                <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-xl">
                  <p className="text-xs font-bold text-sky-500 dark:text-sky-400 uppercase tracking-wider">{accountName}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Amount (₦)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-14 text-2xl font-black focus:ring-sky-500 text-slate-900 dark:text-white"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <p className="text-[10px] text-slate-500 font-bold ml-1">AVAILABLE: ₦{balance.toLocaleString()}</p>
              </div>
              <Button
                onClick={handleConfirmWithdraw}
                disabled={withdrawing || !accountVerified || !withdrawAmount || Number(withdrawAmount) > balance}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl h-12 font-black shadow-lg shadow-sky-500/20 active:scale-95 mt-4 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 dark:bg-slate-950/80">
          <div className="absolute inset-0" onClick={() => !processing && setDepositModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            {processing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" text="Processing payment..." />
              </div>
            ) : (
              <>
                <header className="mb-8 text-center">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deposit Funds</h2>
                  <div className="h-1.5 w-10 bg-sky-500 mx-auto rounded-full mt-2" />
                </header>
                <div className="space-y-6">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 absolute left-6 top-3 z-10">Amount (₦)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value.replace(/\D/g, ''));
                        setDepositError('');
                      }}
                      placeholder="0.00"
                      className="w-full pl-6 pr-4 pt-9 pb-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white"
                    />
                    {depositError && <p className="mt-2 text-xs text-red-500 dark:text-red-400 font-bold px-4">{depositError}</p>}
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <Button 
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                      onClick={handleFund}
                      disabled={depositing || !depositAmount}
                    >
                      {depositing ? <LoadingSpinner size="sm" /> : 'Confirm & Proceed'}
                    </Button>
                    {!depositing && (
                      <button onClick={handleCancelDeposit} className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] py-3">Cancel</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60 dark:bg-slate-950/80">
          <div className="absolute inset-0" onClick={() => !transferProcessing && setTransferModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <header className="mb-8 text-center">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {transferStep === 2 ? 'Verify Identity' : 'Transfer Funds'}
              </h2>
              <div className="h-1.5 w-10 bg-sky-500 mx-auto rounded-full mt-2" />
            </header>
            <div className="space-y-6">
              {transferStep === 1 && (
                <div className="animate-in slide-in-from-bottom-4 space-y-5">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 absolute left-6 top-3 z-10">Email</label>
                    <input
                      placeholder="user@bluesea.com"
                      className="w-full pl-6 pr-12 pt-9 pb-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-white font-bold"
                      value={transferData.recipient}
                      onChange={(e) => setTransferData({...transferData, recipient: e.target.value})}
                    />
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 absolute left-6 top-3 z-10">Amount (₦)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-6 pr-4 pt-9 pb-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 outline-none text-4xl font-black text-slate-900 dark:text-white"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                    />
                  </div>
                  {foundUser && (
                    <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white font-black overflow-hidden border border-slate-200 dark:border-white/5">
                        {foundUser.image ? (
                          <img src={`${API_BASE}${foundUser.image}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-sky-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{foundUser.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{foundUser.email}</p>
                      </div>
                    </div>
                  )}
                  {lookingUp && <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Looking up user...</div>}
                </div>
              )}
              {transferStep === 2 && (
                <div className="animate-in slide-in-from-bottom-4 text-center">
                  <div className="mb-6">
                    <div className="h-16 w-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
                      <ShieldCheck className="h-8 w-8 text-sky-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Confirm <span className="font-black text-slate-900 dark:text-white">₦{transferData.amount}</span> to <span className="font-bold text-sky-500">{foundUser?.name}</span></p>
                  </div>
                  <div className="max-w-[220px] mx-auto">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      inputMode="numeric"
                      className="w-full px-4 py-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none text-center text-4xl tracking-[1.5rem] font-black text-slate-900 dark:text-white"
                      value={transferData.pin}
                      onChange={(e) => setTransferData({...transferData, pin: e.target.value.replace(/\D/g, '')})}
                    />
                    <p className="mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Enter 4-Digit PIN</p>
                  </div>
                </div>
              )}
              {transferError && <p className="text-red-500 dark:text-red-400 text-[10px] font-bold text-center px-4 uppercase tracking-wider">{transferError}</p>}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                  disabled={transferProcessing || (transferStep === 1 && (!transferData.amount || !foundUser))}
                  onClick={() => transferStep === 1 ? setTransferStep(2) : handleTransferSubmit()}
                >
                  {transferProcessing ? <LoadingSpinner size="sm" /> : transferStep === 1 ? 'Verify Transaction' : 'Confirm & Pay'}
                </Button>
                {!transferProcessing && (
                  <button onClick={() => transferStep === 2 ? setTransferStep(1) : setTransferModalOpen(false)} className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] py-3 transition-colors hover:text-slate-700 dark:hover:text-slate-300">
                    {transferStep === 2 ? 'Go Back' : 'Close'}
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