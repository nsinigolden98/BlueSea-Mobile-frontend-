import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  
  ArrowRight,
  Package,
  
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


const VerifiedBadge = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider", className)}>
    <CheckCircle2 className="w-3 h-3" />
    Verified
  </span>
);

// CHANGED TO NAMED EXPORT TO FIX TS2305 ERROR
export function CartPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- MOCK DATA FOR VISUALIZATION (Total: ₦20,090) ---
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('market_cart');
      if (savedCart && JSON.parse(savedCart).length > 0) {
        setCartItems(JSON.parse(savedCart));
      } else {
        // Mock data to reach your 20,090 target
        const mockData: CartItem[] = [
          {
            productId: 'prod_1',
            name: 'Matte Liquid Lipstick (Duo Set)',
            price: 17000,
            quantity: 1,
            totalPrice: 17000,
            sellerId: 'sel_01',
            sellerName: 'Glamour Beauty',
            image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400',
            category: 'Cosmetics',
            createdAt: new Date().toISOString(),
            deliveryLocation: 'Uyo'
          },
          {
            productId: 'prod_2',
            name: 'Professional Beauty Blender',
            price: 590,
            quantity: 1,
            totalPrice: 590,
            sellerId: 'sel_02',
            sellerName: 'Vogue Hub',
            image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
            category: 'Accessories',
            createdAt: new Date().toISOString(),
            deliveryLocation: 'Uyo'
          }
        ];
        setCartItems(mockData);
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
        return { ...item, quantity: newQty, totalPrice: item.price * newQty };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const removeItem = (productId: string) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    saveCart(updatedCart);
    showToast("Item removed");
  };

  const calculateSubtotal = () => cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const deliveryFee = 2500; // Standard Logistics
  const totalAmount = calculateSubtotal() + (cartItems.length > 0 ? deliveryFee : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Package className="w-8 h-8 animate-bounce text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Cart</h1>
            <p className="text-xs text-slate-500">{cartItems.length} items</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto pb-40">
        <div className="max-w-3xl mx-auto space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item.productId}
              className={cn(
                "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-all",
                expandedItemId === item.productId && "ring-2 ring-sky-500"
              )}
              onClick={() => setExpandedItemId(expandedItemId === item.productId ? null : item.productId)}
            >
              <div className="p-3 flex items-center gap-4 cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-medium text-slate-400">{item.sellerName}</span>
                    <VerifiedBadge />
                  </div>
                  <h3 className="text-sm font-bold truncate">{item.name}</h3>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                    <span className="font-bold text-sky-500">₦{item.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {expandedItemId === item.productId && (
                <div className="p-4 border-t border-slate-50 dark:border-slate-700 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl">
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, -1); }} className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                      <span className="font-black text-sm">{item.quantity}</span>
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.productId, 1); }} className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeItem(item.productId); }} className="text-red-500 text-sm font-medium flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* SUMMARY PANEL */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 pb-8 z-40">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-bold">₦{calculateSubtotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Logistics (Uyo)</span>
            <span className="text-green-500 font-bold">₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
            <span className="font-bold">Total Payable</span>
            <span className="text-2xl font-black text-sky-500">₦{totalAmount.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-sky-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-transform"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <ToastComponent />
    </div>
  );
      }
  
