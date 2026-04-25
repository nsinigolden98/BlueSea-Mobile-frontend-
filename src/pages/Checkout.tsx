import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sidebar, 
  PinModal, 
  Toast, 
  TransactionModal 
} from '@/components/ui-custom';
import { 
  ChevronLeft, 
  MapPin, 
  Package, 
  Wallet, 
  Truck, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PRODUCTION-LEVEL CHECKOUT PAGE
 * Integration: Vercel Deployment Ready
 * Logic: Wallet-based payment with PIN confirmation
 */

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string;
  sellerName: string;
}

interface DeliveryInfo {
  country: string;
  state: string;
  address: string;
  landmark: string;
  postalCode: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE MANAGEMENT ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');
  const [orderId] = useState(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);

  // --- REUSED UI UTILS ---
  const { PinComponent, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();

  // --- MOCK DATA (In production, these come from Context/API) ---
  const [cartItems] = useState<CartItem[]>(
    location.state?.items || [
      {
        productId: 'b1',
        name: 'Premium Rice 50kg',
        price: 45000,
        quantity: 1,
        totalPrice: 45000,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
        sellerName: 'Alhaji & Sons'
      },
      {
        productId: 'm2',
        name: 'Matte Liquid Lipstick',
        price: 8500,
        quantity: 2,
        totalPrice: 17000,
        image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80',
        sellerName: 'Glamour Shop'
      }
    ]
  );

  const [deliveryInfo] = useState<DeliveryInfo>({
    country: 'Nigeria',
    state: 'Akwa Ibom',
    address: '124 Abak Road, Federal Housing Estate',
    landmark: 'Opposite Ibom Hall',
    postalCode: '520101'
  });

  const walletBalance = 150000; // Mock balance from Dashboard logic
  const deliveryFee = 2500;
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const total = subtotal + deliveryFee;
  const hasInsufficientBalance = walletBalance < total;

  // --- EFFECTS ---
  useEffect(() => {
    if (message) {
      if (message?.success || message?.code === '000') {
        processOrder();
      } else {
        showToast(message?.error || 'Transaction failed');
        setTxMessage(message?.error || 'PIN Verification Failed');
        setTxStatus(false);
      }
    }
  }, [message]);

  // --- LOGIC ---
  const processOrder = async () => {
    setIsProcessing(true);
    // Simulate Production API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsOrderSuccess(true);
    setTxStatus(true);
    setTxMessage("Order placed successfully!");
  };

  const handlePlaceOrder = () => {
    if (hasInsufficientBalance) {
      showToast("Insufficient Blue Balance");
      return;
    }
    showPinModal();
  };

  // --- RENDER HELPERS ---
  if (isOrderSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order Placed Successfully!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
          Your order <span className="font-mono font-bold text-sky-500">#{orderId}</span> has been confirmed and is being prepared.
        </p>
        
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-500">Items Count</span>
            <span className="font-bold text-slate-900 dark:text-white">{cartItems.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Total Paid</span>
            <span className="font-bold text-sky-500">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-md gap-3">
          <button 
            onClick={() => navigate('/history')}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Track Order
          </button>
          <button 
            onClick={() => navigate('/marketplace')}
            className="w-full py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Checkout</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6 pb-24">
            
            {/* SECTION 1: ORDER SUMMARY */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <button 
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="w-full p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-500">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 dark:text-white">Order Summary</h3>
                    <p className="text-xs text-slate-500">{cartItems.length} Items from Marketplace</p>
                  </div>
                </div>
                {isSummaryExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              <div className={cn("divide-y divide-slate-50 dark:divide-slate-700/50", !isSummaryExpanded && "hidden")}>
                {cartItems.map((item) => (
                  <div key={item.productId} className="p-4 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{item.sellerName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">₦{item.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {!isSummaryExpanded && (
                <div className="p-4 flex items-center gap-2 overflow-x-auto">
                  {cartItems.map((item) => (
                    <img key={item.productId} src={item.image} className="w-8 h-8 rounded-md object-cover border border-slate-100" alt="preview" />
                  ))}
                  <span className="text-xs text-slate-400 font-medium">+{cartItems.length} items</span>
                </div>
              )}
            </section>

            {/* SECTION 2: DELIVERY INFORMATION */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Delivery Address</h3>
                </div>
                <button className="text-xs font-bold text-sky-500 hover:underline">Change</button>
              </div>
              <div className="pl-13 space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{deliveryInfo.address}</p>
                <p className="text-xs text-slate-500">{deliveryInfo.landmark}, {deliveryInfo.state}, {deliveryInfo.country}</p>
                <p className="text-xs text-slate-400">Postal Code: {deliveryInfo.postalCode}</p>
              </div>
            </section>

            {/* SECTION 3: DELIVERY METHOD */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white">Shipping Method</h3>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-sky-100 dark:border-sky-900/30 bg-sky-50/30 dark:bg-sky-900/10">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Standard Delivery</h4>
                  <p className="text-xs text-slate-500">Estimated: 3 - 5 business days</p>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-white">₦{deliveryFee.toLocaleString()}</span>
              </div>
            </section>

            {/* SECTION 4: PAYMENT METHOD */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white">Payment Method</h3>
              </div>
              
              <div className={cn(
                "p-4 rounded-xl border-2 transition-all",
                hasInsufficientBalance 
                  ? "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30" 
                  : "border-sky-500 bg-sky-50 dark:bg-sky-900/10"
              )}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-4 h-4 rounded-full border-4", hasInsufficientBalance ? "border-red-500" : "border-sky-500")} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Blue Balance</h4>
                      <p className="text-xs text-slate-500">Available: ₦{walletBalance.toLocaleString()}</p>
                    </div>
                  </div>
                  {hasInsufficientBalance && (
                    <div className="flex items-center gap-1 text-red-500 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase">Low Funds</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 5: PRICE BREAKDOWN */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Price Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-800 dark:text-white font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery Fee</span>
                <span className="text-slate-800 dark:text-white font-medium">₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white">Total Amount</span>
                <span className="text-xl font-black text-sky-500">₦{total.toLocaleString()}</span>
              </div>
            </section>
          </div>
        </main>

        {/* BOTTOM ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:block">
              <p className="text-xs text-slate-400 font-medium">Payable Amount</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">₦{total.toLocaleString()}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing || hasInsufficientBalance}
              className="flex-1 py-4 bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sky-600 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-sky-500/25"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Place Order
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* REUSED MODAL COMPONENTS */}
      <PinComponent 
        type="marketplace_checkout" 
        value={{ 
          order_id: orderId,
          total_amount: total,
          items_count: cartItems.length 
        }} 
      />
      
      <ToastComponent />
      
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-xs w-full text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
               <div className="absolute inset-0 rounded-full border-4 border-sky-100 dark:border-sky-900/30"></div>
               <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Processing Order</h4>
              <p className="text-xs text-slate-500 mt-1">Please do not close the app or refresh the page.</p>
            </div>
          </div>
        </div>
      )}

      {txStatus !== null && !isOrderSuccess && (
        <TransactionModal 
          isSuccess={txStatus} 
          onClose={() => setTxStatus(null)} 
          toastMessage={txMessage} 
        />
      )}
    </div>
  );
}

        
