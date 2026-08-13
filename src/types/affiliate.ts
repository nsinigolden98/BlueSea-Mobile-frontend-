// ==========================================
// Backend API Types
// ==========================================

export type BackendAffiliateStatus = 'pending' | 'approved' | 'rejected' | 'none';

export interface AffiliateApplicationRequest {
  affiliate_name: string;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  agreement: boolean;
}

export interface AffiliateApplicationResponse {
  id: number;
  affiliate_name: string;
  status: BackendAffiliateStatus;
  is_approved: boolean;
  commission_rate: string;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  agreement_accepted: boolean;
  rejected_reason: string | null;
  created_at: string;
}

export type AffiliateStatusResponse = AffiliateApplicationResponse;

export interface AffiliateDashboardResponse {
  total_clicks: number;
  total_sales: number;
  pending_count: number;
  success_count: number;
  payable_count: number;
  paid_count: number;
  revoked_count: number;
  pending_amount: string;
  payable_amount: string;
  paid_amount: string;
}

export interface AffiliateLink {
  id: number;
  event: string;
  event_title: string;
  commission_rate?: string;
  clicks: number;
  is_active: boolean;
  link: string;
  created_at: string;
}

export interface CreateAffiliateLinkRequest {
  event_id: string;
}

export interface AffiliateSaleRecord {
  id: number;
  affiliate_name: string;
  event: string;
  event_title: string;
  buyer: number;
  buyer_email: string;
  ticket_count: number;
  gross_amount: string;
  commission_rate: string;
  commission_amount: string;
  status: 'pending' | 'success' | 'payable' | 'paid' | 'revoked';
  created_at: string;
  payable_at: string | null;
  paid_at: string | null;
}

export interface AffiliateAttributionRequest {
  event_id?: string;
  affiliate_name?: string;
  link_id?: string | number;
  [key: string]: unknown;
}

export interface AffiliatePayoutResponse {
  success?: boolean;
  message?: string;
  payout_amount?: string;
  transaction_id?: string;
  [key: string]: unknown;
}

// ==========================================
// Frontend / UI Support Types
// ==========================================

export type AffiliateStatus = BackendAffiliateStatus | 'active' | 'suspended' | 'inactive' | 'unverified';

export interface AffiliateProfile {
  id?: string | number;
  userId?: string;
  code?: string;
  affiliate_name?: string;
  status: AffiliateStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AffiliateStats {
  totalClicks: number;
  totalConversions?: number;
  totalSales?: number;
  totalEarnings?: number;
  pendingEarnings?: number;
  conversionRate?: number;
  lifetimeEarnings?: number;
  eventsPromoted?: number;
}

export interface CommissionRecord {
  id: string | number;
  affiliateId?: string;
  eventId?: string;
  eventTitle?: string;
  commissionAmount?: number;
  amount?: number;
  status: string;
  date?: string;
  createdAt?: string;
  description?: string;
}

export interface LeaderboardEntry {
  rank: number;
  affiliateId?: string;
  displayName?: string;
  name?: string;
  ticketsSold?: number;
  lifetimeEarnings?: number;
  totalEarnings?: number;
  currentLevel?: string;
  badge?: string;
  conversions?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress: number;
  target?: number;
  maxProgress?: number;
}

export interface AffiliateNotification {
  id: string;
  title: string;
  message: string;
  date?: string;
  isRead?: boolean;
  read?: boolean;
  type?: string;
  createdAt?: string;
}

export interface AffiliateTrackingData {
  referralCode?: string;
  affiliate_id?: string;
  event_id?: string;
  source?: string;
  campaign?: string;
  landedAt?: string;
  timestamp?: number;
}