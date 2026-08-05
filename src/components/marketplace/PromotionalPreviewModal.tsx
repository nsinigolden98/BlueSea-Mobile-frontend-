import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Share2, 
  Sparkles, 
  Maximize2, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  generateMarketingAssetDataUrl, 
  downloadMarketingAsset 
} from '@/utils/canvasGenerator';
import type { 
  AssetFormat, 
  MarketingAssetEvent 
} from '@/utils/canvasGenerator';

export interface PromotionalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MarketingAssetEvent;
  affiliateId?: string;
  onCopyToast?: (msg: string) => void;
}

export const PromotionalPreviewModal: React.FC<PromotionalPreviewModalProps> = ({
  isOpen,
  onClose,
  event,
  affiliateId,
  onCopyToast,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<AssetFormat>('poster');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [fullResView, setFullResView] = useState<boolean>(false);

  const promotionalUrl = `${window.location.origin}/marketplace?event=${event.id || ''}${affiliateId ? `&affiliate=${affiliateId}` : ''}`;

  const renderAsset = useCallback(async () => {
    setGenerating(true);
    try {
      const dataUrl = await generateMarketingAssetDataUrl(event, selectedFormat, affiliateId);
      setPreviewDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate promotional asset preview', err);
    } finally {
      setGenerating(false);
    }
  }, [event, selectedFormat, affiliateId]);

  useEffect(() => {
    if (isOpen) {
      renderAsset();
      setZoomLevel(100);
    }
  }, [isOpen, selectedFormat, renderAsset]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewDataUrl) return;
    downloadMarketingAsset(previewDataUrl, event.event_title, selectedFormat);
    if (onCopyToast) onCopyToast('Asset downloaded successfully!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(promotionalUrl);
    setCopiedLink(true);
    if (onCopyToast) onCopyToast('Promotional link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.event_title,
          text: `Check out ${event.event_title} on BlueSea Mobile Marketplace!`,
          url: promotionalUrl,
        });
      } catch (e) {
        console.log('Share canceled or failed', e);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-5xl flex items-center justify-between py-2 border-b border-slate-800 text-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold text-base sm:text-lg">Promotional Asset Preview</h2>
          {affiliateId && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              Code: {affiliateId}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-5xl flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 my-4 items-center min-h-0">
        <div className="md:col-span-4 space-y-5 text-white flex flex-col justify-center">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Asset Format</label>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
              {[
                { id: 'poster', label: 'Poster (Portrait 3:4)', desc: 'Instagram Stories / Status' },
                { id: 'square', label: 'Square Social (1:1)', desc: 'Feed Posts / Instagram' },
                { id: 'banner', label: 'Landscape Banner (16:9)', desc: 'X / LinkedIn / Web' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id as AssetFormat)}
                  className={cn(
                    "p-3 rounded-2xl text-left border transition-all flex flex-col justify-center",
                    selectedFormat === f.id
                      ? "bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/10"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <span className="font-bold text-xs text-white">{f.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Preview Scale</span>
              <span className="font-bold text-sky-400">{zoomLevel}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFullResView(!fullResView)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 ml-auto"
                title="Toggle Full Resolution"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={renderAsset}
            disabled={generating}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <RotateCcw className="w-4 h-4" />}
            Regenerate Asset
          </button>
        </div>

        <div className="md:col-span-8 flex items-center justify-center min-h-[350px] sm:min-h-[480px] bg-slate-900/60 rounded-3xl border border-slate-800 p-4 relative overflow-hidden">
          {generating ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
              <p className="text-xs font-semibold">Composing high-res promotional preview...</p>
            </div>
          ) : previewDataUrl ? (
            <div 
              className="max-h-[60vh] overflow-auto rounded-2xl flex items-center justify-center transition-all duration-300"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
            >
              <img
                src={previewDataUrl}
                alt={`${event.event_title} ${selectedFormat} preview`}
                className="max-h-[52vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-700/50"
              />
            </div>
          ) : (
            <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8" />
              <span>Failed to render asset preview</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-5xl pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <input
            type="text"
            readOnly
            value={promotionalUrl}
            className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-2.5 rounded-xl focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Copied' : 'Copy Link'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWebShare}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-sky-400" /> Share
          </button>

          <button
            onClick={handleDownload}
            disabled={generating || !previewDataUrl}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Download Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionalPreviewModal;