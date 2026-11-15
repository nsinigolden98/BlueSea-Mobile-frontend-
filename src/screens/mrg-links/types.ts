export type MrGCurrency = 'NGN' | 'USD' | 'EUR' | 'GBP';
export type MrGLinkStatus = 'active' | 'paused' | 'expired';

export interface MrGLink {
  id: string;
  destinationUrl: string;
  shortCode: string;
  title: string;
  description: string;
  folder?: string;
  status: MrGLinkStatus;
  createdAt: string;
  expiresAt?: string;
  passwordProtected: boolean;
  campaignId?: string;
  clicks: number;
  isCustomAlias: boolean;
}

export interface MrGCampaign {
  id: string;
  name: string;
  channel: string;
  description: string;
  createdAt: string;
  linkIds: string[];
}

export interface MrGQrCode {
  id: string;
  name: string;
  targetUrl: string;
  imageDataUrl: string;
  createdAt: string;
}

export interface MrGLandingPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  buttonLabel: string;
  destinationUrl: string;
  published: boolean;
  createdAt: string;
}

export interface MrGRoutingRule {
  id: string;
  name: string;
  platform: 'Android' | 'iOS' | 'Desktop' | 'All mobile';
  country?: string;
  city?: string;
  destinationUrl: string;
  enabled: boolean;
}

export interface MrGReport {
  id: string;
  url: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'Received locally' | 'Under review';
}

export interface MrGStore {
  links: MrGLink[];
  campaigns: MrGCampaign[];
  qrCodes: MrGQrCode[];
  landingPages: MrGLandingPage[];
  routingRules: MrGRoutingRule[];
  reports: MrGReport[];
  credits: number;
  currency: MrGCurrency;
  verifiedVendorAliasCredits: number;
  customAliasCredits: number;
  securityPreferences: { warningPage: boolean; reviewReports: boolean };
  vendorAliasAllowanceGranted: boolean;
}

export type MrGPageKey =
  | 'overview'
  | 'links'
  | 'analytics'
  | 'qr'
  | 'campaigns'
  | 'landing-pages'
  | 'routing'
  | 'security'
  | 'plans'
  | 'settings'
  | 'domains'
  | 'api'
  | 'teams'
  | 'whatsapp'
  | 'ai'
  | 'ab-testing';
