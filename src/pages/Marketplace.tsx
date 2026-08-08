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
  Sparkles, 
  Clock, 
  Tag,
  Check, 
  Video, 
  CalendarDays,
  Star,
  Menu,
  Bookmark,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, ENDPOINTS, API_BASE } from '@/types';
import type { MarketplaceEvent } from '@/types';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

// --- AFFILIATE IMPORTS ---
import { 
  getAffiliateStatus, 
  getOrGenerateAffiliateId, 
  getAffiliateTracking,
  getAffiliateProfile,
  toggleSaveAffiliateEventId,
  getSavedAffiliateEventIds,
  setAffiliateTracking
} from '@/utils/affiliateStorage';

// --- PROMOTIONAL PREVIEW COMPONENT IMPORTS ---
import { PromotionalPreviewModal } from '@/components/marketplace/PromotionalPreviewModal';
import type { MarketingAssetEvent } from '@/utils/canvasGenerator';

// --- CATEGORIES CONSTANT ---
const EVENT_CATEGORIES = [
  'Music', 'Comedy', 'Conference', 'Technology', 'Business', 
  'Church', 'Seminar', 'Workshop', 'Festival', 'Sports', 
  'Education', 'Fashion', 'Networking', 'Health', 'Charity', 
  'Government', 'Entertainment'
] as const;

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

const VerifiedBadge = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider", className)}>
    <CheckCircle2 className="w-3 h-3" />
    Verified
  </span>
);

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
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  // --- AFFILIATE SYSTEM STATES ---
  const [affiliateStatus, setAffiliateStatusState] = useState<string>('unverified');
  const [affiliateId, setAffiliateId] = useState<string>('');
  const [savedAffiliateEvents, setSavedAffiliateEvents] = useState<string[]>([]);

  useEffect(() => {
    const currentStatus = getAffiliateStatus();
    const currentAffId = getOrGenerateAffiliateId();
    setAffiliateStatusState(currentStatus);
    setAffiliateId(currentAffId);
    setSavedAffiliateEvents(getSavedAffiliateEventIds());

    const referralParam = searchParams.get('affiliate') || searchParams.get('ref');
    const eventParam = searchParams.get('event');

    if (referralParam) {
      const myProfile = getAffiliateProfile();
      if (myProfile?.affiliateId === referralParam || currentAffId === referralParam) {
        console.log('Self-referral link detected. Referral tracking ignored.');
      } else {
        setAffiliateTracking({
          affiliate_id: referralParam,
          event_id: eventParam || undefined,
          timestamp: Date.now()
        });
      }
    }
  }, [searchParams]);

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

  const isSoldOut = useMemo(() => {
    if (!selectedEvent) return false;
    if (typeof selectedEvent.total_tickets === 'number' && selectedEvent.total_tickets > 0) {
      return (selectedEvent.tickets_sold ?? 0) >= selectedEvent.total_tickets;
    }
    return false;
  }, [selectedEvent]);

  const isEventEnded = useMemo(() => {
    if (!selectedEvent || !selectedEvent.event_date) return false;
    return new Date(selectedEvent.event_date) < new Date();
  }, [selectedEvent]);

  const handlePurchase = () => {
    if (!selectedEvent || isSoldOut || isEventEnded) return;
    if (!selectedEvent.is_free && !selectedTicketType) return;
    
    const trackingData = getAffiliateTracking();
    if (trackingData && trackingData.affiliate_id) {
      console.log(`Attaching Affiliate Referral ${trackingData.affiliate_id} to checkout payload.`);
    }

    showPinModal();
  };

  const now = useMemo(() => new Date(), []);

  const activeEvents = useMemo(() => {
    return events.filter(e => e.event_date && new Date(e.event_date) >= now);
  }, [events, now]);

  const pastEvents = useMemo(() => {
    return events.filter(e => e.event_date && new Date(e.event_date) < now);
  }, [events, now]);

  const filteredEvents = useMemo(() => {
    return activeEvents.filter(event => {
      const query = debouncedSearch.toLowerCase().trim();
      const matchesCategory = activeCategory === 'All' || (event.category && event.category.toLowerCase() === activeCategory.toLowerCase());

      if (!query) return matchesCategory;

      const titleMatch = (event.event_title ?? '').toLowerCase().includes(query);
      const catMatch = (event.category ?? '').toLowerCase().includes(query);
      const organizerMatch = event.organizer_name ? event.organizer_name.toLowerCase().includes(query) : false;
      const locationMatch = (event.event_location ?? '').toLowerCase().includes(query);
      const venueMatch = (event.venue_name ?? '').toLowerCase().includes(query);
      const cityMatch = (event.city ?? '').toLowerCase().includes(query);
      const tagsMatch = event.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false;

      return matchesCategory && (titleMatch || catMatch || organizerMatch || locationMatch || venueMatch || cityMatch || tagsMatch);
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
    return '';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStartingPrice = (event: ExtendedEvent) => {
    if (event.is_free) return 'Free';
    if (!event.ticket_types || event.ticket_types.length === 0) return 'Price N/A';
    const prices = event.ticket_types.map(t => Number(t.price)).filter(p => !isNaN(p));
    if (prices.length === 0) return 'Price N/A';
    const minPrice = Math.min(...prices);
    return minPrice === 0 ? 'Free' : `₦${minPrice.toLocaleString()}`;
  };

  const toggleFavorite = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => ({ ...prev, [eventId]: !prev[eventId] }));
    showToast(favorites[eventId] ? 'Removed from saved events' : 'Saved to favorites!');
  };

  const toggleFollowOrganizer = (organizerName: string) => {
    if (!organizerName) return;
    setFollowedOrganizers(prev => ({ ...prev, [organizerName]: !prev[organizerName] }));
    showToast(followedOrganizers[organizerName] ? `Unfollowed ${organizerName}` : `Following ${organizerName}`);
  };

  const toggleSaveForAffiliatePromotion = (eventId: string) => {
    const isNowSaved = toggleSaveAffiliateEventId(eventId);
    setSavedAffiliateEvents(getSavedAffiliateEventIds());
    showToast(isNowSaved ? 'Saved for affiliate promotion!' : 'Removed from saved promotion events');
  };

  const handleShareEvent = async (event: ExtendedEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (affiliateStatus === 'verified') {
      setShareModalEvent(event);
      setPreviewModalOpen(true);
    } else {
      const shareUrl = `${window.location.origin}/marketplace?event=${event.id}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: event.event_title,
            text: `Check out ${event.event_title} on BlueTickets!`,
            url: shareUrl,
          });
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            try {
              await navigator.clipboard.writeText(shareUrl);
              showToast('Event link copied to clipboard!');
            } catch {
              showToast('Unable to share link');
            }
          }
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('Event link copied to clipboard!');
        } catch {
          showToast('Unable to copy link');
        }
      }
    }
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
      trending: activeEvents.filter(e => (e.tickets_sold ?? 0) > 0),
      upcoming: [...activeEvents].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()),
      online: activeEvents.filter(e => e.attendance_mode === 'online'),
      physical: activeEvents.filter(e => e.attendance_mode === 'physical' || !e.attendance_mode),
      free: activeEvents.filter(e => e.is_free || e.ticket_types?.some(t => Number(t.price) === 0)),
      past: pastEvents
    };
  }, [activeEvents, pastEvents]);

  const renderHeroSection = () => {
    if (!featuredEvent) return null;
    const heroImg = getEventImage(featuredEvent);

    return (
      <div className="relative rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-900 text-white shadow-lg">
        <div className="h-48 sm:h-56 md:h-60 relative w-full overflow-hidden">
          {heroImg ? (
            <img 
              src={heroImg} 
              alt={featuredEvent.event_title} 
              loading="lazy"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-sky-500/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-sky-500/90 text-white backdrop-blur-md shadow-md">
                Featured Event
              </span>
              {featuredEvent.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-white/20 text-white backdrop-blur-md hidden sm:inline-block">
                  {featuredEvent.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => toggleFavorite(featuredEvent.id, e)}
                className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Heart className={cn("w-3.5 h-3.5", favorites[featuredEvent.id] && "fill-red-500 text-red-500")} />
              </button>
              <button 
                onClick={(e) => handleShareEvent(featuredEvent, e)}
                className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 space-y-1.5 z-10">
            {featuredEvent.organizer_name && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {featuredEvent.organizer_name}
                </span>
                {featuredEvent.is_approved && <VerifiedBadge />}
              </div>
            )}

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight line-clamp-1">
              {featuredEvent.event_title}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs text-slate-300">
              {featuredEvent.event_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" /> {formatDate(featuredEvent.event_date)}
                </span>
              )}
              {featuredEvent.event_location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> {featuredEvent.event_location}
                </span>
              )}
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
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

  const renderEventCard = (event: ExtendedEvent) => {
    const cardImg = getEventImage(event);

    return (
      <div 
        key={event.id} 
        onClick={() => setSelectedEvent(event)} 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full w-full"
      >
        <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 relative overflow-hidden shrink-0">
          {cardImg ? (
            <img 
              src={cardImg} 
              alt={event.event_title} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
              <Ticket className="w-10 h-10 text-slate-400 dark:text-slate-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            {event.category ? (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-sky-400" />
                {event.category}
              </span>
            ) : <div />}
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
                onClick={(e) => handleShareEvent(event, e)}
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
            {event.organizer_name && (
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <span>By {event.organizer_name}</span>
              </p>
            )}
            <h3 className="font-bold text-slate-800 dark:text-white text-base line-clamp-1 group-hover:text-sky-500 transition-colors">
              {event.event_title}
            </h3>
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              {event.event_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
              )}
              {event.event_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="line-clamp-1">{event.event_location}</span>
                </div>
              )}
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
  };

  const renderEventCollection = (title: string, items: ExtendedEvent[]) => {
    if (!items || items.length === 0) return null;

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

        <div className="flex items-stretch gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth pb-3 pt-1 -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((event) => (
            <div 
              key={event.id} 
              className="snap-start shrink-0 w-[84vw] sm:w-[320px] md:w-[340px] flex flex-col"
            >
              {renderEventCard(event)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    if (loading) {
      return (
        <div className="flex items-stretch gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                Showing {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''}
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
                <p className="text-slate-500 text-sm max-w-md mx-auto">
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
            {renderEventCollection('Online Events', collections.online)}
            {renderEventCollection('Physical Events', collections.physical)}
            {renderEventCollection('Free Events', collections.free)}
            {renderEventCollection('Past Events', collections.past)}
          </div>
        )}
      </div>
    );
  };

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    const ticketTypes: ExtendedTicketType[] = selectedEvent.ticket_types?.length 
      ? selectedEvent.ticket_types 
      : selectedEvent.is_free 
        ? [{
            id: 'free-pass',
            name: 'Free Pass',
            price: 0,
            quantity_available: selectedEvent.total_tickets ? Math.max(0, selectedEvent.total_tickets - (selectedEvent.tickets_sold ?? 0)) : 1,
            benefits: ['Full Event Access']
          }]
        : [];

    const currentTicket = ticketTypes.find(t => t.id === selectedTicketType);
    const unitPrice = currentTicket ? Number(currentTicket.price) : 0;
    const totalPrice = unitPrice * quantity;
    const isOnlineMode = selectedAttendanceMode === 'online';

    const totalTickets = selectedEvent.total_tickets;
    const ticketsSold = selectedEvent.tickets_sold ?? 0;
    const hasValidTicketCount = typeof totalTickets === 'number' && totalTickets > 0;
    const remainingTickets = hasValidTicketCount ? Math.max(0, totalTickets - ticketsSold) : null;
    const progressPercent = hasValidTicketCount 
      ? Math.min(100, Math.max(0, Math.round((ticketsSold / totalTickets) * 100))) 
      : null;

    const relatedEvents = activeEvents.filter(e => e.id !== selectedEvent.id && e.category === selectedEvent.category).slice(0, 3);
    const detailHeroImg = getEventImage(selectedEvent);

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedEvent(null)} 
          className="flex items-center gap-2 text-sky-500 font-bold text-sm hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="aspect-[16/9] md:aspect-[21/9] relative bg-slate-900">
            {detailHeroImg ? (
              <img 
                src={detailHeroImg} 
                alt={selectedEvent.event_title} 
                loading="lazy"
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex items-center justify-center">
                <Ticket className="w-16 h-16 text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button 
                onClick={(e) => toggleFavorite(selectedEvent.id, e)}
                className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Heart className={cn("w-5 h-5", favorites[selectedEvent.id] && "fill-red-500 text-red-500")} />
              </button>
              <button 
                onClick={(e) => handleShareEvent(selectedEvent, e)}
                className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                {selectedEvent.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500 text-white uppercase tracking-wider">
                    {selectedEvent.category}
                  </span>
                )}
                {selectedEvent.is_approved && <VerifiedBadge />}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white leading-tight">
                {selectedEvent.event_title}
              </h1>
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedEvent.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {hasValidTicketCount && remainingTickets !== null && progressPercent !== null && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Ticket Availability</span>
                  <span className="text-sky-500">{remainingTickets} tickets remaining ({progressPercent}% claimed)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {selectedEvent.organizer_name && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-500 font-bold flex items-center justify-center text-lg border border-sky-500/20 shrink-0">
                    {selectedEvent.organizer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">
                        {selectedEvent.organizer_name}
                      </h4>
                      {selectedEvent.is_approved && <VerifiedBadge />}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {typeof selectedEvent.organizer_hosted_count === 'number' && (
                        <span>{selectedEvent.organizer_hosted_count} Event{selectedEvent.organizer_hosted_count !== 1 ? 's' : ''}</span>
                      )}
                      {selectedEvent.organizer_followers && (
                        <>
                          {typeof selectedEvent.organizer_hosted_count === 'number' && <span>•</span>}
                          <span>{selectedEvent.organizer_followers} Followers</span>
                        </>
                      )}
                      {typeof selectedEvent.organizer_rating === 'number' && selectedEvent.organizer_rating > 0 && (
                        <>
                          {(typeof selectedEvent.organizer_hosted_count === 'number' || selectedEvent.organizer_followers) && <span>•</span>}
                          <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                            <Star className="w-3 h-3 fill-current" /> {selectedEvent.organizer_rating}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => toggleFollowOrganizer(selectedEvent.organizer_name!)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                    followedOrganizers[selectedEvent.organizer_name!]
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
                      : "bg-sky-500 text-white hover:bg-sky-600"
                  )}
                >
                  {followedOrganizers[selectedEvent.organizer_name!] ? 'Following' : 'Follow'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedEvent.event_date && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Date & Time</h5>
                    <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                      {formatDate(selectedEvent.event_date)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatTime(selectedEvent.event_date)} {selectedEvent.timezone ? `(${selectedEvent.timezone})` : ''}
                    </p>
                  </div>
                </div>
              )}

              {(selectedEvent.venue_name || selectedEvent.event_location) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Venue & Location</h5>
                    {selectedEvent.venue_name && (
                      <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
                        {selectedEvent.venue_name}
                      </p>
                    )}
                    {selectedEvent.event_location && (
                      <p className="text-xs text-slate-500">
                        {selectedEvent.event_location} {selectedEvent.city ? `• ${selectedEvent.city}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
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

              {isOnlineMode && (selectedEvent.meeting_platform || selectedEvent.timezone || selectedEvent.internet_req) && (
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 space-y-2 text-xs">
                  {selectedEvent.meeting_platform && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Meeting Platform:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.meeting_platform}</span>
                    </div>
                  )}
                  {selectedEvent.timezone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timezone:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.timezone}</span>
                    </div>
                  )}
                  {selectedEvent.internet_req && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Internet Requirement:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.internet_req}</span>
                    </div>
                  )}
                </div>
              )}

              {!isOnlineMode && (selectedEvent.parking_info || selectedEvent.arrival_time || selectedEvent.dress_code) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  {selectedEvent.parking_info && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Parking:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.parking_info}</span>
                    </div>
                  )}
                  {selectedEvent.arrival_time && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Arrival Time:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.arrival_time}</span>
                    </div>
                  )}
                  {selectedEvent.dress_code && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dress Code:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedEvent.dress_code}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedEvent.event_location && selectedEvent.event_location.trim() !== '' && (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Map Location</h5>
                    <p className="text-[11px] text-slate-500">Open venue location in Google Maps</p>
                  </div>
                </div>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedEvent.event_location)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-sky-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Google Maps
                </a>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">About Event</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedEvent.event_description || 'No detailed description provided for this event.'}
              </p>
            </div>

            {selectedEvent.gallery && selectedEvent.gallery.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Event Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedEvent.gallery.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img 
                        src={getImageUrl(img)} 
                        alt={`Gallery ${idx + 1}`} 
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-800 dark:text-white">Buyer Protection & Refund Policy</h5>
                <p className="text-slate-500 mt-0.5">
                  All tickets are cryptographically verified by BlueSea Mobile Marketplace.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Select Ticket Type</h3>
              {ticketTypes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-medium">
                  Ticket information is currently unavailable for this event.
                </div>
              ) : (
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
                          {ticket.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{ticket.description}</p>
                          )}
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
              )}
            </div>

            {ticketTypes.length > 0 && (
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
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount</span>
                <span className="text-2xl font-black text-sky-500">
                  {ticketTypes.length === 0 ? 'N/A' : totalPrice === 0 ? 'Free' : `₦${totalPrice.toLocaleString()}`}
                </span>
              </div>

              <button 
                onClick={handlePurchase} 
                disabled={isSoldOut || isEventEnded || ticketTypes.length === 0 || (!selectedTicketType && !selectedEvent.is_free)} 
                className="flex-1 max-w-xs py-4 rounded-2xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {isSoldOut 
                  ? 'Sold Out' 
                  : isEventEnded 
                    ? 'Event Ended' 
                    : ticketTypes.length === 0 
                      ? 'Tickets Unavailable' 
                      : selectedEvent.is_free 
                        ? 'Get Free Ticket' 
                        : 'Proceed to Payment'}
              </button>
            </div>

            {relatedEvents.length > 0 && (
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">Related Events in {selectedEvent.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedEvents.map((item) => renderEventCard(item))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const marketingAssetEvent: MarketingAssetEvent | null = shareModalEvent ? {
    id: shareModalEvent.id,
    event_title: shareModalEvent.event_title,
    subtitle: shareModalEvent.organizer_name ? `Hosted by ${shareModalEvent.organizer_name}` : undefined,
    organizer_name: shareModalEvent.organizer_name,
    is_verified_organizer: shareModalEvent.is_approved,
    event_date: shareModalEvent.event_date,
    event_time: formatTime(shareModalEvent.event_date),
    event_location: shareModalEvent.event_location,
    venue_name: shareModalEvent.venue_name,
    city: shareModalEvent.city,
    category: shareModalEvent.category,
    is_free: shareModalEvent.is_free,
    starting_price: shareModalEvent.ticket_types?.[0]?.price,
    attendance_mode: shareModalEvent.attendance_mode,
    tags: shareModalEvent.tags,
    resolved_image: getEventImage(shareModalEvent),
    event_banner: getEventImage(shareModalEvent),
    ticket_image: shareModalEvent.ticket_image ? getImageUrl(shareModalEvent.ticket_image) : undefined,
  } : null;

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
                aria-label="Toggle Navigation Menu"
              >
                <MoreHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
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
          className="flex-1 p-4 md:p-6 overflow-y-auto z-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

      {/* PROMOTIONAL ASSET PREVIEW WORKFLOW MODAL */}
      {marketingAssetEvent && (
        <PromotionalPreviewModal
          isOpen={previewModalOpen}
          onClose={() => { setPreviewModalOpen(false); setShareModalEvent(null); }}
          event={marketingAssetEvent}
          affiliateId={affiliateStatus === 'verified' ? affiliateId : undefined}
          onCopyToast={(msg) => showToast(msg)}
        />
      )}

      <PinComponent 
        type="marketplace" 
        value={{ 
          event_id: selectedEvent?.id, 
          ticket_type: selectedEvent?.ticket_types?.find(t => t.id === selectedTicketType)?.name || (selectedEvent?.is_free ? 'Free Pass' : 'Ticket Purchase'), 
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