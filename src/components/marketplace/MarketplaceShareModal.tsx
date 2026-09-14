import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, X, Ticket, Check, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExtendedEvent } from './MarketplaceEventCard';
import type { MarketplaceEvent } from '@/types';

interface MarketplaceShareModalProps {
  shareModalEvent: ExtendedEvent | null;
  previewModalOpen: boolean;
  affiliateId: string;
  affiliateStatus: string;
  copiedLink: boolean;
  onClose: () => void;
  onCopyEventLink: (eventId: string) => void;
  onOpenPreviewModal: () => void;
  getEventImage: (event: MarketplaceEvent) => string;
}

export const MarketplaceShareModal: React.FC<MarketplaceShareModalProps> = ({
  shareModalEvent,
  previewModalOpen,
  affiliateId,
  affiliateStatus,
  copiedLink,
  onClose,
  onCopyEventLink,
  onOpenPreviewModal,
  getEventImage,
}) => {
  const navigate = useNavigate();

  if (!shareModalEvent || previewModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Share Event</h3>
              <p className="text-xs text-slate-500">Copy event link or build promo assets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          {getEventImage(shareModalEvent) ? (
            <img 
              src={getEventImage(shareModalEvent)} 
              alt={shareModalEvent.event_title} 
              className="w-12 h-12 rounded-xl object-cover shrink-0" 
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-slate-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">
              {shareModalEvent.event_title}
            </h4>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {shareModalEvent.event_location || 'Online Event'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Direct Event Link
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={`${window.location.origin}/marketplace?event=${shareModalEvent.id}${affiliateId ? `&ref=${affiliateId}` : ''}`}
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 truncate outline-none"
            />
            <button
              onClick={() => onCopyEventLink(shareModalEvent.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer",
                copiedLink 
                  ? "bg-emerald-500 text-white" 
                  : "bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20"
              )}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent border border-sky-500/20 space-y-3">
          {affiliateStatus === 'verified' || affiliateStatus === 'approved' ? (
            <>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <h5 className="text-xs font-bold text-sky-600 dark:text-sky-400">Verified Affiliate Access</h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Generate custom marketing flyers, posters, and track referral sales for this event.
              </p>
              <button
                onClick={onOpenPreviewModal}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Open Promotional Preview & Assets <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h5 className="text-xs font-bold text-slate-800 dark:text-white">Earn Commission on Ticket Sales!</h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Join our Affiliate Program to generate customized promotional flyers, custom banners, and earn cash for every attendee who registers through your link.
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/affiliate');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-900 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Join Affiliate Program <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};