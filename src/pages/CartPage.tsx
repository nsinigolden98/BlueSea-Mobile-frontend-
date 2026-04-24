import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ShoppingBag,
  ArrowRight,
  Package,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toast } from '@/components/ui-custom';

// --- TYPES ---

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
  image: string;
  category: string;
  createdAt: string;
  deliveryLocation: string | null;
}

// --- COMPONENTS ---

const VerifiedBadge = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider", className)}>
    <CheckCircle2 className="w-3 h-3" />
    Verified
  </span>
);

export default function CartPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  
  // --- STATE ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- CART LOGIC ---

  // Defined loadCart before useEffect so the compiler sees the reference clearly
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('market_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('market_cart', JSON.stringify(items));
    setCartItems(items);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          totalPrice: item.price * newQty
        };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    saveCart(updatedCart);
    showToast("Item removed from cart");
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  };

  // --- UI RENDERERS ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Package className="w-8 h-8 animate-bounce text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-white" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Cart</h1>
            <p className="text-xs text-slate-500">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4 pb-40">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Your cart is empty</h3>
                <p className="text-sm text-slate-500">Add items from the marketplace to see them here.</p>
              </div>
              <button 
                onClick={() => navigate('/marketplace')}
                className="px-8 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
              >
                Go Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.productId}
                className={cn(
                  "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300",
                  expandedItemId === item.productId ? "ring-2 ring-sky-500 ring-offset-2 dark:ring-offset-slate-900 shadow-xl" : "shadow-sm"
                )}
              >
                {/* COLLAPSED VIEW / CARD HEADER */}
                <div 
                  onClick={() => setExpandedItemId(expandedItemId === item.productId ? null : item.productId)}
                  className="p-3 flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-medium text-slate-400 truncate">{item.sellerName}</span>
                      <VerifiedBadge />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                      <span className="font-bold text-sky-500">₦{item.totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* EXPANDABLE SECTION */}
                <div className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  expandedItemId === item.productId ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}>
                  <div className="overflow-hidden">
                    <div className="p-4 border-t border-slate-50 dark:border-slate-700 space-y-4">
                      {/* Detailed Info */}
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-600">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-bold uppercase">
                            {item.category}
                          </span>
                          <h4 className="font-bold text-slate-800 dark:text-white">Product Details</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-3 h-3"><Info className="w-3 h-3" /></span>
                            Unit Price: ₦{item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1); }}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm disabled:opacity-30 transition-all active:scale-90"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-black w-4 text-center text-slate-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm transition-all active:scale-90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); removeItem(item.productId); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium text-sm transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* STICKY PRICE SUMMARY & CHECKOUT */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 pb-8 z-40">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-800 dark:text-white">₦{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery</span>
                <span className="text-green-500 font-medium">₦0</span>
              </div>
              <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-white">Total</span>
                <span className="text-2xl font-black text-sky-500">₦{calculateSubtotal().toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="w-full py-4 rounded-2xl bg-sky-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]"
              onClick={() => {
                showToast("Checkout logic coming soon");
              }}
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <ToastComponent />
    </div>
  );
                                      }
          
