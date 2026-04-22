import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { Search, Calendar, MapPin, Ticket, Loader2, ChevronRight, MoreHorizontal, QrCode, Shield, Plus, User, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, ENDPOINTS, API_BASE, type MarketplaceEvent} from '@/types';

// Points Data Definition
const POINTS_PROVIDERS = [
  { id: 'cod', name: 'COD Mobile', image: '🎮', color: 'bg-slate-800', packages: [{ id: 1, name: '80 CP', price: 900 }, { id: 2, name: '420 CP', price: 4500 }, { id: 3, name: '880 CP', price: 9000 }] },
  { id: 'freefire', name: 'Free Fire', image: '🔥', color: 'bg-orange-500', packages: [{ id: 1, name: '100 Diamonds', price: 800 }, { id: 2, name: '310 Diamonds', price: 2400 }, { id: 3, name: '520 Diamonds', price: 4000 }] },
  { id: 'pubg', name: 'PUBG Mobile', image: '🪖', color: 'bg-yellow-600', packages: [{ id: 1, name: '60 UC', price: 1200 }, { id: 2, name: '325 UC', price: 6000 }, { id: 3, name: '660 UC', price: 11500 }] },
  { id: 'fortnite', name: 'Fortnite', image: '⛏️', color: 'bg-purple-600', packages: [{ id: 1, name: '1000 V-Bucks', price: 12000 }, { id: 2, name: '2800 V-Bucks', price: 30000 }, { id: 3, name: '5000 V-Bucks', price: 50000 }] },
  { id: 'acadiva', name: 'Acadiva', image: '🎓', color: 'bg-blue-600', packages: [{ id: 1, name: 'Basic Plan', price: 2000 }, { id: 2, name: 'Premium Plan', price: 5000 }, { id: 3, name: 'Scholar Plan', price: 10000 }] },
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

  // Simulated Points Purchase
  const handlePointPurchase = async () => {
    if (!pointPlayerId.trim()) {
      setPointError('Player ID is required');
      return;
    }
    setPointError('');
    setIsPointLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reuse existing Pin Modal flow
    setIsPointLoading(false);
    showPinModal();
  };

  const filteredEvents = events.filter(event => 
    event.event_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.event_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      default:
        return renderComingSoon();
    }
  };

  const renderPoints = () => {
    const filteredPoints = POINTS_PROVIDERS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className={cn("aspect-video relative flex items-center justify-center text-4xl", provider.color)}>
               {provider.image}
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
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to Providers
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className={cn("aspect-[21/9] relative flex items-center justify-center text-6xl", selectedPointProvider.color)}>
            {selectedPointProvider.image}
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
          <ChevronRight className="w-4 h-4 rotate-180" />
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
        <span className="text-4xl">{activeCategory === 'Products' ? '🛍️' : '🪙'}</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Coming Soon</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">The MarketPlace is being stocked with amazing products and events. Check back soon!</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Market Place</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Buy Smarter & Cheaper</p>
            </div>
          </div>
          
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50">
                {!vendorStatus && (
                  <button onClick={() => { navigate('/vendor-verification'); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Verify Seller
                  </button>
                )}
                <button onClick={() => { navigate('/my-tickets'); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> My Tickets
                </button>
                {vendorStatus && (
                  <>
                    <button onClick={() => { navigate('/scanner'); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"><QrCode className="w-4 h-4" /> QR Scanner</button>
                    <button onClick={() => { navigate('/event-manager'); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Create Event</button>
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
              <Input type="text" placeholder={`Search ${activeCategory.toLowerCase()}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 py-6 rounded-xl" />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedEvent(null);
                    setSelectedPointProvider(null);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    activeCategory === category ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
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
        event_id: selectedEvent?.id || selectedPointProvider?.id, 
        ticket_type: selectedEvent?.ticket_types?.find(t => t.id === selectedTicketType)?.name || selectedPointProvider?.packages.find(p => p.id === selectedPointPackage)?.name || '', 
        quantity,
        player_id: pointPlayerId 
      }} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={txMessage} />
      )}
    </div>
  );
}
  
