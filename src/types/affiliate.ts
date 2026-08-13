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
  id: string | number;
  affiliate_name: string;
  status: BackendAffiliateStatus;
  is_approved: boolean;
  commission_rate?: string;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  agreement_accepted: boolean;
  rejected_reason?: string | null;
  created_at: string;
}

export interface AffiliateStatusResponse {
  status: BackendAffiliateStatus;
  is_approved: boolean;
  affiliate_name?: string;
  commission_rate?: string;
  rejected_reason?: string | null;
}

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
  id: string | number;
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
  id: string | number;
  affiliate_name?: string;
  event: string;
  event_title: string;
  buyer?: string;
  buyer_email?: string;
  ticket_count?: number;
  gross_amount?: string;
  commission_rate?: string;
  commission_amount: string;
  status: 'pending' | 'success' | 'payable' | 'paid' | 'revoked';
  created_at: string;
  payable_at?: string | null;
  paid_at?: string | null;
}

export interface AffiliateAttributionRequest {
  event_id: string;
  affiliate_name?: string;
  link_id?: string | number;
}

export interface AffiliatePayoutResponse {
  success: boolean;
  message: string;
  payout_amount?: string;
  transaction_id?: string;
}