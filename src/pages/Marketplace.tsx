import { useState, useEffect } from 'react';
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
  History,
  FilePlus,
  Coins
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
  { id: 'b1', category: 'Bulk', name: 'Premium Rice 50kg', price: 45000, sellerName: 'Alhaji & Sons', sellerId: 's1', stock: 12, condition: 'New', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', 'https://images.unsplash.com/photo-1591117207239-7ad59a057fd6?w=800&q=80'], description: 'Long grain parboiled rice, stone-free and high quality.', badge: 'Hot' },
  { id: 'b2', category: 'Bulk', name: 'Vegetable Oil 25L', price: 32000, sellerName: 'Uyo Food Mart', sellerId: 's2', stock: 5, condition: 'New', images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80'], description: 'Pure refined vegetable oil for all cooking purposes.', badge: 'Bulk' },
  { id: 'b3', category: 'Bulk', name: 'Carton of Indomie', price: 12500, sellerName: 'Alhaji & Sons', sellerId: 's1', stock: 50, condition: 'New', images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80'], description: 'Standard carton containing 40 packs of delicious noodles.', badge: 'New' },
  { id: 'e1', category: 'Electronics', name: 'iPhone 15 Pro Max', price: 1850000, sellerName: 'Gadget Hub', sellerId: 's3', stock: 2, condition: 'New', images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80', 'https://images.unsplash.com/photo-1696423602352-75d1653f5344?w=800&q=80'], description: 'Titanium design, A17 Pro chip, Pro camera system.', badge: 'Hot' },
  { id: 'e2', category: 'Electronics', name: 'MacBook Air M2', price: 1200000, sellerName: 'Elite Tech', sellerId: 's4', stock: 4, condition: 'New', images: ['https://images.unsplash.com/photo-1611186871348-b1ec696e5237?w=800&q=80'], description: 'Supercharged by M2, 13-inch Liquid Retina display.', badge: 'Sale' },
  { id: 'e3', category: 'Electronics', name: 'Sony WH-1000XM5', price: 450000, sellerName: 'Gadget Hub', sellerId: 's3', stock: 0, condition: 'New', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80'], description: 'Industry-leading noise cancellation headphones.', badge: 'Out' },
  { id: 's1', category: 'Shoes', name: 'Nike Air Jordan 1', price: 120000, sellerName: 'Sneaker Head', sellerId: 's5', stock: 8, condition: 'New', images: ['https://images.unsplash.com/photo-1584000302558-ce0ad2ee920e?w=800&q=80'], description: 'Iconic basketball sneakers in classic red and black.', badge: 'Hot' },
  { id: 's2', category: 'Shoes', name: 'Adidas Ultraboost', price: 95000, sellerName: 'Runners World', sellerId: 's6', stock: 15, condition: 'New', images: ['https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80'], description: 'Ultimate comfort and energy return for long distance running.', badge: 'New' },
  { id: 's3', category: 'Shoes', name: 'Formal Leather Shoes', price: 45000, sellerName: 'Uyo Footwear', sellerId: 's7', stock: 20, condition: 'New', images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80'], description: 'Handcrafted Italian leather shoes for professional look.', badge: 'Classic' },
  { id: 'm1', category: 'Makeup', name: 'Fenty Beauty Foundation', price: 42000, sellerName: 'Glamour Shop', sellerId: 's8', stock: 25, condition: 'New', images: ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&q=80'], description: 'Pro Filt\'r Soft Matte Longwear Foundation in 50 shades.', badge: 'Hot' },
  { id: 'm2', category: 'Makeup', name: 'Matte Liquid Lipstick', price: 8500, sellerName: 'Glamour Shop', sellerId: 's8', stock: 100, condition: 'New', images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80'], description: 'Non-drying, long-lasting matte finish liquid lipstick.', badge: 'Sale' },
  { id: 'm3', category: 'Makeup', name: 'Eyeshadow Palette', price: 15000, sellerName: 'Beauty Haven', sellerId: 's9', stock: 12, condition: 'New', images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80'], description: 'Professional palette with 12 highly pigmented shades.', badge: 'Trending' },
];

const POINTS_PROVIDERS = [
  { id: 'cod', name: 'COD Mobile', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80', color: 'bg-slate-800', packages: [{ id: 1, name: '80 CP', price: 900 }, { id: 2, name: '420 CP', price: 4500 }, { id: 3, name: '880 CP', price: 9000 }] },
  { id: 'freefire', name: 'Free Fire', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&q=80', color: 'bg-orange-500', packages: [{ id: 1, name: '100 Diamonds', price: 800 }, { id: 2, name: '310 Diamonds', price: 2400 }, { id: 3, name: '520 Diamonds', price: 4000 }] },
  { id: 'pubg', name: 'PUBG Mobile', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80', color: 'bg-yellow-600', packages: [{ id: 1, name: '60 UC', price: 1200 }, { id: 2, name: '325 UC', price: 6000 }, { id: 3, name: '660 UC', price: 11500 }] },
  { id: 'fortnite', name: 'Fortnite', image: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=400&q=80', color: 'bg-purple-600', packages: [{ id: 1, name: '1000 V-Bucks', price: 12000 }, { id: 2, name: '2800 V-Bucks', price: 30000 }, { id: 3, name: '5000 V-Bucks', price: 50000 }] },
  { id: 'acadiva', name: 'Acadiva', image: 'https://acadiva.xyz/favicon.ico', color: 'bg-blue-600', packages: [{ id: 1, name: 'Basic Plan', price: 2000 }, { id: 2, name: 'Premium Plan', price: 5000 }, { id: 3, name: 'Scholar Plan', price: 10000 }] },
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
  const [cartCount, setCartCount] = useState(0);

  const [selectedPointProvider, setSelectedPointProvider] = useState<typeof POINTS_PROVIDERS[0] | null>(null);
  const [pointPlayerId, setPointPlayerId] = useState('');
  const [selectedPointPackage, setSelectedPointPackage] = useState<number | null>(null);
  const [isPointLoading, setIsPointLoading] = useState(false);
  const [pointError, setPointError] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeProductSubCategory, setActiveProductSubCategory] = useState('All');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
      console.log(err)
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
      console.log(err)
      setVendorStatus(false);
    }
  };

  const isSoldOut = selectedEvent && selectedEvent.tickets_sold >= selectedEvent.total_tickets;
  const isEventEnded = selectedEvent && new Date(selectedEvent.event_date) < new Date();

  const handlePurchase = () => {
    if (!selectedEvent || isSoldOut || isEventEnded) return;
    if (!selectedEvent.is_free && !selectedTicketType) return;
    showPinModal();
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || selectedProduct.stock <= 0) return;
    
    setIsAddingToCart(true);
    
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
      createdAt: new Date().toISOString(),
      deliveryLocation: null // TODO: Set delivery location during checkout
    };

    console.log("Preparing Cart Item:", cartItem);

    setTimeout(() => {
        setIsAddingToCart(false);
        setCartCount(prev => prev + 1);
        showToast("Added to cart");
        setSelectedProduct(null);
    }, 800);
  };

  const filteredEvents = events.filter(event => 
    event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPoints = POINTS_PROVIDERS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeProductSubCategory === 'All' || p.category === activeProductSubCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isEventPassed = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const renderContent = () => {
    switch (activeCategory) {
      case 'Events':
        return selectedEvent ? renderEventDetails() : renderEvents();
      case 'Points':
        return selectedPointProvider ? renderPointDetails() : renderPoints();
      case 'Products':
        return selectedProduct ? renderProductDetails() : renderProducts();
      default:
        return renderComingSoon();
    }
  };

  const renderProducts = () => {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveProductSubCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeProductSubCategory === cat 
                  ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900" 
                  : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No products available</h3>
            <p className="text-slate-500">Check back later for new arrivals in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => {
                    setSelectedProduct(product);
                    setProductQuantity(1);
                    setCurrentImageIndex(0);
                }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  {product.badge && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold bg-sky-500 text-white shadow-lg">
                        {product.badge}
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] text-slate-400 line-clamp-1">{product.sellerName}</span>
                    <VerifiedBadge className="scale-75 origin-left" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-500 font-bold text-sm">₦{product.price.toLocaleString()}</span>
                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                    </div>
                  </div>
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
        <button 
          onClick={() => setSelectedProduct(null)}
          className="flex items-center gap-2 text-sky-500 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="aspect-square md:aspect-video relative bg-slate-100 dark:bg-slate-800">
            <img 
              src={selectedProduct.images[currentImageIndex]} 
              alt={selectedProduct.name} 
              className="w-full h-full object-cover" 
            />
            
            {selectedProduct.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === 0 ? selectedProduct.images.length - 1 : prev - 1);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => prev === selectedProduct.images.length - 1 ? 0 : prev + 1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {selectedProduct.images.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        currentImageIndex === i ? "bg-white w-4" : "bg-white/40"
                      )} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-500 text-[10px] font-bold uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{selectedProduct.condition}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                    {selectedProduct.name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Price per unit</p>
                <span className="text-2xl font-black text-sky-500">₦{selectedProduct.price.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-500 font-bold">
                    {selectedProduct.sellerName.charAt(0)}
                 </div>
                 <div>
                    <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{selectedProduct.sellerName}</h4>
                        <VerifiedBadge />
                    </div>
                    <p className="text-[10px] text-slate-500">Sold by Verified Seller</p>
                 </div>
               </div>
               <div className="text-right">
                    <div className="flex items-center gap-0.5 text-yellow-500 mb-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">4.8</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Location: Uyo</p>
               </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-white">Description</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Quantity</h4>
                        <p className={cn(
                            "text-xs mt-0.5",
                            selectedProduct.stock > 5 ? "text-slate-400" : "text-orange-500 font-medium"
                        )}>
                            {selectedProduct.stock > 0 ? `In Stock: ${selectedProduct.stock} left` : 'Out of Stock'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            disabled={productQuantity <= 1}
                            onClick={() => setProductQuantity(q => q - 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm disabled:opacity-50"
                        >
                            -
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{productQuantity}</span>
                        <button 
                            disabled={productQuantity >= selectedProduct.stock}
                            onClick={() => setProductQuantity(q => q + 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm disabled:opacity-50"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-dashed border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-500">₦{selectedProduct.price.toLocaleString()} × {productQuantity}</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">₦{(selectedProduct.price * productQuantity).toLocaleString()}</span>
                </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={selectedProduct.stock <= 0 || isAddingToCart}
              className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : selectedProduct.stock <= 0 ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
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
            onClick={() => {
                setSelectedPointProvider(provider);
                setSelectedPointPackage(null);
                setPointPlayerId('');
                setPointError('');
            }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className={cn("aspect-video relative overflow-hidden", provider.color)}>
               <img src={provider.image} alt={provider.name} className="w-full h-full object-cover mix-blend-overlay opacity-60" />
               <div className="absolute inset-0 flex items-center justify-center">
                   <img src={provider.image} alt={provider.name} className="w-16 h-16 rounded-2xl shadow-xl object-cover border-2 border-white/20" />
               </div>
               <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-medium bg-white/20 backdrop-blur-md text-white">
                Points
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1 text-sm md:text-base line-clamp-1">
                {provider.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Instant Delivery</p>
              <button className="w-full py-2 rounded-xl bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 transition-colors">
                Top Up
              </button>
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
        <button 
          onClick={() => setSelectedPointProvider(null)}
          className="flex items-center gap-2 text-sky-500 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Providers
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className={cn("aspect-[21/9] relative flex items-center justify-center", selectedPointProvider.color)}>
            <img src={selectedPointProvider.image} alt={selectedPointProvider.name} className="w-24 h-24 rounded-3xl border-4 border-white/20 shadow-2xl object-cover" />
          </div>
          
          <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {selectedPointProvider.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a package and enter your Player ID to proceed.</p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">Select Package</h3>
                <div className="grid grid-cols-1 gap-3">
                    {selectedPointProvider.packages.map((pkg) => (
                    <div 
                        key={pkg.id}
                        onClick={() => setSelectedPointPackage(pkg.id)}
                        className={cn(
                        'p-4 rounded-xl border-2 cursor-pointer transition-all',
                        selectedPointPackage === pkg.id
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                        )}
                    >
                        <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", selectedPointPackage === pkg.id ? "bg-sky-500" : "bg-slate-300")} />
                            <h4 className="font-medium text-slate-800 dark:text-white">{pkg.name}</h4>
                        </div>
                        <span className="font-bold text-sky-500">₦{pkg.price.toLocaleString()}</span>
                        </div>
                    </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" /> Player ID
                </label>
                <Input 
                    placeholder="Enter Player ID"
                    value={pointPlayerId}
                    onChange={(e) => setPointPlayerId(e.target.value)}
                    className={cn(pointError ? "border-red-500" : "")}
                />
                {pointError && <p className="text-xs text-red-500 mt-1">{pointError}</p>}
                <p className="text-[10px] text-slate-400 italic">Make sure your Player ID is correct. Transactions are irreversible.</p>
            </div>

            <button
              onClick={handlePointPurchase}
              disabled={!selectedPointPackage || !pointPlayerId || isPointLoading}
              className="w-full py-4 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPointLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                selectedPointPackage 
                  ? `Pay ₦${selectedPointProvider.packages.find(p => p.id === selectedPointPackage)?.price.toLocaleString()}`
                  : 'Select a Package'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };
  const handlePointPurchase = async () => {
    if (!pointPlayerId.trim()) {
      setPointError('Player ID is required');
      return;
    }
    setPointError('');
    setIsPointLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPointLoading(false);
    showPinModal();
  };

  const renderEvents = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No Events Found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery ? 'Try a different search term' : 'Check back soon for upcoming events!'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((event) => (
          <div 
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative">
              {getEventImage(event) ? (
                <img src={getEventImage(event)} alt={event.event_title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-sky-500 text-white">
                {event.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2 line-clamp-1">{event.event_title}</h3>
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{event.event_location}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {isEventPassed(event.event_date) ? (
                      <span className="text-slate-400 font-medium">Event Ended</span>
                    ) : event.tickets_sold >= event.total_tickets ? (
                      <span className="text-red-500 font-medium">Sold Out</span>
                    ) : (
                      `${event.tickets_sold}/${event.total_tickets} sold`
                    )}
                  </span>
                </div>
                <button className="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors">
                  {event.is_free ? 'Free' : 'View'}
                </button>
              </div>
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
        <button 
          onClick={() => setSelectedEvent(null)}
          className="flex items-center gap-2 text-sky-500 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative">
            {getEventImage(selectedEvent) ? (
              <img src={getEventImage(selectedEvent)} alt={selectedEvent.event_title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-16 h-16 text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-sky-500 text-white">{selectedEvent.category}</span>
              {selectedEvent.is_approved && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedEvent.event_title}</h2>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDate(selectedEvent.event_date)}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{selectedEvent.event_location}</span></div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3">About Event</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedEvent.event_description}</p>
            </div>

            {selectedEvent.ticket_types && selectedEvent.ticket_types.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Select Tickets</h3>
                <div className="space-y-3">
                  {selectedEvent.ticket_types.map((ticketType) => (
                    <div 
                      key={ticketType.id}
                      onClick={() => setSelectedTicketType(ticketType.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 cursor-pointer transition-all',
                        selectedTicketType === ticketType.id
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-white">{ticketType.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{ticketType.description || `${ticketType.quantity_available} available`}</p>
                        </div>
                        <span className="font-bold text-sky-500">{Number(ticketType.price) === 0 ? 'Free' : `₦${Number(ticketType.price).toLocaleString()}`}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTicketType && !selectedEvent.is_free && (
                  <div className="mt-4">
                    <label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">-</button>
                      <span className="text-xl font-bold text-slate-800 dark:text-white">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">+</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={isSoldOut || isEventEnded || (!selectedTicketType && !selectedEvent.is_free)}
              className="w-full py-4 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSoldOut ? 'Sold Out' : isEventEnded ? 'Event Ended' : selectedEvent.is_free ? 'Get Free Ticket' : selectedTicketType ? `Pay ₦${(Number(selectedEvent.ticket_types.find(t => t.id === selectedTicketType)?.price) * quantity).toLocaleString()}` : 'Select a Ticket'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderComingSoon = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {activeCategory === 'Products' ? <Package className="w-10 h-10 text-slate-400" /> : <Coins className="w-10 h-10 text-slate-400" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Coming Soon</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">The MarketPlace is being stocked with amazing products and events. Check back soon!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Market Place</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Buy Smarter & Cheaper</p>
            </div>
          </div>
          
          <div className="relative flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
              <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50">
                {!vendorStatus ? (
                  <>
                    <button onClick={() => { navigate('/vendor-verification'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium">
                      <Shield className="w-4 h-4 text-sky-500" /> Become Verified Seller
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate('/my-tickets'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium">
                      <Ticket className="w-4 h-4 text-sky-500" /> My Tickets
                    </button>
                    <button onClick={() => { navigate('/event-manager'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium">
                      <Plus className="w-4 h-4 text-sky-500" /> Create Event
                    </button>
                    <button onClick={() => { navigate('/scanner'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium">
                      <QrCode className="w-4 h-4 text-sky-500" /> Scan QR Code
                    </button>
                    <button onClick={() => { navigate('/post-product'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium">
                      <FilePlus className="w-4 h-4 text-sky-500" /> Post Product
                    </button>
                    <button onClick={() => { navigate('/history'); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium">
                      <History className="w-4 h-4 text-sky-500" /> History
                    </button>
                    {/* TODO: Post Product Page */}
                    {/* TODO: History Page */}
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input type="text" placeholder={`Search ${activeCategory.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 py-6 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800" />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedEvent(null);
                    setSelectedPointProvider(null);
                    setSelectedProduct(null);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'px-6 py-2.5 rounded-full text-sm font-bold transition-all',
                    activeCategory === category ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                  )}
                >
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
        ticket_type: selectedEvent?.ticket_types?.find(t => t.id === selectedTicketType)?.name || selectedPointProvider?.packages.find(p => p.id === selectedPointPackage)?.name || 'Product Purchase', 
        quantity: activeCategory === 'Products' ? productQuantity : quantity,
        player_id: pointPlayerId 
      }} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={txMessage} />
      )}
    </div>
  );
}
