import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Ticket, 
  ChevronRight, 
  MoreHorizontal, 
  QrCode, 
  Shield, 
  Plus, 
  CheckCircle2, 
  ChevronLeft, 
  History, 
  Heart, 
  Share2, 
  Globe, 
  Building2, 
  Download, 
  Copy, 
  Code, 
  Sparkles, 
  Clock, 
  Tag,
  Check, 
  X, 
  Video, 
 // AlertCircle, 
  CalendarDays,
  Star,
  Menu,
  Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, ENDPOINTS, API_BASE } from '@/types';
import type { MarketplaceEvent } from '@/types';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

// --- AFFILIATE IMPORTS ---
import { 
  getAffiliateStatus, 
  getOrGenerateAffiliateId, 
  setAffiliateTracking, 
  getAffiliateTracking,
  getAffiliateProfile,
  toggleSaveAffiliateEventId,
  getSavedAffiliateEventIds
} from '@/utils/affiliateStorage';
import { generateMarketingAsset } from '@/utils/canvasGenerator';

// --- CATEGORIES CONSTANT ---
const EVENT_CATEGORIES = [
  'Music', 'Comedy', 'Conference', 'Technology', 'Business', 
  'Church', 'Seminar', 'Workshop', 'Festival', 'Sports', 
  'Education', 'Fashion', 'Networking', 'Health', 'Charity', 
  'Government', 'Entertainment'
] as const;

// --- EXTENDED TYPES FOR BLUETICKETS ---
interface ExtendedTicketType {
  id: string;
  name: string;
  price: number | string;
  quantity_available: number;
  description?: string;
  benefits?: string[];
  is_refundable?: boolean;
  is_transferable?: boolean;
}

interface ExtendedEvent extends MarketplaceEvent {
  organizer_name?: string;
  organizer_avatar?: string;
  organizer_hosted_count?: number;
  organizer_followers?: string;
  organizer_rating?: number;
  attendance_mode?: 'online' | 'physical' | 'hybrid';
  venue_name?: string;
  city?: string;
  tags?: string[];
  gallery?: string[];
  affiliate_enabled?: boolean;
  affiliate_rate?: string;
  meeting_platform?: string;
  join_instructions?: string;
  timezone?: string;
  internet_req?: string;
  parking_info?: string;
  arrival_time?: string;
  dress_code?: string;
}

// --- UNIVERSAL COMPONENTS ---
const VerifiedBadge = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider", className)}>
    <CheckCircle2 className="w-3 h-3" />
    Verified
  </span>
);

// --- DEBOUNCE HOOK ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function Marketplace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { PinComponent, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();

  // References
  const mainViewportRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- GLOBAL UI STATE ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showMenu, setShowMenu] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');
  
  // Interactive UI States
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [followedOrganizers, setFollowedOrganizers] = useState<Record<string, boolean>>({});
  const [shareModalEvent, setShareModalEvent] = useState<ExtendedEvent | null>(null);
  const [activeShareTab, setActiveShareTab] = useState<'link' | 'poster' | 'square' | 'banner' | 'embed' | 'affiliate'>('link');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // --- AFFILIATE SYSTEM STATES ---
  const [affiliateStatus, setAffiliateStatusState] = useState<string>('unverified');
  const [affiliateId, setAffiliateId] = useState<string>('');
  const [savedAffiliateEvents, setSavedAffiliateEvents] = useState<string[]>([]);

  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND INTEGRATION
  AUTOMATIC REFERRAL TRACKING
  ==============================
  */
  useEffect(() => {
    // Read affiliate status and ID
    const currentStatus = getAffiliateStatus();
    const currentAffId = getOrGenerateAffiliateId();
    setAffiliateStatusState(currentStatus);
    setAffiliateId(currentAffId);
    setSavedAffiliateEvents(getSavedAffiliateEventIds());

    // Auto-detect referral link param "?affiliate=AFF001" or "?ref=..."
    const referralParam = searchParams.get('affiliate') || searchParams.get('ref');
    const eventParam = searchParams.get('event');

    if (referralParam) {
      const myProfile = getAffiliateProfile();
      // Self-Referral Protection: Do not attach if affiliate ID belongs to logged in user
      if (myProfile?.affiliateId === referralParam || currentAffId === referralParam) {
        console.log('Self-referral link detected. Referral tracking ignored.');
      } else {
        setAffiliateTracking({
          affiliate_id: referralParam,
          event_id: eventParam || undefined,
          timestamp: Date.now()
        });
        console.log(`Referral link tracked for Affiliate ID: ${referralParam}`);
      }
    }
  }, [searchParams]);

  // Click Outside Listener for Header Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Event System
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEvent | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAttendanceMode, setSelectedAttendanceMode] = useState<'online' | 'physical'>('physical');

  useEffect(() => {
    if (mainViewportRef.current) {
      mainViewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedEvent) {
      setSelectedTicketType('');
      setQuantity(1);
    } else {
      const mode = selectedEvent.attendance_mode || 'physical';
      if (mode === 'online') setSelectedAttendanceMode('online');
      else setSelectedAttendanceMode('physical');
    }
  }, [selectedEvent]);

  useEffect(() => {
    fetchEvents();
    fetchVendorStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getRequest(ENDPOINTS.marketplace_events);
      if (data) {
        setEvents(data);
        const eventId = searchParams.get('event');
        if (eventId) {
          const foundEvent = data.find((e: ExtendedEvent) => e.id === eventId);
          if (foundEvent) setSelectedEvent(foundEvent);
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
      setVendorStatus(response?.vendor?.is_verified || false);
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
    
    // Attach affiliate tracking payload if present
    const trackingData = getAffiliateTracking();
    if (trackingData && trackingData.affiliate_id) {
      console.log(`Attaching Affiliate Referral ${trackingData.affiliate_id} to checkout payload.`);
    }

    showPinModal();
  };

  const now = useMemo(() => new Date(), []);

  const activeEvents = useMemo(() => {
    return events.filter(e => new Date(e.event_date) >= now);
  }, [events, now]);

  const pastEvents = useMemo(() => {
    return events.filter(e => new Date(e.event_date) < now);
  }, [events, now]);

  const filteredEvents = useMemo(() => {
    return activeEvents.filter(event => {
      const query = debouncedSearch.toLowerCase().trim();
      const matchesCategory = activeCategory === 'All' || event.category.toLowerCase() === activeCategory.toLowerCase();

      if (!query) return matchesCategory;

      const titleMatch = event.event_title.toLowerCase().includes(query);
      const catMatch = event.category.toLowerCase().includes(query);
      const organizerMatch = (event.organizer_name || 'BlueTickets Organizer').toLowerCase().includes(query);
      const locationMatch = event.event_location.toLowerCase().includes(query);
      const venueMatch = (event.venue_name || '').toLowerCase().includes(query);
      const cityMatch = (event.city || '').toLowerCase().includes(query);
      const tagsMatch = event.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
      const modeMatch = (event.attendance_mode || 'physical').toLowerCase().includes(query);

      return matchesCategory && (titleMatch || catMatch || organizerMatch || locationMatch || venueMatch || cityMatch || tagsMatch || modeMatch);
    });
  }, [activeEvents, debouncedSearch, activeCategory]);

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const getEventImage = (event: MarketplaceEvent) => {
    if (event.event_banner) return getImageUrl(event.event_banner);
    if (event.ticket_image) return getImageUrl(event.ticket_image);
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStartingPrice = (event: ExtendedEvent) => {
    if (event.is_free) return 'Free';
    if (!event.ticket_types || event.ticket_types.length === 0) return '₦0';
    const prices = event.ticket_types.map(t => Number(t.price));
    const minPrice = Math.min(...prices);
    return minPrice === 0 ? 'Free' : `₦${minPrice.toLocaleString()}`;
  };

  const toggleFavorite = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => ({ ...prev, [eventId]: !prev[eventId] }));
    showToast(favorites[eventId] ? 'Removed from saved events' : 'Saved to favorites!');
  };

  const toggleFollowOrganizer = (organizerName: string) => {
    setFollowedOrganizers(prev => ({ ...prev, [organizerName]: !prev[organizerName] }));
    showToast(followedOrganizers[organizerName] ? `Unfollowed ${organizerName}` : `Following ${organizerName}`);
  };

  const toggleSaveForAffiliatePromotion = (eventId: string) => {
    const isNowSaved = toggleSaveAffiliateEventId(eventId);
    setSavedAffiliateEvents(getSavedAffiliateEventIds());
    showToast(isNowSaved ? 'Saved for affiliate promotion!' : 'Removed from saved promotion events');
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedType(null), 2000);
  };

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      const msgState = message as any;
      if (msgState?.success || msgState?.code === '000') {
        showToast(msgState?.response_description || 'Transaction successful!');
        setTxMessage(msgState?.response_description || 'Transaction successful!');
        setTxStatus(true);
        setSelectedEvent(null);
      } else {
        showToast(msgState?.error || msgState?.response_description || 'Transaction failed');
        setTxMessage(msgState?.error || msgState?.response_description || 'Transaction failed');
        setTxStatus(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const featuredEvent = useMemo(() => activeEvents[0] || events[0] || null, [activeEvents, events]);

  const collections = useMemo(() => {
    return {
      trending: activeEvents.filter(e => e.tickets_sold > 0),
      nearYou: activeEvents.filter(e => e.event_location || e.venue_name),
      upcoming: [...activeEvents].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
      online: activeEvents.filter(e => e.attendance_mode === 'online' || e.attendance_mode === 'hybrid'),
      physical: activeEvents.filter(e => e.attendance_mode === 'physical' || !e.attendance_mode || e.attendance_mode === 'hybrid'),
      hybrid: activeEvents.filter(e => e.attendance_mode === 'hybrid'),
      free: activeEvents.filter(e => e.is_free || e.ticket_types?.some(t => Number(t.price) === 0)),
      recentlyAdded: [...activeEvents].reverse(),
      endingSoon: activeEvents.filter(e => {
        const diffDays = (new Date(e.event_date).getTime() - now.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }),
      past: pastEvents
    };
  }, [activeEvents, pastEvents, now]);

  const renderHeroSection = () => {
    if (!featuredEvent) return null;
    return (
      <div className="relative rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="h-48 sm:h-56 md:h-60 relative w-full overflow-hidden">
          <img 
            src={getEventImage(featuredEvent)} 
            alt={featuredEvent.event_title} 
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-sky-500/90 text-white backdrop-blur-md shadow-md">
                Featured Event
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-white/20 text-white backdrop-blur-md hidden sm:inline-block">
                {featuredEvent.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => toggleFavorite(featuredEvent.id, e)}
                className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Heart className={cn("w-3.5 h-3.5", favorites[featuredEvent.id] && "fill-red-500 text-red-500")} />
              </button>
              <button 
                onClick={() => setShareModalEvent(featuredEvent)}
                className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {featuredEvent.organizer_name || 'BlueTickets Organizer'}
              </span>
              <VerifiedBadge />
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight line-clamp-1">
              {featuredEvent.event_title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-300">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-sky-400" /> {formatDate(featuredEvent.event_date)}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-sky-400" /> {featuredEvent.event_location}</span>
            </div>

            <div className="pt-1 flex items-center justify-between gap-4">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Starting From</span>
                <span className="text-base sm:text-lg md:text-xl font-black text-sky-400">{getStartingPrice(featuredEvent)}</span>
              </div>

              <button 
                onClick={() => setSelectedEvent(featuredEvent)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-all shadow-md shadow-sky-500/25 flex items-center gap-1.5"
              >
                Quick Buy <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => setActiveCategory('All')}
        className={cn(
          "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0",
          activeCategory === 'All' 
            ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md" 
            : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"
        )}
      >
        All Categories
      </button>
      {EVENT_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0",
            activeCategory === cat 
              ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20" 
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );

  const renderEventCard = (event: ExtendedEvent) => (
    <div 
      key={event.id} 
      onClick={() => setSelectedEvent(event)} 
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full w-full"
    >
      <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0">
        <img 
          src={getEventImage(event)} 
          alt={event.event_title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3 h-3 text-sky-400" />
            {event.category}
          </span>
          <div className="flex items-center gap-1.5">
            {affiliateStatus === 'verified' && (
              <button 
                onClick={(e) => { e.stopPropagation(); toggleSaveForAffiliatePromotion(event.id); }}
                className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
                title="Save for Affiliate Promotion"
              >
                <Bookmark className={cn("w-3.5 h-3.5", savedAffiliateEvents.includes(event.id) && "fill-sky-400 text-sky-400")} />
              </button>
            )}
            <button 
              onClick={(e) => toggleFavorite(event.id, e)}
              className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
            >
              <Heart className={cn("w-3.5 h-3.5", favorites[event.id] && "fill-red-500 text-red-500")} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShareModalEvent(event); }}
              className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1 font-medium text-[11px] bg-slate-900/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {event.attendance_mode === 'online' ? <Video className="w-3 h-3 text-sky-400" /> : <Building2 className="w-3 h-3 text-sky-400" />}
            <span className="capitalize">{event.attendance_mode || 'Physical'}</span>
          </span>
          {event.is_approved && <VerifiedBadge />}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1.5">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <span>By {event.organizer_name || 'BlueTickets Host'}</span>
          </p>
          <h3 className="font-bold text-slate-800 dark:text-white text-base line-clamp-1 group-hover:text-sky-500 transition-colors">
            {event.event_title}
          </h3>
          <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="line-clamp-1">{event.event_location}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Starting at</span>
            <span className="text-base font-bold text-sky-500">{getStartingPrice(event)}</span>
          </div>

          <button className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1">
            Details
          </button>
        </div>
      </div>
    </div>
  );

  const renderEventCollection = (title: string, items: ExtendedEvent[]) => {
    if (!items || items.length === 0) return null;

    const isSingle = items.length === 1;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
              {items.length}
            </span>
          </h3>
        </div>

        {isSingle ? (
          <div className="flex justify-center max-w-md mx-auto w-full">
            <div className="w-full">
              {renderEventCard(items[0])}
            </div>
          </div>
        ) : (
          <div className="flex items-stretch gap-4 overflow-x-auto max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth pb-3 pt-1 -mx-4 px-4 md:mx-0 md:px-0">
            {items.map((event) => (
              <div 
                key={event.id} 
                className="snap-start shrink-0 w-[84vw] sm:w-[320px] md:w-[340px] flex flex-col"
              >
                {renderEventCard(event)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEvents = () => {
    if (loading) {
      return (
        <div className="flex items-stretch gap-4 overflow-x-auto max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden pb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shrink-0 w-[84vw] sm:w-[320px] animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
              <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    const isFilteredState = debouncedSearch !== '' || activeCategory !== 'All';

    return (
      <div className="space-y-6">
        {!isFilteredState && renderHeroSection()}
        {renderCategories()}

        {isFilteredState ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Showing {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''} {activeCategory !== 'All' ? `in "${activeCategory}"` : ''}
              </p>
              <button 
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="text-xs font-bold text-sky-500 hover:underline"
              >
                Clear Filters
              </button>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Events Found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                  Try broadening your search criteria or selecting a different category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((event) => renderEventCard(event))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {renderEventCollection('Trending Events', collections.trending)}
            {renderEventCollection('Upcoming Events', collections.upcoming)}
            {renderEventCollection('Near You', collections.nearYou)}
            {renderEventCollection('Online Events', collections.online)}
            {renderEventCollection('Physical Events', collections.physical)}
            {renderEventCollection('Hybrid Events', collections.hybrid)}
            {renderEventCollection('Free Events', collections.free)}
            {renderEventCollection('Recently Added', collections.recentlyAdded)}
            {renderEventCollection('Ending Soon', collections.endingSoon)}
            {renderEventCollection('Past Events', collections.past)}
          </div>
        )}
      </div>
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    const ticketTypes: ExtendedTicketType[] = selectedEvent.ticket_types?.length ? selectedEvent.ticket_types : [
      {
        id: 'standard',
        name: selectedEvent.is_free ? 'Free Pass' : 'General Admission',
        price: selectedEvent.is_free ? 0 : 5000,
        quantity_available: selectedEvent.total_tickets - selectedEvent.tickets_sold,
        benefits: ['Full Event Access', 'Digital Ticket', 'Standard Support'],
        is_refundable: false,
        is_transferable: true
      }
    ];

    const currentTicket = ticketTypes.find(t => t.id === selectedTicketType);
    const unitPrice = currentTicket ? Number(currentTicket.price) : 0;
    const totalPrice = unitPrice * quantity;
    const isOnlineMode = selectedAttendanceMode === 'online';

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedEvent(null)} 
          className="flex items-center gap-2 text-sky-500 font-bold text-sm hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Discover
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="aspect-[16/9] md:aspect-[21/9] relative bg-slate-900">
            <img 
              src={getEventImage(selectedEvent)} 
              alt={selectedEvent.event_title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button 
                onClick={(e) => toggleFavorite(selectedEvent.id, e)}
                className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Heart className={cn("w-5 h-5", favorites[selectedEvent.id] && "fill-red-500 text-red-500")} />
              </button>
              <button 
                onClick={() => setShareModalEvent(selectedEvent)}
                className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500 text-white uppercase tracking-wider">
                  {selectedEvent.category}
                </span>
                {selectedEvent.is_approved && <VerifiedBadge />}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white leading-tight">
                {selectedEvent.event_title}
              </h1>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-500 font-bold flex items-center justify-center text-lg border border-sky-500/20">
                  {selectedEvent.organizer_name ? selectedEvent.organizer_name.charAt(0) : 'B'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">
                      {selectedEvent.organizer_name || 'BlueTickets Organizer'}
                    </h4>
                    <VerifiedBadge />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{selectedEvent.organizer_hosted_count || 12} Events</span>
                    <span>•</span>
                    <span>{selectedEvent.organizer_followers || '1.2k'} Followers</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                      <Star className="w-3 h-3 fill-current" /> {selectedEvent.organizer_rating || 4.9}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleFollowOrganizer(selectedEvent.organizer_name || 'BlueTickets Organizer')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    followedOrganizers[selectedEvent.organizer_name || 'BlueTickets Organizer']
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
                      : "bg-sky-500 text-white hover:bg-sky-600"
                  )}
                >
                  {followedOrganizers[selectedEvent.organizer_name || 'BlueTickets Organizer'] ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Clock className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase">Date & Time</h5>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                    {formatDate(selectedEvent.event_date)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatTime(selectedEvent.event_date)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase">Venue & Location</h5>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                    {selectedEvent.venue_name || 'Main Event Center'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedEvent.event_location}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Attendance Mode</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={selectedEvent.attendance_mode === 'online'}
                  onClick={() => setSelectedAttendanceMode('physical')}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3",
                    selectedAttendanceMode === 'physical'
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/20"
                      : "border-slate-200 dark:border-slate-800 opacity-60"
                  )}
                >
                  <Building2 className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Attend Physically</p>
                    <p className="text-[10px] text-slate-500">In-person experience</p>
                  </div>
                </button>

                <button
                  disabled={selectedEvent.attendance_mode === 'physical'}
                  onClick={() => setSelectedAttendanceMode('online')}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3",
                    selectedAttendanceMode === 'online'
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/20"
                      : "border-slate-200 dark:border-slate-800 opacity-60"
                  )}
                >
                  <Globe className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Attend Online</p>
                    <p className="text-[10px] text-slate-500">Stream from anywhere</p>
                  </div>
                </button>
              </div>

              {isOnlineMode ? (
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Meeting Platform:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.meeting_platform || 'Zoom HD Live'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Timezone:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.timezone || 'GMT+1 (West Africa Standard Time)'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Internet Requirement:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.internet_req || '10 Mbps Stable Connection'}</span></div>
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 pt-2 border-t border-sky-200 dark:border-sky-900">
                    * Join link and calendar invite will be emailed after ticket confirmation.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Parking:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.parking_info || 'Free On-site VIP Parking'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Arrival Time:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.arrival_time || '30 Minutes before start'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Dress Code:</span> <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.dress_code || 'Smart Casual'}</span></div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">About Event</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedEvent.event_description || 'No detailed description provided for this event.'}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Select Ticket Type</h3>
              <div className="space-y-3">
                {ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketType(ticket.id)}
                    className={cn(
                      'p-4 rounded-2xl border-2 cursor-pointer transition-all',
                      selectedTicketType === ticket.id
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-900/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-sky-300'
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{ticket.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{ticket.description || `${ticket.quantity_available} tickets remaining`}</p>
                      </div>
                      <span className="text-lg font-black text-sky-500">
                        {Number(ticket.price) === 0 ? 'Free' : `₦${Number(ticket.price).toLocaleString()}`}
                      </span>
                    </div>

                    {ticket.benefits && ticket.benefits.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                        {ticket.benefits.map((b, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" /> {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Buying for a group?</h4>
                <p className="text-xs text-slate-500">Adjust quantity for bulk ticket purchase</p>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                >
                  -
                </button>
                <span className="text-sm font-bold w-4 text-center text-slate-800 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount</span>
                <span className="text-2xl font-black text-sky-500">
                  {totalPrice === 0 ? 'Free' : `₦${totalPrice.toLocaleString()}`}
                </span>
              </div>

              <button 
                onClick={handlePurchase} 
                disabled={isSoldOut || isEventEnded || (!selectedTicketType && !selectedEvent.is_free)} 
                className="flex-1 max-w-xs py-4 rounded-2xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {isSoldOut ? 'Sold Out' : isEventEnded ? 'Event Ended' : selectedEvent.is_free ? 'Get Free Ticket' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight">BlueTickets</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Discover experiences worth attending</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Affiliate Center Direct Navigation Link */}
            <button 
              onClick={() => navigate('/affiliate')}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-bold transition-colors"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              Affiliate Center
            </button>

            {!vendorStatus ? (
              <button 
                onClick={() => navigate('/vendor-verification')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-colors"
              >
                <Shield className="w-4 h-4" />
                Become Organizer
              </button>
            ) : (
              <button 
                onClick={() => navigate('/event-manager')}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 text-xs font-bold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            )}

            <button 
              onClick={() => navigate('/my-tickets')}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              <Ticket className="w-4 h-4 text-sky-500" />
              My Tickets
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu((prev) => !prev)} 
                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs"
                aria-label="Toggle Header Navigation Menu"
              >
                <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation Menu</p>
                  </div>

                  <button 
                    onClick={() => { navigate('/affiliate'); setShowMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-sky-500" /> 
                    Affiliate Center
                  </button>

                  {!vendorStatus ? (
                    <button 
                      onClick={() => { navigate('/vendor-verification'); setShowMenu(false); }} 
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-sky-500" /> 
                      Become Verified Organizer
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => { navigate('/event-manager'); setShowMenu(false); }} 
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-sky-500" /> 
                        Create Event
                      </button>
                      <button 
                        onClick={() => { navigate('/scanner'); setShowMenu(false); }} 
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                      >
                        <QrCode className="w-4 h-4 text-sky-500" /> 
                        Ticket Scanner
                      </button>
                    </>
                  )}

                  <button 
                    onClick={() => { navigate('/my-tickets'); setShowMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-sky-500" /> 
                    My Tickets
                  </button>

                  <button 
                    onClick={() => { navigate('/history'); setShowMenu(false); }} 
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:text-sky-600 flex items-center gap-2.5 transition-colors"
                  >
                    <History className="w-4 h-4 text-sky-500" /> 
                    Transaction History
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main 
          ref={mainViewportRef} 
          className="flex-1 p-4 md:p-6 overflow-y-auto max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden z-10"
        >
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search events by title, organizer, city, location..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-12 py-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm" 
              />
            </div>

            {selectedEvent ? renderEventDetails() : renderEvents()}
          </div>
        </main>

        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900">
          <MobileBottomNavigation />
        </div>
      </div>

      {/* SHARE MODAL WITH AFFILIATE VERIFICATION CHECK & CANVAS GENERATION */}
      {shareModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl md:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-500" /> Share Event
              </h3>
              <button onClick={() => setShareModalEvent(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden pb-2">
              {[
                { id: 'link', label: 'Share Link', icon: Share2, verifiedOnly: false },
                { id: 'embed', label: 'Embed Code', icon: Code, verifiedOnly: false },
                { id: 'affiliate', label: 'Affiliate Link', icon: Sparkles, verifiedOnly: true },
                { id: 'poster', label: 'Portrait Poster', icon: Download, verifiedOnly: true },
                { id: 'square', label: 'Square Post', icon: Download, verifiedOnly: true },
                { id: 'banner', label: 'Landscape Banner', icon: Download, verifiedOnly: true },
              ]
              .filter(tab => !tab.verifiedOnly || affiliateStatus === 'verified')
              .map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShareTab(tab.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all",
                      activeShareTab === tab.id
                        ? "bg-sky-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeShareTab === 'link' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Copy standard event link to share with attendees.</p>
                <div className="flex gap-2">
                  <Input readOnly value={`${window.location.origin}/marketplace?event=${shareModalEvent.id}`} className="text-xs" />
                  <button 
                    onClick={() => handleCopy(`${window.location.origin}/marketplace?event=${shareModalEvent.id}`, 'link')}
                    className="px-4 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0"
                  >
                    {copiedType === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy Link
                  </button>
                </div>
              </div>
            )}

            {activeShareTab === 'embed' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Paste this HTML snippet to embed this ticket widget into your website.</p>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] break-all border border-slate-800">
                  {`<iframe src="${window.location.origin}/marketplace?event=${shareModalEvent.id}&embed=true" width="100%" height="500" frameborder="0"></iframe>`}
                </div>
                <button 
                  onClick={() => handleCopy(`<iframe src="${window.location.origin}/marketplace?event=${shareModalEvent.id}&embed=true" width="100%" height="500" frameborder="0"></iframe>`, 'embed')}
                  className="w-full py-3 rounded-2xl bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  {copiedType === 'embed' ? <Check className="w-4 h-4" /> : <Code className="w-4 h-4" />} Copy Embed Code
                </button>
              </div>
            )}

            {/* VERIFIED AFFILIATE TABS */}
            {affiliateStatus === 'verified' ? (
              <>
                {activeShareTab === 'affiliate' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">
                      Your unique Affiliate Link includes your permanent ID (<span className="font-bold text-sky-500">{affiliateId}</span>).
                    </p>
                    <div className="flex gap-2">
                      <Input readOnly value={`${window.location.origin}/marketplace?event=${shareModalEvent.id}&affiliate=${affiliateId}`} className="text-xs" />
                      <button 
                        onClick={() => handleCopy(`${window.location.origin}/marketplace?event=${shareModalEvent.id}&affiliate=${affiliateId}`, 'affiliate')}
                        className="px-4 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0"
                      >
                        {copiedType === 'affiliate' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}

                {activeShareTab === 'poster' && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-slate-500">Generate high-res Portrait Poster for Instagram Stories / WhatsApp Status.</p>
                    <button 
                      onClick={() => generateMarketingAsset(shareModalEvent, 'poster', affiliateId)}
                      className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                    >
                      <Download className="w-4 h-4" /> Download Branded Portrait Poster
                    </button>
                  </div>
                )}

                {activeShareTab === 'square' && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-slate-500">Generate 1:1 Square Post for Instagram Feed & Facebook.</p>
                    <button 
                      onClick={() => generateMarketingAsset(shareModalEvent, 'square', affiliateId)}
                      className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                    >
                      <Download className="w-4 h-4" /> Download Square Social Post
                    </button>
                  </div>
                )}

                {activeShareTab === 'banner' && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-slate-500">Generate Landscape Banner for Twitter (X), LinkedIn & Web.</p>
                    <button 
                      onClick={() => generateMarketingAsset(shareModalEvent, 'banner', affiliateId)}
                      className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                    >
                      <Download className="w-4 h-4" /> Download Branded Landscape Banner
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 space-y-3">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Become a Verified Affiliate to unlock marketing tools</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Earn commissions, generate branded posters, and track referrals automatically.
                </p>
                <button 
                  onClick={() => { setShareModalEvent(null); navigate('/affiliate/register'); }}
                  className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors"
                >
                  Apply to Become an Affiliate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <PinComponent 
        type="marketplace" 
        value={{ 
          event_id: selectedEvent?.id, 
          ticket_type: selectedEvent?.ticket_types?.find(t => t.id === selectedTicketType)?.name || 'Ticket Purchase', 
          quantity: quantity,
          attendance_mode: selectedAttendanceMode
        }} 
      />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={txMessage} />
      )}
    </div>
  );
}