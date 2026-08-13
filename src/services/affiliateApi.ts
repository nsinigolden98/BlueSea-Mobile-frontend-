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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An unexpected network error occurred.';
    try {
      const errorData = await response.json();
      errorMessage =
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        (typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
    } catch {
      if (response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (response.status === 403) {
        errorMessage = 'You are not authorized to perform this operation.';
      } else if (response.status === 404) {
        errorMessage = 'The requested affiliate resource was not found.';
      } else {
        errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      }
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export const affiliateApi = {
  async getStatus(): Promise<AffiliateStatusResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/status/`, {
      method: 'GET',
      headers,
    });
    return handleResponse<AffiliateStatusResponse>(res);
  },

  async apply(payload: AffiliateApplicationRequest): Promise<AffiliateApplicationResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/apply/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<AffiliateApplicationResponse>(res);
  },

  async getDashboard(): Promise<AffiliateDashboardResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/dashboard/`, {
      method: 'GET',
      headers,
    });
    return handleResponse<AffiliateDashboardResponse>(res);
  },

  async getLinks(): Promise<AffiliateLink[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/links/`, {
      method: 'GET',
      headers,
    });
    return handleResponse<AffiliateLink[]>(res);
  },

  async createLink(payload: CreateAffiliateLinkRequest): Promise<AffiliateLink> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/links/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<AffiliateLink>(res);
  },

  async recordAttribution(payload: AffiliateAttributionRequest): Promise<{ success: boolean; message?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/attribution/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message?: string }>(res);
  },

  async getSales(): Promise<AffiliateSaleRecord[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/sales/`, {
      method: 'GET',
      headers,
    });
    return handleResponse<AffiliateSaleRecord[]>(res);
  },

  async requestPayout(): Promise<AffiliatePayoutResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/affiliate/payout/`, {
      method: 'POST',
      headers,
    });
    return handleResponse<AffiliatePayoutResponse>(res);
  },
};