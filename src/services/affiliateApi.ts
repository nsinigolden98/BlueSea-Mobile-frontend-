// ==========================================
// BlueSea Mobile - Affiliate API Service
// Production API integration
// ==========================================

import type {
  AffiliateApplicationRequest,
  AffiliateApplicationResponse,
  AffiliateStatusResponse,
  AffiliateDashboardResponse,
  AffiliateLink,
  CreateAffiliateLinkRequest,
  AffiliateSaleRecord,
  AffiliateAttributionRequest,
  AffiliatePayoutResponse,
} from '@/types/affiliate';
import { getAuthToken } from './api';

/**
 * Production API base URL.
 *
 * Expected:
 * https://api.blueseamobile.com.ng
 *
 * VITE_API_BASE_URL may be supplied through the Vite environment.
 * The trailing slash is removed so endpoint construction remains consistent.
 */
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.blueseamobile.com.ng'
).replace(/\/+$/, '');

/**
 * Build headers for authenticated JSON API requests.
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

/**
 * Safely extract a useful error message from a backend response.
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const errorData: unknown = await response.json();

    if (
      typeof errorData === 'object' &&
      errorData !== null
    ) {
      const data = errorData as Record<string, unknown>;

      if (typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail;
      }

      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }

      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }

      /*
       * Django REST Framework validation responses can sometimes
       * return field-level errors such as:
       *
       * {
       *   "affiliate_name": ["This field already exists."]
       * }
       *
       * Convert those into a readable frontend error.
       */
      const fieldMessages: string[] = [];

      Object.entries(data).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          value.forEach((message) => {
            if (typeof message === 'string') {
              fieldMessages.push(`${field}: ${message}`);
            }
          });
        } else if (typeof value === 'string') {
          fieldMessages.push(`${field}: ${value}`);
        }
      });

      if (fieldMessages.length > 0) {
        return fieldMessages.join(' ');
      }
    }

    if (typeof errorData === 'string' && errorData.trim()) {
      return errorData;
    }
  } catch {
    // Response was not JSON.
  }

  switch (response.status) {
    case 400:
      return 'The request contains invalid information.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You are not authorized to perform this operation.';
    case 404:
      return 'The requested affiliate resource was not found.';
    case 405:
      return 'This operation is not supported by the server.';
    case 409:
      return 'This request conflicts with an existing record.';
    case 422:
      return 'Some of the submitted information is invalid.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'The server encountered an unexpected error.';
    case 502:
    case 503:
    case 504:
      return 'The affiliate service is temporarily unavailable. Please try again shortly.';
    default:
      return `Request failed with HTTP ${response.status}.`;
  }
}

/**
 * Application-specific API error.
 *
 * Keeping the HTTP status available allows UI components to react
 * appropriately to authentication, validation, conflict, and server errors.
 */
export class AffiliateApiError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(
    message: string,
    status: number,
    statusText: string
  ) {
    super(message);

    this.name = 'AffiliateApiError';
    this.status = status;
    this.statusText = statusText;

    Object.setPrototypeOf(this, AffiliateApiError.prototype);
  }
}

/**
 * Handle API responses consistently across the entire affiliate module.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await extractErrorMessage(response);

    throw new AffiliateApiError(
      message,
      response.status,
      response.statusText
    );
  }

  /*
   * Some backend operations may successfully return 204 No Content.
   * Avoid calling response.json() on an empty response.
   */
  if (response.status === 204) {
    return {} as T;
  }

  /*
   * A successful endpoint should normally return JSON.
   * If the server unexpectedly returns an empty body, provide a
   * controlled error rather than causing an unhelpful JSON parsing error.
   */
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.toLowerCase().includes('application/json')) {
    const text = await response.text();

    if (!text.trim()) {
      return {} as T;
    }

    /*
     * Some deployments can return JSON without the correct content type.
     * Try parsing it before failing.
     */
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new AffiliateApiError(
        'The server returned an unexpected response format.',
        response.status,
        response.statusText
      );
    }
  }

  return (await response.json()) as T;
}

/**
 * Execute an authenticated request.
 *
 * This centralizes fetch behavior so every affiliate endpoint follows
 * the same request and error-handling rules.
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith('/')
    ? path
    : `/${path}`;

  const url = `${API_BASE_URL}${normalizedPath}`;

  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'omit',
    });
  } catch {
    /*
     * This catches browser-level failures such as:
     *
     * - CORS failure
     * - DNS failure
     * - network disconnection
     * - unreachable API
     *
     * These do not produce a normal HTTP response.
     */
    throw new AffiliateApiError(
      'Unable to connect to the affiliate service. Please check your connection and try again.',
      0,
      'NETWORK_ERROR'
    );
  }

  return handleResponse<T>(response);
}

/**
 * Serialize a JSON request body safely.
 */
function jsonBody(payload: unknown): string {
  return JSON.stringify(payload);
}

// ==========================================
// Affiliate API
// ==========================================

export const affiliateApi = {
  /**
   * GET /affiliate/status/
   *
   * Retrieves the authenticated user's affiliate application status.
   */
  async getStatus(): Promise<AffiliateStatusResponse> {
    return request<AffiliateStatusResponse>(
      '/affiliate/status/',
      {
        method: 'GET',
      }
    );
  },

  /**
   * POST /affiliate/apply/
   *
   * Submits an affiliate application.
   */
  async apply(
    payload: AffiliateApplicationRequest
  ): Promise<AffiliateApplicationResponse> {
    return request<AffiliateApplicationResponse>(
      '/affiliate/apply/',
      {
        method: 'POST',
        body: jsonBody(payload),
      }
    );
  },

  /**
   * GET /affiliate/dashboard/
   *
   * Retrieves authenticated affiliate statistics.
   */
  async getDashboard(): Promise<AffiliateDashboardResponse> {
    return request<AffiliateDashboardResponse>(
      '/affiliate/dashboard/',
      {
        method: 'GET',
      }
    );
  },

  /**
   * GET /affiliate/links/
   *
   * Retrieves the authenticated affiliate's tracking links.
   */
  async getLinks(): Promise<AffiliateLink[]> {
    return request<AffiliateLink[]>(
      '/affiliate/links/',
      {
        method: 'GET',
      }
    );
  },

  /**
   * POST /affiliate/links/
   *
   * Creates an affiliate tracking link for an event.
   */
  async createLink(
    payload: CreateAffiliateLinkRequest
  ): Promise<AffiliateLink> {
    return request<AffiliateLink>(
      '/affiliate/links/',
      {
        method: 'POST',
        body: jsonBody(payload),
      }
    );
  },

  /**
   * POST /affiliate/attribution/
   *
   * Records referral attribution.
   *
   * IMPORTANT:
   * The backend remains the authoritative source for attribution.
   * The frontend must never calculate commissions, sales,
   * affiliate ownership, or payout values locally.
   */
  async recordAttribution(
    payload: AffiliateAttributionRequest
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    return request<{
      success: boolean;
      message?: string;
    }>(
      '/affiliate/attribution/',
      {
        method: 'POST',
        body: jsonBody(payload),
      }
    );
  },

  /**
   * GET /affiliate/sales/
   *
   * Retrieves affiliate sales/referral records.
   */
  async getSales(): Promise<AffiliateSaleRecord[]> {
    return request<AffiliateSaleRecord[]>(
      '/affiliate/sales/',
      {
        method: 'GET',
      }
    );
  },

  /**
   * POST /affiliate/payout/
   *
   * Requests an affiliate payout.
   */
  async requestPayout(): Promise<AffiliatePayoutResponse> {
    return request<AffiliatePayoutResponse>(
      '/affiliate/payout/',
      {
        method: 'POST',
      }
    );
  },
};

// ==========================================
// Canonical Named Exports
// ==========================================

export const getAffiliateStatus = affiliateApi.getStatus;
export const applyForAffiliate = affiliateApi.apply;
export const getAffiliateDashboard = affiliateApi.getDashboard;
export const getAffiliateLinks = affiliateApi.getLinks;
export const createAffiliateLink = affiliateApi.createLink;
export const recordAffiliateAttribution =
  affiliateApi.recordAttribution;
export const getAffiliateSales = affiliateApi.getSales;
export const requestAffiliatePayout =
  affiliateApi.requestPayout;

// ==========================================
// Backward-Compatible Named Exports
// ==========================================
//
// Keep these temporarily so existing pages/components that already
// import the Api-suffixed functions do not break.
//
// We can remove them later after checking every import in the project.

export const getAffiliateStatusApi =
  affiliateApi.getStatus;

export const applyForAffiliateApi =
  affiliateApi.apply;

export const getAffiliateDashboardApi =
  affiliateApi.getDashboard;

export const getAffiliateLinksApi =
  affiliateApi.getLinks;

export const createAffiliateLinkApi =
  affiliateApi.createLink;

export const recordAffiliateAttributionApi =
  affiliateApi.recordAttribution;

export const getAffiliateSalesApi =
  affiliateApi.getSales;

export const requestAffiliatePayoutApi =
  affiliateApi.requestPayout;

// ==========================================
// Default Export
// ==========================================

export default affiliateApi;