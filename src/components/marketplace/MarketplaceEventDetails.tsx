import React, { useMemo, useEffect } from 'react';
import { 
  ChevronLeft, Heart, Share2, Sparkles, Clock, MapPin, Building2, Globe, ExternalLink, 
  ShieldCheck, Check, Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketplaceEventCard, VerifiedBadge, type ExtendedEvent, type ExtendedTicketType } from './MarketplaceEventCard';
import type { MarketplaceEvent } from '@/types';

interface MarketplaceEventDetailsProps {
  selectedEvent: ExtendedEvent;
  activeEvents: ExtendedEvent[];
  selectedTicketType: string;
  setSelectedTicketType: (id: string) => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  selectedAttendanceMode: 'online' | 'physical';
  setSelectedAttendanceMode: (mode: 'online' | 'physical') => void;
  favorites: Record<string, boolean>;
  followedOrganizers: Record<string, boolean>;
  onBack: () => void;
  onPurchase: () => void;
  onTicketAffiliateAction: (event: ExtendedEvent, e?: React.MouseEvent) => void;
  onToggleFavorite: (eventId: string, e?: React.MouseEvent) => void;
  onToggleSaveAffiliate: (eventId: string) => void;
  onOpenShareModal: (event: ExtendedEvent, e?: React.MouseEvent) => void;
  onToggleFollowOrganizer: (organizerName: string) => void;
  savedAffiliateEvents: string[];
  affiliateStatus: string;
  getImageUrl: (path: string | undefined) => string;
  getEventImage: (event: MarketplaceEvent) => string;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  getStartingPrice: (event: ExtendedEvent) => string;
  onSelectEvent: (event: ExtendedEvent) => void;
}

export const MarketplaceEventDetails: React.FC<MarketplaceEventDetailsProps> = ({
  selectedEvent,
  activeEvents,
  selectedTicketType,
  setSelectedTicketType,
  quantity,
  setQuantity,
  selectedAttendanceMode,
  setSelectedAttendanceMode,
  favorites,
  followedOrganizers,
  onBack,
  onPurchase,
  onTicketAffiliateAction,
  onToggleFavorite,
  onToggleSaveAffiliate,
  onOpenShareModal,
  onToggleFollowOrganizer,
  savedAffiliateEvents,
  affiliateStatus,
  getImageUrl,
  getEventImage,
  formatDate,
  formatTime,
  getStartingPrice,
  onSelectEvent,
}) => {
  const isSoldOut = useMemo(() => {
    if (typeof selectedEvent.total_tickets === 'number' && selectedEvent.total_tickets > 0) {
      return (selectedEvent.tickets_sold ?? 0) >= selectedEvent.total_tickets;
    }
    return false;
  }, [selectedEvent]);

  const isEventEnded = useMemo(() => {
    if (!selectedEvent.event_date) return false;
    return new Date(selectedEvent.event_date) < new Date();
  }, [selectedEvent.event_date]);

  const ticketTypes: ExtendedTicketType[] = useMemo(() => {
    if (selectedEvent.ticket_types?.length) {
      return selectedEvent.ticket_types;
    }
    if (selectedEvent.is_free) {
      return [{
        id: 'free-pass',
        name: 'Free Pass',
        price: 0,
        quantity_available: selectedEvent.total_tickets 
          ? Math.max(0, selectedEvent.total_tickets - (selectedEvent.tickets_sold ?? 0)) 
          : 1,
        benefits: ['Full Event Access']
      }];
    }
    return [];
  }, [selectedEvent]);

  // Auto-select valid ticket type if none is selected
  useEffect(() => {
    if (ticketTypes.length > 0 && (!selectedTicketType || !ticketTypes.some(t => t.id === selectedTicketType))) {
      setSelectedTicketType(ticketTypes[0].id);
    }
  }, [ticketTypes, selectedTicketType, setSelectedTicketType]);

  // Auto-sync attendance mode if restricted by event configuration
  useEffect(() => {
    if (selectedEvent.attendance_mode === 'online' && selectedAttendanceMode !== 'online') {
      setSelectedAttendanceMode('online');
    } else if (selectedEvent.attendance_mode === 'physical' && selectedAttendanceMode !== 'physical') {
      setSelectedAttendanceMode('physical');
    }
  }, [selectedEvent.attendance_mode, selectedAttendanceMode, setSelectedAttendanceMode]);

  const currentTicket = ticketTypes.find(t => t.id === selectedTicketType);
  const unitPrice = currentTicket ? Number(currentTicket.price) : 0;
  const totalPrice = unitPrice * quantity;

  const totalTickets = selectedEvent.total_tickets;
  const ticketsSold = selectedEvent.tickets_sold ?? 0;
  const hasValidTicketCount = typeof totalTickets === 'number' && totalTickets > 0;
  const remainingTickets = hasValidTicketCount ? Math.max(0, totalTickets - ticketsSold) : null;
  const progressPercent = hasValidTicketCount 
    ? Math.min(100, Math.max(0, Math.round((ticketsSold / totalTickets) * 100))) 
    : null;

  // Upper boundary for quantity selector
  const maxAvailableQuantity = currentTicket?.quantity_available ?? remainingTickets ?? 99;

  const relatedEvents = useMemo(() => {
    return activeEvents.filter(e => e.id !== selectedEvent.id && e.category === selectedEvent.category).slice(0, 3);
  }, [activeEvents, selectedEvent.id, selectedEvent.category]);

  const detailHeroImg = getEventImage(selectedEvent);

  const googleMapsUrl = useMemo(() => {
    const queryParts = [selectedEvent.venue_name, selectedEvent.event_location, selectedEvent.city]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts)}`;
  }, [selectedEvent.venue_name, selectedEvent.event_location, selectedEvent.city]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sky-500 font-bold text-sm hover:underline cursor-pointer"
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
              <Building2 className="w-16 h-16 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button 
              onClick={(e) => onTicketAffiliateAction(selectedEvent, e)}
              className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              title="Promote as Affiliate"
            >
              <Sparkles className="w-5 h-5 text-sky-400" />
            </button>
            <button 
              onClick={(e) => onToggleFavorite(selectedEvent.id, e)}
              className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
            >
              <Heart className={cn("w-5 h-5", favorites[selectedEvent.id] && "fill-red-500 text-red-500")} />
            </button>
            <button 
              onClick={(e) => onOpenShareModal(selectedEvent, e)}
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
                onClick={() => onToggleFollowOrganizer(selectedEvent.organizer_name!)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer",
                  followedOrganizers[selectedEvent.organizer_name]
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
                    : "bg-sky-500 text-white hover:bg-sky-600"
                )}
              >
                {followedOrganizers[selectedEvent.organizer_name] ? 'Following' : 'Follow'}
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
                  "p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer",
                  selectedAttendanceMode === 'physical'
                    ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/20"
                    : "border-slate-200 dark:border-slate-800 opacity-60",
                  selectedEvent.attendance_mode === 'online' && "cursor-not-allowed opacity-40"
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
                  "p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer",
                  selectedAttendanceMode === 'online'
                    ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/20"
                    : "border-slate-200 dark:border-slate-800 opacity-60",
                  selectedEvent.attendance_mode === 'physical' && "cursor-not-allowed opacity-40"
                )}
              >
                <Globe className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Attend Online</p>
                  <p className="text-[10px] text-slate-500">Stream from anywhere</p>
                </div>
              </button>
            </div>
          </div>

          {(selectedEvent.venue_name || selectedEvent.event_location) && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-sky-500" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Map Location</h5>
                  <p className="text-[11px] text-slate-500">Open venue location in Google Maps</p>
                </div>
              </div>
              <a 
                href={googleMapsUrl} 
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
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  -
                </button>
                <span className="text-sm font-bold w-4 text-center text-slate-800 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(maxAvailableQuantity, quantity + 1))} 
                  disabled={quantity >= maxAvailableQuantity}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
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
              onClick={onPurchase} 
              disabled={isSoldOut || isEventEnded || ticketTypes.length === 0 || !currentTicket} 
              className="flex-1 max-w-xs py-4 rounded-2xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 cursor-pointer"
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
                {relatedEvents.map((item) => (
                  <MarketplaceEventCard 
                    key={item.id}
                    event={item}
                    onSelect={onSelectEvent}
                    onTicketAffiliateAction={onTicketAffiliateAction}
                    onToggleFavorite={onToggleFavorite}
                    onToggleSaveAffiliate={onToggleSaveAffiliate}
                    onOpenShareModal={onOpenShareModal}
                    isFavorite={!!favorites[item.id]}
                    isSavedAffiliate={savedAffiliateEvents.includes(item.id)}
                    affiliateStatus={affiliateStatus}
                    getImageUrl={getImageUrl}
                    getEventImage={getEventImage}
                    formatDate={formatDate}
                    getStartingPrice={getStartingPrice}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};