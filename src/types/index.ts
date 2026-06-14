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
  referral_code: string;
}

// Transaction Types
export interface Transaction {
    id: number;
    description: string;
    created_at: string;
    amount: number;
    transaction_type: 'CREDIT' | 'DEBIT';
    status: string;
    reference?: string;
}

// Network Types
export type Network = 'MTN' | 'Glo' | 'Airtel' | '9mobile';

export interface DataPlan {
  id: string;
  size: string;
  price: number;
  validity: string;
  network: Network;
  // Added "Weekend" and "Special" here:
  planType: "Daily" | "Weekly" | "Monthly" | "Extravalue" | "Social" | "Night" | "Binge" | "Mega" | "TV" | "Campus" | "DG" | "AlwaysOn" | "YouTube" | "MiFi" | "Router" | "Unlimited" | "Anytime" | "Weekend" | "Special";
  description: string;
  key?: string; // Added optional key for 9mobile
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
  id: string; // | string[]
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
  referralCode?: string;
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
  initial_quantity?: number;
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
  reset_transaction_pin_email:`${API_BASE}/account/transaction/pin/request/`,
  verify_transaction_pin_email:`${API_BASE}/account/transaction/pin/verify-otp/`,
  set_transaction_pin_email:`${API_BASE}/accounts/transaction/pin/new/`,
  balance: `${API_BASE}/wallet/balance/`,
  fund: `${API_BASE}/transactions/fund-wallet/`,
  webhook: `${API_BASE}/transactions/webhook/paystack/`,
  history: `${API_BASE}/transactions/history/`,
  // withdraw: `${API_BASE}/transactions/withdraw/`,
  user: `${API_BASE}/user_preference/user/`,
  pin_set: `${API_BASE}/accounts/pin/set/`,
  pin_verify: `${API_BASE}/accounts/pin/verify/`,
  pin_reset: `${API_BASE}/accounts/pin/reset/`,
  pin_reset_request: `${API_BASE}/accounts/transaction/pin/request/`,
  pin_reset_verify: `${API_BASE}/accounts/transaction/pin/verify-otp/`,
  pin_reset_confirm: `${API_BASE}/accounts/transaction/pin/new/`,
  buy_airtime: `${API_BASE}/payments/airtime/`,
  buy_airtel: `${API_BASE}/payments/airtel-data/`,
  buy_mtn: `${API_BASE}/payments/mtn-data/`,
  buy_glo: `${API_BASE}/payments/glo-data/`,
  buy_etisalat: `${API_BASE}/payments/etisalat-data/`,
  account_name: `${API_BASE}/transactions/account-name/`,
  verify_account_name: `${API_BASE}/marketplace/verify-account-name/`,
  event_public: (id: string) => `${API_BASE}/marketplace/events/public/${id}/`,
  event_withdraw: `${API_BASE}/marketplace/withdraw/`,
  withdrawal: `${API_BASE}/payments/withdrawal/`,
  electricity: `${API_BASE}/payments/electricity/`,
  electricity_user: `${API_BASE}/payments/electricity/customer/`,
  internal_transfer: `${API_BASE}/payments/internal-transfer/`,
  user_lookup: `${API_BASE}/accounts/user/lookup/`,
  notifications: `${API_BASE}/notifications/`,
  notification_read: (id: string) => `${API_BASE}/notifications/${id}/read/`,
  notification_mark_all_read: `${API_BASE}/notifications/mark-all-read/`,
  notification_delete: (id: string) => `${API_BASE}/notifications/${id}/delete/`,
  support_tickets: `${API_BASE}/support/`,
  support_ticket_detail: (id: string) => `${API_BASE}/support/${id}/`,
  loyalty_rewards: `${API_BASE}/loyalty/rewards/`,
  loyalty_reward_detail: (id: string) => `${API_BASE}/loyalty/rewards/${id}/`,
  loyalty_redeem: (id: string) => `${API_BASE}/loyalty/rewards/${id}/redeem/`,
  loyalty_redemptions: `${API_BASE}/loyalty/redemptions/`,
  bonus_summary: `${API_BASE}/bonus/summary/`,
  bonus_history: `${API_BASE}/bonus/history/`,
  bonus_daily_login: `${API_BASE}/bonus/daily-login/`,
  bonus_campaigns: `${API_BASE}/bonus/campaigns/`,
  group_payment_history: `${API_BASE}/payments/group-payment/history/`,
  group_payment: `${API_BASE}/payments/group-payment/`,
  dstv: `${API_BASE}/payments/dstv/`,
  showmax: `${API_BASE}/payments/showmax/`,
  startimes: `${API_BASE}/payments/startimes/`,
  gotv: `${API_BASE}/payments/gotv/`,
  waec_registration: `${API_BASE}/payments/waec-registration/`,
  waec_result: `${API_BASE}/payments/waec-result/`,
  jamb_registration: `${API_BASE}/payments/jamb-registration/`,
  auto_topup_list: `${API_BASE}/autotopup/list/`,
  auto_topup_create: `${API_BASE}/autotopup/create/`,
  auto_topup_details: (id: string) => `${API_BASE}/autotopup/${id}/`,
  auto_topup_cancel: (id: string) => `${API_BASE}/autotopup/${id}/cancel/`,
  auto_topup_reactivate: (id: string) => `${API_BASE}/autotopup/${id}/reactivate/`,
  auto_topup_history: (id: string) => `${API_BASE}/autotopup/${id}/history/`,
  create_group: `${API_BASE}/payments/group/create/`,
  add_to_group: `${API_BASE}/payments/group/add-member/`,
  join_group: `${API_BASE}/payments/group/join-group/`,
  my_groups: `${API_BASE}/payments/group/my-groups/`,
  update_group: (id:string) =>`${API_BASE}/payments/group/${id}/update/`,
  group_detail: (id:string) =>`${API_BASE}/payments/group/${id}/`,
  export_attendees: (eventId: string) => `${API_BASE}/marketplace/events/${eventId}/attendees/export/`,
  leave_group: `${API_BASE}/payments/group/leave/`,
  cancel_group: `${API_BASE}/payments/group/cancel/`,
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
  marketplace_add_scanner: (id: string) => `${API_BASE}/marketplace/events/${id}/scanner/`,
  marketplace_my_scanner_assignments: `${API_BASE}/marketplace/my-scanner-assignments/`,
  marketplace_ticket_detail: (id: string) => `${API_BASE}/marketplace/tickets/${id}/`,
  marketplace_ticket_transfer: (id: string) => `${API_BASE}/marketplace/tickets/${id}/transfer/`,
  marketplace_ticket_cancel: (id: string) => `${API_BASE}/marketplace/tickets/${id}/cancel/`,
  referral: `${API_BASE}/bonus/referral/`,
  
  
  
  //new
  states: '/api/locations/states/',
  lgas: '/api/locations/lgas/',
};



// Save Access Token In Cookie
export function setCookie(name:string,TOKEN:string) {
  Cookies.set(name, TOKEN, {
    expires: 1,
    path: '/',
    secure: true, 
    sameSite:'lax',
  })
}

// Get Cookie
export function getCookie(name:string){
  const cookie:string|undefined = Cookies.get(name);
    return cookie
}

export const TOKEN:string = getCookie('access_token') || ''

// Delete Cookie
 export function deleteCookie(name:string) {
   Cookies.remove(name, { path: '/' });
  }


// GET REQUEST
export async function getRequest(url: string, options?: { method?: string }) {
  try {
    const response = await axios.get(url, 
      options?.method ? {
        method: options.method,
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Accept": 'application/json'
        }
      } : {
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "Accept": 'application/json'
        }
      }
    );
    return response.data
  } catch (error) {
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
    console.log(error)
    return error?.response?.data
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
  } catch (error: any) {
    console.log(error);
    return error?.response?.data
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
  } catch (error: any) {
    console.log(error)
    return error?.response?.data
  }
}

// PATCH REQUEST
export async function patchRequest(url: string, payload: object) {
  try {
    const response = await axios.patch(url,payload,
      {
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          // "Content-Type": "multipart/formdata",
          // "Accept": 'application/json'
        }

      });
    return response.data
  } catch (error: any) {
    console.log(error)
    return error?.response?.data
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
    console.log(error);
    return error?.response?.data 
  }
}

export const stripCommas = (amount:string) => {
  return Number(amount.replaceAll(',',''))
}

// src/types/index.ts

// ==========================================
// 1. GLOBAL API & SYSTEM CONSTANTS
// ==========================================

{/*export const ENDPOINTS = {
  marketplace_events: '/api/marketplace/events/',
  vendor_status: '/api/merchant/profile/',
  states: '/api/locations/states/',
  lgas: '/api/locations/lgas/',
};*/}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
  };
}

{/*export const getRequest = async (endpoint: string) => {
  const token = localStorage.getItem('bluesim_token');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};*/}

// ==========================================
// 2. MARKETPLACE & MERCHANT
// ==========================================
export interface Category {
  id: string;
  name: string;
  icon?: string;
  slug: string;
}

export interface Merchant {
  id: string;
  name: string;
  is_verified: boolean;
  avatar: string;
  rating: number;
  response_rate?: number;
  response_time?: string;
  joined_date?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string; // Made optional to prevent modifier conflicts across variants
  price: number;
  discount_price: number;
  currency: string;
  stock_quantity: number;
  condition: 'new' | 'used';
  status: 'active' | 'draft' | 'sold_out' | 'hidden' | 'deleted' | 'under_review';
  visibility: 'public' | 'hidden';
  location: string;
  delivery_type: 'pickup' | 'delivery' | 'both';
  delivery_fee: number;
  images: string[];
  category: Category;
  seller: Merchant;
  rating: number;
  review_count: number;
  view_count: number;
  wishlist_count: number;
  created_at: string;
  updated_at: string;
}

// ==========================================
// 3. ORDERS & CHECKOUT
// ==========================================
export type OrderStatus = 
  | 'pending' 
  | 'awaiting_payment' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'completed' 
  | 'refunded' 
  | 'cancelled' 
  | 'disputed';

export interface OrderPreview {
  id: string;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  status: OrderStatus;
  items?: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  delivery_address?: DeliveryInfo;
}

export interface DeliveryInfo {
  country: string;
  state: string;
  city?: string;
  lga?: string;
  address: string;
  landmark?: string;
  postalCode?: string;
}

// ==========================================
// 4. MESSAGING SYSTEM
// ==========================================
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'user';
  is_verified: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  order?: {
    id: string;
    status: OrderStatus;
  };
  last_message: string;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  text?: string;
  image_url?: string;
  sender_id: string;
  is_mine: boolean;
  role: 'buyer' | 'seller' | 'system';
  timestamp: string;
  status: MessageStatus;
  reply_to?: string;
  pin?: string; // Added to fix property fallback errors during checkout verification
}

// ==========================================
// 5. AFFILIATE / DISCOVER & EARN
// ==========================================
export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'event' | 'product';
  price: number;
  commission_percent: number;
  location: string;
  seller_name: string;
  seller_avatar: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  image_url: string;
}

export interface AffiliateEarnings {
  total: number;
  pending: number;
  withdrawable: number;
}

// ==========================================
// 6. ACTIVITY & HISTORY
// ==========================================
export interface HistoryDetails {
  sellerName?: string;
  deliveryLocation?: string;
  transactionId?: string;
  gameName?: string;
  playerId?: string;
  eventName?: string;
  eventDate?: string;
  ticketInfo?: string;
}

export interface HistoryItem {
  id: string;
  type: 'product' | 'point' | 'ticket' | 'affiliate' | 'wallet';
  title: string;
  image: string;
  amount: number;
  quantity?: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  details: HistoryDetails;
}

// ==========================================
// 7. EVENT SYSTEM (PRESERVED MODULES)
// ==========================================
export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: string; // Synced consistent primitive typing
  quantity_available: number;
}

export interface MarketplaceEvent {
  id: string;
  event_title: string;
  event_description: string;
  event_date: string;
  event_location: string;
  category: string;
  event_banner?: string;
  ticket_image?: string;
  is_free: boolean;
  is_approved: boolean;
  tickets_sold: number;
  total_tickets: number;
  ticket_types: TicketType[];
}

// ==========================================
// 8. WALLET & POINTS
// ==========================================
export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface PointPackage {
  id: number;
  name: string;
  price: number;
}

export interface PointProvider {
  id: string;
  name: string;
  image: string;
  color: string;
  packages: PointPackage[];
}





// src/types/index.ts

export type TransactionStatus = 'successful' | 'pending' | 'failed';

export type TransactionCategory = 'airtime' | 'data' | 'deposit' | 'withdrawal' | 'bill_payment' | 'transfer' | 'savings_deposit' | 'marketplace' |
'affiliate_commission' | 'bus_booking' | 'escrow' | 'crypto' | 'pension' | 'insurance' | string;
export type NotificationCategory = 'wallet' |
'affiliate' | 'payroll' | 'savings' | 'events' | 'streaming' | 'subscriptions' | 'security' | 'system' | string;
// Sub-interfaces required by downstream components to fix .map/reduce issues
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  paymentSchedule: 'monthly' | 'weekly' | 'biweekly';
  deductions?: any[];
  bonuses?: any[];
  nextPayDate: string;
  status: string;
}

export interface RentalUnit {
  id: string;
  unitNumber: string;
  status: 'occupied' | 'vacant' | string;
  [key: string]: any;
}



export interface Transaction {
  id: Number; // Fixed id number vs string conflict to safely enable implicit interface merging
  transaction_type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  status: string; // Fixed status string vs any conflict to align perfectly with top layer layout
  category?: TransactionCategory;
  created_at: string;
  payment_method?: string;
  sender_name?: string;
  receiver_name?: string;
}



export interface AppNotification {
  id: string;
  title: string;
  subtitle: string;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  amount?: number;
  actionType?: string;
}

export interface VaultMilestone {
  id: string;
  // Changed from id?: string to explicitly match Milestone tracking expectations
  label: string;
  percentage: number;
  achieved: boolean;
  achievedAt?: string;
}

export interface VaultTransaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  timestamp: string;
}

export interface SavingsVault {
  id: string;
  name: string;
  type: string;
  interestRate: number;
  goal: number;
  current: number;
  milestones: VaultMilestone[];
  transactions: VaultTransaction[];
  createdAt: string;
}

export interface Property {
  id: string;
  name: string;
  type: string; 
  images: string[];
  address: string;
  price?: number;
  units?: RentalUnit[]; // Updated: Components expect an iterable structural array, not a number
  description?: string;
  // Required by Properties.tsx
  ownerId?: string;     // Required by Properties.tsx
  affiliateCommission?: number;
  // Required by Properties.tsx
  createdAt: string;
  [key: string]: any;
}

export interface PensionPlan {
  id: string;
  name: string;
  totalContribution: number;
  employerMatch: number;
  projectedGrowth: number; 
  contributionRate: number;
  monthlyContribution: number;
  autoDeduct: boolean;
  history: any[];
  [key: string]: any;
}

export interface BSPCoinActivity {
  id: string;
  timestamp: string;
  type: 'earn' | 'receive' | 'spend' | 'transfer';
  amount: number;
  description?: string;
  balance?: number; // Added: Fixes missing property error in BspCrypto.tsx
}

export interface Business {
  id: string;
  name?: string;
  staff?: StaffMember[]; // Updated: Analytics & Payroll components expect array properties
  type?: string;
  // Required by BusinessHub.tsx
  walletBalance?: number; // Required by BusinessHub.tsx
  role?: string;
  // Required by BusinessHub.tsx
  createdAt: string;
  [key: string]: any;
}


// Remaining micro types safely structured
export interface BlueSeaCard { id: string; [key: string]: any; }
export interface InsurancePlan { id: string; [key: string]: any; }
export interface AppointmentBooking { id: string; createdAt: string; [key: string]: any; }
export interface Storefront { id: string; createdAt: string; analytics: any; [key: string]: any; }
export interface FreelanceService { id: string; [key: string]: any; }
export interface FreelanceOrder { id: string; createdAt: string; [key: string]: any; }
export interface AffiliateItem { id: string; [key: string]: any; }
export interface DigitalContract { id: string; createdAt: string; [key: string]: any; }
export interface BlueSeaEvent { id: string; createdAt: string; [key: string]: any; }
export interface EventTicket { id: string; purchaseDate: string; [key: string]: any; }
export interface LiveStream { id: string; [key: string]: any; }
export interface BusTicket { id: string; [key: string]: any; }
export interface Subscription { id: string; createdAt: string; [key: string]: any; }
