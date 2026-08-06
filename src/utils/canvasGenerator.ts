import { API_BASE } from '@/types';
import { toPng } from 'html-to-image';

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

/**
 * Escapes unsafe characters for safe embedding inside HTML string templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Converts an image URL into a base64 Data URL to prevent CORS/canvas tainting issues.
 * Gracefully falls back to DEFAULT_MARKETPLACE_IMAGE if the primary image cannot be fetched.
 */
async function imageUrlToDataUrl(url: string): Promise<string> {
  if (!url) return DEFAULT_MARKETPLACE_IMAGE;
  if (url.startsWith('data:')) return url;

  const fetchAsBase64 = async (targetUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(targetUrl, { mode: 'cors' });
      if (!response.ok) return null;
      const blob = await response.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string' && reader.result.startsWith('data:image')) {
            resolve(reader.result);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const drawToCanvasBase64 = async (targetUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = targetUrl;
    });
  };

  // Try converting primary image
  let dataUrl = await fetchAsBase64(url);
  if (dataUrl) return dataUrl;

  dataUrl = await drawToCanvasBase64(url);
  if (dataUrl) return dataUrl;

  // Fallback to DEFAULT_MARKETPLACE_IMAGE if primary image failed
  if (url !== DEFAULT_MARKETPLACE_IMAGE) {
    let fallbackDataUrl = await fetchAsBase64(DEFAULT_MARKETPLACE_IMAGE);
    if (!fallbackDataUrl) {
      fallbackDataUrl = await drawToCanvasBase64(DEFAULT_MARKETPLACE_IMAGE);
    }
    if (fallbackDataUrl) return fallbackDataUrl;
  }

  return url;
}

/**
 * Builds modern, high-resolution HTML template for the specified asset format.
 */
function buildMarketingAssetHtml(
  event: MarketingAssetEvent,
  format: AssetFormat,
  imageDataUrl: string,
  affiliateId?: string
): string {
  const fontStack =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const dateObj = new Date(event.event_date);
  const formattedDate = isNaN(dateObj.getTime())
    ? escapeHtml(String(event.event_date))
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const title = escapeHtml(event.event_title);
  const organizerText = escapeHtml(event.organizer_name || 'BlueTickets Host');

  const priceTagText = escapeHtml(
    event.is_free
      ? 'Free Pass'
      : event.starting_price
      ? `Price: ₦${Number(event.starting_price).toLocaleString()}`
      : 'Tickets Available'
  );

  const attendanceMode = escapeHtml((event.attendance_mode || 'Physical').toUpperCase());
  const categoryText = escapeHtml((event.category || 'EVENT').toUpperCase());

  const locationParts: string[] = [];
  if (event.venue_name) locationParts.push(event.venue_name);
  if (event.event_location) locationParts.push(event.event_location);
  if (event.city && !event.event_location?.includes(event.city)) locationParts.push(event.city);
  const locationText = escapeHtml(locationParts.join(', ') || 'See Event Details');

  const formattedTime = event.event_time ? escapeHtml(event.event_time) : '';
  const escapedAffiliateId = affiliateId ? escapeHtml(affiliateId) : '';

  if (format === 'poster') {
    return `
      <div style="
        width: 1200px;
        height: 1600px;
        background: #090d16;
        background-image:
          radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 15% 85%, rgba(2, 132, 199, 0.18) 0%, transparent 45%),
          linear-gradient(180deg, #090d16 0%, #0f172a 100%);
        padding: 40px;
        box-sizing: border-box;
        font-family: ${fontStack};
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
      ">
        <div style="
          width: 1120px;
          height: 1520px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 32px;
          padding: 44px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        ">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="font-size: 34px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px;">
              BlueSea Mobile
            </div>
            <div style="font-size: 20px; font-weight: 500; color: #94a3b8; letter-spacing: 0.5px;">
              BlueSea Mobile Marketplace
            </div>
          </div>

          <!-- Hero Image -->
          <div style="width: 1032px; height: 600px; border-radius: 24px; overflow: hidden; position: relative; background: #1e293b; box-shadow: 0 16px 32px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08);">
            <img src="${imageDataUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          </div>

          <!-- Main Content -->
          <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
            <div style="display: flex; gap: 14px; align-items: center;">
              <span style="background: #0284c7; color: #ffffff; font-size: 18px; font-weight: 700; padding: 8px 20px; border-radius: 12px; letter-spacing: 0.8px; text-transform: uppercase;">
                ${categoryText}
              </span>
              <span style="background: rgba(255, 255, 255, 0.12); color: #e2e8f0; font-size: 18px; font-weight: 600; padding: 8px 20px; border-radius: 12px; letter-spacing: 0.8px; text-transform: uppercase;">
                ${attendanceMode}
              </span>
            </div>

            <h1 style="font-size: 50px; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.15; letter-spacing: -0.5px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">
              ${title}
            </h1>

            <div style="font-size: 26px; font-weight: 600; color: #38bdf8;">
              Hosted by: ${organizerText}
            </div>

            <div style="font-size: 26px; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 10px;">
              <span>📅</span>
              <span>${formattedDate}${formattedTime ? ` • ${formattedTime}` : ''}</span>
            </div>

            <div style="font-size: 24px; font-weight: 500; color: #cbd5e1; display: flex; align-items: center; gap: 10px;">
              <span>📍</span>
              <span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${locationText}</span>
            </div>

            <div>
              <span style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-size: 28px; font-weight: 800; padding: 14px 32px; border-radius: 16px; display: inline-block; box-shadow: 0 8px 16px rgba(2, 132, 199, 0.3);">
                ${priceTagText}
              </span>
            </div>
          </div>

          <!-- Affiliate Code Box -->
          ${
            escapedAffiliateId
              ? `<div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #38bdf8; border-radius: 16px; padding: 16px 28px; display: flex; justify-content: center; align-items: center; gap: 12px;">
                  <span style="font-size: 22px; font-weight: 700; color: #38bdf8;">Official Promotional Partner Code:</span>
                  <span style="font-size: 24px; font-weight: 800; color: #ffffff; background: #0284c7; padding: 4px 16px; border-radius: 8px;">${escapedAffiliateId}</span>
                </div>`
              : ''
          }

          <!-- Footer -->
          <div style="text-align: center; font-size: 20px; font-weight: 500; color: #94a3b8; letter-spacing: 0.5px;">
            Powered by BlueSea Mobile
          </div>
        </div>
      </div>
    `;
  }

  if (format === 'square') {
    return `
      <div style="
        width: 1080px;
        height: 1080px;
        background: #090d16;
        background-image:
          radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 15% 85%, rgba(2, 132, 199, 0.18) 0%, transparent 45%),
          linear-gradient(180deg, #090d16 0%, #0f172a 100%);
        padding: 32px;
        box-sizing: border-box;
        font-family: ${fontStack};
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
      ">
        <div style="
          width: 1016px;
          height: 1016px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 28px;
          padding: 32px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        ">
          <!-- Hero Image -->
          <div style="width: 952px; height: 420px; border-radius: 20px; overflow: hidden; position: relative; background: #1e293b; box-shadow: 0 12px 24px rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08);">
            <img src="${imageDataUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          </div>

          <!-- Main Content -->
          <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <span style="background: #0284c7; color: #ffffff; font-size: 16px; font-weight: 700; padding: 6px 16px; border-radius: 10px; letter-spacing: 0.8px; text-transform: uppercase;">
                ${categoryText}
              </span>
              <span style="background: rgba(255, 255, 255, 0.12); color: #e2e8f0; font-size: 16px; font-weight: 600; padding: 6px 16px; border-radius: 10px; letter-spacing: 0.8px; text-transform: uppercase;">
                ${attendanceMode}
              </span>
            </div>

            <h1 style="font-size: 38px; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.18; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">
              ${title}
            </h1>

            <div style="font-size: 22px; font-weight: 600; color: #38bdf8;">
              Hosted by: ${organizerText}
            </div>

            <div style="font-size: 20px; font-weight: 500; color: #e2e8f0; display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
              <span>📅 ${formattedDate}${formattedTime ? ` • ${formattedTime}` : ''}</span>
              <span>📍 ${locationText}</span>
            </div>

            <div style="display: flex; gap: 16px; align-items: center; margin-top: 4px;">
              <span style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-size: 22px; font-weight: 800; padding: 10px 24px; border-radius: 14px; display: inline-block;">
                ${priceTagText}
              </span>
              ${
                escapedAffiliateId
                  ? `<span style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #38bdf8; color: #38bdf8; font-size: 18px; font-weight: 700; padding: 8px 18px; border-radius: 12px;">
                      Partner Code: ${escapedAffiliateId}
                    </span>`
                  : ''
              }
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; font-size: 18px; font-weight: 500; color: #94a3b8; letter-spacing: 0.5px;">
            Powered by BlueSea Mobile
          </div>
        </div>
      </div>
    `;
  }

  // Banner format
  return `
    <div style="
      width: 1200px;
      height: 630px;
      background: #090d16;
      background-image:
        radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.18) 0%, transparent 45%),
        radial-gradient(circle at 15% 85%, rgba(2, 132, 199, 0.18) 0%, transparent 45%),
        linear-gradient(180deg, #090d16 0%, #0f172a 100%);
      padding: 24px;
      box-sizing: border-box;
      font-family: ${fontStack};
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    ">
      <div style="
        width: 1152px;
        height: 582px;
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px;
        padding: 28px;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: 28px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      ">
        <!-- Left Side Content -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; width: 620px; height: 100%;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 24px; font-weight: 800; color: #38bdf8;">BlueSea Mobile</span>
              <span style="font-size: 16px; font-weight: 500; color: #94a3b8;">Marketplace</span>
            </div>

            <div style="display: flex; gap: 10px; align-items: center;">
              <span style="background: #0284c7; color: #ffffff; font-size: 14px; font-weight: 700; padding: 4px 14px; border-radius: 8px; letter-spacing: 0.8px; text-transform: uppercase;">
                ${categoryText}
              </span>
              <span style="background: rgba(255, 255, 255, 0.12); color: #e2e8f0; font-size: 14px; font-weight: 600; padding: 4px 14px; border-radius: 8px; letter-spacing: 0.8px; text-transform: uppercase;">
                ${attendanceMode}
              </span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <h1 style="font-size: 34px; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.15; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">
              ${title}
            </h1>
            <div style="font-size: 20px; font-weight: 600; color: #38bdf8;">
              Hosted by: ${organizerText}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 18px; font-weight: 500; color: #cbd5e1;">
            <div>📅 ${formattedDate}${formattedTime ? ` • ${formattedTime}` : ''}</div>
            <div style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">📍 ${locationText}</div>
          </div>

          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-size: 20px; font-weight: 800; padding: 8px 20px; border-radius: 12px; display: inline-block;">
              ${priceTagText}
            </span>
            ${
              escapedAffiliateId
                ? `<span style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #38bdf8; color: #38bdf8; font-size: 16px; font-weight: 700; padding: 6px 14px; border-radius: 10px;">
                    Code: ${escapedAffiliateId}
                  </span>`
                : ''
            }
          </div>

          <div style="font-size: 16px; font-weight: 500; color: #94a3b8;">
            Powered by BlueSea Mobile
          </div>
        </div>

        <!-- Right Side Hero Image -->
        <div style="width: 440px; height: 526px; border-radius: 20px; overflow: hidden; background: #1e293b; box-shadow: 0 10px 20px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); flex-shrink: 0;">
          <img src="${imageDataUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
      </div>
    </div>
  `;
}

/**
 * Converts a DOM element to PNG Data URL using html-to-image with SVG foreignObject fallback.
 */
async function elementToDataUrl(
  element: HTMLElement,
  width: number,
  height: number
): Promise<string> {
  try {
    return await toPng(element, {
      width,
      height,
      pixelRatio: 1,
      cacheBust: false,
    });
  } catch (err) {
    return svgForeignObjectToDataUrl(element, width, height);
  }
}

/**
 * Fallback converter using SVG foreignObject + Canvas.
 */
async function svgForeignObjectToDataUrl(
  element: HTMLElement,
  width: number,
  height: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const htmlString = element.outerHTML;
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
              ${htmlString}
            </div>
          </foreignObject>
        </svg>
      `;

      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error('Failed to create canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to render SVG to image: ' + String(e)));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates promotional asset Data URL using HTML rendering.
 * DOES NOT trigger automatic download.
 */
export const generateMarketingAssetDataUrl = async (
  event: MarketingAssetEvent,
  format: AssetFormat,
  affiliateId?: string
): Promise<string> => {
  const { width, height } = FORMAT_DIMENSIONS[format];

  // 1. Resolve event image using exact same logic as Marketplace
  const primaryImageUrl = getMarketingEventImage(event);
  const imageDataUrl = await imageUrlToDataUrl(primaryImageUrl);

  // 2. Build HTML template
  const templateHtml = buildMarketingAssetHtml(event, format, imageDataUrl, affiliateId);

  // 3. Mount offscreen DOM element
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = 'hidden';
  container.style.zIndex = '-9999';
  container.innerHTML = templateHtml;

  document.body.appendChild(container);

  try {
    const targetElement = (container.firstElementChild as HTMLElement) || container;
    const dataUrl = await elementToDataUrl(targetElement, width, height);
    return dataUrl;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
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