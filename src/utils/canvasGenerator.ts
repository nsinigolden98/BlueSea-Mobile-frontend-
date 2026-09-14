import { API_BASE } from '@/types';

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
  resolved_image?: string;
  image_url?: string;
}

export const FORMAT_DIMENSIONS: Record<AssetFormat, CanvasDimensions> = {
  poster: { width: 1200, height: 1600 }, // Portrait 3:4
  square: { width: 1080, height: 1080 }, // Square 1:1
  banner: { width: 1200, height: 630 },  // Landscape 16:9
};

export const DEFAULT_MARKETPLACE_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * Resolves relative and absolute image URLs to match Marketplace behavior.
 */
export const resolveEventImageUrl = (path?: string): string => {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const baseUrl = API_BASE || '';
  if (path.startsWith('/') && baseUrl.endsWith('/')) {
    return `${baseUrl}${path.slice(1)}`;
  }
  if (!path.startsWith('/') && !baseUrl.endsWith('/') && baseUrl) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}${path}`;
};

/**
 * Inherits the exact same resolved image logic used on Marketplace cards.
 */
export const getMarketingEventImage = (event: MarketingAssetEvent): string => {
  const candidate =
    event.resolved_image ||
    event.image_url ||
    event.event_banner ||
    event.ticket_image;

  if (candidate) {
    return resolveEventImageUrl(candidate);
  }
  return DEFAULT_MARKETPLACE_IMAGE;
};

// Helper for drawing rounded rectangle paths safely across environments
function fillRoundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  fillRoundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  fillRoundRectPath(ctx, x, y, w, h, r);
  ctx.stroke();
}

// Safely load image for canvas with defensive mobile WebView handling
const loadImage = (src?: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (!src) return resolve(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    let settled = false;
    const finalize = (result: HTMLImageElement | null) => {
      if (!settled) {
        settled = true;
        resolve(result);
      }
    };

    const timeoutId = setTimeout(() => {
      finalize(null);
    }, 8000);

    img.onload = async () => {
      clearTimeout(timeoutId);
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        if ('decode' in img && typeof img.decode === 'function') {
          try {
            await img.decode();
          } catch {
            // Safe fallback on decode error
          }
        }
        finalize(img);
      } else {
        finalize(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      finalize(null);
    };

    img.src = src;

    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      clearTimeout(timeoutId);
      finalize(img);
    }
  });
};

// Crop and draw image maintaining aspect ratio safely
function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number = 0
) {
  if (!img.naturalWidth || !img.naturalHeight) return;

  ctx.save();
  if (radius > 0) {
    fillRoundRectPath(ctx, x, y, w, h, radius);
    ctx.clip();
  }

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;
  let sx = 0,
    sy = 0,
    sw = img.naturalWidth,
    sh = img.naturalHeight;

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

// Wrap text onto multiple lines cleanly with bounds checking
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  if (!text) return y;

  const words = text.trim().split(/\s+/);
  let line = '';
  let currentY = y;
  let lineCount = 1;

  for (let n = 0; n < words.length; n++) {
    const testLine = line ? `${line} ${words[n]}` : words[n];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      if (lineCount >= maxLines) {
        ctx.fillText(`${line}...`, x, currentY);
        return currentY;
      }
      ctx.fillText(line, x, currentY);
      line = words[n];
      currentY += lineHeight;
      lineCount++;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
  }

  return currentY;
}

// Draw modern background with subtle accent glow
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const glow1 = ctx.createRadialGradient(
    width * 0.85,
    height * 0.15,
    0,
    width * 0.85,
    height * 0.15,
    width * 0.5
  );
  glow1.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
  glow1.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(
    width * 0.15,
    height * 0.85,
    0,
    width * 0.15,
    height * 0.85,
    width * 0.5
  );
  glow2.addColorStop(0, 'rgba(2, 132, 199, 0.18)');
  glow2.addColorStop(1, 'rgba(2, 132, 199, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Generates promotional asset canvas and returns Data URL using HTML5 Canvas API.
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

  // Load Event Image with fallback
  const primaryImageUrl = getMarketingEventImage(event);
  let eventImg = await loadImage(primaryImageUrl);
  if (!eventImg && primaryImageUrl !== DEFAULT_MARKETPLACE_IMAGE) {
    eventImg = await loadImage(DEFAULT_MARKETPLACE_IMAGE);
  }

  // Common formatted text variables
  const dateObj = new Date(event.event_date);
  const dateStr = isNaN(dateObj.getTime())
    ? String(event.event_date)
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const organizerText = event.organizer_name || 'BlueTickets Host';
  const priceTag = event.is_free
    ? 'Free Pass'
    : event.starting_price
    ? `Price: ₦${Number(event.starting_price).toLocaleString()}`
    : 'Tickets Available';
  const attendanceMode = (event.attendance_mode || 'Physical').toUpperCase();
  const categoryText = (event.category || 'EVENT').toUpperCase();

  const locationParts: string[] = [];
  if (event.venue_name) locationParts.push(event.venue_name);
  if (event.event_location) locationParts.push(event.event_location);
  if (event.city && !event.event_location?.includes(event.city)) locationParts.push(event.city);
  const locationText = locationParts.join(', ') || 'See Event Details';

  drawBackground(ctx, width, height);

  if (format === 'poster') {
    // ------------------- PORTRAIT POSTER (1200 x 1600) -------------------
    const margin = 40;
    const cardX = margin;
    const cardY = margin;
    const cardW = width - margin * 2;
    const cardH = height - margin * 2;

    ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, 32);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 32);

    const contentX = cardX + 48;
    const contentWidth = cardW - 96;

    // Header Branding
    ctx.fillStyle = '#38bdf8';
    ctx.font = `800 36px ${FONT_FAMILY}`;
    ctx.fillText('BlueSea Mobile', contentX, cardY + 68);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 22px ${FONT_FAMILY}`;
    ctx.textAlign = 'right';
    ctx.fillText('BlueSea Mobile Marketplace', contentX + contentWidth, cardY + 68);
    ctx.textAlign = 'left';

    // Hero Image (Expanded height to remove bottom dead space)
    const imgY = cardY + 100;
    const imgHeight = 680;
    if (eventImg) {
      drawCroppedImage(ctx, eventImg, contentX, imgY, contentWidth, imgHeight, 24);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      strokeRoundRect(ctx, contentX, imgY, contentWidth, imgHeight, 24);
    } else {
      ctx.fillStyle = '#1e293b';
      fillRoundRect(ctx, contentX, imgY, contentWidth, imgHeight, 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `bold 32px ${FONT_FAMILY}`;
      ctx.fillText('BlueSea Mobile Event', contentX + 40, imgY + imgHeight / 2);
    }

    let currentY = imgY + imgHeight + 48;

    // Badges Row
    ctx.font = `bold 20px ${FONT_FAMILY}`;
    const catWidth = ctx.measureText(categoryText).width + 44;
    ctx.fillStyle = '#0284c7';
    fillRoundRect(ctx, contentX, currentY, catWidth, 44, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(categoryText, contentX + 22, currentY + 29);

    const modeWidth = ctx.measureText(attendanceMode).width + 44;
    const modeX = contentX + catWidth + 16;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    fillRoundRect(ctx, modeX, currentY, modeWidth, 44, 12);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(attendanceMode, modeX + 22, currentY + 29);

    currentY += 88;

    // Prominent Large Event Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 64px ${FONT_FAMILY}`;
    currentY = wrapText(ctx, event.event_title, contentX, currentY, contentWidth, 74, 3);

    // Hosted By
    currentY += 52;
    ctx.fillStyle = '#38bdf8';
    ctx.font = `600 30px ${FONT_FAMILY}`;
    ctx.fillText(`Hosted by: ${organizerText}`, contentX, currentY);

    // Date & Time
    currentY += 48;
    ctx.fillStyle = '#f8fafc';
    ctx.font = `600 30px ${FONT_FAMILY}`;
    ctx.fillText(`📅 ${dateStr}${event.event_time ? ` • ${event.event_time}` : ''}`, contentX, currentY);

    // Location & Venue
    currentY += 44;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `500 28px ${FONT_FAMILY}`;
    currentY = wrapText(ctx, `📍 ${locationText}`, contentX, currentY, contentWidth, 38, 2);

    // Prominent Price Tag
    currentY += 52;
    ctx.font = `800 32px ${FONT_FAMILY}`;
    const priceWidth = ctx.measureText(priceTag).width + 64;
    ctx.fillStyle = '#0284c7';
    fillRoundRect(ctx, contentX, currentY, priceWidth, 68, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(priceTag, contentX + 32, currentY + 45);

    // Affiliate Code Box (if present)
    if (affiliateId) {
      const affiliateY = height - margin - 130;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      fillRoundRect(ctx, contentX, affiliateY, contentWidth, 70, 16);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      strokeRoundRect(ctx, contentX, affiliateY, contentWidth, 70, 16);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold 24px ${FONT_FAMILY}`;
      ctx.fillText(
        `Official Promotional Partner Code: ${affiliateId}`,
        width / 2,
        affiliateY + 43
      );
      ctx.textAlign = 'left';
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 22px ${FONT_FAMILY}`;
    ctx.fillText('Powered by BlueSea Mobile', width / 2, height - margin - 25);
    ctx.textAlign = 'left';

  } else if (format === 'square') {
    // ------------------- SQUARE SOCIAL (1080 x 1080) -------------------
    const margin = 32;
    const cardX = margin;
    const cardY = margin;
    const cardW = width - margin * 2;
    const cardH = height - margin * 2;

    ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 28);

    const contentX = cardX + 36;
    const contentWidth = cardW - 72;

    // Hero Image
    const imgY = cardY + 28;
    const imgHeight = 440;
    if (eventImg) {
      drawCroppedImage(ctx, eventImg, contentX, imgY, contentWidth, imgHeight, 20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      strokeRoundRect(ctx, contentX, imgY, contentWidth, imgHeight, 20);
    } else {
      ctx.fillStyle = '#1e293b';
      fillRoundRect(ctx, contentX, imgY, contentWidth, imgHeight, 20);
    }

    let currentY = imgY + imgHeight + 32;

    // Badges Row
    ctx.font = `bold 18px ${FONT_FAMILY}`;
    const catWidth = ctx.measureText(categoryText).width + 36;
    ctx.fillStyle = '#0284c7';
    fillRoundRect(ctx, contentX, currentY, catWidth, 40, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(categoryText, contentX + 18, currentY + 26);

    const modeWidth = ctx.measureText(attendanceMode).width + 36;
    const modeX = contentX + catWidth + 14;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    fillRoundRect(ctx, modeX, currentY, modeWidth, 40, 10);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(attendanceMode, modeX + 18, currentY + 26);

    currentY += 60;

    // Event Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 44px ${FONT_FAMILY}`;
    currentY = wrapText(ctx, event.event_title, contentX, currentY, contentWidth, 52, 2);

    // Hosted By
    currentY += 42;
    ctx.fillStyle = '#38bdf8';
    ctx.font = `600 24px ${FONT_FAMILY}`;
    ctx.fillText(`Hosted by: ${organizerText}`, contentX, currentY);

    // Date & Time
    currentY += 38;
    ctx.fillStyle = '#f8fafc';
    ctx.font = `600 22px ${FONT_FAMILY}`;
    ctx.fillText(`📅 ${dateStr}${event.event_time ? ` • ${event.event_time}` : ''}`, contentX, currentY);

    // Location
    currentY += 34;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `500 21px ${FONT_FAMILY}`;
    currentY = wrapText(ctx, `📍 ${locationText}`, contentX, currentY, contentWidth, 28, 2);

    // Price Badge & Affiliate Code Box
    currentY += 42;
    ctx.font = `800 24px ${FONT_FAMILY}`;
    const priceWidth = ctx.measureText(priceTag).width + 52;
    ctx.fillStyle = '#0284c7';
    fillRoundRect(ctx, contentX, currentY, priceWidth, 52, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(priceTag, contentX + 26, currentY + 35);

    if (affiliateId) {
      const codeX = contentX + priceWidth + 16;
      ctx.font = `700 20px ${FONT_FAMILY}`;
      const codeText = `Partner Code: ${affiliateId}`;
      const codeWidth = ctx.measureText(codeText).width + 40;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      fillRoundRect(ctx, codeX, currentY, codeWidth, 52, 12);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      strokeRoundRect(ctx, codeX, currentY, codeWidth, 52, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(codeText, codeX + 20, currentY + 33);
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 20px ${FONT_FAMILY}`;
    ctx.fillText('Powered by BlueSea Mobile', width / 2, height - margin - 20);
    ctx.textAlign = 'left';

  } else {
    // ------------------- LANDSCAPE BANNER (1200 x 630) -------------------
    const margin = 24;
    const cardX = margin;
    const cardY = margin;
    const cardW = width - margin * 2;
    const cardH = height - margin * 2;

    ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, 24);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    strokeRoundRect(ctx, cardX, cardY, cardW, cardH, 24);

    const rightImgW = 460;
    const rightImgH = cardH - 52;
    const rightImgX = cardX + cardW - 26 - rightImgW;
    const rightImgY = cardY + 26;

    if (eventImg) {
      drawCroppedImage(ctx, eventImg, rightImgX, rightImgY, rightImgW, rightImgH, 20);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      strokeRoundRect(ctx, rightImgX, rightImgY, rightImgW, rightImgH, 20);
    } else {
      ctx.fillStyle = '#1e293b';
      fillRoundRect(ctx, rightImgX, rightImgY, rightImgW, rightImgH, 20);
    }

    const leftX = cardX + 32;
    const leftWidth = rightImgX - leftX - 28;
    let currentY = cardY + 48;

    // Header
    ctx.fillStyle = '#38bdf8';
    ctx.font = `800 26px ${FONT_FAMILY}`;
    ctx.fillText('BlueSea Mobile', leftX, currentY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 18px ${FONT_FAMILY}`;
    ctx.fillText('Marketplace', leftX + 210, currentY);

    currentY += 30;

    // Badges Row
    ctx.font = `bold 15px ${FONT_FAMILY}`;
    const catWidth = ctx.measureText(categoryText).width + 30;
    ctx.fillStyle = '#0284c7';
    fillRoundRect(ctx, leftX, currentY, catWidth, 34, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(categoryText, leftX + 15, currentY + 22);

    const modeWidth = ctx.measureText(attendanceMode).width + 30;
    const modeX = leftX + catWidth + 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    fillRoundRect(ctx, modeX, currentY, modeWidth, 34, 8);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(attendanceMode, modeX + 15, currentY + 22);

    currentY += 56;

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 38px ${FONT_FAMILY}`;
    currentY = wrapText(ctx, event.event_title, leftX, currentY, leftWidth, 46, 2);

    // Hosted By
    currentY += 38;
    ctx.fillStyle = '#38bdf8';
    ctx.font = `600 22px ${FONT_FAMILY}`;
    ctx.fillText(`Hosted by: ${organizerText}`, leftX, currentY);

    // Date & Time
    currentY += 34;
    ctx.fillStyle = '#f8fafc';
    ctx.font = `600 20px ${FONT_FAMILY}`;
    ctx.fillText(`📅 ${dateStr}${event.event_time ? ` • ${event.event_time}` : ''}`, leftX, currentY);

    // Location
    currentY += 30;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `500 18px ${FONT_FAMILY}`;
    currentY = wrapText(ctx, `📍 ${locationText}`, leftX, currentY, leftWidth, 24, 1);

// Price Badge & Code
    currentY += 34;
    ctx.font = `800 22px ${FONT_FAMILY}`;
    const priceWidth = ctx.measureText(priceTag).width + 44;
    ctx.fillStyle = '#0284c7';
    fillRoundRect(ctx, leftX, currentY, priceWidth, 46, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(priceTag, leftX + 22, currentY + 30);

    if (affiliateId) {
      const codeX = leftX + priceWidth + 14;
      ctx.font = `700 18px ${FONT_FAMILY}`;
      const codeText = `Code: ${affiliateId}`;
      const codeWidth = ctx.measureText(codeText).width + 30;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      fillRoundRect(ctx, codeX, currentY, codeWidth, 46, 10);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      strokeRoundRect(ctx, codeX, currentY, codeWidth, 46, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(codeText, codeX + 15, currentY + 29);
    }

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = `500 16px ${FONT_FAMILY}`;
    ctx.fillText('Powered by BlueSea Mobile', leftX, cardY + cardH - 20);
  }

  return canvas.toDataURL('image/png');
};

/**
 * Triggers file download from Data URL.
 */
export const downloadMarketingAsset = (
  dataUrl: string,
  eventTitle: string,
  format: AssetFormat
): void => {
  const slugified =
    eventTitle
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