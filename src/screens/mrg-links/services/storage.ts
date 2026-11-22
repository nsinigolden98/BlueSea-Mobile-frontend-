import type { MrGStore } from '../types';
import { FREE_LINK_CREDITS } from './pricing';

const STORAGE_KEY = 'bluesea.mrg-links.preview.v1';

export const EMPTY_MRG_STORE: MrGStore = {
  links: [],
  campaigns: [],
  qrCodes: [],
  landingPages: [],
  routingRules: [],
  reports: [],
  credits: FREE_LINK_CREDITS,
  currency: 'NGN',
  verifiedVendorAliasCredits: 0,
  customAliasCredits: 0,
  securityPreferences: { warningPage: true, reviewReports: true },
  vendorAliasAllowanceGranted: false,
};

export function loadMrGStore(scope = 'anonymous'): MrGStore {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${scope}`);
    if (!raw) return EMPTY_MRG_STORE;
    const parsed = JSON.parse(raw) as Partial<MrGStore>;
    return {
      ...EMPTY_MRG_STORE,
      ...parsed,
      links: Array.isArray(parsed.links) ? parsed.links : [],
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
      qrCodes: Array.isArray(parsed.qrCodes) ? parsed.qrCodes : [],
      landingPages: Array.isArray(parsed.landingPages) ? parsed.landingPages : [],
      routingRules: Array.isArray(parsed.routingRules) ? parsed.routingRules : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      securityPreferences: { ...EMPTY_MRG_STORE.securityPreferences, ...(parsed.securityPreferences || {}) },
    };
  } catch {
    return EMPTY_MRG_STORE;
  }
}

export function saveMrGStore(store: MrGStore, scope = 'anonymous'): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}:${scope}`, JSON.stringify(store));
  } catch (error) {
    console.error('MrG Links preview data could not be saved in this browser:', error);
  }
}

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createShortCode(length = 7): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

export function normaliseUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Enter a destination URL.');
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !/^https?:\/\//i.test(trimmed)) throw new Error('Only HTTP and HTTPS links are supported.');
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only HTTP and HTTPS links are supported.');
  return parsed.toString();
}

export function buildShortUrl(code: string): string {
  return `https://MrG.com/${code}`;
}
