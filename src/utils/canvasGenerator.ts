import type { MarketplaceEvent } from '@/types';

export type MarketingAssetType = 'poster' | 'square' | 'banner';

interface ExtendedEvent extends MarketplaceEvent {
  organizer_name?: string;
  venue_name?: string;
}

function getEventImageUrl(event: ExtendedEvent): string {
  if (event.event_banner && event.event_banner.startsWith('http')) return event.event_banner;
  if (event.ticket_image && event.ticket_image.startsWith('http')) return event.ticket_image;
  return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
}

/**
 * Draws the branded poster canvas using the event's main image.
 */
export function renderMarketingCanvas(
  event: ExtendedEvent,
  assetType: MarketingAssetType,
  affiliateId: string
): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');

    let width = 1080;
    let height = 1350; // Poster 4:5

    if (assetType === 'square') {
      width = 1080;
      height = 1080; // Square 1:1
    } else if (assetType === 'banner') {
      width = 1200;
      height = 630; // Banner 16:9
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(canvas);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getEventImageUrl(event);

    const drawCanvas = () => {
      // 1. Draw Background / Event Main Image
      if (img.complete && img.naturalWidth > 0) {
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width / 2) - (img.width / 2) * scale;
        const y = (height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Dark Overlay Gradient for Typography Readability
      const overlay = ctx.createLinearGradient(0, 0, 0, height);
      overlay.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      overlay.addColorStop(0.5, 'rgba(15, 23, 42, 0.7)');
      overlay.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, width, height);

      // 3. Top Header Branding Badge
      ctx.fillStyle = '#0284c7';
      ctx.roundRect(50, 50, 220, 44, 22);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('BLUESEA EVENTS', 75, 78);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('POWERED BY BLUESEA MOBILE', 300, 78);

      // 4. Event Title & Organizer
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 48px sans-serif';
      ctx.fillText(event.event_title || 'Featured Event', 50, height - 320, width - 100);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.fillText(`Hosted by: ${event.organizer_name || 'BlueTickets Organizer'}`, 50, height - 270);

      // 5. Date & Location Footer Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.roundRect(50, height - 230, width - 100, 160, 24);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`📅 ${new Date(event.event_date).toLocaleDateString()}`, 80, height - 170);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '18px sans-serif';
      ctx.fillText(`📍 ${event.event_location || 'Main Venue'}`, 80, height - 130);

      // 6. Referral Promo Badge Box
      ctx.fillStyle = '#0284c7';
      ctx.roundRect(width - 380, height - 210, 310, 120, 20);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('USE REFERRAL CODE', width - 350, height - 165);

      ctx.font = '900 28px sans-serif';
      ctx.fillText(affiliateId, width - 350, height - 125);

      resolve(canvas);
    };

    img.onload = drawCanvas;
    img.onerror = drawCanvas;
  });
}

/**
 * Generates and triggers browser PNG download for an event marketing asset.
 */
export async function generateMarketingAsset(
  event: ExtendedEvent,
  assetType: MarketingAssetType,
  affiliateId: string
): Promise<void> {
  const canvas = await renderMarketingCanvas(event, assetType, affiliateId);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BlueSea-${assetType}-${event.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}