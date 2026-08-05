type MarketingAssetEvent = {
  event_title: string;
  organizer_name?: string;
  event_date: string | Date;
  event_location: string;
  category: string;
  is_free: boolean;
};

export type AssetFormat = 'poster' | 'square' | 'banner';

export interface CanvasDimensions {
  width: number;
  height: number;
}

const FORMAT_DIMENSIONS: Record<AssetFormat, CanvasDimensions> = {
  poster: { width: 1200, height: 1600 }, // Portrait 3:4
  square: { width: 1080, height: 1080 }, // Square 1:1
  banner: { width: 1200, height: 630 },  // Landscape 16:9
};

export const generateMarketingAsset = async (
  event: MarketingAssetEvent,
  format: AssetFormat,
  affiliateId?: string
): Promise<void> => {
  const { width, height } = FORMAT_DIMENSIONS[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Background Dark Theme
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, width, height);

  // Decorative Accent Gradients
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#0284c7'); // sky-600
  bgGradient.addColorStop(1, '#0f172a'); // slate-900
  ctx.fillStyle = bgGradient;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1.0;

  // Card Container Box
  const margin = 40;
  ctx.fillStyle = '#1e293b'; // slate-800
  ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 32);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Branding Header: BlueSea Mobile Logo Text
  ctx.fillStyle = '#38bdf8'; // sky-400
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('BlueSea Mobile', margin + 40, margin + 70);

  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.font = '500 22px sans-serif';
  ctx.fillText('Powered by BlueSea Mobile Marketplace', margin + 40, margin + 105);

  // Format Specific Rendering
  if (format === 'poster') {
    // Event Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    wrapText(ctx, event.event_title, margin + 40, margin + 200, width - (margin + 40) * 2, 64);

    // Organizer Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 28px sans-serif';
    ctx.fillText(`Hosted by: ${event.organizer_name || 'BlueTickets Host'}`, margin + 40, margin + 340);

    // Event Details
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 28px sans-serif';
    ctx.fillText(`📅 Date: ${new Date(event.event_date).toLocaleDateString()}`, margin + 40, margin + 420);
    ctx.fillText(`📍 Venue: ${event.event_location}`, margin + 40, margin + 470);
    ctx.fillText(`🏷️ Category: ${event.category}`, margin + 40, margin + 520);

    // Starting Price Box
    ctx.fillStyle = '#0284c7';
    ctx.roundRect(margin + 40, margin + 580, 360, 80, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`Pass: ${event.is_free ? 'Free Entry' : 'Tickets Available'}`, margin + 60, margin + 632);

    // Affiliate ID Footer Badge
    if (affiliateId) {
      ctx.fillStyle = '#0f172a';
      ctx.roundRect(margin + 40, height - margin - 120, width - (margin + 40) * 2, 80, 20);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`Official Promotional Partner Code: ${affiliateId}`, margin + 70, height - margin - 72);
    }
  } else if (format === 'square') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    wrapText(ctx, event.event_title, margin + 40, margin + 200, width - (margin + 40) * 2, 54);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 26px sans-serif';
    ctx.fillText(`Organizer: ${event.organizer_name || 'BlueTickets Host'}`, margin + 40, margin + 320);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 26px sans-serif';
    ctx.fillText(`📅 ${new Date(event.event_date).toLocaleDateString()} | 📍 ${event.event_location}`, margin + 40, margin + 390);

    if (affiliateId) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Ref Code: ${affiliateId}`, margin + 40, margin + 460);
    }
  } else {
    // Banner
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    wrapText(ctx, event.event_title, margin + 40, margin + 190, width - (margin + 40) * 2, 48);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(`📅 ${new Date(event.event_date).toLocaleDateString()} • 📍 ${event.event_location}`, margin + 40, margin + 290);

    if (affiliateId) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 22px sans-serif';
      ctx.fillText(`Affiliate Reference: ${affiliateId}`, margin + 40, margin + 340);
    }
  }

  // Convert to downloadable image
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `${event.event_title.replace(/\s+/g, '-').toLowerCase()}-${format}.png`;
  link.href = dataUrl;
  link.click();
};

// Canvas Text Wrapping Helper Function
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}