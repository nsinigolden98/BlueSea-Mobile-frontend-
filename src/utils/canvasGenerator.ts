export type AssetFormat = 'poster' | 'square' | 'banner';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface MarketingAssetEvent {
  id?: string;
  event_title: string;
  subtitle?: string;
  organizer_name?: string;
  is_verified_organizer?: boolean;
  event_date: string | Date;
  event_time?: string;
  event_location: string;
  venue_name?: string;
  city?: string;
  category: string;
  is_free: boolean;
  starting_price?: number | string;
  attendance_mode?: 'online' | 'physical' | 'hybrid';
  tags?: string[];
  event_banner?: string;
  ticket_image?: string;
}

export const FORMAT_DIMENSIONS: Record<AssetFormat, CanvasDimensions> = {
  poster: { width: 1200, height: 1600 }, // Portrait 3:4
  square: { width: 1080, height: 1080 }, // Square 1:1
  banner: { width: 1200, height: 630 },  // Landscape 16:9
};

// Helper: Safely load image for canvas with fallback
const loadImage = (src?: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

// Helper: Crop and draw image on canvas keeping aspect ratio
function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number = 0
) {
  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();
  }

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgRatio > targetRatio) {
    sw = img.naturalHeight * targetRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / targetRatio;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// Helper: Wrap text onto multiple lines on canvas
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 1;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '...', x, currentY);
        return currentY;
      }
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}

/**
 * Generates promotional asset canvas and returns Data URL.
 * DOES NOT trigger automatic download.
 */
export const generateMarketingAssetDataUrl = async (
  event: MarketingAssetEvent,
  format: AssetFormat,
  affiliateId?: string
): Promise<string> => {
  const { width, height } = FORMAT_DIMENSIONS[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Failed to create canvas context');

  // Load Event Image
  const imageUrl = event.event_banner || event.ticket_image;
  const eventImg = await loadImage(imageUrl);

  // Background Slate Theme
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, width, height);

  // Decorative Accent Gradients
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#0284c7'); // sky-600
  bgGradient.addColorStop(0.6, '#0f172a'); // slate-900
  ctx.fillStyle = bgGradient;
  ctx.globalAlpha = 0.25;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1.0;

  const margin = 40;
  const dateStr = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const organizerText = event.organizer_name || 'Verified BlueTickets Host';
  const priceTag = event.is_free ? 'Free Pass' : (event.starting_price ? `Pass: ₦${Number(event.starting_price).toLocaleString()}` : 'Tickets Available');
  const attendanceMode = (event.attendance_mode || 'Physical').toUpperCase();

  // FORMAT SPECIFIC CUSTOM LAYOUTS
  if (format === 'poster') {
    // ------------------- PORTRAIT POSTER (1200 x 1600) -------------------
    // Outer Border Card
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Banner Image Box
    const imgHeight = 620;
    if (eventImg) {
      drawCroppedImage(ctx, eventImg, margin + 20, margin + 110, width - (margin + 20) * 2, imgHeight, 24);
    } else {
      ctx.fillStyle = '#334155';
      ctx.roundRect(margin + 20, margin + 110, width - (margin + 20) * 2, imgHeight, 24);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('BlueSea Mobile Event', margin + 60, margin + 400);
    }

    // Branding Top Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('BlueSea Mobile', margin + 30, margin + 65);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px sans-serif';
    ctx.fillText('Powered by BlueSea Mobile Marketplace', width - margin - 420, margin + 65);

    // Event Info Section Below Image
    let contentY = margin + 110 + imgHeight + 50;

    // Category Pill & Mode Pill
    ctx.fillStyle = '#0284c7';
    ctx.roundRect(margin + 30, contentY, 200, 44, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(event.category.toUpperCase(), margin + 50, contentY + 28);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(margin + 245, contentY, 180, 44, 12);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(attendanceMode, margin + 265, contentY + 28);

    contentY += 80;

    // Event Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px sans-serif';
    contentY = wrapText(ctx, event.event_title, margin + 30, contentY, width - (margin + 30) * 2, 62, 3);

    // Subtitle if available
    if (event.subtitle) {
      contentY += 40;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 26px sans-serif';
      contentY = wrapText(ctx, event.subtitle, margin + 30, contentY, width - (margin + 30) * 2, 34, 2);
    }

    contentY += 55;

    // Organizer Row
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Hosted by: ${organizerText}`, margin + 30, contentY);

    contentY += 50;

    // Date & Location
    ctx.fillStyle = '#f8fafc';
    ctx.font = '500 26px sans-serif';
    ctx.fillText(`📅 ${dateStr}${event.event_time ? ` • ${event.event_time}` : ''}`, margin + 30, contentY);

    contentY += 45;
    ctx.fillText(`📍 ${event.venue_name ? `${event.venue_name}, ` : ''}${event.event_location}`, margin + 30, contentY);

    // Price Box
    ctx.fillStyle = '#0284c7';
    ctx.roundRect(width - margin - 360, contentY - 70, 320, 75, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(priceTag, width - margin - 330, contentY - 24);

    // Affiliate Footer Badge
    if (affiliateId) {
      const footerY = height - margin - 110;
      ctx.fillStyle = '#0f172a';
      ctx.roundRect(margin + 30, footerY, width - (margin + 30) * 2, 80, 20);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`Official Promotional Partner Code: ${affiliateId}`, margin + 60, footerY + 48);
    }

  } else if (format === 'square') {
    // ------------------- SQUARE SOCIAL (1080 x 1080) -------------------
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 28);
    ctx.fill();

    // Top Image
    const imgHeight = 440;
    if (eventImg) {
      drawCroppedImage(ctx, eventImg, margin + 20, margin + 20, width - (margin + 20) * 2, imgHeight, 20);
    } else {
      ctx.fillStyle = '#334155';
      ctx.roundRect(margin + 20, margin + 20, width - (margin + 20) * 2, imgHeight, 20);
      ctx.fill();
    }

    let contentY = margin + imgHeight + 60;

    // Category Pill
    ctx.fillStyle = '#0284c7';
    ctx.roundRect(margin + 30, contentY - 30, 180, 38, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(event.category.toUpperCase(), margin + 45, contentY - 5);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    contentY = wrapText(ctx, event.event_title, margin + 30, contentY + 30, width - (margin + 30) * 2, 52, 2);

    contentY += 45;

    // Host & Details
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(`Organizer: ${organizerText}`, margin + 30, contentY);

    contentY += 40;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 24px sans-serif';
    ctx.fillText(`📅 ${dateStr} | 📍 ${event.event_location}`, margin + 30, contentY);

    contentY += 45;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(priceTag, margin + 30, contentY);

    if (affiliateId) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 20px sans-serif';
      ctx.fillText(`Ref Partner Code: ${affiliateId} • Powered by BlueSea Mobile`, margin + 30, height - margin - 35);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 20px sans-serif';
      ctx.fillText('Powered by BlueSea Mobile Marketplace', margin + 30, height - margin - 35);
    }

  } else {
    // ------------------- LANDSCAPE BANNER (1200 x 630) -------------------
    ctx.fillStyle = '#1e293b';
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 24);
    ctx.fill();

    const rightImgWidth = 440;
    const rightImgHeight = height - margin * 2 - 40;

    if (eventImg) {
      drawCroppedImage(ctx, eventImg, width - margin - rightImgWidth - 20, margin + 20, rightImgWidth, rightImgHeight, 20);
    } else {
      ctx.fillStyle = '#334155';
      ctx.roundRect(width - margin - rightImgWidth - 20, margin + 20, rightImgWidth, rightImgHeight, 20);
      ctx.fill();
    }

    const leftWidth = width - margin * 2 - rightImgWidth - 60;
    let contentY = margin + 60;

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('BlueSea Mobile Marketplace', margin + 30, contentY);

    contentY += 50;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px sans-serif';
    contentY = wrapText(ctx, event.event_title, margin + 30, contentY, leftWidth, 48, 2);

    contentY += 40;

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(`Hosted by: ${organizerText}`, margin + 30, contentY);

    contentY += 40;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '500 22px sans-serif';
    ctx.fillText(`📅 ${dateStr} • 📍 ${event.event_location}`, margin + 30, contentY);

    contentY += 45;

    ctx.fillStyle = '#0284c7';
    ctx.roundRect(margin + 30, contentY - 25, 240, 50, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(priceTag, margin + 50, contentY + 8);

    if (affiliateId) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 18px sans-serif';
      ctx.fillText(`Affiliate Code: ${affiliateId}`, margin + 300, contentY + 8);
    }
  }

  return canvas.toDataURL('image/png');
};

/**
 * Triggers file download from Data URL.
 * File name format: event-name-poster.png, event-name-square.png, event-name-banner.png
 */
export const downloadMarketingAsset = (
  dataUrl: string,
  eventTitle: string,
  format: AssetFormat
): void => {
  const slugified = eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'event';
  const fileName = `${slugified}-${format}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};