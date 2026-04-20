import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Loader2, ArrowLeft, ChevronLeft } from 'lucide-react';
import { getRequest, type MarketplaceEvent, TOKEN } from '@/types';
import { ENDPOINTS } from '@/types';

export function EventPublic() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<MarketplaceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const isAuthenticated = !!TOKEN;

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/marketplace?event=${event?.id}`);
      return;
    }
    if (event) {
      navigate(`/marketplace?event=${event.id}`);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        const response = await getRequest(ENDPOINTS.event_public(eventId));
        
        if (response?.id) {
          setEvent(response);
        } else {
          setError('Event not found or not approved');
        }
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const API_BASE = import.meta.env.VITE_API_BASE;
    return `${API_BASE}${path}`;
  };

  const getEventImage = (evt: MarketplaceEvent) => {
    if (evt.event_banner) return getImageUrl(evt.event_banner);
    if (evt.ticket_image) return getImageUrl(evt.ticket_image);
    return '';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-lg mb-4">{error || 'Event not found'}</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-sky-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Marketplace
        </button>
      </div>
    );
  }

  const isSoldOut = event.tickets_sold >= event.total_tickets;
  const isEventEnded = new Date(event.event_date) < new Date();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
          Event Details
        </h1>
      </div>

      {/* Event Image */}
      {getEventImage(event) && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={getEventImage(event)}
            alt={event.event_title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Category & Status */}
        <div className="flex items-center gap-3">
          {event.category && (
            <span className="px-3 py-1 bg-sky-500 text-white text-sm rounded-full">
              {event.category}
            </span>
          )}
          {event.is_approved && (
            <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
              Approved
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {event.event_title}
        </h2>

        {/* Date & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Calendar className="w-5 h-5 text-sky-500" />
            <span>{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <MapPin className="w-5 h-5 text-sky-500" />
            <span>{event.event_location}</span>
          </div>
        </div>

        {/* Host */}
        <div className="text-slate-600 dark:text-slate-300">
          <p>Hosted by: <span className="font-medium">{event.hosted_by}</span></p>
          {event.vendor?.business_name && (
            <p className="text-sm text-slate-500">{event.vendor.business_name}</p>
          )}
        </div>

        {/* Description */}
        {event.event_description && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {event.event_description}
            </p>
          </div>
        )}

        {/* Ticket Types */}
        {event.ticket_types && event.ticket_types.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Available Tickets
            </h3>
            <div className="grid gap-3">
              {event.ticket_types.map((tt) => (
                <div
                  key={tt.id}
                  onClick={() => !event.is_free && setSelectedTicketType(tt.id)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    selectedTicketType === tt.id
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                      : event.is_free
                      ? 'border-slate-200 dark:border-slate-700'
                      : 'border-slate-200 dark:border-slate-700 cursor-pointer hover:border-sky-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {tt.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {tt.quantity_available} available
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">
                      {event.is_free ? 'Free' : `₦${Number(tt.price).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector (for paid events) */}
        {selectedTicketType && !event.is_free && (
          <div className="flex items-center gap-4">
            <span className="text-slate-600 dark:text-slate-300">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Buy Button */}
        <button
          onClick={handleBuyTicket}
          disabled={isSoldOut || isEventEnded || (!selectedTicketType && !event.is_free)}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            isSoldOut || isEventEnded
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-600 text-white'
          }`}
        >
          {isSoldOut
            ? 'Sold Out'
            : isEventEnded
            ? 'Event Ended'
            : !isAuthenticated
            ? 'Login to Get Ticket'
            : event.is_free
            ? 'Get Free Ticket'
            : `Buy Ticket - ₦${
                Number(event.ticket_types?.find(t => t.id === selectedTicketType)?.price || 0) * quantity
              }.toLocaleString()`}
        </button>

        <p className="text-center text-sm text-slate-500">
          You'll be redirected to login if not already logged in
        </p>
      </div>
    </div>
  );
}