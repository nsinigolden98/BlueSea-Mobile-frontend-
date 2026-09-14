import React from 'react';
import { MarketplaceEventCard, type ExtendedEvent } from './MarketplaceEventCard';
import type { MarketplaceEvent } from '@/types';

interface MarketplaceEventCollectionProps {
  title: string;
  items: ExtendedEvent[];
  onSelect: (event: ExtendedEvent) => void;
  onTicketAffiliateAction: (event: ExtendedEvent, e?: React.MouseEvent) => void;
  onToggleFavorite: (eventId: string, e?: React.MouseEvent) => void;
  onToggleSaveAffiliate: (eventId: string) => void;
  onOpenShareModal: (event: ExtendedEvent, e?: React.MouseEvent) => void;
  favorites: Record<string, boolean>;
  savedAffiliateEvents: string[];
  affiliateStatus: string;
  getImageUrl: (path: string | undefined) => string;
  getEventImage: (event: MarketplaceEvent) => string;
  formatDate: (dateString: string) => string;
  getStartingPrice: (event: ExtendedEvent) => string;
}

export const MarketplaceEventCollection: React.FC<MarketplaceEventCollectionProps> = ({
  title,
  items,
  onSelect,
  onTicketAffiliateAction,
  onToggleFavorite,
  onToggleSaveAffiliate,
  onOpenShareModal,
  favorites,
  savedAffiliateEvents,
  affiliateStatus,
  getImageUrl,
  getEventImage,
  formatDate,
  getStartingPrice,
}) => {
  if (!items || items.length === 0) return null;

  // Render a max subset bounded view initially to avoid excess layout DOM work
  const boundedItems = items.slice(0, 10);

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
        {boundedItems.map((event) => (
          <div 
            key={event.id} 
            className="snap-start shrink-0 w-[84vw] sm:w-[320px] md:w-[340px] flex flex-col"
          >
            <MarketplaceEventCard 
              event={event}
              onSelect={onSelect}
              onTicketAffiliateAction={onTicketAffiliateAction}
              onToggleFavorite={onToggleFavorite}
              onToggleSaveAffiliate={onToggleSaveAffiliate}
              onOpenShareModal={onOpenShareModal}
              isFavorite={!!favorites[event.id]}
              isSavedAffiliate={savedAffiliateEvents.includes(event.id)}
              affiliateStatus={affiliateStatus}
              getImageUrl={getImageUrl}
              getEventImage={getEventImage}
              formatDate={formatDate}
              getStartingPrice={getStartingPrice}
            />
          </div>
        ))}
      </div>
    </div>
  );
};