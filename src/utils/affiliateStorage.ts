import type {
  AffiliateStatus,
  AffiliateTrackingData,
  AffiliateProfile,
  AffiliateStats,
  CommissionRecord,
  LeaderboardEntry,
  Achievement,
  AffiliateNotification,
} from '@/types/affiliate';

/**
 * Affiliate client-side utility helpers.
 *
 * IMPORTANT:
 * These storage values are only used for temporary client-side UI/session
 * state. They must never be treated as proof of affiliate approval,
 * commission ownership, sales, earnings, or payment status.
 *
 * The backend remains the authoritative source for all affiliate data.
 */

// -----------------------------------------------------------------------------
// Storage Keys
// -----------------------------------------------------------------------------

const STORAGE_KEYS = {
  PROFILE: 'affiliate_profile',
  STATUS: 'affiliate_status',
  TRACKING: 'affiliate_tracking',
} as const;

// -----------------------------------------------------------------------------
// Affiliate Identity
// -----------------------------------------------------------------------------

/**
 * Returns the affiliate identifier stored in the affiliate profile.
 *
 * We do NOT generate an affiliate ID on the frontend.
 * The backend must create and provide the real affiliate identity.
 */
export const getOrGenerateAffiliateId = (): string | null => {
  const profile = getAffiliateProfile();

  if (!profile) {
    return null;
  }

  if (profile.code) {
    return profile.code;
  }

  if (profile.id !== undefined && profile.id !== null) {
    return String(profile.id);
  }

  return null;
};

// -----------------------------------------------------------------------------
// Affiliate Status
// -----------------------------------------------------------------------------

/**
 * Gets the locally cached affiliate status.
 *
 * IMPORTANT:
 * This is only a client-side cache/fallback.
 * Production pages should use affiliateApi.getStatus() when they need
 * authoritative status from the backend.
 */
export const getAffiliateStatus = (): AffiliateStatus => {
  try {
    const storedStatus = localStorage.getItem(STORAGE_KEYS.STATUS);

    if (!storedStatus) {
      return 'none';
    }

    return storedStatus as AffiliateStatus;
  } catch {
    return 'none';
  }
};

/**
 * Stores the latest affiliate status for UI/session continuity.
 *
 * This must only be called with a status received from the backend.
 * Never use this function to grant or manufacture affiliate privileges.
 */
export const setAffiliateStatus = (
  status: AffiliateStatus
): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATUS, status);
  } catch {
    // Storage may be unavailable in private/restricted browser contexts.
  }
};

// -----------------------------------------------------------------------------
// Referral Tracking
// -----------------------------------------------------------------------------

/**
 * Gets temporary referral tracking information.
 *
 * This can be used to preserve referral information while the user moves
 * through the marketplace before the attribution information is sent to
 * the backend.
 *
 * The stored values are NOT proof of attribution.
 */
export const getAffiliateTracking = (): AffiliateTrackingData | null => {
  try {
    const storedTracking = localStorage.getItem(
      STORAGE_KEYS.TRACKING
    );

    if (!storedTracking) {
      return null;
    }

    const parsedTracking: unknown = JSON.parse(storedTracking);

    if (
      !parsedTracking ||
      typeof parsedTracking !== 'object' ||
      Array.isArray(parsedTracking)
    ) {
      return null;
    }

    return parsedTracking as AffiliateTrackingData;
  } catch {
    return null;
  }
};

/**
 * Stores temporary referral tracking information.
 *
 * This does NOT confirm an affiliate conversion.
 * The backend must still receive and validate attribution.
 */
export const setAffiliateTracking = (
  tracking: AffiliateTrackingData
): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.TRACKING,
      JSON.stringify(tracking)
    );
  } catch {
    // Storage may be unavailable.
  }
};

/**
 * Clears temporary referral tracking information.
 */
export const clearAffiliateTracking = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRACKING);
  } catch {
    // Ignore storage errors.
  }
};

// -----------------------------------------------------------------------------
// Saved Affiliate Events
// -----------------------------------------------------------------------------

/**
 * Saved-event state has no backend endpoint in the API contract supplied so far.
 *
 * Therefore this remains an in-memory UI state only.
 *
 * It is intentionally NOT persisted because there is currently no backend
 * endpoint to synchronize it with.
 */
let savedAffiliateEventIds: string[] = [];

/**
 * Returns saved affiliate event IDs for the current application session.
 */
export const getSavedAffiliateEventIds = (): string[] => {
  return [...savedAffiliateEventIds];
};

/**
 * Toggles an event in the temporary saved-event collection.
 */
export const toggleSaveAffiliateEventId = (
  eventId: string
): boolean => {
  const normalizedEventId = eventId.trim();

  if (!normalizedEventId) {
    return false;
  }

  const exists = savedAffiliateEventIds.includes(
    normalizedEventId
  );

  if (exists) {
    savedAffiliateEventIds = savedAffiliateEventIds.filter(
      (id) => id !== normalizedEventId
    );

    return false;
  }

  savedAffiliateEventIds = [
    ...savedAffiliateEventIds,
    normalizedEventId,
  ];

  return true;
};

// -----------------------------------------------------------------------------
// Affiliate Profile
// -----------------------------------------------------------------------------

/**
 * Gets the locally cached affiliate profile.
 *
 * This is only a UI/session cache.
 *
 * The authoritative profile should come from the backend.
 */
export const getAffiliateProfile = (): AffiliateProfile | null => {
  try {
    const storedProfile = localStorage.getItem(
      STORAGE_KEYS.PROFILE
    );

    if (!storedProfile) {
      return null;
    }

    const parsedProfile: unknown = JSON.parse(storedProfile);

    if (
      !parsedProfile ||
      typeof parsedProfile !== 'object' ||
      Array.isArray(parsedProfile)
    ) {
      return null;
    }

    return parsedProfile as AffiliateProfile;
  } catch {
    return null;
  }
};

/**
 * Stores a backend-provided affiliate profile for temporary UI/session use.
 *
 * Do not use this function to create or modify authoritative affiliate
 * information.
 */
export const saveAffiliateProfile = (
  profile: AffiliateProfile
): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.PROFILE,
      JSON.stringify(profile)
    );
  } catch {
    // Storage may be unavailable.
  }
};

// -----------------------------------------------------------------------------
// Affiliate Statistics
// -----------------------------------------------------------------------------

/**
 * Statistics are not stored locally.
 *
 * They must come from affiliateApi.getDashboard().
 *
 * This fallback remains only for legacy components that still import this
 * helper before they are migrated to the backend API.
 */
export const getAffiliateStats = (): AffiliateStats => ({
  totalClicks: 0,
  totalSales: 0,
  conversionRate: 0,
  pendingEarnings: 0,
  lifetimeEarnings: 0,
  eventsPromoted: 0,
});

// -----------------------------------------------------------------------------
// Legacy Compatibility Exports
// -----------------------------------------------------------------------------

/**
 * No mock affiliate data is generated.
 *
 * Production components should retrieve their data from the backend.
 */
export const getMockCommissions = (): CommissionRecord[] => [];

export const getMockLeaderboard = (): LeaderboardEntry[] => [];

export const getMockAchievements = (): Achievement[] => [];

export const getMockNotifications = (): AffiliateNotification[] => [];