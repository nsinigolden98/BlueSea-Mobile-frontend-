import type { 
  AffiliateStatus, 
  AffiliateTrackingData, 
  AffiliateProfile, 
  AffiliateStats, 
  CommissionRecord, 
  LeaderboardEntry, 
  Achievement, 
  AffiliateNotification 
} from '@/types/affiliate';

const STORAGE_KEYS = {
  PROFILE: 'affiliate_profile',
  STATUS: 'affiliate_status',
  AFFILIATE_ID: 'affiliate_id',
  STATS: 'affiliate_statistics',
  SAVED_EVENTS: 'affiliate_saved_events',
  NOTIFICATIONS: 'affiliate_notifications',
  TRACKING: 'affiliate_tracking',
};

// URL / Session Referral Tracking Helpers used by Marketplace
export const getOrGenerateAffiliateId = (): string => {
  let existingId = localStorage.getItem(STORAGE_KEYS.AFFILIATE_ID);
  if (!existingId) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    existingId = `AFF${randomNum}`;
    localStorage.setItem(STORAGE_KEYS.AFFILIATE_ID, existingId);
  }
  return existingId;
};

export const getAffiliateStatus = (): AffiliateStatus => {
  const status = localStorage.getItem(STORAGE_KEYS.STATUS) as AffiliateStatus;
  return status || 'none';
};

export const setAffiliateStatus = (status: AffiliateStatus): void => {
  localStorage.setItem(STORAGE_KEYS.STATUS, status);
};

export const getAffiliateTracking = (): AffiliateTrackingData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRACKING);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setAffiliateTracking = (tracking: AffiliateTrackingData): void => {
  localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(tracking));
};

export const clearAffiliateTracking = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TRACKING);
};

export const getSavedAffiliateEventIds = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_EVENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const toggleSaveAffiliateEventId = (eventId: string): boolean => {
  const saved = getSavedAffiliateEventIds();
  const exists = saved.includes(eventId);
  const updated = exists ? saved.filter(id => id !== eventId) : [...saved, eventId];
  localStorage.setItem(STORAGE_KEYS.SAVED_EVENTS, JSON.stringify(updated));
  return !exists;
};

// Safe defaults for legacy UI component references (no mock data)
export const getAffiliateProfile = (): AffiliateProfile | null => null;
export const saveAffiliateProfile = (): void => {};
export const getAffiliateStats = (): AffiliateStats => ({
  totalClicks: 0,
  totalSales: 0,
  conversionRate: 0,
  pendingEarnings: 0,
  lifetimeEarnings: 0,
  eventsPromoted: 0,
});
export const getMockCommissions = (): CommissionRecord[] => [];
export const getMockLeaderboard = (): LeaderboardEntry[] => [];
export const getMockAchievements = (): Achievement[] => [];
export const getMockNotifications = (): AffiliateNotification[] => [];