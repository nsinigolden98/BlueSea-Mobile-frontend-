import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar, PinModal, Toast, TransactionModal, Loader } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { Search, CalendarDays } from 'lucide-react';
import { getRequest, postRequest, ENDPOINTS, API_BASE } from '@/types';
import type { MarketplaceEvent } from '@/types';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { useAuth } from '@/context/AuthContext';

import { 
  getAffiliateTracking,
  toggleSaveAffiliateEventId,
  getSavedAffiliateEventIds,
  setAffiliateTracking
} from '@/utils/affiliateStorage';

import { PromotionalPreviewModal } from '@/components/marketplace/PromotionalPreviewModal';
import type { MarketingAssetEvent } from '@/utils/canvasGenerator';

import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { MarketplaceCategories } from '@/components/marketplace/MarketplaceCategories';
import { MarketplaceHero } from '@/components/marketplace/MarketplaceHero';
import { MarketplaceEventCard, type ExtendedEvent as BaseExtendedEvent } from '@/components/marketplace/MarketplaceEventCard';
import { MarketplaceEventCollection } from '@/components/marketplace/MarketplaceEventCollection';
import { MarketplaceEventDetails } from '@/components/marketplace/MarketplaceEventDetails';
import { MarketplaceShareModal } from '@/components/marketplace/MarketplaceShareModal';

export type ExtendedEvent = BaseExtendedEvent & {
  event_mode?: 'offline' | 'online' | 'hybrid' | string;
};

interface AffiliateStatusResponse {
  id?: number;
  affiliate_name?: string;
  status?: 'pending' | 'approved' | 'rejected';
  is_approved?: boolean;
  commission_rate?: string;
  message?: string;
  detail?: string;
}

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
  const { user } = useAuth();
  const { PinComponent, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const mainViewportRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- UI STATES ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showMenu, setShowMenu] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');
  
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [followedOrganizers, setFollowedOrganizers] = useState<Record<string, boolean>>({});

  const [shareModalEvent, setShareModalEvent] = useState<ExtendedEvent | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // --- AFFILIATE SYSTEM STATES ---
  const [affiliateStatus, setAffiliateStatusState] = useState<string>('unverified');
  const [affiliateId, setAffiliateId] = useState<string>('');
  const [savedAffiliateEvents, setSavedAffiliateEvents] = useState<string[]>([]);
  const [isVerifyingAffiliate, setIsVerifyingAffiliate] = useState<boolean>(false);

  // --- EVENTS STATE ---
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEvent | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedAttendanceMode, setSelectedAttendanceMode] = useState<'online' | 'physical'>('physical');

  const checkBackendAffiliateStatus = useCallback(async () => {
    try {
      const res: AffiliateStatusResponse = await getRequest(ENDPOINTS.affiliate_status);
      if (res && (res.id || res.status || res.is_approved !== undefined)) {
        const isApproved = res.is_approved === true || res.status === 'approved';
        return { registered: true, approved: isApproved, status: res.status || (isApproved ? 'approved' : 'pending'), affiliateName: res.affiliate_name };
      }
      return { registered: false, approved: false, status: 'none' };
    } catch (err: any) {
      const statusCode = err?.response?.status || err?.status;
      if (statusCode === 401) return { registered: false, approved: false, status: 'unauthenticated', unauthenticated: true };
      if (statusCode === 404) return { registered: false, approved: false, status: 'not_found' };
      return { registered: false, approved: false, status: 'error', error: true };
    }
  }, []);

  useEffect(() => {
    const initAffiliateSystem = async () => {
      const res = await checkBackendAffiliateStatus();
      if (res.registered) {
        setAffiliateStatusState(res.approved ? 'verified' : res.status);
        if (res.affiliateName) setAffiliateId(res.affiliateName);
      } else {
        setAffiliateStatusState('unverified');
      }
    };

    initAffiliateSystem();
    setSavedAffiliateEvents(getSavedAffiliateEventIds());

    const referralParam = searchParams.get('affiliate') || searchParams.get('ref');
    const eventParam = searchParams.get('event');

    if (referralParam) {
      postRequest(ENDPOINTS.affiliate_attribution, {
        affiliate_name: referralParam,
        event_id: eventParam || undefined
      }).catch((err) => console.error('Attribution recording notice:', err));

      setAffiliateTracking({ affiliate_id: referralParam, event_id: eventParam || undefined, timestamp: Date.now() });
    }
  }, [searchParams, checkBackendAffiliateStatus]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRequest(ENDPOINTS.marketplace_events);
      if (Array.isArray(data)) {
        setEvents(data);
        const eventId = searchParams.get('event');
        if (eventId) {
          const foundEvent = data.find((e: ExtendedEvent) => String(e.id) === String(eventId));
          if (foundEvent) {
            setSelectedEvent(foundEvent);
          } else {
            try {
              const detailEndpoint = ENDPOINTS.marketplace_event_detail 
                ? ENDPOINTS.marketplace_event_detail(eventId)
                : `${API_BASE}/marketplace/events/${eventId}/`;
              const detailData = await getRequest(detailEndpoint);
              if (detailData && detailData.id) {
                setSelectedEvent(detailData);
              }
            } catch (detailErr) {
              console.error('Failed to fetch specific event detail:', detailErr);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch marketplace events:', err);
      showToast('Failed to load marketplace events. Please reload.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, showToast]);

  const fetchVendorStatus = useCallback(async () => {
    try {
      const response = await getRequest(ENDPOINTS.vendor_status);
      setVendorStatus(response?.vendor?.is_verified || false);
    } catch (err) {
      console.error('Vendor status error:', err);
      setVendorStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchVendorStatus();
  }, [fetchEvents, fetchVendorStatus]);

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
      const mode = selectedEvent.event_mode || selectedEvent.attendance_mode || 'offline';
      setSelectedAttendanceMode(mode === 'online' ? 'online' : 'physical');
    }
  }, [selectedEvent]);

  const now = useMemo(() => new Date(), []);

  const parseEventDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const activeEvents = useMemo(() => {
    return events.filter(e => {
      const d = parseEventDate(e.event_date);
      return d ? d >= now : true;
    });
  }, [events, now]);

  const pastEvents = useMemo(() => {
    return events.filter(e => {
      const d = parseEventDate(e.event_date);
      return d ? d < now : false;
    });
  }, [events, now]);

  const filteredEvents = useMemo(() => {
    return activeEvents.filter(event => {
      const query = debouncedSearch.toLowerCase().trim();
      const matchesCategory = activeCategory === 'All' || (event.category && event.category.toLowerCase() === activeCategory.toLowerCase());
      if (!query) return matchesCategory;

      const titleMatch = (event.event_title ?? '').toLowerCase().includes(query);
      const catMatch = (event.category ?? '').toLowerCase().includes(query);
      const organizerMatch = (event.hosted_by || event.organizer_name || '').toLowerCase().includes(query);
      const locationMatch = (event.event_location ?? '').toLowerCase().includes(query);
      const venueMatch = (event.venue_name ?? '').toLowerCase().includes(query);
      const cityMatch = (event.city ?? '').toLowerCase().includes(query);
      const tagsMatch = event.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false;

      return matchesCategory && (titleMatch || catMatch || organizerMatch || locationMatch || venueMatch || cityMatch || tagsMatch);
    });
  }, [activeEvents, debouncedSearch, activeCategory]);

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
    const baseUrl = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const getEventImage = (event: MarketplaceEvent) => {
    if (event.event_banner) return getImageUrl(event.event_banner);
    if (event.ticket_image) return getImageUrl(event.ticket_image);
    return '';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = parseEventDate(dateString);
    if (!d) return dateString;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const d = parseEventDate(dateString);
    if (!d) return dateString;
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStartingPrice = (event: ExtendedEvent) => {
    if (event.is_free) return 'Free';
    if (!event.ticket_types || event.ticket_types.length === 0) return 'Price N/A';
    const prices = event.ticket_types.map(t => Number(t.price)).filter(p => !isNaN(p));
    if (prices.length === 0) return 'Price N/A';
    const minPrice = Math.min(...prices);
    return minPrice === 0 ? 'Free' : `₦${minPrice.toLocaleString()}`;
  };

  const handlePurchase = async () => {
    if (!selectedEvent) return;

    let unitPrice = 0;
    if (!selectedEvent.is_free) {
      if (selectedEvent.ticket_types && selectedEvent.ticket_types.length > 0) {
        const tType = selectedEvent.ticket_types.find(t => String(t.id) === String(selectedTicketType));
        if (!tType) {
          showToast('Please select a ticket type.');
          return;
        }
        unitPrice = Number(tType.price) || 0;
      }
    }
    const requiredTotal = unitPrice * quantity;

    if (requiredTotal > 0) {
      const rawBalance = user?.balance;
      const availableBalance = typeof rawBalance === 'number'
        ? rawBalance
        : parseFloat(String(rawBalance || 0).replace(/[^0-9.-]+/g, '')) || 0;

      if (availableBalance < requiredTotal) {
        showToast(`Insufficient balance (₦${availableBalance.toLocaleString()}). Required: ₦${requiredTotal.toLocaleString()}. Please fund your wallet.`);
        setTimeout(() => navigate('/wallet'), 1200);
        return;
      }
    }

    const trackingData = getAffiliateTracking();
    if (trackingData?.affiliate_id) {
      console.log(`Attaching Affiliate Referral ${trackingData.affiliate_id} to checkout session.`);
    }

    showPinModal();
  };

  const handleTicketAffiliateAction = async (targetEvent: ExtendedEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!targetEvent || !targetEvent.id) {
      showToast('Invalid event configuration. Unable to initiate affiliate action.');
      return;
    }

    if (isVerifyingAffiliate) return;
    setIsVerifyingAffiliate(true);
    showLoader();

    try {
      const res = await checkBackendAffiliateStatus();
      if (res.unauthenticated) {
        showToast('Please log in to access affiliate promotion links.');
        navigate(`/login?redirect=/marketplace?event=${targetEvent.id}`);
        return;
      }
      if (res.error) {
        showToast('Failed to verify affiliate registration. Please try again.');
        return;
      }
      if (!res.registered) {
        showToast('You must register as an affiliate first.');
        navigate('/affiliate');
        return;
      }
      if (!res.approved) {
        showToast('Your affiliate account is pending approval.');
        return;
      }

      setShareModalEvent(targetEvent);
      setPreviewModalOpen(true);
    } finally {
      setIsVerifyingAffiliate(false);
      hideLoader();
    }
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

  const handleOpenShareModal = (event: ExtendedEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShareModalEvent(event);
    setCopiedLink(false);
  };

  const handleCopyEventLink = async (eventId: string) => {
    const affiliateParam = affiliateId ? `&ref=${affiliateId}` : '';
    const link = `${window.location.origin}/marketplace?event=${eventId}${affiliateParam}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      showToast('Event referral link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      showToast('Failed to copy link');
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
  }, [message, showToast]);

  const featuredEvent = useMemo(() => activeEvents[0] || events[0] || null, [activeEvents, events]);

  const collections = useMemo(() => ({
    trending: activeEvents.filter(e => (e.tickets_sold ?? 0) > 0),
    upcoming: [...activeEvents].sort((a, b) => {
      const dA = parseEventDate(a.event_date);
      const dB = parseEventDate(b.event_date);
      return (dA ? dA.getTime() : 0) - (dB ? dB.getTime() : 0);
    }),
    online: activeEvents.filter(e => e.event_mode === 'online' || e.event_mode === 'hybrid' || e.attendance_mode === 'online'),
    physical: activeEvents.filter(e => e.event_mode === 'offline' || e.event_mode === 'hybrid' || e.attendance_mode === 'physical' || !e.event_mode),
    free: activeEvents.filter(e => e.is_free || e.ticket_types?.some(t => Number(t.price) === 0)),
    past: pastEvents
  }), [activeEvents, pastEvents]);

  const marketingAssetEvent: MarketingAssetEvent | null = shareModalEvent ? ({
    id: shareModalEvent.id,
    event_title: shareModalEvent.event_title,
    subtitle: shareModalEvent.hosted_by ? `Hosted by ${shareModalEvent.hosted_by}` : (shareModalEvent.organizer_name ? `Hosted by ${shareModalEvent.organizer_name}` : undefined),
    organizer_name: shareModalEvent.hosted_by || shareModalEvent.organizer_name,
    is_verified_organizer: shareModalEvent.is_approved,
    event_date: shareModalEvent.event_date,
    event_time: formatTime(shareModalEvent.event_date),
    event_location: shareModalEvent.event_location,
    venue_name: shareModalEvent.venue_name || shareModalEvent.event_location,
    city: shareModalEvent.city,
    category: shareModalEvent.category,
    is_free: shareModalEvent.is_free,
    starting_price: shareModalEvent.ticket_types?.[0]?.price,
    event_mode: shareModalEvent.event_mode || shareModalEvent.attendance_mode,
    attendance_mode: shareModalEvent.attendance_mode || (shareModalEvent.event_mode === 'online' ? 'online' : 'physical'),
    tags: shareModalEvent.tags,
    resolved_image: getEventImage(shareModalEvent),
    event_banner: getEventImage(shareModalEvent),
    ticket_image: shareModalEvent.ticket_image ? getImageUrl(shareModalEvent.ticket_image) : undefined,
  } as unknown as MarketingAssetEvent) : null;

  const isFilteredState = debouncedSearch !== '' || activeCategory !== 'All';

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <MarketplaceHeader 
          vendorStatus={vendorStatus}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          menuRef={menuRef}
        />

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

            {selectedEvent ? (
              <MarketplaceEventDetails 
                selectedEvent={selectedEvent}
                activeEvents={activeEvents}
                selectedTicketType={selectedTicketType}
                setSelectedTicketType={setSelectedTicketType}
                quantity={quantity}
                setQuantity={setQuantity}
                selectedAttendanceMode={selectedAttendanceMode}
                setSelectedAttendanceMode={setSelectedAttendanceMode}
                favorites={favorites}
                followedOrganizers={followedOrganizers}
                onBack={() => setSelectedEvent(null)}
                onPurchase={handlePurchase}
                onTicketAffiliateAction={handleTicketAffiliateAction}
                onToggleFavorite={toggleFavorite}
                onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                onOpenShareModal={handleOpenShareModal}
                onToggleFollowOrganizer={toggleFollowOrganizer}
                savedAffiliateEvents={savedAffiliateEvents}
                affiliateStatus={affiliateStatus}
                getImageUrl={getImageUrl}
                getEventImage={getEventImage}
                formatDate={formatDate}
                formatTime={formatTime}
                getStartingPrice={getStartingPrice}
                onSelectEvent={setSelectedEvent}
              />
            ) : loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <LoaderComponent />
                <p className="text-xs text-slate-400 font-medium">Loading Marketplace...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {!isFilteredState && (
                  <MarketplaceHero 
                    featuredEvent={featuredEvent}
                    onSelect={setSelectedEvent}
                    onToggleFavorite={toggleFavorite}
                    onOpenShareModal={handleOpenShareModal}
                    isFavorite={featuredEvent ? !!favorites[featuredEvent.id] : false}
                    getEventImage={getEventImage}
                    formatDate={formatDate}
                    getStartingPrice={getStartingPrice}
                  />
                )}

                <MarketplaceCategories 
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />

                {isFilteredState ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Showing {filteredEvents.length} result{filteredEvents.length !== 1 ? 's' : ''}
                      </p>
                      <button 
                        onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                        className="text-xs font-bold text-sky-500 hover:underline cursor-pointer"
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
                        {filteredEvents.map((event) => (
                          <MarketplaceEventCard 
                            key={event.id}
                            event={event}
                            onSelect={setSelectedEvent}
                            onTicketAffiliateAction={handleTicketAffiliateAction}
                            onToggleFavorite={toggleFavorite}
                            onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                            onOpenShareModal={handleOpenShareModal}
                            isFavorite={!!favorites[event.id]}
                            isSavedAffiliate={savedAffiliateEvents.includes(event.id)}
                            affiliateStatus={affiliateStatus}
                            getImageUrl={getImageUrl}
                            getEventImage={getEventImage}
                            formatDate={formatDate}
                            getStartingPrice={getStartingPrice}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <MarketplaceEventCollection 
                      title="Trending Events" 
                      items={collections.trending} 
                      onSelect={setSelectedEvent}
                      onTicketAffiliateAction={handleTicketAffiliateAction}
                      onToggleFavorite={toggleFavorite}
                      onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                      onOpenShareModal={handleOpenShareModal}
                      favorites={favorites}
                      savedAffiliateEvents={savedAffiliateEvents}
                      affiliateStatus={affiliateStatus}
                      getImageUrl={getImageUrl}
                      getEventImage={getEventImage}
                      formatDate={formatDate}
                      getStartingPrice={getStartingPrice}
                    />
                    <MarketplaceEventCollection 
                      title="Upcoming Events" 
                      items={collections.upcoming} 
                      onSelect={setSelectedEvent}
                      onTicketAffiliateAction={handleTicketAffiliateAction}
                      onToggleFavorite={toggleFavorite}
                      onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                      onOpenShareModal={handleOpenShareModal}
                      favorites={favorites}
                      savedAffiliateEvents={savedAffiliateEvents}
                      affiliateStatus={affiliateStatus}
                      getImageUrl={getImageUrl}
                      getEventImage={getEventImage}
                      formatDate={formatDate}
                      getStartingPrice={getStartingPrice}
                    />
                    <MarketplaceEventCollection 
                      title="Online Events" 
                      items={collections.online} 
                      onSelect={setSelectedEvent}
                      onTicketAffiliateAction={handleTicketAffiliateAction}
                      onToggleFavorite={toggleFavorite}
                      onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                      onOpenShareModal={handleOpenShareModal}
                      favorites={favorites}
                      savedAffiliateEvents={savedAffiliateEvents}
                      affiliateStatus={affiliateStatus}
                      getImageUrl={getImageUrl}
                      getEventImage={getEventImage}
                      formatDate={formatDate}
                      getStartingPrice={getStartingPrice}
                    />
                    <MarketplaceEventCollection 
                      title="Physical & Hybrid Events" 
                      items={collections.physical} 
                      onSelect={setSelectedEvent}
                      onTicketAffiliateAction={handleTicketAffiliateAction}
                      onToggleFavorite={toggleFavorite}
                      onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                      onOpenShareModal={handleOpenShareModal}
                      favorites={favorites}
                      savedAffiliateEvents={savedAffiliateEvents}
                      affiliateStatus={affiliateStatus}
                      getImageUrl={getImageUrl}
                      getEventImage={getEventImage}
                      formatDate={formatDate}
                      getStartingPrice={getStartingPrice}
                    />
                    <MarketplaceEventCollection 
                      title="Free Events" 
                      items={collections.free} 
                      onSelect={setSelectedEvent}
                      onTicketAffiliateAction={handleTicketAffiliateAction}
                      onToggleFavorite={toggleFavorite}
                      onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                      onOpenShareModal={handleOpenShareModal}
                      favorites={favorites}
                      savedAffiliateEvents={savedAffiliateEvents}
                      affiliateStatus={affiliateStatus}
                      getImageUrl={getImageUrl}
                      getEventImage={getEventImage}
                      formatDate={formatDate}
                      getStartingPrice={getStartingPrice}
                    />
                    <MarketplaceEventCollection 
                      title="Past Events" 
                      items={collections.past} 
                      onSelect={setSelectedEvent}
                      onTicketAffiliateAction={handleTicketAffiliateAction}
                      onToggleFavorite={toggleFavorite}
                      onToggleSaveAffiliate={toggleSaveForAffiliatePromotion}
                      onOpenShareModal={handleOpenShareModal}
                      favorites={favorites}
                      savedAffiliateEvents={savedAffiliateEvents}
                      affiliateStatus={affiliateStatus}
                      getImageUrl={getImageUrl}
                      getEventImage={getEventImage}
                      formatDate={formatDate}
                      getStartingPrice={getStartingPrice}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900">
          <MobileBottomNavigation />
        </div>
      </div>

      <MarketplaceShareModal 
        shareModalEvent={shareModalEvent}
        previewModalOpen={previewModalOpen}
        affiliateId={affiliateId}
        affiliateStatus={affiliateStatus}
        copiedLink={copiedLink}
        onClose={() => setShareModalEvent(null)}
        onCopyEventLink={handleCopyEventLink}
        onOpenPreviewModal={() => setPreviewModalOpen(true)}
        getEventImage={getEventImage}
      />

      {marketingAssetEvent && (
        <PromotionalPreviewModal
          isOpen={previewModalOpen}
          onClose={() => { setPreviewModalOpen(false); setShareModalEvent(null); }}
          event={marketingAssetEvent}
          affiliateId={affiliateStatus === 'verified' || affiliateStatus === 'approved' ? affiliateId : undefined}
          onCopyToast={(msg) => showToast(msg)}
        />
      )}

      <LoaderComponent />
      <PinComponent 
        type="marketplace" 
        value={{ 
          event_id: selectedEvent?.id, 
          ticket_type_id: selectedTicketType || undefined,
          ticket_type: selectedEvent?.ticket_types?.find(t => String(t.id) === String(selectedTicketType))?.name || (selectedEvent?.is_free ? 'Free Pass' : 'Ticket Purchase'), 
          quantity: quantity,
          attendance_mode: selectedAttendanceMode,
          event_mode: selectedEvent?.event_mode || 'offline'
        }} 
      />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={txMessage} />
      )}
    </div>
  );
}