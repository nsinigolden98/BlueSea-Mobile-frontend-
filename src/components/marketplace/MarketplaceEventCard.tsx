import React from 'react';
import { Ticket, Tag, Sparkles, Bookmark, Heart, Share2, Video, Building2, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketplaceEvent } from '@/types';

export interface ExtendedTicketType {
  id: string;
  name: string;
  price: number | string;
  quantity_available: number;
  description?: string;
  benefits?: string[];
  is_refundable?: boolean;
  is_transferable?: boolean;
}

export interface ExtendedEvent extends MarketplaceEvent {
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

interface MarketplaceEventCardProps {
  event: ExtendedEvent;
  onSelect: (event: ExtendedEvent) => void;
  onTicketAffiliateAction: (event: ExtendedEvent, e?: React.MouseEvent) => void;
  onToggleFavorite: (eventId: string, e?: React.MouseEvent) => void;
  onToggleSaveAffiliate: (eventId: string) => void;
  onOpenShareModal: (event: ExtendedEvent, e?: React.MouseEvent) => void;
  isFavorite: boolean;
  isSavedAffiliate: boolean;
  affiliateStatus: string;
  getImageUrl: (path: string | undefined) => string;
  getEventImage: (event: MarketplaceEvent) => string;
  formatDate: (dateString: string) => string;
  getStartingPrice: (event: ExtendedEvent) => string;
}

export const VerifiedBadge = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider", className)}>
    <CheckCircle2 className="w-3 h-3" />
    Verified
  </span>
);

export const MarketplaceEventCard: React.FC<MarketplaceEventCardProps> = ({
  event,
  onSelect,
  onTicketAffiliateAction,
  onToggleFavorite,
  onToggleSaveAffiliate,
  onOpenShareModal,
  isFavorite,
  isSavedAffiliate,
  affiliateStatus,
  getEventImage,
  formatDate,
  getStartingPrice,
}) => {
  const cardImg = getEventImage(event);

  return (
    <div 
      onClick={() => onSelect(event)} 
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
            <button 
              onClick={(e) => onTicketAffiliateAction(event, e)}
              className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
              title="Promote as Affiliate"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            </button>
            {affiliateStatus === 'verified' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleSaveAffiliate(event.id); }}
                className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
                title="Save for Affiliate Promotion"
              >
                <Bookmark className={cn("w-3.5 h-3.5", isSavedAffiliate && "fill-sky-400 text-sky-400")} />
              </button>
            )}
            <button 
              onClick={(e) => onToggleFavorite(event.id, e)}
              className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
            >
              <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-red-500 text-red-500")} />
            </button>
            <button 
              onClick={(e) => onOpenShareModal(event, e)}
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