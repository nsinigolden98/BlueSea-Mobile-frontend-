import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Ticket, 
  Loader2, 
  ChevronRight, 
  MoreHorizontal, 
  QrCode, 
  Shield, 
  Plus, 
  User, 
  CheckCircle2, 
  ShoppingCart,
  Star,
  ChevronLeft,
  Package,
  ChevronDown,
  History,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, ENDPOINTS, API_BASE, type MarketplaceEvent} from '@/types';

// --- UNIVERSAL COMPONENTS ---

const VerifiedBadge = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider", className)}>
    <CheckCircle2 className="w-3 h-3" />
    Verified
  </span>
);

// --- PRODUCT DATA DEFINITION ---

const PRODUCT_CATEGORIES = ['All', 'Bulk', 'Electronics', 'Shoes', 'Makeup'];

const PRODUCTS = [
  // Bulk
  { id: 'b1', category: 'Bulk', name: 'Premium Rice 50kg', price: 45000, sellerName: 'Alhaji & Sons', sellerId: 's1', stock: 12, condition: 'New', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80'], description: 'Long grain parboiled rice, stone-free and high quality.', badge: 'Hot', deliveryLocation: null },
  { id: 'b2', category: 'Bulk', name: 'Vegetable Oil 25L', price: 32000, sellerName: 'Uyo Food Mart', sellerId: 's2', stock: 5, condition: 'New', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80'], description: 'Pure refined vegetable oil for all cooking purposes.', badge: 'Bulk', deliveryLocation: null },
  { id: 'b3', category: 'Bulk', name: 'Carton of Indomie', price: 12500, sellerName: 'Alhaji & Sons', sellerId: 's1', stock: 50, condition: 'New', images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80'], description: 'Standard carton containing 40 packs of delicious noodles.', badge: 'New', deliveryLocation: null },
  // Electronics
  { id: 'e1', category: 'Electronics', name: 'iPhone 15 Pro Max', price: 1850000, sellerName: 'Gadget Hub', sellerId: 's3', stock: 2, condition: 'New', images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80'], description: 'Titanium design, A17 Pro chip, Pro camera system.', badge: 'Hot', deliveryLocation: null },
  { id: 'e2', category: 'Electronics', name: 'MacBook Air M2', price: 1200000, sellerName: 'Elite Tech', sellerId: 's4', stock: 4, condition: 'New', images: ['https://images.unsplash.com/photo-1611186871348-b1ec696e5237?w=800&q=80'], description: 'Supercharged by M2, 13-inch Liquid Retina display.', badge: 'Sale', deliveryLocation: null },
  { id: 'e3', category: 'Electronics', name: 'Sony WH-1000XM5', price: 450000, sellerName: 'Gadget Hub', sellerId: 's3', stock: 0, condition: 'New', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80'], description: 'Industry-leading noise cancellation headphones.', badge: 'Out', deliveryLocation: null },
  // Shoes
  { id: 's1', category: 'Shoes', name: 'Nike Air Jordan 1', price: 120000, sellerName: 'Sneaker Head', sellerId: 's5', stock: 8, condition: 'New', images: ['https://images.unsplash.com/photo-1584000302558-ce0ad2ee920e?w=800&q=80'], description: 'Iconic basketball sneakers in classic red and black.', badge: 'Hot', deliveryLocation: null },
  { id: 's2', category: 'Shoes', name: 'Adidas Ultraboost', price: 95000, sellerName: 'Runners World', sellerId: 's6', stock: 15, condition: 'New', images: ['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80'], description: 'Ultimate comfort and energy return for long distance running.', badge: 'New', deliveryLocation: null },
  // Makeup
  { id: 'm1', category: 'Makeup', name: 'Fenty Beauty Foundation', price: 42000, sellerName: 'Glamour Shop', sellerId: 's8', stock: 25, condition: 'New', images: ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80'], description: 'Pro Filt\'r Soft Matte Longwear Foundation in 50 shades.', badge: 'Hot', deliveryLocation: null },
];

const POINTS_PROVIDERS = [
  { id: 'cod', name: 'COD Mobile', image: 'https://i.ibb.co/VWVf6XN/cod-logo.png', color: 'bg-black', packages: [{ id: 1, name: '80 CP', price: 900 }, { id: 2, name: '420 CP', price: 4500 }, { id: 3, name: '880 CP', price: 9000 }] },
  { id: 'freefire', name: 'Free Fire', image: 'https://i.ibb.co/L5X8hRy/ff-logo.png', color: 'bg-orange-600', packages: [{ id: 1, name: '100 Diamonds', price: 800 }, { id: 2, name: '310 Diamonds', price: 2400 }, { id: 3, name: '520 Diamonds', price: 4000 }] },
  { id: 'pubg', name: 'PUBG Mobile', image: 'https://i.ibb.co/kXP0N4q/pubg-logo.png', color: 'bg-[#F7C600]', packages: [{ id: 1, name: '60 UC', price: 1200 }, { id: 2, name: '325 UC', price: 6000 }, { id: 3, name: '660 UC', price: 11500 }] },
  { id: 'fortnite', name: 'Fortnite', image: 'https://i.ibb.co/0V0f1rQ/fortnite-logo.png', color: 'bg-purple-700', packages: [{ id: 1, name: '1000 V-Bucks', price: 12000 }, { id: 2, name: '2800 V-Bucks', price: 30000 }, { id: 3, name: '5000 V-Bucks', price: 50000 }] },
  { id: 'acadiva', name: 'Acadiva', image: 'https://acadiva.xyz/favicon.png', color: 'bg-blue-600', packages: [{ id: 1, name: 'Basic Plan', price: 2000 }, { id: 2, name: 'Premium Plan', price: 5000 }, { id: 3, name: 'Scholar Plan', price: 10000 }] },
];

export function Marketplace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Events');
  const [events, setEvents] = useState<MarketplaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<MarketplaceEvent | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [vendorStatus, setVendorStatus] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState(false);
  const { PinComponent, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');

  // Points System Specific States
  const [selectedPointProvider, setSelectedPointProvider] = useState<typeof POINTS_PROVIDERS[0] | null>(null);
  const [pointPlayerId, setPointPlayerId] = useState('');
  const [selectedPointPackage, setSelectedPointPackage] = useState<number | null>(null);
  const [isPointLoading, setIsPointLoading] = useState(false);
  const [pointError, setPointError] = useState('');

  // --- PRODUCT SYSTEM STATES ---
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeProductSubCategory, setActiveProductSubCategory] = useState('All');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [priceFilter, setPriceFilter] = useState('Most Popular');
  const [cartCount, setCartCount] = useState(0);

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const getEventImage = (event: MarketplaceEvent) => {
    if (event.event_banner) return getImageUrl(event.event_banner);
    if (event.ticket_image) return getImageUrl(event.ticket_image);
    return '';
  };

  const categories = ['Events', 'Products', 'Points'];
  const priceFilters = ['Most Popular', 'Low Price', 'Mid Range', 'High Price'];

  useEffect(() => {
    if (!selectedEvent) {
      setSelectedTicketType('');
      setQuantity(1);
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchEvents();
    fetchVendorStatus();
  }, []);

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      if (message?.success || message?.code === '000') {
        showToast(message?.response_description || 'Transaction successful!');
        setTxMessage(message?.response_description || 'Transaction successful!');
        setTxStatus(true);
        setSelectedEvent(null);
        setSelectedPointProvider(null);
        setSelectedProduct(null);
      } else {
        showToast(message?.error || message?.response_description || 'Transaction failed');
        setTxMessage(message?.error || message?.response_description || 'Transaction failed');
        setTxStatus(false);
      }
    }
  }, [message]);

  const fetchEvents = async () => {
    try {
      const data = await getRequest(ENDPOINTS.marketplace_events);
      if (data) {
        setEvents(data);
        const eventId = searchParams.get('event');
        if (eventId) {
          const foundEvent = data.find((e: MarketplaceEvent) => e.id === eventId);
          if (foundEvent) {
            setSelectedEvent(foundEvent);
          }
        }
      }
    } catch (err) {
      console.log(err);
      showToast('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStatus = async () => {
    try {
      const response = await getRequest(ENDPOINTS.vendor_status);
      if (response?.vendor) {
        setVendorStatus(response.vendor.is_verified);
      } else {
        setVendorStatus(false);
      }
    } catch (err) {
      console.log(err);
      setVendorStatus(false);
    }
  };

  const isSoldOut = selectedEvent && selectedEvent.tickets_sold >= selectedEvent.total_tickets;
  const isEventEnded = selectedEvent && new Date(selectedEvent.event_date) < new Date();

  const handlePurchase = () => {
    if (!selectedEvent || isSoldOut || isEventEnded) return;
    if (!selectedEvent.is_free && !selectedTicketType) return;
    
    // TODO: Send to history system
    const historyPayload = {
      type: "points",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    console.log("Preparing History Payload:", historyPayload);

    showPinModal();
  };

  // --- PRODUCT LOGIC ---

  const handleAddToCart = async () => {
    if (!selectedProduct || selectedProduct.stock <= 0) return;
    
    setIsAddingToCart(true);
    
    // Preparation for history system
    const historyData = {
        type: "product",
        status: "pending",
        productId: selectedProduct.id,
        quantity: productQuantity,
        total: selectedProduct.price * productQuantity,
        createdAt: new Date().toISOString()
    };

    const cartItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: productQuantity,
      totalPrice: selectedProduct.price * productQuantity,
      sellerId: selectedProduct.sellerId,
      sellerName: selectedProduct.sellerName,
      image: selectedProduct.images[0],
      category: selectedProduct.category,
      deliveryLocation: null, // TODO: Capture user delivery location during checkout
      createdAt: new Date().toISOString()
    };

    // Simulated API latency
    setTimeout(() => {
        setIsAddingToCart(false);
        setCartCount(prev => prev + productQuantity);
        showToast("Added to cart");
        setSelectedProduct(null);
        console.log("Cart Update:", cartItem, historyData);
        // TODO: Send to history system
    }, 800);
  };

  // --- FILTER LOGIC ---

  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeProductSubCategory === 'All' || p.category === activeProductSubCategory;
      return matchesSearch && matchesCategory;
    });

    if (priceFilter === 'Low Price') {
        result = result.sort((a, b) => a.price - b.price);
    } else if (priceFilter === 'High Price') {
        result = result.sort((a, b) => b.price - a.price);
    } else if (priceFilter === 'Mid Range') {
        result = result.filter(p => p.price >= 50000 && p.price <= 500000);
    }

    return result;
  }, [searchQuery, activeProductSubCategory, priceFilter]);

  const filteredEvents = events.filter(event => 
    event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPoints = POINTS_PROVIDERS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isEventPassed = (eventDate: string) => new Date(eventDate) < new Date();

  // --- RENDERERS ---

  const renderContent = () => {
    switch (activeCategory) {
      case 'Events': return selectedEvent ? renderEventDetails() : renderEvents();
      case 'Points': return selectedPointProvider ? renderPointDetails() : renderPoints();
      case 'Products': return selectedProduct ? renderProductDetails() : renderProducts();
      default: return renderComingSoon();
    }
  };

  const renderProducts = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          {/* Category Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              className="flex items-center justify-between w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-500" />
                Category: {activeProductSubCategory}
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isCategoryExpanded && "rotate-180")} />
            </button>
            
            {isCategoryExpanded && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveProductSubCategory(cat);
                      setIsCategoryExpanded(false);
                    }}
                    className={cn(
                      "w-full px-5 py-3 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50",
                      activeProductSubCategory === cat ? "text-sky-500 font-bold bg-sky-50/50 dark:bg-sky-900/10" : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {priceFilters.map((f) => (
              <button
                key={f}
                onClick={() => setPriceFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all",
                  priceFilter === f 
                    ? "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/20" 
                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No products found</h3>
            <p className="text-slate-500">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => { setSelectedProduct(product); setProductQuantity(1); setCurrentImageIndex(0); }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {product.badge && <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold bg-sky-500 text-white shadow-lg">{product.badge}</div>}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1 mb-1"><span className="text-[10px] text-slate-400 line-clamp-1">{product.sellerName}</span><VerifiedBadge className="scale-75 origin-left" /></div>
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between"><span className="text-sky-500 font-bold text-sm">₦{product.price.toLocaleString()}</span><div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-colors"><Plus className="w-4 h-4" /></div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProductDetails = () => {
    if (!selectedProduct) return null;
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-sky-500 font-medium"><ChevronLeft className="w-4 h-4" />Back</button>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="aspect-square relative bg-slate-100 dark:bg-slate-800">
            <img src={selectedProduct.images[currentImageIndex]} alt={selectedProduct.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">{selectedProduct.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Delivery: Select at checkout</span>
              </div>
            </div>
          <div className="flex justify-between items-center py-4 border-y border-slate-100 dark:border-slate-800">
              <span className="text-2xl font-black text-sky-500">₦{selectedProduct.price.toLocaleString()}</span>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                  <button disabled={productQuantity <= 1} onClick={() => setProductQuantity(q => q - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm">-</button>
                  <span className="text-sm font-bold w-4 text-center">{productQuantity}</span>
                  <button disabled={productQuantity >= selectedProduct.stock} onClick={() => setProductQuantity(q => q + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm">+</button>
              </div>
            </div>
            <button onClick={handleAddToCart} disabled={selectedProduct.stock <= 0 || isAddingToCart} className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20">
              {isAddingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShoppingCart className="w-5 h-5" />Add to Cart</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPoints = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPoints.map((provider) => (
          <div 
            key={provider.id}
            onClick={() => { setSelectedPointProvider(provider); setSelectedPointPackage(null); setPointPlayerId(''); setPointError(''); }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className={cn("aspect-video relative flex items-center justify-center p-6", provider.color)}>
               <img src={provider.image} alt={provider.name} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1 text-sm">{provider.name}</h3>
              <p className="text-[10px] text-slate-500 mb-3">⚡ Instant Top-up</p>
              <button className="w-full py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors">Select</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPointDetails = () => {
    if (!selectedPointProvider) return null;
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedPointProvider(null)} className="flex items-center gap-2 text-sky-500 font-medium"><ChevronLeft className="w-4 h-4" />Back</button>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className={cn("aspect-video flex items-center justify-center p-8", selectedPointProvider.color)}>
            <img src={selectedPointProvider.image} alt={selectedPointProvider.name} className="w-full h-full object-contain" />
          </div>
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold dark:text-white">{selectedPointProvider.name}</h2>
            <div className="space-y-3">
                {selectedPointProvider.packages.map((pkg) => (
                    <div key={pkg.id} onClick={() => setSelectedPointPackage(pkg.id)} className={cn('p-4 rounded-xl border-2 cursor-pointer transition-all', selectedPointPackage === pkg.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-200 dark:border-slate-700')}>
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium dark:text-white">{pkg.name}</h4>
                            <span className="font-bold text-sky-500">₦{pkg.price.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            <Input placeholder="Enter Player ID" value={pointPlayerId} onChange={(e) => setPointPlayerId(e.target.value)} className={pointError ? "border-red-500" : ""} />
            <button onClick={handlePointPurchase} disabled={!selectedPointPackage || !pointPlayerId || isPointLoading} className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors">
              {isPointLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Topup'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handlePointPurchase = async () => {
    if (!pointPlayerId.trim()) { setPointError('Player ID is required'); return; }
    setIsPointLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsPointLoading(false);
    showPinModal();
  };

  const renderEvents = () => {
    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative">
              {getEventImage(event) ? <img src={getEventImage(event)} alt={event.event_title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Calendar className="w-12 h-12 text-slate-400" /></div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2 line-clamp-1">{event.event_title}</h3>
              <div className="space-y-2 text-xs text-slate-500"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(event.event_date)}</div><div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.event_location}</div></div>
              <button className="w-full mt-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold">View Ticket</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-sky-500 font-medium"><ChevronLeft className="w-4 h-4" />Back</button>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden p-6 space-y-4">
          <h2 className="text-2xl font-bold dark:text-white">{selectedEvent.event_title}</h2>
          <p className="text-sm text-slate-500">{selectedEvent.event_description}</p>
          <button onClick={handlePurchase} className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold">Purchase Ticket</button>
        </div>
      </div>
    );
  };

  const renderComingSoon = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Coming Soon</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">Market Place</h1><p className="text-[10px] text-slate-500">Buy Smarter & Cheaper</p></div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors">
              <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {!vendorStatus ? (
                    <>
                      <button onClick={() => { navigate('/vendor-verification'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                        <Shield className="w-4 h-4 text-sky-500" /> Become Verified Seller
                      </button>
                      <button onClick={() => { navigate('/my-tickets'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                        <Ticket className="w-4 h-4 text-sky-500" /> My Tickets
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { navigate('/event-manager'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                        <Plus className="w-4 h-4 text-sky-500" /> Create Event
                      </button>
                      <button onClick={() => { navigate('/scanner'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                        <QrCode className="w-4 h-4 text-sky-500" /> Scan QR Code
                      </button>
                      <button onClick={() => { navigate('/post-product'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                        {/* TODO: Implement Post Product Page */}
                        <Store className="w-4 h-4 text-sky-500" /> Post Product
                      </button>
                      <button onClick={() => { navigate('/history'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                        {/* TODO: Implement History Page */}
                        <History className="w-4 h-4 text-sky-500" /> History
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input type="text" placeholder={`Search ${activeCategory.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 py-6 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm" />
            </div>
            <div className="flex gap-2.5">
              {categories.map((category) => (
                <button key={category} onClick={() => { setActiveCategory(category); setSelectedEvent(null); setSelectedPointProvider(null); setSelectedProduct(null); setSearchQuery(''); }} className={cn('px-6 py-2.5 rounded-xl text-sm font-bold transition-all', activeCategory === category ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700')}>
                  {category}
                </button>
              ))}
            </div>
            {renderContent()}
          </div>
        </main>
      </div>

      <PinComponent type="marketplace" value={{ 
        event_id: selectedEvent?.id || selectedPointProvider?.id || selectedProduct?.id, 
        quantity: activeCategory === 'Products' ? productQuantity : quantity,
        player_id: pointPlayerId 
      }} />
      <ToastComponent />
      {isOpen && <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={txMessage} />}
    </div>
  );
        }
