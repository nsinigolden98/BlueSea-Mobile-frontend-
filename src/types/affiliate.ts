import type { MarketplaceEvent } from '@/types';

export type AffiliateStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type AffiliateLevel = 'Standard' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface SocialAccountInput {
  platform: string;
  url: string;
}

export interface AffiliateProfile {
  id: string;
  displayName: string;
  status: AffiliateStatus;
  affiliateId: string; // Permanent ID e.g., AFF001
  categories: string[];
  socialAccounts: SocialAccountInput[];
  promotionMethods: string[];
  agreedToTerms: boolean;
  createdAt: string;
  level: AffiliateLevel;
}

export interface AffiliateStats {
  totalClicks: number;
  totalSales: number;
  conversionRate: number;
  pendingEarnings: number;
  lifetimeEarnings: number;
  eventsPromoted: number;
}

export interface CommissionRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  commissionAmount: number;
  status: 'pending' | 'paid';
  date: string;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  ticketsSold: number;
  lifetimeEarnings: number;
  currentLevel: AffiliateLevel;
  badge: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface AffiliateNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'event' | 'approval' | 'commission' | 'milestone';
}

export interface AffiliateTrackingData {
  affiliate_id: string;
  event_id?: string;
  timestamp: number;
}

export interface ExtendedMarketplaceEvent extends MarketplaceEvent {
  organizer_name?: string;
  organizer_avatar?: string;
  organizer_hosted_count?: number;
  organizer_followers?: string;
  organizer_rating?: number;
  attendance_mode?: 'online' | 'physical' | 'hybrid';
  venue_name?: string;
  city?: string;
  tags?: string[];
  gallery?: string[];
  affiliate_enabled?: boolean;
  affiliate_rate?: string;
  meeting_platform?: string;
  join_instructions?: string;
  timezone?: string;
  internet_req?: string;
  parking_info?: string;
  arrival_time?: string;
  dress_code?: string;
}