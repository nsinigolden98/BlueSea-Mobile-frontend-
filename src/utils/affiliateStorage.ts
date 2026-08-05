import type { 
  AffiliateProfile, 
  AffiliateStatus, 
  AffiliateStats, 
  CommissionRecord, 
  LeaderboardEntry, 
  Achievement, 
  AffiliateNotification, 
  AffiliateTrackingData 
} from '@/types/affiliate';

/*
====================================================================
TEMPORARY LOCAL STORAGE IMPLEMENTATION
ALL FUNCTIONS BELOW WILL BE REPLACED BY BACKEND API CALLS
====================================================================
*/

const STORAGE_KEYS = {
  PROFILE: 'affiliate_profile',
  STATUS: 'affiliate_status',
  AFFILIATE_ID: 'affiliate_id',
  STATS: 'affiliate_statistics',
  SAVED_EVENTS: 'affiliate_saved_events',
  NOTIFICATIONS: 'affiliate_notifications',
  TRACKING: 'affiliate_tracking',
};

// Generate permanent Affiliate ID once
export const getOrGenerateAffiliateId = (): string => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  let existingId = localStorage.getItem(STORAGE_KEYS.AFFILIATE_ID);
  if (!existingId) {
    const randomNum = Math.floor(100 + Math.random() * 900);
    existingId = `AFF${randomNum}`;
    localStorage.setItem(STORAGE_KEYS.AFFILIATE_ID, existingId);
  }
  return existingId;
};

export const getAffiliateStatus = (): AffiliateStatus => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  const status = localStorage.getItem(STORAGE_KEYS.STATUS) as AffiliateStatus;
  return status || 'unverified';
};

export const setAffiliateStatus = (status: AffiliateStatus): void => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  localStorage.setItem(STORAGE_KEYS.STATUS, status);
};

export const getAffiliateProfile = (): AffiliateProfile | null => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return null;
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse affiliate profile from LocalStorage', e);
    return null;
  }
};

export const saveAffiliateProfile = (profile: AffiliateProfile): void => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  localStorage.setItem(STORAGE_KEYS.STATUS, profile.status);
};

export const getAffiliateStats = (): AffiliateStats => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse affiliate stats', e);
  }
  return {
    totalClicks: 1420,
    totalSales: 86,
    conversionRate: 6.05,
    pendingEarnings: 45000,
    lifetimeEarnings: 320000,
    eventsPromoted: 12,
  };
};

export const getSavedAffiliateEventIds = (): string[] => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_EVENTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const toggleSaveAffiliateEventId = (eventId: string): boolean => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  const saved = getSavedAffiliateEventIds();
  const exists = saved.includes(eventId);
  let updated: string[];
  if (exists) {
    updated = saved.filter(id => id !== eventId);
  } else {
    updated = [...saved, eventId];
  }
  localStorage.setItem(STORAGE_KEYS.SAVED_EVENTS, JSON.stringify(updated));
  return !exists;
};

export const getAffiliateTracking = (): AffiliateTrackingData | null => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRACKING);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const setAffiliateTracking = (tracking: AffiliateTrackingData): void => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(tracking));
};

export const clearAffiliateTracking = (): void => {
  /*
  ==============================
  TEMP LOCAL STORAGE
  REMOVE AFTER BACKEND
  ==============================
  */
  localStorage.removeItem(STORAGE_KEYS.TRACKING);
};

export const getMockCommissions = (): CommissionRecord[] => [
  { id: 'comm_1', eventId: '1', eventTitle: 'Lagos Tech Fest 2026', commissionAmount: 7500, status: 'paid', date: '2026-08-01' },
  { id: 'comm_2', eventId: '2', eventTitle: 'AfroBeats Summer Jam', commissionAmount: 12000, status: 'pending', date: '2026-08-04' },
  { id: 'comm_3', eventId: '3', eventTitle: 'SaaS Founder Conference', commissionAmount: 15000, status: 'paid', date: '2026-07-28' },
  { id: 'comm_4', eventId: '4', eventTitle: 'Youth Empowerment Summit', commissionAmount: 3500, status: 'pending', date: '2026-08-05' },
];

export const getMockLeaderboard = (): LeaderboardEntry[] => [
  { rank: 1, displayName: 'Alex Marketing Pro', ticketsSold: 412, lifetimeEarnings: 1250000, currentLevel: 'Diamond', badge: '🥇 Champion' },
  { rank: 2, displayName: 'Sarah Jenkins', ticketsSold: 320, lifetimeEarnings: 980000, currentLevel: 'Platinum', badge: '🥈 Elite' },
  { rank: 3, displayName: 'David O.', ticketsSold: 285, lifetimeEarnings: 820000, currentLevel: 'Gold', badge: '🥉 Star' },
  { rank: 4, displayName: 'Grace Emmanuel', ticketsSold: 194, lifetimeEarnings: 510000, currentLevel: 'Silver', badge: '⭐ Rising' },
  { rank: 5, displayName: 'Tobi Tech Promos', ticketsSold: 142, lifetimeEarnings: 390000, currentLevel: 'Silver', badge: '⭐ Rising' },
];

export const getMockAchievements = (): Achievement[] => [
  { id: 'ach_1', title: 'First Sale', description: 'Generated your first ticket referral sale', iconName: 'Award', isUnlocked: true, unlockedAt: '2026-05-12', progress: 1, target: 1 },
  { id: 'ach_2', title: '10 Sales Milestone', description: 'Successfully referred 10 ticket buyers', iconName: 'ShoppingBag', isUnlocked: true, unlockedAt: '2026-06-20', progress: 10, target: 10 },
  { id: 'ach_3', title: '50 Sales Club', description: 'Reach 50 ticket referral sales', iconName: 'Flame', isUnlocked: true, unlockedAt: '2026-07-15', progress: 50, target: 50 },
  { id: 'ach_4', title: 'Centurion (100 Sales)', description: 'Refer 100 ticket buyers across events', iconName: 'Trophy', isUnlocked: false, progress: 86, target: 100 },
  { id: 'ach_5', title: '1,000 Link Clicks', description: 'Drive over 1,000 unique affiliate link clicks', iconName: 'MousePointer', isUnlocked: true, unlockedAt: '2026-07-02', progress: 1000, target: 1000 },
  { id: 'ach_6', title: 'Top Affiliate', description: 'Rank in the top 3 on the monthly leaderboard', iconName: 'Crown', isUnlocked: false, progress: 4, target: 3 },
];

export const getMockNotifications = (): AffiliateNotification[] => [
  { id: 'notif_1', title: 'Application Approved!', message: 'Welcome to the BlueSea Affiliate Program. Start promoting events today.', date: '2026-08-01', isRead: true, type: 'approval' },
  { id: 'notif_2', title: 'Commission Earned', message: 'You earned ₦12,000 commission for AfroBeats Summer Jam.', date: '2026-08-04', isRead: false, type: 'commission' },
  { id: 'notif_3', title: 'New Event Available', message: 'Lagos FinTech Summit 2026 is now offering 15% affiliate commission.', date: '2026-08-05', isRead: false, type: 'event' },
  { id: 'notif_4', title: 'Milestone Reached!', message: 'You passed 1,000 affiliate link clicks. Keep up the great work!', date: '2026-08-02', isRead: true, type: 'milestone' },
];