import axios from 'axios'
import Cookies from 'js-cookie'
  
// User Types
export interface User {
  id?: string; 
  email: string;
   firstName: string;
  surname: string;
  phone: string;
  profilePicture?: string;
  balance: string;
  lockedBalance?: string;
  availableBalance?: string;
  pin_is_set: boolean;
  bluePoints?: number;
  transactions?: Transaction[];
}

// Transaction Types
export interface Transaction {
    id: number;
    description: string;
    created_at: string;
    amount: number;
    transaction_type: 'CREDIT' | 'DEBIT';
    status: string;
}

// Network Types
export type Network = 'MTN' | 'Glo' | 'Airtel' | '9mobile';

// Data Plan Types
export interface DataPlan {
  id: string ;
  size: string ;
  price: number;
  validity: string;
  network: Network;
  planType: 'Daily' | 'Weekly' | 'Monthly' | 'Extravalue';
  description: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
  comingSoon?: boolean;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// Theme Types
export type Theme = 'light' | 'dark';

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  email: string;
  phone: string;
  firstName: string;
  surname: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// BluePoints Types
export interface BluePointHistory {
  id: string;
  source: string;
  points: number;
  date: string;
  type: 'earned' | 'redeemed';
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  completed: boolean;
  icon: string;
}

// Streak Types
export interface StreakDay {
  date: string;
  claimed: boolean;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  nextReward: number;
  lastLoginDate: string;
  streakHistory: StreakDay[];
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'general' | 'feature' | 'promo';
  priority: 'low' | 'medium' | 'high';
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'transaction' | 'reward' | 'announcement';
  read: boolean;
}

// Loyalty Marketplace Types
export interface LoyaltyItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
  category: 'voucher' | 'data' | 'discount' | 'experience' | 'cashback';
  available: boolean;
}

// Marketplace Types
export interface TicketType {
  id: string;
  name: string;
  price: string;
  quantity_available: number;
  description?: string;
}

export interface Vendor {
  id: string;
  business_name: string;
  logo?: string;
  is_verified: boolean;
}

export interface MarketplaceEvent {
  id: string;
  vendor: Vendor;
  event_title: string;
  event_description: string;
  event_date: string;
  event_location: string;
  hosted_by: string;
  category: string;
  is_free: boolean;
  quantity?: number;
  event_banner?: string;
  ticket_image?: string;
  is_approved: boolean;
  ticket_types: TicketType[];
  total_tickets: number;
  tickets_sold: number;
  created_at: string;
}

export interface MyTicket {
  id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_banner?: string;
  is_free: boolean;
  ticket_type: TicketType;
  owner_name: string;
  owner_email: string;
  status: string;
  vendor_name: string;
  qr_code: string;
  created_at: string;
  transferred_at?: string;
  canceled_at?: string;
}

export interface ScannerStats {
  total_tickets: number;
  scanned_tickets: number;
  remaining: number;
}

export interface ScannerAssignment {
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_banner?: string;
  vendor: string;
  role: 'scanner' | 'vendor';
  statistics: ScannerStats;
  assigned_at?: string;
}

export interface VendorStatus {
  id: string;
  brand_name: string;
  business_type: string;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventPayload {
  event_title: string;
  event_description: string;
  event_date: string;
  event_location: string;
  hosted_by: string;
  category: string;
  is_free: boolean;
  quantity?: number;
  event_banner?: File;
  ticket_image?: File;
  ticket_types?: {
    name: string;
    price: string;
    quantity_available: number;
    description?: string;
  }[];
}

export interface CreateVendorPayload {
  brand_name: string;
  business_type: string;
  residential_address: string;
  state_city: string;
  id_type: string;
  monthly_volume: string;
  business_description: string;
  legal_name?: string;
}

// Group Payment Types
export interface Contributor {
  id: string;
  name: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface GroupPayment {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  contributors: Contributor[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  expiresAt: string;
}

// More Services Types
export interface MoreService {
  id: string;
  name: string;
  icon: string;
  comingSoon?: boolean;
}

export interface MoreServiceCategory {
  id: string;
  name: string;
  services: MoreService[];
}


export const API_BASE = import.meta.env.VITE_API_BASE

export const ENDPOINTS = {
  login: `${API_BASE}/accounts/login/`,
  signup: `${API_BASE}/accounts/sign-up/`,
  sendOtp: `${API_BASE}/accounts/resend-otp/`,
  sendOtp_FP: `${API_BASE}/accounts/password/reset/request/`,
  verify_FP: `${API_BASE}/accounts/password/reset/verify-otp/`,
  confirm_FP: `${API_BASE}/accounts/password/reset/confirm/`,
  verifyOtp: `${API_BASE}/accounts/verify-email/`,
  forgotReset: `${API_BASE}/accounts/auth/forgot-reset/`,
  oauthGoogle: `${API_BASE}/accounts/auth/google/`,
  balance: `${API_BASE}/wallet/balance/`,
  fund: `${API_BASE}/transactions/fund-wallet/`,
  webhook: `${API_BASE}/transactions/webhook/paystack/`,
  history: `${API_BASE}/transactions/history/`,
  withdraw: `${API_BASE}/transactions/withdraw/`,
  user: `${API_BASE}/user_preference/user/`,
  pin_set: `${API_BASE}/accounts/pin/set/`,
  pin_verify: `${API_BASE}/accounts/pin/verify/`,
  pin_reset: `${API_BASE}/accounts/pin/reset/`,
  buy_airtime: `${API_BASE}/payments/airtime/`,
  buy_airtel: `${API_BASE}/payments/airtel-data/`,
  buy_mtn: `${API_BASE}/payments/mtn-data/`,
  buy_glo: `${API_BASE}/payments/glo-data/`,
  buy_etisalat: `${API_BASE}/payments/etisalat-data/`,
  account_name: `${API_BASE}/transactions/account-name/`,
  electricity: `${API_BASE}/payments/electricity/`,
  electricity_user: `${API_BASE}/payments/electricity/customer/`,
  notifications: `${API_BASE}/notifications/`,
  group_payment_history: `${API_BASE}/payments/group-payment/history/`,
  group_payment: `${API_BASE}/payments/group-payment/`,
  group_payment_create: `${API_BASE}/group-payment/create/`,
  group_payment_my_groups: `${API_BASE}/group-payment/my-groups/`,
  group_payment_details: `${API_BASE}/group-payment/`,
  group_payment_leave: `${API_BASE}/group-payment/leave/`,
  group_payment_cancel: `${API_BASE}/group-payment/cancel/`,
  group_payment_join: `${API_BASE}/group-payment/join-group/`,
  dstv: `${API_BASE}/payments/dstv/`,
  showmax: `${API_BASE}/payments/showmax/`,
  startimes: `${API_BASE}/payments/startimes/`,
  gotv: `${API_BASE}/payments/gotv/`,
  waec_registration: `${API_BASE}/payments/waec-registration/`,
  waec_result: `${API_BASE}/payments/waec-result/`,
  jamb_registration: `${API_BASE}/payments/jamb-registration/`,
  auto_topup_list: `${API_BASE}/autotopup/`,
  auto_topup_create: `${API_BASE}/autotopup/create/`,
  auto_topup_details: (id: string) => `${API_BASE}/autotopup/${id}/`,
  auto_topup_cancel: (id: string) => `${API_BASE}/autotopup/${id}/cancel/`,
  auto_topup_reactivate: (id: string) => `${API_BASE}/autotopup/${id}/reactivate/`,
  auto_topup_history: (id: string) => `${API_BASE}/autotopup/${id}/history/`,
  create_group: `${API_BASE}/payments/group/create/`,
  join_group: `${API_BASE}/payments/group/join-group/`,
  add_to_group: `${API_BASE}/payments/group/add-member/`,
  my_groups: `${API_BASE}/payments/group/my-groups/`,
  group_detail: (id: string) => `${API_BASE}/payments/group/${id}/`,
  group_payment: `${API_BASE}/payments/group-payment/`,
  group_payment_history: `${API_BASE}/payments/group-payment/history/`,
  logout: `${API_BASE}/accounts/logout/`,
  events: `${API_BASE}/marketplace/events/all/`,
  create_events: `${API_BASE}/marketplace/events/create/`,
  create_vendor: `${API_BASE}/marketplace/vendor/create/`,
  vendor_status: `${API_BASE}/marketplace/vendor/status/`,
  vendor_tickets: `${API_BASE}/marketplace/vendor/tickets/`,
  tickets: `${API_BASE}/marketplace/tickets/`,
  mytickets: `${API_BASE}/marketplace/tickets/my/`,
  purchase: `${API_BASE}/marketplace/events/`,
  scan_ticket: `${API_BASE}/marketplace/tickets/scan/`,
  marketplace_events: `${API_BASE}/marketplace/events/all/`,
  marketplace_event_detail: (id: string) => `${API_BASE}/marketplace/events/${id}/`,
  marketplace_purchase: (id: string) => `${API_BASE}/marketplace/events/${id}/purchase/`,
  marketplace_my_tickets: `${API_BASE}/marketplace/tickets/my/`,
  marketplace_my_events: `${API_BASE}/marketplace/events/my/`,
  marketplace_scanner_stats: (id: string) => `${API_BASE}/marketplace/events/${id}/scan-stats/`,
  marketplace_my_scanner_assignments: `${API_BASE}/marketplace/my-scanner-assignments/`,
  marketplace_ticket_detail: (id: string) => `${API_BASE}/marketplace/tickets/${id}/`,
  marketplace_ticket_transfer: (id: string) => `${API_BASE}/marketplace/tickets/${id}/transfer/`,
  marketplace_ticket_cancel: (id: string) => `${API_BASE}/marketplace/tickets/${id}/cancel/`,
};

// Save Access Token In Cookie
export function setCookie(name:string,TOKEN:string) {
  Cookies.set(name, TOKEN, {
    expires: 1,
    path: '/',
    secure: true,
    sameSite:'strict',
  })
  
}

// Get Cookie
function getCookie(name:string){
  const cookie:string|undefined = Cookies.get(name);
    return cookie
}

export const TOKEN:string = getCookie('access_token') || ''

// Delete Cookie
 export function deleteCookie(name:string) {
   Cookies.remove(name, { path: '/' });
  }


// GET REQUEST
export async function getRequest(url: string) {

  try {
    const response = await axios.get(url,
      {
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Accept": 'application/json'
        }
      });
    return response.data
  } catch (error: any) {
    console.log(error)
    return {}
  }
}

// POST REQUEST
export async function postRequest(url: string, payload: object) {
  try {
    const response = await axios.post(url,payload,
      {
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Accept": 'application/json'
        }

      });
    return response.data
  } catch (error: any) {
    return error?.response?.data || {}
  }
}
// POST REQUEST (FILES)
export async function postFileRequest(url: string,payload: object) {
  try {
    const response = await axios.post(url,payload,
      {
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
        },
      });
    return response.data
  } catch (error) {
    console.log(error)
  }
}

// PUT REQUEST
export async function putRequest(url: string, payload: object) {
  try {
    const response = await axios.put(url,payload,
      {
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Accept": 'application/json'
        }

      });
    return response.data
  } catch (error) {
    console.log(error)
  }
}

// DELETE REQUEST
export async function deleteRequest(url: string) {
  try {
    const response = await axios.delete(url,
      {
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Accept": 'application/json'
        }

      });
    return response.data
  } catch (error: any) {
    return error?.response?.data || {}
  }
}


