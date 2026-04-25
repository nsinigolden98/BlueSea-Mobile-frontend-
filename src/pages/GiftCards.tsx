import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  PinModal, 
  Toast, 
  TransactionModal,
  LoadingSpinner 
} from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Plus, 
  History, 
  Gift, 
  CreditCard, 
  Globe, 
  Mail, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ArrowRightLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---

const GIFT_CARD_BRANDS = [
  { id: 'amz', name: 'Amazon', region: 'US/UK', color: 'bg-[#232f3e]', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg' },
  { id: 'apl', name: 'Apple', region: 'Global', color: 'bg-black', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'stm', name: 'Steam', region: 'Global', color: 'bg-[#171a21]', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg' },
  { id: 'gpg', name: 'Google Play', region: 'US', color: 'bg-white', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Play_Arrow_logo_6.svg' },
  { id: 'rzr', name: 'Razer Gold', region: 'Global', color: 'bg-[#252525]', logo: 'https://assets.razerzone.com/eeimages/v2/razer-gold/razer-gold-logo.png' }
];

const INITIAL_TRANSACTIONS = [
  { id: 'tx1', type: 'Buy', brand: 'Amazon', amount: '$50.00', status: 'Completed', date: '2026-04-20', converted: false },
  { id: 'tx2', type: 'Buy', brand: 'Steam', amount: '$20.00', status: 'Pending', date: '2026-04-24', converted: false },
  { id: 'tx3', type: 'Redeem', brand: 'Apple', amount: '$100.00', status: 'Completed', date: '2026-04-22', converted: false }
];

const REGIONS = ['United States (USD)', 'United Kingdom (GBP)', 'Europe (EUR)', 'Canada (CAD)'];
const AMOUNTS = [10, 25, 50, 100, 200, 500];

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Completed: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    Pending: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    Failed: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
  };
  return (
    <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider", styles[status as keyof typeof styles])}>
      {status}
    </span>
  );
};

export default function GiftCardPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  
  // Modal States
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'pin'>('form');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States - Buy
  const [buyData, setBuyData] = useState({ brand: '', region: '', amount: 0, qty: 1, email: '' });
  
  // Form States - Redeem
  const [redeemData, setRedeemData] = useState({ brand: '', region: '', code: '', value: '', image: null as string | null });

  const { PinComponent, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');

  // Handle PIN success/failure from PinModal
  useEffect(() => {
    if (message) {
      setIsTxModalOpen(true);
      if (message.success) {
        setTxStatus(true);
        setTxMessage(message.message || 'Request successful!');
        resetForms();
      } else {
        setTxStatus(false);
        setTxMessage(message.error || 'Transaction failed');
      }
    }
  }, [message]);

  const resetForms = () => {
    setBuyModalOpen(false);
    setRedeemModalOpen(false);
    setCurrentStep('form');
    setBuyData({ brand: '', region: '', amount: 0, qty: 1, email: '' });
    setRedeemData({ brand: '', region: '', code: '', value: '', image: null });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRedeemData({ ...redeemData, image: URL.createObjectURL(file) });
    }
  };

  const validateBuy = () => buyData.brand && buyData.region && buyData.amount > 0 && buyData.email.includes('@');
  const validateRedeem = () => redeemData.brand && redeemData.region && redeemData.code && redeemData.value && redeemData.image;

  // --- RENDERERS ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="flex items-center gap-4 px-4 py-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Gift Cards</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Buy & Redeem Instantly</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* SECTION 1: FEATURED CARDS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Popular Brands</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {GIFT_CARD_BRANDS.map((card) => (
                  <div 
                    key={card.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3 hover:shadow-lg transition-all cursor-pointer group active:scale-95"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center p-2 shadow-sm bg-slate-50 dark:bg-slate-800")}>
                      <img src={card.logo} alt={card.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate w-full">{card.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{card.region}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 2: ACTION BUTTONS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setBuyModalOpen(true)}
                className="group p-6 bg-sky-500 rounded-[2.5rem] flex items-center justify-between text-white shadow-xl shadow-sky-500/20 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black leading-tight">Buy Gift Card</p>
                    <p className="text-white/70 text-xs font-medium">Digital delivery to email</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 opacity-50 group-hover:opacity-100" />
              </button>

              <button 
                onClick={() => setRedeemModalOpen(true)}
                className="group p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white">
                    <ArrowRightLeft className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">Redeem Card</p>
                    <p className="text-slate-400 text-xs font-medium">Convert card to cash</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-sky-500" />
              </button>
            </section>

            {/* SECTION 3: RECENT ACTIVITY */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Recent Activity</h3>
                <button className="text-sky-500 text-xs font-black uppercase tracking-widest">See All</button>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden shadow-sm">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        tx.type === 'Buy' ? "bg-sky-50 text-sky-500 dark:bg-sky-500/10" : "bg-orange-50 text-orange-500 dark:bg-orange-500/10"
                      )}>
                        {tx.type === 'Buy' ? <CreditCard className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{tx.brand} Gift Card</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400 font-bold uppercase">{tx.type}</p>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <p className="text-[10px] text-slate-400">{tx.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">{tx.amount}</p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <StatusBadge status={tx.status} />
                      </div>
                      {tx.type === 'Redeem' && tx.status === 'Completed' && (
                        <button className="mt-3 text-[10px] font-black text-sky-500 uppercase tracking-tighter border border-sky-500/20 px-2 py-1 rounded-md hover:bg-sky-500 hover:text-white transition-all">
                          Convert to Blue Balance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>
      {/* --- BUY MODAL --- */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 animate-in slide-in-from-bottom duration-300">
          <header className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={resetForms} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-6 h-6 text-slate-500" />
            </button>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Buy Gift Card</h2>
            <div className="w-10" />
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-xl mx-auto space-y-8">
              
              {/* Step 1: Form */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">1. Select Brand</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {GIFT_CARD_BRANDS.map(b => (
                      <button 
                        key={b.id}
                        onClick={() => setBuyData({...buyData, brand: b.name})}
                        className={cn(
                          "p-4 rounded-2xl border text-left flex items-center gap-3 transition-all",
                          buyData.brand === b.name ? "border-sky-500 bg-sky-50 dark:bg-sky-500/10" : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-1">
                          <img src={b.logo} className="w-full h-full object-contain" />
                        </div>
                        <span className={cn("text-sm font-bold", buyData.brand === b.name ? "text-sky-600 dark:text-sky-400" : "text-slate-600 dark:text-slate-400")}>{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">2. Region & Amount</Label>
                  <div className="space-y-4">
                    <select 
                      className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                      onChange={(e) => setBuyData({...buyData, region: e.target.value})}
                    >
                      <option value="">Select Region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>

                    <div className="grid grid-cols-3 gap-2">
                      {AMOUNTS.map(a => (
                        <button 
                          key={a}
                          onClick={() => setBuyData({...buyData, amount: a})}
                          className={cn(
                            "py-3 rounded-xl border font-black transition-all",
                            buyData.amount === a ? "bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          )}
                        >
                          ${a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">3. Delivery Details</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <Input 
                      placeholder="Delivery Email Address"
                      className="pl-12 py-7 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500"
                      value={buyData.email}
                      onChange={(e) => setBuyData({...buyData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Unit Price</span>
                    <span className="font-black text-slate-900 dark:text-white">${buyData.amount}.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-400">Quantity</span>
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                      <button onClick={() => setBuyData({...buyData, qty: Math.max(1, buyData.qty - 1)})} className="w-8 h-8 rounded-lg flex items-center justify-center font-black">-</button>
                      <span className="w-4 text-center font-black">{buyData.qty}</span>
                      <button onClick={() => setBuyData({...buyData, qty: buyData.qty + 1})} className="w-8 h-8 rounded-lg flex items-center justify-center font-black">+</button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black text-sky-500">${buyData.amount * buyData.qty}.00</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => showPinModal()}
                disabled={!validateBuy()}
                className="w-full py-8 rounded-[2rem] bg-sky-500 hover:bg-sky-600 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- REDEEM MODAL --- */}
      {redeemModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950 animate-in slide-in-from-bottom duration-300">
          <header className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button onClick={resetForms} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-6 h-6 text-slate-500" />
            </button>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Redeem Gift Card</h2>
            <div className="w-10" />
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-xl mx-auto space-y-8">
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Card Brand</Label>
                    <select 
                      className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                      onChange={(e) => setRedeemData({...redeemData, brand: e.target.value})}
                    >
                      <option value="">Select Brand</option>
                      {GIFT_CARD_BRANDS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Card Region</Label>
                    <select 
                      className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 outline-none font-bold text-slate-700 dark:text-slate-200"
                      onChange={(e) => setRedeemData({...redeemData, region: e.target.value})}
                    >
                      <option value="">Select Region</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Card Code</Label>
                  <Input 
                    placeholder="Enter Card Number or PIN"
                    className="py-7 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 font-bold"
                    value={redeemData.code}
                    onChange={(e) => setRedeemData({...redeemData, code: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Value on Card ($)</Label>
                  <Input 
                    type="number"
                    placeholder="e.g. 100"
                    className="py-7 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-sky-500 font-black text-2xl"
                    value={redeemData.value}
                    onChange={(e) => setRedeemData({...redeemData, value: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Proof of Purchase (Image)</Label>
                  {redeemData.image ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <img src={redeemData.image} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setRedeemData({...redeemData, image: null})}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <Camera className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="text-xs font-black text-slate-400 uppercase">Upload Image Proof</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                <div className="p-6 bg-orange-50 dark:bg-orange-500/10 rounded-[2rem] border border-orange-100 dark:border-orange-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase">Current Rate</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">₦750 / $1</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Estimated Payout</p>
                    <p className="text-2xl font-black text-green-500">₦{(Number(redeemData.value) * 750).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => showPinModal()}
                disabled={!validateRedeem()}
                className="w-full py-8 rounded-[2rem] bg-sky-500 hover:bg-sky-600 text-lg font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
              >
                Submit Redeem Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- PIN MODAL COMPONENT --- */}
      <PinComponent 
        type="gift_card" 
        value={{ 
          action: buyModalOpen ? 'buy' : 'redeem',
          details: buyModalOpen ? buyData : redeemData 
        }} 
      />

      {/* --- TOAST & TX FEEDBACK --- */}
      <ToastComponent />
      {isTxModalOpen && (
        <TransactionModal 
          isSuccess={txStatus} 
          onClose={() => {
            setIsTxModalOpen(false);
            setTransactions(prev => [
              { 
                id: Math.random().toString(), 
                type: buyModalOpen ? 'Buy' : 'Redeem', 
                brand: buyModalOpen ? buyData.brand : redeemData.brand, 
                amount: `$${buyModalOpen ? buyData.amount * buyData.qty : redeemData.value}`, 
                status: 'Pending', 
                date: '2026-04-25',
                converted: false 
              },
              ...prev
            ]);
          }} 
          toastMessage={txMessage} 
        />
      )}
    </div>
  );
                    }
