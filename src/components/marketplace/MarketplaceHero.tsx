import React from 'react';
import { Sparkles, Heart, Share2, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerifiedBadge, type ExtendedEvent } from './MarketplaceEventCard';
import type { MarketplaceEvent } from '@/types';

interface MarketplaceHeroProps {
  featuredEvent: ExtendedEvent | null;
  onSelect: (event: ExtendedEvent) => void;
  onToggleFavorite: (eventId: string, e?: React.MouseEvent) => void;
  onOpenShareModal: (event: ExtendedEvent, e?: React.MouseEvent) => void;
  isFavorite: boolean;
  getEventImage: (event: MarketplaceEvent) => string;
  formatDate: (dateString: string) => string;
  getStartingPrice: (event: ExtendedEvent) => string;
}

export const MarketplaceHero: React.FC<MarketplaceHeroProps> = ({
  featuredEvent,
  onSelect,
  onToggleFavorite,
  onOpenShareModal,
  isFavorite,
  getEventImage,
  formatDate,
  getStartingPrice,
}) => {
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
              onClick={(e) => onToggleFavorite(featuredEvent.id, e)}
              className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
            >
              <Heart className={cn("w-3.5 h-3.5", isFavorite && "fill-red-500 text-red-500")} />
            </button>
            <button 
              onClick={(e) => onOpenShareModal(featuredEvent, e)}
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
              onClick={() => onSelect(featuredEvent)}
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