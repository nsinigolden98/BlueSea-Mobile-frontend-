import type { NavItem, Transaction, BluePointHistory, Task, Streak, Announcement, Notification, LoyaltyItem, GroupPayment } from '@/types';
import { ENDPOINTS, getRequest} from '@/types';

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid', path: '/dashboard' },
  { id: 'airtime', label: 'Buy Airtime & Data', icon: 'Smartphone', path: '/airtime' },
//  { id: 'data', label: 'Buy Data', icon: 'Wifi', path: '/data' },
  { id: 'marketplace', label: 'Blue Tickets', icon: 'Store', path: '/marketplace' },
  { id: 'services', label: 'Services', icon: 'Globe', path: '/services' },
 //  { id: 'campaigns', label: 'Discover & Earn', icon: 'HandCoins', path: '/campaigns' },
  { id: 'rewards', label: 'Rewards', icon: 'Gift', path: '/rewards' },
 //{ id: 'PayLink', label: 'PayLink', icon: 'ScanQrCode', path: '/paylink' },
//   { id: 'bluespere', label: 'BlueSpere', icon: 'Orbit', path: '/bluesphere' },
  { id: 'more-services', label: 'More Services', icon: 'Grid3X3', path: '/more-services' },
  { id: 'payroll-pro', label: 'Payroll Pro', icon: 'Briefcase', path: '/payroll-pro' },
  //{ id: 'mrg-links', label: 'MrG Links', icon: 'link', path: '/mrg-links' },
    { id: 'scanner', label: 'Scanner', icon: 'QrCode', path: '/scanner-assignments' },
  { id: 'support', label: 'Support', icon: 'Headphones', path: '/support' },
];



/*
export const services: Service[] = [
  { id: '1', name: 'Market Place', icon: 'Store', category: 'Special Features' },
  { id: '2', name: 'Group Payment', icon: 'Users', category: 'Special Features' },
  { id: '3', name: 'Smart-top-up', icon: 'RefreshCw', category: 'Special Features' },
  { id: '4', name: 'Airtime', icon: 'Smartphone', category: 'Airtime & Data' },
  { id: '5', name: 'Data', icon: 'Wifi', category: 'Airtime & Data' },
  { id: '6', name: 'Light Bills', icon: 'Zap', category: 'Bills & Utilities' },
  { id: '7', name: 'TV Subscription', icon: 'Tv', category: 'Bills & Utilities' },
  { id: '8', name: 'Wallet', icon: 'Wallet', category: 'Wallet' },
  { id: '9', name: 'Gift Card', icon: 'Gift', category: 'Wallet' },
  { id: '10', name: 'Referral/Reward', icon: 'Share2', category: 'Value Added' },
  { id: '11', name: 'Blue Point', icon: 'Coins', category: 'Value Added' },
  { id: '12', name: 'Airtime Buyback', icon: 'RefreshCw', category: 'Special Features' },
  { id: '13', name: 'BlueSpere', icon: 'Orbit', category: 'Value Added' },
]; */
   
export const TransactionsData= async ():Promise<Transaction[]> => {
  try {
    const response = await getRequest(ENDPOINTS.history);
    
    const page_length = Math.ceil(response.count / 5);

    // Create an array of page numbers [1, 2, 3...]
    const pages = Array.from({ length: page_length }, (_, i) => i + 1);

    // Fetch all pages in parallel (much faster than a sequential for-loop)
    const pageResults = await Promise.all(
      pages.map(page => getRequest(`${ENDPOINTS.history}?page=${page}`))
    );
    

    // Flatten all results into a single array and filter out any empty/undefined entries
    const allData = pageResults
      .flatMap(page => page.results)
      .filter(item => item !== undefined);
    return allData;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return []; // Return empty array on failure to prevent UI crashes
  }
};



// BluePoints History
export const bluePointHistory: BluePointHistory[] = [
  { id: '1', source: 'Airtime Purchase', points: 10, date: '2025-03-15', type: 'earned' },
  { id: '2', source: 'Data Purchase', points: 5, date: '2025-03-14', type: 'earned' },
  { id: '3', source: 'Daily Login', points: 2, date: '2025-03-14', type: 'earned' },
  { id: '4', source: 'Referral Bonus', points: 50, date: '2025-03-12', type: 'earned' },
  { id: '5', source: 'Points Redeemed', points: -100, date: '2025-03-10', type: 'redeemed' },
  { id: '6', source: 'Task Completed', points: 20, date: '2025-03-08', type: 'earned' },
];

// Tasks
export const tasks: Task[] = [
  { id: '1', title: 'Buy Airtime', description: 'Purchase airtime worth ₦500 or more', rewardPoints: 10, completed: true, icon: 'Smartphone' },
  { id: '2', title: 'Buy Data', description: 'Purchase a data plan', rewardPoints: 5, completed: true, icon: 'Wifi' },
  { id: '3', title: 'Refer a Friend', description: 'Invite a friend to join BlueSea', rewardPoints: 50, completed: false, icon: 'Share2' },
  { id: '4', title: 'Complete Profile', description: 'Fill in all your profile details', rewardPoints: 20, completed: true, icon: 'User' },
  { id: '5', title: 'Daily Login Streak', description: 'Login for 7 consecutive days', rewardPoints: 30, completed: false, icon: 'Calendar' },
  { id: '6', title: 'Pay Light Bill', description: 'Make a utility bill payment', rewardPoints: 15, completed: false, icon: 'Zap' },
];

// Streak Data
export const streakData: Streak = {
  currentStreak: 5,
  longestStreak: 12,
  nextReward: 30,
  lastLoginDate: '2025-03-16',
  streakHistory: [
    { date: '2025-03-16', claimed: true },
    { date: '2025-03-15', claimed: true },
    { date: '2025-03-14', claimed: true },
    { date: '2025-03-13', claimed: true },
    { date: '2025-03-12', claimed: true },
    { date: '2025-03-11', claimed: false },
    { date: '2025-03-10', claimed: true },
  ],
};

// Announcements
export const announcements: Announcement[] = [
  { id: '1', title: 'Welcome to BlueSea Mobile!', content: 'Thank you for joining us. Start earning BluePoints today!', date: '2025-03-15', type: 'general', priority: 'high' },
  { id: '2', title: 'New Feature: Group Payments', content: 'You can now create group payments and split bills with friends and family.', date: '2025-03-14', type: 'feature', priority: 'medium' },
  { id: '3', title: 'Weekend Bonus', content: 'Earn 2x BluePoints on all purchases this weekend!', date: '2025-03-13', type: 'promo', priority: 'high' },
];

// Notifications
export const notifications: Notification[] = [
  { id: '1', title: 'Transaction Successful', message: 'Your airtime purchase of ₦1000 was successful.', date: '2025-03-15 14:30', type: 'transaction', read: false },
  { id: '2', title: 'Points Earned!', message: 'You earned 10 BluePoints for your airtime purchase.', date: '2025-03-15 14:30', type: 'reward', read: false },
  { id: '3', title: 'New Announcement', message: 'Check out our new Group Payments feature!', date: '2025-03-14 09:00', type: 'announcement', read: true },
  { id: '4', title: 'Streak Bonus', message: 'You are on a 5-day login streak! Keep it up!', date: '2025-03-14 08:00', type: 'reward', read: true },
  { id: '5', title: 'Welcome Bonus', message: 'You received 50 BluePoints as a welcome bonus!', date: '2025-03-10 10:00', type: 'reward', read: true },
];

// Loyalty Marketplace Items
export const loyaltyItems: LoyaltyItem[] = [
  { id: '1', name: '₦100 Airtime Voucher', description: 'Get ₦100 airtime for any network', pointsCost: 100, image: 'airtime', category: 'voucher', available: true },
  { id: '2', name: '₦500 Data Bundle', description: '500MB data valid for 7 days', pointsCost: 400, image: 'data', category: 'data', available: true },
  { id: '3', name: '10% Discount Coupon', description: 'Get 10% off your next purchase', pointsCost: 200, image: 'discount', category: 'discount', available: true },
  { id: '4', name: 'Movie Ticket', description: 'Free movie ticket at partner cinemas', pointsCost: 1000, image: 'ticket', category: 'experience', available: false },
  { id: '5', name: 'Coffee Voucher', description: 'Free coffee at partner cafes', pointsCost: 300, image: 'coffee', category: 'voucher', available: true },
  { id: '6', name: '₦1000 Cashback', description: 'Get ₦1000 added to your wallet', pointsCost: 900, image: 'cashback', category: 'cashback', available: true },
];

// Group Payments
export const groupPayments: GroupPayment[] = [
  { 
    id: '1', 
    name: 'Weekend Data Bundle', 
    description: 'Splitting 10GB data bundle among 4 friends',
    targetAmount: 3000,
    currentAmount: 2250,
    contributors: [
      { id: '1', name: 'You', amount: 750, status: 'paid' },
      { id: '2', name: 'John Doe', amount: 750, status: 'paid' },
      { id: '3', name: 'Jane Smith', amount: 750, status: 'paid' },
      { id: '4', name: 'Mike Johnson', amount: 750, status: 'pending' },
    ],
    status: 'active',
    createdAt: '2025-03-14',
    expiresAt: '2025-03-17',
  },
  { 
    id: '2', 
    name: 'Office Airtime', 
    description: 'Team airtime for the month',
    targetAmount: 5000,
    currentAmount: 5000,
    contributors: [
      { id: '1', name: 'You', amount: 1000, status: 'paid' },
      { id: '2', name: 'Alice', amount: 1000, status: 'paid' },
      { id: '3', name: 'Bob', amount: 1000, status: 'paid' },
      { id: '4', name: 'Carol', amount: 1000, status: 'paid' },
      { id: '5', name: 'David', amount: 1000, status: 'paid' },
    ],
    status: 'completed',
    createdAt: '2025-03-01',
    expiresAt: '2025-03-05',
  },
];

// More Services Categories
export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  comingSoon?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: ServiceItem[];
}

export const moreServiceCategories: ServiceCategory[] = [
  {
    id: 'telecom',
    name: 'Telecom',
    services: [
      { id: 't1', name: 'Airtime', icon: 'Smartphone' },
      { id: 't2', name: 'Data Bundle', icon: 'Wifi' },
      { id: 't3', name: 'Airtime Buyback', icon: 'RefreshCw' },
      { id: 't4', name: 'Auto Top-Up', icon: 'RefreshCw' },
    ],
  },
  {
    id: 'tv',
    name: 'TV Subscription',
    services: [
      { id: 'tv1', name: 'DSTV', icon: 'Tv' },
      { id: 'tv2', name: 'GOTV', icon: 'Tv' },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    services: [
      { id: 'u1', name: 'Electricity Bill', icon: 'Zap' },
      { id: 'u2', name: 'Betting', icon: 'Trophy' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    services: [
      { id: 'f1', name: 'Wallet', icon: 'Wallet' },
      { id: 'f2', name: 'Group Payment', icon: 'Users' },
      { id: 'f3', name: 'Blue Tickets', icon: 'Store' },
      { id: 'f4', name: 'Payroll', icon: 'Briefcase' },
    ],
  },
  {
    id: 'others',
    name: 'Others',
    services: [
      { id: 'o3', name: 'Loyalty Rewards', icon: 'Award' },
      { id: 'o4', name: 'Rewards', icon: 'Gift' },
      { id: 'o6', name: 'Support', icon: 'Headphones' },
      { id: 'o7', name: 'Campaigns', icon: 'Sparkles' },
      { id: 'o8', name: 'Scanner', icon: 'QrCode' },
    ],
  },
];

export const airtimeAmounts = [100, 200, 300, 400, 500, 1000];

export const networks = ['MTN', 'Glo', 'Airtel', '9mobile'] as const;



/*

// ---- Transaction Data Loader ----
export async function TransactionsData() {
  // In a real app, this would fetch from the API
  // For demo, we load from localStorage or return defaults
  const stored = localStorage.getItem('bluesea_transactions');
  if (stored) return JSON.parse(stored);
  return [];
}

// ---- Bus Companies (Demo) ----
export const BUS_COMPANIES = [
  { id: 'guo', name: 'GUO Transport', slogan: 'The Ultimate Transport Experience' },
  { id: 'abc', name: 'ABC Transport', slogan: 'Travel With Confidence' },
  { id: 'libra', name: 'Libra Motors', slogan: 'Comfort On The Move' },
  { id: 'peace', name: 'Peace Mass Transit', slogan: 'Your Peaceful Journey' },
  { id: 'gigm', name: 'GIGM', slogan: 'Go With God' },
];*/
