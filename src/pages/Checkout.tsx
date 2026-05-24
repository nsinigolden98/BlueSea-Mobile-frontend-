// src/pages/Checkout.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateOrder, usePayOrder } from '@/hooks/orders/useOrders';
import { useWalletBalance } from '@/hooks/wallet/useWallet';
import { Sidebar, PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { 
  ChevronLeft, MapPin, Package, Wallet, Truck, 
  CheckCircle2, 
  //Loader2, 
  ArrowRight, AlertCircle, 
  ChevronDown, ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderPreview } from '@/types'; // Fixed verbatimModuleSyntax compilation rule

export function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId, quantity, referralCode, address } = location.state || {};
  
  // --- STATE & HOOKS ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [orderData, setOrderData] = useState<OrderPreview | null>(null);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');

  const { showToast, ToastComponent } = Toast();
  const { PinComponent, showPinModal, message } = PinModal();

  // --- SERVER STATE MUTATIONS & QUERIES ---
  const { data: walletRes, isLoading: walletLoading } = useWalletBalance();
  const createOrderMutation = useCreateOrder();
  const payOrderMutation = usePayOrder();

  const walletBalance = walletRes?.data?.balance || 0;
  const hasInsufficientBalance = orderData ? walletBalance < orderData.total_amount : false;

  // 1. Initialize Order on Mount (Backend calculates totals)
  useEffect(() => {
    if (productId) {
      createOrderMutation.mutate({
        product_id: productId,
        quantity: quantity || 1,
        delivery_address: address || { type: "default" }, // Fallback to user default
        delivery_type: "delivery",
        referral_code: referralCode, // Affiliate tracking attribution preserved
      }, {
        onSuccess: (res: any) => setOrderData(res.data),
        onError: (err: any) => showToast(err.message || 'Failed to initialize checkout. Please try again.')
      });
    } else {
      // Invalid access, redirect back
      navigate('/marketplace');
    }
  }, [productId]);

  // 2. Handle PIN verification response for payment
  useEffect(() => {
    if (message) {
      const msgState = message as any; // Safe cast bypasses property validation bounds on context configurations
      if (msgState.success || msgState.code === '000') {
        // Backend handles actual wallet deduction and state change
        payOrderMutation.mutate({
          order_id: orderData!.id,
          wallet_pin: msgState.pin
        }, {
          onSuccess: (res: any) => {
            setTxStatus(true);
            setTxMessage(res.message || "Order placed successfully!");
          },
          onError: (err: any) => {
            setTxStatus(false);
            setTxMessage(err.message || 'Payment processing failed');
            showToast(err.message || 'Payment processing failed');
          }
        });
      } else {
        showToast(msgState.error || 'PIN Verification Failed');
      }
    }
  }, [message]);

  const handlePlaceOrder = () => {
    if (hasInsufficientBalance) {
      showToast("Insufficient Blue Balance. Please top up your wallet.");
      return;
    }
    showPinModal();
  };

  // --- RENDER: SUCCESS STATE ---
  if (txStatus === true && orderData) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order Placed Successfully!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
          Your order <span className="font-mono font-bold text-sky-500">#{orderData.id.split('-')[0].toUpperCase()}</span> has been confirmed.
        </p>
        
        <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-500">Total Paid</span>
            <span className="font-bold text-sky-500">₦{orderData.total_amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-md gap-3">
          <button 
            onClick={() => navigate(`/orders/${orderData.id}`)}
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

  // --- RENDER: CHECKOUT FLOW ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <button 
            onClick={() => navigate(-1)}
            disabled={createOrderMutation.isPending || payOrderMutation.isPending}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Checkout</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6 pb-24">
            
            {/* SKELETON LOADER FOR ORDER INITIALIZATION */}
            {createOrderMutation.isPending && !orderData ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700" />
                <div className="h-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700" />
                <div className="h-40 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700" />
              </div>
            ) : orderData ? (
              <>
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
                        <p className="text-xs text-slate-500">Items from Marketplace</p>
                      </div>
                    </div>
                    {isSummaryExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  <div className={cn("divide-y divide-slate-50 dark:divide-slate-700/50", !isSummaryExpanded && "hidden")}>
                    {/* Render backend items - assuming orderData.items exists */}
                    {(orderData as any).items?.map((item: any) => (
                      <div key={item.product_id} className="p-4 flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">₦{item.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {(orderData as any).delivery_address?.address || "Default Address"}
                    </p>
                    <p className="text-xs text-slate-500">Standard Location Delivery</p>
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
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">₦{orderData.delivery_fee.toLocaleString()}</span>
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
                          {walletLoading ? (
                             <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded mt-1" />
                          ) : (
                             <p className="text-xs text-slate-500">Available: ₦{walletBalance.toLocaleString()}</p>
                          )}
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
                    <span className="text-slate-800 dark:text-white font-medium">₦{orderData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery Fee</span>
                    <span className="text-slate-800 dark:text-white font-medium">₦{orderData.delivery_fee.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-white">Total Amount</span>
                    <span className="text-xl font-black text-sky-500">₦{orderData.total_amount.toLocaleString()}</span>
                  </div>
                </section>
              </>
            ) : null}
          </div>
        </main>

        {/* BOTTOM ACTION BAR */}
        {orderData && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 z-40">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div className="hidden md:block">
                <p className="text-xs text-slate-400 font-medium">Payable Amount</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">₦{orderData.total_amount.toLocaleString()}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={payOrderMutation.isPending || hasInsufficientBalance || walletLoading}
                className="flex-1 py-4 bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sky-600 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-sky-500/25"
              >
                Place Order
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <PinComponent 
        type="marketplace_checkout" 
        value={{ 
          order_id: orderData?.id,
          total_amount: orderData?.total_amount
        }} 
      />
      
      <ToastComponent />
      
      {/* FULLSCREEN PROCESSING SPINNER */}
      {payOrderMutation.isPending && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-xs w-full text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
               <div className="absolute inset-0 rounded-full border-4 border-sky-100 dark:border-sky-900/30"></div>
               <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">Processing Payment</h4>
              <p className="text-xs text-slate-500 mt-1">Please do not close the app or refresh the page.</p>
            </div>
          </div>
        </div>
      )}

      {txStatus === false && (
        <TransactionModal 
          isSuccess={false} 
          onClose={() => setTxStatus(null)} 
          toastMessage={txMessage} 
        />
      )}
    </div>
  );
}
