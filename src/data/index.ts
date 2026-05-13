import type { DataPlan, Service, NavItem, Transaction, BluePointHistory, Task, Streak, Announcement, Notification, LoyaltyItem, GroupPayment, Network } from '@/types';
import { ENDPOINTS, getRequest} from '@/types';

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid', path: '/dashboard' },
  { id: 'airtime', label: 'Buy Airtime & Data', icon: 'Smartphone', path: '/airtime' },
//  { id: 'data', label: 'Buy Data', icon: 'Wifi', path: '/data' },
  { id: 'marketplace', label: 'Market Place', icon: 'Store', path: '/marketplace' },
  { id: 'services', label: 'Services', icon: 'Globe', path: '/services' },
   { id: 'campaigns', label: 'Discover & Earn', icon: 'HandCoins', path: '/campaigns' },
  { id: 'rewards', label: 'Rewards', icon: 'Gift', path: '/rewards' },
  { id: 'campaigns', label: 'Flights', icon: 'PlaneTakeoff', path: '/flights' },
  { id: 'scanner', label: 'Scanner', icon: 'QrCode', path: '/scanner-assignments' },
  { id: 'support', label: 'Support', icon: 'Headphones', path: '/support' },
    { id: 'bluespere', label: 'BlueSpere', icon: 'Orbit', path: '/bluesphere' },
  { id: 'more-services', label: 'More Services', icon: 'Grid3X3', path: '/more-services' },
];



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
];
  
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
      { id: 'tv3', name: 'Startimes', icon: 'Tv' },
      { id: 'tv4', name: 'ShowMax', icon: 'Tv' },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    services: [
      { id: 'e1', name: 'WAEC Registration', icon: 'BookOpen' },
      { id: 'e2', name: 'WAEC Result', icon: 'FileText' },
      { id: 'e3', name: 'JAMB Registration', icon: 'GraduationCap' },
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
      { id: 'f3', name: 'Market Place', icon: 'Store' },
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

export const airtimeAmounts = [50, 100, 200, 500, 1000, 2000];

export const networks = ['MTN', 'Glo', 'Airtel', '9mobile'] as const;

export const MTN_DATA = [
{
id: "mtn-10mb-100",
price: 100,
size: "110MB",
validity: "1 Day",
planType: "Daily",
network: "MTN",
description: "110MB Daily Plan (1 Day) - N100"
},
{
id: "mtn-230mb-200",
price: 200,
size: "230MB",
validity: "1 Day",
planType: "Daily",
network: "MTN",
description: "230MB Daily Plan (1 Day) - N200"
},
{
id: "mtn-1500mb-1000",
price: 1000,
size: "1.5GB",
validity: "7 Days",
planType: "Weekly",
network: "MTN",
description: "1.5GB Weekly Plan (7 Days) - N1,000"
},
{
id: "mtn-5.5gb-3500",
price: 3500,
size: "7GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "7GB Monthly Plan - N3,500"
},
{
id: "mtn-3.5gb-1500",
price: 1500,
size: "3.5GB",
validity: "7 Days",
planType: "Weekly",
network: "MTN",
description: "3.5GB Weekly Plan (7 Days) - N1,500"
},
{
id: "mtn-data-6500",
price: 6500,
size: "16.5GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "16.5GB Monthly Plan"
},
{
id: "mtn-20gb-7500",
price: 7500,
size: "20GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "20GB Monthly Plan"
},
{
id: "mtn-32gb-11000",
price: 11000,
size: "36GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "36GB Monthly Plan"
},
{
id: "mtn-75gb-20000",
price: 18000,
size: "75GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "75GB Monthly Plan"
},
{
id: "mtn-2.7gb-2000",
price: 2000,
size: "2.7GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "2.7GB + 2mins + 2GB All Night Streaming + 200MB YouTube Music, Monthly Plan - N2000"
},
{
id: "mtn-1800mb-1500",
price: 1500,
size: "1.8GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "1.8GB + 6mins + 5 SMS, Weekly plan - N1500"
},
{
id: "mtn-120gb-24000",
price: 24000,
size: "120GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN N24,000 120GB - 30days"
},
{
id: "mtn-480gb-90000",
price: 90000,
size: "480GB",
validity: "90 Days",
planType: "Extravalue",
network: "MTN",
description: "480GB 3-Month Plan - N90,000"
},
{
id: "mtn-1gb-350",
price: 500,
size: "1GB",
validity: "1 Day",
planType: "Daily",
network: "MTN",
description: "MTN N500 1GB + 1.5mins - 1 day"
},
{
id: "mtn-1gb-600",
price: 800,
size: "1GB",
validity: "7 Days",
planType: "Weekly",
network: "MTN",
description: "1GB+5mins Weekly Plan"
},
{
id: "mtn-xtrabundle-500",
price: 500,
size: "600MB",
validity: "7 Days",
planType: "Extravalue",
network: "MTN",
description: "600MB Xtra Bundle Weekly Data (7 Days) - N500"
},
{
id: "mtn-xtra-1000",
price: 1500,
size: "2GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "2GB + 2 Mins Monthly Plan - N1,500"
},
{
id: "mtn-11gb-5000",
price: 5500,
size: "12.5GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "12.5GB Monthly Plan - N5,500"
},
{
id: "mtn-2-5gb-900",
price: 900,
size: "2.5GB",
validity: "2 Days",
planType: "Daily",
network: "MTN",
description: "MTN N900 2.5GB - 2 days"
},
{
id: "mtn-150gb-40000",
price: 40000,
size: "150GB",
validity: "60 Days",
planType: "Extravalue",
network: "MTN",
description: "150GB 2-Month Plan"
},
{
id: "mtn-11gb-3500",
price: 3500,
size: "11GB",
validity: "7 Days",
planType: "Weekly",
network: "MTN",
description: "MTN N3,500 11GB - 7 days"
},
{
id: "mtn-500mb-ex-350",
price: 350,
size: "500MB",
validity: "1 Day",
planType: "Daily",
network: "MTN",
description: "500MB Daily Plan (1 Day) - N350"
},
{
id: "mtn-2-5gb-ex-600",
price: 600,
size: "1.5GB",
validity: "2 Days",
planType: "Daily",
network: "MTN",
description: "1.5GB Daily Plan (2 Days) - N600"
},
{
id: "mtn-2gb-ex-750",
price: 750,
size: "2GB",
validity: "2 Days",
planType: "Daily",
network: "MTN",
description: "2GB Daily Plan (2 Days) - N750"
},
{
id: "mtn-1500mb-ex-1200",
price: 3000,
size: "2.7GB",
validity: "30 Days",
planType: "Extravalue",
network: "MTN",
description: "2.7GB Xtra Bundle Monthly Plan"
},
{
id: "mtn-8gb-ex-3000",
price: 4500,
size: "10GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN N4,500 10GB + 10mins - 30 days"
},
{
id: "mtn-25gb-9000",
price: 9000,
size: "25GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN N9,000 25GB + Youtube - 30 days"
},
{
id: "mtn-65gb-ex-16000",
price: 16000,
size: "65GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "65GB Monthly Plan (30 Days) - N16,000"
},
{
id: "mtn-500mb-500",
price: 500,
size: "1.5GB",
validity: "7 Days",
planType: "Weekly",
network: "MTN",
description: "500MB + 1GB YouTube (7 Days) - N500"
},
{
id: "mtn-3.2gb-1000",
price: 1000,
size: "3.2GB",
validity: "2 Days",
planType: "Daily",
network: "MTN",
description: "MTN N1000 3.2GB - 2 days"
},
{
id: "mtn-7gb-3000",
price: 2500,
size: "6GB",
validity: "7 Days",
planType: "Weekly",
network: "MTN",
description: "MTN N2500 6GB - 7 days"
},
{
id: "mtn-3.5gb-2500",
price: 2500,
size: "3.5GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN N2500 3.5GB +5mins Monthly Plan"
},
{
id: "mtn-hynetflex-14500-30",
price: 14500,
size: "60GB",
validity: "30 Days",
planType: "Extravalue",
network: "MTN",
description: "60GB Monthly HyNetFlex Plan - N14,500"
},
{
id: "mtn-hynetflex-75000-90",
price: 75000,
size: "450GB",
validity: "90 Days",
planType: "Extravalue",
network: "MTN",
description: "450GB 3-Month Broadband Plan - N75,000"
},
{
id: "mtn-hynetflex-9000-30",
price: 9000,
size: "30GB",
validity: "30 Days",
planType: "Extravalue",
network: "MTN",
description: "30GB Monthly Broadband Plan - N9,000"
},
{
id: "mtn-2.5-750",
price: 750,
size: "2.5GB",
validity: "1 Day",
planType: "Daily",
network: "MTN",
description: "2.5GB Daily Plan - 750 Naira"
},
{
id: "mtn-20-5000",
price: 5000,
size: "20GB",
validity: "7 Days",
planType: "Weekly",
network: "MTN",
description: "20GB Weekly Plan - 5,000 Naira"
},
{
id: "mtn-7gb-1800",
price: 1800,
size: "7GB",
validity: "2 Days",
planType: "Daily",
network: "MTN",
description: "MTN N1800 7GB - (2 Days)"
},
{
id: "mtn-150gb-30000",
price: 30000,
size: "150GB",
validity: "30 Days",
planType: "Extravalue",
network: "MTN",
description: "MTN N30,000 150GB + 2GB daily - 5G Router Data (30 Days)"
},
{
id: "mtn-165gb-35000",
price: 35000,
size: "165GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN N35,000 165GB Monthly Data Plan (30 Days)"
},
{
id: "mtn-200gb-37500",
price: 37500,
size: "200GB",
validity: "30 Days",
planType: "Extravalue",
network: "MTN",
description: "MTN N37,500 200GB + 5GB Youtube/MSTeams/Zoom - 5G Router Data (30 Days)"
},
{
id: "mtn-260gb-monthly",
price: 45000,
size: "260GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN 260GB + 2GB daily upon exhausting main bundle - N45,000"
},
{
id: "mtn-1500gb-yearly",
price: 225000,
size: "1.5TB",
validity: "365 Days",
planType: "Extravalue",
network: "MTN",
description: "MTN 1.5TB - N225,000 Broadband Router"
},
{
id: "mtn-6.75gb-3000",
price: 3000,
size: "6.75GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN N3000 6.75GB Monthly Plan"
},
{
id: "mtn-14.5gb-5000",
price: 5000,
size: "14.5GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN 14.5GB Monthly Plan Monthly"
},
{
id: "mtn-5.5gb-2-1500",
price: 1500,
size: "5.5GB",
validity: "2 Days",
planType: "Daily",
network: "MTN",
description: "MTN N1500 5.5GB - (2 days)"
},
{
id: "mtn-4gb-2-1200",
price: 1200,
size: "4GB",
validity: "2 Days",
planType: "Daily",
network: "MTN",
description: "MTN N1200 4GB - (2 days)"
},
{
id: "mtn-3.5gb-1-1000",
price: 1000,
size: "3.5GB",
validity: "1 Day",
planType: "Daily",
network: "MTN",
description: "MTN N1000 3.5GB - (1 day)"
},
{
id: "mtn-34gb-30-10000",
price: 10000,
size: "34GB",
validity: "30 Days",
planType: "Monthly",
network: "MTN",
description: "MTN N10000 34GB - (30 days)"
}
] as const;



export const AIRTEL_DATA = [
{
id: "airt-50",
price: 50,
size: "250MB",
validity: "1 Day",
planType: "Night",
network: "Airtel",
description: "250MB Night Plan (12 - 5 AM) - 50 Naira - 1Day"
},
{
id: "airt-100",
price: 100,
size: "200MB",
validity: "1 Day",
planType: "Social",
network: "Airtel",
description: "200MB Social Plan (2 Days) - 100 Naira - 1Day"
},
{
id: "airt-200",
price: 200,
size: "230MB",
validity: "1 Day",
planType: "Daily",
network: "Airtel",
description: "230MB Daily Plan (2 Days) - 200 Naira - 200MB - 1Day"
},
{
id: "airt-daily-100",
price: 100,
size: "110MB",
validity: "1 Day",
planType: "Daily",
network: "Airtel",
description: "Airtel Data - 100 Naira - 110MB - 1 Day"
},
{
id: "airt-500",
price: 500,
size: "500MB",
validity: "7 Days",
planType: "Weekly",
network: "Airtel",
description: "500MB Weekly Plan (7 Days) - 500 Naira"
},
{
id: "airt-1000-7",
price: 1000,
size: "1.5GB",
validity: "7 Days",
planType: "Weekly",
network: "Airtel",
description: "1.5GB Weekly Plan + Youtube & Social Plans (7 Days) - 1,000 Naira"
},
{
id: "airt-1500-7",
price: 1500,
size: "3.5GB",
validity: "7 Days",
planType: "Weekly",
network: "Airtel",
description: "3.5GB Weekly Plan + Youtube & Social Platform (7 Days) - 1,500 Naira"
},
{
id: "airt-2000",
price: 2000,
size: "3GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "3GB Monthly Plan + Youtube & Social Plan (30 Days)- 2,000 Naira"
},
{
id: "airt-3000",
price: 3000,
size: "8GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "8GB Monthly Plan + Youtube & Social Plan (30 Days) - 3,000 Naira"
},
{
id: "airt-4000",
price: 4000,
size: "10GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "10GB Monthly Plan + Youtube & Social Plan (30 Days) - 4,000 Naira"
},
{
id: "airt-5000",
price: 5000,
size: "13GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "13GB Monthly Plan + Youtube & Social Plan (30 Days) - 5,000 Naira"
},
{
id: "airt-1500-2",
price: 1500,
size: "5GB",
validity: "2 Days",
planType: "Binge",
network: "Airtel",
description: "5GB Binge Plan + Youtube & Social Platforms Data (2 Day) - 1,500 Naira"
},
{
id: "airt-10000",
price: 10000,
size: "35GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "35GB Monthly Plan + Youtube & Social Plan (30 Days) - 10,000 Naira"
},
{
id: "airt-15000",
price: 15000,
size: "60GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "60GB Monthly Plan + Youtube & Social Plan (30 Days) - 15,000 Naira"
},
{
id: "airt-40000",
price: 40000,
size: "210GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "210GB Data (30 Days) - 40,000 Naira"
},
{
id: "airt-60000",
price: 60000,
size: "350GB",
validity: "120 Days",
planType: "Extravalue",
network: "Airtel",
description: "350GB Monthly Plan + Youtube & Social Plan (120 Days) - 60,000 Naira"
},
{
id: "airt-100000",
price: 100000,
size: "680GB",
validity: "365 Days",
planType: "Extravalue",
network: "Airtel",
description: "680GB Data (365 Days) - 100,000 Naira"
},
{
id: "airt-20000",
price: 20000,
size: "100GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "100GB Monthly Plan + Youtube & Social Plan (30 Days) - 20,000 Naira"
},
{
id: "airt-2500",
price: 2500,
size: "4GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "4GB Monthly Plan + Youtube & Social Plan (30 Days) - 2,500 Naira"
},
{
id: "airt-8000",
price: 8000,
size: "25GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "25GB Monthly Plan + Youtube & Social Plan (30 Days) - 8,000 Naira"
},
{
id: "airt-30000",
price: 30000,
size: "160GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "160GB Monthly Plan (30 Days) - 30,000 Naira"
},
{
id: "airt-50000",
price: 50000,
size: "200GB",
validity: "90 Days",
planType: "Extravalue",
network: "Airtel",
description: "200GB Monthly Plan (90 Days) - 50,000 Naira"
},
{
id: "airt-600",
price: 600,
size: "1.5GB",
validity: "2 Days",
planType: "Binge",
network: "Airtel",
description: "1.5GB Binge Plan + Youtube & Social Plan Data (2 Days) - 600 Naira"
},
{
id: "airt-1000-2",
price: 1000,
size: "3.2GB",
validity: "2 Days",
planType: "Binge",
network: "Airtel",
description: "3.2GB Binge Plan + Youtube & Social Plans Data (2 Days)  - 1000 Naira"
},
{
id: "airt-3000-7",
price: 3000,
size: "10GB",
validity: "7 Days",
planType: "Weekly",
network: "Airtel",
description: "10GB Weekly Plan + Youtube & Social Platform (7 Days) - 3000 Naira"
},
{
id: "airt-5000-7",
price: 5000,
size: "18GB",
validity: "7 Days",
planType: "Weekly",
network: "Airtel",
description: "18GB Weekly Plan + Youtube & Social Platform (7 Days) - 5000 Naira"
},
{
id: "airt-binge-500-1",
price: 500,
size: "Binge Plan",
validity: "1 Day",
planType: "Binge",
network: "Airtel",
description: "500 Naira Binge Plan -"
},
{
id: "airt-800-7",
price: 800,
size: "1GB",
validity: "7 Days",
planType: "Weekly",
network: "Airtel",
description: "1GB Weekly Plan (7 Days) - 800 Naira"
},
{
id: "airt-6000-30",
price: 6000,
size: "18GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "18GB Monthly Plan + Youtube & Social Plan (30 Days) - 6000 Naira"
},
{
id: "airt-75-1",
price: 75,
size: "75MB",
validity: "1 Day",
planType: "Daily",
network: "Airtel",
description: "75MB Daily Plan (1 Day) - 75 Naira"
},
{
id: "airt-300-1",
price: 300,
size: "300MB",
validity: "1 Day",
planType: "Daily",
network: "Airtel",
description: "300MB Daily Plan (1 Day) - 300 Naira"
},
{
id: "airt-social-300-3",
price: 300,
size: "1GB",
validity: "3 Days",
planType: "Social",
network: "Airtel",
description: "1GB Social Plan Plan (3 Days) - 300 Naira"
},
{
id: "airt-750-2",
price: 750,
size: "2GB",
validity: "2 Days",
planType: "Binge",
network: "Airtel",
description: "2GB Binge Plan + Youtube & Social Plan Data (2 Days) - 750 Naira"
},
{
id: "airt-1500-30",
price: 1500,
size: "2GB",
validity: "30 Days",
planType: "Monthly",
network: "Airtel",
description: "2GB Monthly Plan + Youtube & Social Plan (30 Days) - 1,500 Naira"
},
{
id: "airt-2500-7",
price: 2500,
size: "6GB",
validity: "7 Days",
planType: "Weekly",
network: "Airtel",
description: "6GB Weekly Plan + Youtube & Social Platform (7 Days) - 2,500 Naira"
},
{
id: "airt-mifi-5000-30",
price: 5000,
size: "13GB",
validity: "30 Days",
planType: "MiFi",
network: "Airtel",
description: "13GB MIFI 5 Data - MiFi Only (30 Days) - 5,000 Naira"
},
{
id: "airt-mifi-10000-30",
price: 10000,
size: "35GB",
validity: "30 Days",
planType: "MiFi",
network: "Airtel",
description: "35GB MIFI 10 Data - MiFi Only (30 Days) - 10,000 Naira"
},
{
id: "airt-mifi-15000-30",
price: 15000,
size: "60GB",
validity: "30 Days",
planType: "MiFi",
network: "Airtel",
description: "60GB MIFI 15 Data - MiFi Only (30 Days) - 15,000 Naira"
},
{
id: "airt-mifi-20000-30",
price: 20000,
size: "100GB",
validity: "30 Days",
planType: "Router",
network: "Airtel",
description: "100GB Monthly Plan + Youtube & Social Plan (30 Days) - 20,000 Naira"
},
{
id: "airt-mifi-30000-30",
price: 30000,
size: "Unlimited",
validity: "30 Days",
planType: "Unlimited",
network: "Airtel",
description: "Unlimited 20MBPS Data - Router Only (30 Days) - 30,000 Naira"
},
{
id: "airt-mifi-50000-30",
price: 50000,
size: "Unlimited",
validity: "30 Days",
planType: "Unlimited",
network: "Airtel",
description: "Unlimited 60MBPS Data - Router Only (30 Days) - 50,000 Naira"
},
{
id: "airt-mifi-80000-90",
price: 80000,
size: "Unlimited",
validity: "90 Days",
planType: "Unlimited",
network: "Airtel",
description: "Unlimited 60MBPS Data - Router Only (90 Days) - 80,000 Naira"
},
{
id: "airt-mifi-135000-90",
price: 135000,
size: "Unlimited",
validity: "90 Days",
planType: "Unlimited",
network: "Airtel",
description: "Unlimited 60MBPS Data - Router Only (90 Days) - 135,000 Naira"
},
{
id: "airt-mifi-150000-120",
price: 150000,
size: "Unlimited",
validity: "120 Days",
planType: "Unlimited",
network: "Airtel",
description: "Unlimited 20MBPS Data - Router Only (120 Days) - 150,000 Naira"
},
{
id: "airt-social-500-7",
price: 500,
size: "1.5GB",
validity: "7 Days",
planType: "Social",
network: "Airtel",
description: "1.5GB Social Plan - 500 Naira"
},
{
id: "airt-350-500",
price: 350,
size: "500MB",
validity: "2 Days",
planType: "Daily",
network: "Airtel",
description: "500MB Daily Plan (2 Days) - 350 Naira - 500MB - 2 Days"
}
]as const;


export const GLO_DATA = [
{
id: "glo-daily-50",
price: 50,
size: "40MB",
validity: "1 Day",
planType: "Daily",
network: "Glo",
description: "40MB + 5MB Night - N50 - 1 Day"
},
{
id: "glo-daily-100",
price: 100,
size: "120MB",
validity: "1 Day",
planType: "Daily",
network: "Glo",
description: "120MB + 5MB Night - N100 - 1 Day"
},
{
id: "glo-2days-200",
price: 200,
size: "250MB",
validity: "2 Days",
planType: "Daily",
network: "Glo",
description: "250MB + 25MB Night - N200 - 2 Days"
},
{
id: "glo-monthly-1000",
price: 1000,
size: "1.1GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "1.1GB + 1.5GB Night - N1000 - 30 Days"
},
{
id: "glo-monthly-1500",
price: 1500,
size: "2.2GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "2.2GB + 3GB - N1500 - 30 Days"
},
{
id: "glo-monthly-2000",
price: 2000,
size: "3.25GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "3.25GB + 3GB Night - N2000 - 30 Days"
},
{
id: "glo-monthly-2500",
price: 2500,
size: "4.25GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "4.25GB + 3GB Night - N2500 - 30 Days"
},
{
id: "glo-monthly-3000",
price: 3000,
size: "8.5GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "8.5GB + 2GB Night - N3000 - 30 Days"
},
{
id: "glo-monthly-4000",
price: 4000,
size: "10.5GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "10.5GB + 2GB Night - N4000 - 30 Days"
},
{
id: "glo-monthly-5000",
price: 5000,
size: "14.5GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "14.5GB + 2.5GB Night - N5000 - 30 Days"
},
{
id: "glo-monthly-8000",
price: 8000,
size: "26GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "26GB + 2GB - N8,000 - 30 Days"
},
{
id: "glo-monthly-10000",
price: 10000,
size: "38GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "38GB + 4GB Night - N10,000 - 30 Days"
},
{
id: "glo-sunday-200",
price: 200,
size: "875MB",
validity: "1 Day",
planType: "Weekend",
network: "Glo",
description: "875MB 1 Day - Weekend N200"
},
{
id: "glo-special-500",
price: 500,
size: "1GB",
validity: "2 Days",
planType: "Special",
network: "Glo",
description: "1GB + 1GB Night - N500 - 2 Days Special"
},
{
id: "glo-special-1500",
price: 1500,
size: "4GB",
validity: "7 Days",
planType: "Special",
network: "Glo",
description: "4GB + 2GB Night - N1,500 - 7 Days - Special"
},
{
id: "glo-weekend-500",
price: 500,
size: "2.5GB",
validity: "2 Days",
planType: "Weekend",
network: "Glo",
description: "2.5GB 2 Days - Weekend N500"
},
{
id: "glo-mega-30000",
price: 30000,
size: "165GB",
validity: "30 Days",
planType: "Mega",
network: "Glo",
description: "165GB 30 Days - Mega N30000"
},
{
id: "glo-mega-40000",
price: 40000,
size: "220GB",
validity: "30 Days",
planType: "Mega",
network: "Glo",
description: "220GB 30 Days - Mega N40000 Oneoff"
},
{
id: "glo-mega-50000",
price: 50000,
size: "310GB",
validity: "60 Days",
planType: "Mega",
network: "Glo",
description: "310GB 60 Days - Mega N50000"
},
{
id: "glo-mega-60000",
price: 60000,
size: "355GB",
validity: "90 Days",
planType: "Mega",
network: "Glo",
description: "355GB 90 Days - Mega N60000"
},
{
id: "glo-mega-75000",
price: 75000,
size: "475GB",
validity: "90 Days",
planType: "Mega",
network: "Glo",
description: "475GB 90 Days - Mega N75000 Oneoff"
},
{
id: "glo-tv-150",
price: 150,
size: "500MB",
validity: "3 Days",
planType: "TV",
network: "Glo",
description: "Glo TV VOD 500 MB 3days Oneoff"
},
{
id: "glo-tv-450",
price: 450,
size: "2GB",
validity: "7 Days",
planType: "TV",
network: "Glo",
description: "Glo TV VOD 2GB 7days Oneoff"
},
{
id: "glo-tv-1400",
price: 1400,
size: "6GB",
validity: "30 Days",
planType: "TV",
network: "Glo",
description: "Glo TV VOD 6GB 30days"
},
{
id: "glo-tv-900",
price: 900,
size: "2GB",
validity: "7 Days",
planType: "TV",
network: "Glo",
description: "Glo TV Lite 2GB 7 Days"
},
{
id: "glo-tv-3200",
price: 3200,
size: "6GB",
validity: "30 Days",
planType: "TV",
network: "Glo",
description: "Glo TV Max 6 GB 30 Days"
},
{
id: "glo-social-oneoff-100",
price: 100,
size: "300MB",
validity: "1 Day",
planType: "Social",
network: "Glo",
description: "300MB - GloMyG N100 1 Day"
},
{
id: "glo-social-oneoff-300",
price: 300,
size: "1GB",
validity: "3 Days",
planType: "Social",
network: "Glo",
description: "Glo MyG N300 1 GB 3 Days OneOff (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)"
},
{
id: "glo-social-oneoff-500",
price: 500,
size: "1.5GB",
validity: "7 Days",
planType: "Social",
network: "Glo",
description: "Glo MyG N500 1.5 GB 7 Days (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)"
},
{
id: "glo-social-oneoff-1000",
price: 1000,
size: "3.5GB",
validity: "30 Days",
planType: "Social",
network: "Glo",
description: "Glo MyG N1000 3.5 GB 30 Days (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)"
},
{
id: "glo-campus-booster-100",
price: 100,
size: "240MB",
validity: "1 Day",
planType: "Campus",
network: "Glo",
description: "240MB + 5MB Night - N100 - 1 Day - Camp-Boost"
},
{
id: "glo-campus-booster-200",
price: 200,
size: "500MB",
validity: "2 Days",
planType: "Campus",
network: "Glo",
description: "500MB + 25MB Night - N200 - 2 Days - Camp-Boost"
},
{
id: "glo-campus-booster-500",
price: 500,
size: "1.1GB",
validity: "7 Days",
planType: "Campus",
network: "Glo",
description: "1.1GB + 1GB Night - N500 - 7 Days - Camp-Boost"
},
{
id: "glo-campus-booster-1000",
price: 1000,
size: "2.2GB",
validity: "30 Days",
planType: "Campus",
network: "Glo",
description: "2.2GB + 2GB Night - N1000 - 30 Days - Camp-Boost"
},
{
id: "glo-campus-booster-2000",
price: 2000,
size: "6.5GB",
validity: "30 Days",
planType: "Campus",
network: "Glo",
description: "6.5GB + 3.5GB - N2,000 - 30 Days - Camp-Boost"
},
{
id: "glo-campus-booster-5000",
price: 5000,
size: "29GB",
validity: "30 Days",
planType: "Campus",
network: "Glo",
description: "29GB + 3GB Night - N5000 - 30 Days - Camp-Boost"
},
{
id: "glo-dg-295",
price: 295,
size: "1GB",
validity: "3 Days",
planType: "DG",
network: "Glo",
description: "1GB (Best Value) - 295 Naira - 3 days"
},
{
id: "glo-dg-890",
price: 890,
size: "3GB",
validity: "3 Days",
planType: "DG",
network: "Glo",
description: "3GB (Best Value) - 890 Naira - 3 days"
},
{
id: "glo-dg-1485",
price: 1485,
size: "5GB",
validity: "3 Days",
planType: "DG",
network: "Glo",
description: "5GB (Best Value) - 1,485 Naira - 3 days"
},
{
id: "glo-dg-345",
price: 345,
size: "1GB",
validity: "7 Days",
planType: "DG",
network: "Glo",
description: "1GB (Best Value) - 345 Naira - 7 days"
},
{
id: "glo-dg-1040",
price: 1040,
size: "3GB",
validity: "7 Days",
planType: "DG",
network: "Glo",
description: "3GB (Best Value) - 1,040 Naira - 7 days"
},
{
id: "glo-dg-1730",
price: 1730,
size: "5GB",
validity: "7 Days",
planType: "DG",
network: "Glo",
description: "5GB (Best Value) - 1,730 Naira - 7 days"
},
{
id: "glo-dg-350",
price: 350,
size: "1GB",
validity: "14 Days",
planType: "DG",
network: "Glo",
description: "1GB (Best Value) - 350 Naira - 14 days Night plan"
},
{
id: "glo-dg-1040-14",
price: 1040,
size: "3GB",
validity: "14 Days",
planType: "DG",
network: "Glo",
description: "3GB (Best Value) - 1,040 Naira - 14 days Night plan"
},
// Note: glo-dg-1730 duplicated in source table for 7d and 14d night. flagging.
{
id: "glo-dg-1730-14", // Manually adjusted suffix for internal uniqueness while flagging original in comment
price: 1730,
size: "5GB",
validity: "14 Days",
planType: "DG",
network: "Glo",
description: "5GB (Best Value)  - 1,730 Naira - 14 days Night plan"
},
{
id: "glo-dg-3460",
price: 3460,
size: "10GB",
validity: "14 Days",
planType: "DG",
network: "Glo",
description: "10GB (Best Value) - 3,460 Naira - 14 days Night plan"
},
{
id: "glo-dg-99",
price: 99,
size: "200MB",
validity: "14 Days",
planType: "DG",
network: "Glo",
description: "200MB (Best Value) - 99 Naira - 14 days"
},
{
id: "glo-dg-250",
price: 250,
size: "500MB",
validity: "14 Days",
planType: "DG",
network: "Glo",
description: "500MB (Best Value) - 250 Naira - 14 days"
},
{
id: "glo-dg-250-30",
price: 250,
size: "500MB",
validity: "30 Days",
planType: "DG",
network: "Glo",
description: "500MB (Best Value) - N250 - 30 Days"
},
{
id: "glo-dg-495",
price: 495,
size: "1GB",
validity: "30 Days",
planType: "DG",
network: "Glo",
description: "1GB (Best Value) - 495 Naira - 30 days"
},
{
id: "glo-dg-990",
price: 990,
size: "2GB",
validity: "30 Days",
planType: "DG",
network: "Glo",
description: "2GB (Best Value) - 990 Naira - 30 days"
},
// Duplicate ID in source: glo-dg-1485 (3d vs 30d). Internal mapping usually requires unique IDs.
{
id: "glo-dg-1485-30", // Manually adjusted suffix
price: 1485,
size: "3GB",
validity: "30 Days",
planType: "DG",
network: "Glo",
description: "3GB (Best Value) - 1,485 Naira - 30 days"
},
{
id: "glo-dg-2475",
price: 2475,
size: "5GB",
validity: "30 Days",
planType: "DG",
network: "Glo",
description: "5GB (Best Value) - 2,475 Naira - 30 days"
},
{
id: "glo-dg-4950",
price: 4950,
size: "10GB",
validity: "30 Days",
planType: "DG",
network: "Glo",
description: "10GB (Best Value) - 4,950 Naira - 30 days"
},
{
id: "glo-750-14",
price: 750,
size: "1.1GB",
validity: "14 Days",
planType: "Special",
network: "Glo",
description: "1.1GB 14 Days - N750"
},
{
id: "glo-1000-7days",
price: 1000,
size: "1.7GB",
validity: "7 Days",
planType: "Weekly",
network: "Glo",
description: "1.7GB + 2GB Night - N1000 - 7 Days"
},
{
id: "glo-2000-7days",
price: 2000,
size: "6.5GB",
validity: "7 Days",
planType: "Weekly",
network: "Glo",
description: "6.5GB + 2.5GB - N2000 - 7 Days"
},
{
id: "glo-5000-7days",
price: 5000,
size: "22GB",
validity: "7 Days",
planType: "Weekly",
network: "Glo",
description: "22GB + 2GB Night - N5000 - 7 Days"
},
{
id: "glo-6000-30days",
price: 6000,
size: "18.5GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "18.5GB + 2GB Night - N6000 - 30 Days"
},
{
id: "glo-15000-30days",
price: 15000,
size: "62GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "62GB + 2GB - N15,000 - 30 Days"
},
{
id: "glo-20000-30days",
price: 20000,
size: "105GB",
validity: "30 Days",
planType: "Monthly",
network: "Glo",
description: "105GB + 2GB - N20,000 - 30 Days"
},
{
id: "glo-350-special-1day",
price: 350,
size: "1GB",
validity: "1 Day",
planType: "Special",
network: "Glo",
description: "1GB 1 Day - Special N350"
},
{
id: "glo-600-special-2days",
price: 600,
size: "1.55GB",
validity: "2 Days",
planType: "Special",
network: "Glo",
description: "1.55GB + 2GB Night - N600 - 2 Days - Special"
},
{
id: "glo-1000-special-2days",
price: 1000,
size: "3.1GB",
validity: "2 Days",
planType: "Special",
network: "Glo",
description: "3.1GB + 2GB - N1000 - 2 Days - Special"
},
{
id: "glo-25000-mega-30days",
price: 25000,
size: "135GB",
validity: "30 Days",
planType: "Mega",
network: "Glo",
description: "135GB 30 Days - Mega N25000 Oneoff"
},
{
id: "glo-yearly-mega",
price: 150000,
size: "1000GB",
validity: "365 Days",
planType: "Mega",
network: "Glo",
description: "1000GB Yearly - Mega N150,000 Oneoff"
},
{
id: "glo-social-50-3days",
price: 50,
size: "135MB",
validity: "3 Days",
planType: "Social",
network: "Glo",
description: "135MB 3 Days - Social Bundles N50"
},
{
id: "glo-special-100-7days",
price: 100,
size: "335MB",
validity: "7 Days",
planType: "Social",
network: "Glo",
description: "335MB 7 Days - Social Bundles N100"
},
{
id: "glo-special-300-10days",
price: 300,
size: "1.1GB",
validity: "10 Days",
planType: "Social",
network: "Glo",
description: "1.1GB 10 Days - Social Bundles N300"
},
{
id: "glo-special-500-15days",
price: 500,
size: "1.8GB",
validity: "15 Days",
planType: "Social",
network: "Glo",
description: "1.8GB 15 Days - Social Bundles N500"
},
{
id: "glo-night-60-1day",
price: 60,
size: "350MB",
validity: "1 Day",
planType: "Night",
network: "Glo",
description: "350MB Night - N60"
},
{
id: "glo-night-120-1day",
price: 120,
size: "750MB",
validity: "1 Day",
planType: "Night",
network: "Glo",
description: "750MB Night - N120"
},
{
id: "glo-500mb-200-oneoff",
price: 200,
size: "500MB",
validity: "1 Day",
planType: "Daily",
network: "Glo",
description: "500MB 1 Day - N200 Oneoff"
},
{
id: "glo-1000mb-300-oneoff",
price: 300,
size: "1GB",
validity: "1 Day",
planType: "Daily",
network: "Glo",
description: "1GB 1 Day - N300 Oneoff"
},
{
id: "glo-always-on-2000",
price: 2000,
size: "6.1GB",
validity: "15 Days",
planType: "AlwaysOn",
network: "Glo",
description: "6.1GB (410MB per day) 15 Days - Always On N2000"
},
{
id: "glo-always-on-3500",
price: 3500,
size: "15GB",
validity: "30 Days",
planType: "AlwaysOn",
network: "Glo",
description: "15GB (500MB per day) 30 Days - Always On N3500"
},
{
id: "glo-always-on-5000",
price: 5000,
size: "30GB",
validity: "30 Days",
planType: "AlwaysOn",
network: "Glo",
description: "30GB (1GB per day) 30 Days - Always On N5000"
},
{
id: "glo-always-on-7000",
price: 7000,
size: "45GB",
validity: "30 Days",
planType: "AlwaysOn",
network: "Glo",
description: "45GB (1.5 per day) 30 Days - Always On N7000"
},
{
id: "glo-youtube-250",
price: 250,
size: "1GB",
validity: "1 Day",
planType: "YouTube",
network: "Glo",
description: "1GB 1 Day - Youtube Special N250"
},
{
id: "glo-youtube-600",
price: 600,
size: "3GB",
validity: "2 Days",
planType: "YouTube",
network: "Glo",
description: "3GB 2 Days - Youtube Special N600"
}
]as const;

export const NINEMOBILE_DATA = [
{
key: "eti-100",
id: "eti-100",
price: 100,
size: "83MB",
validity: "1 Day",
planType: "Daily",
network: "9mobile",
description: "T2 83MB - 100 Naira - 1 day"
},
{
key: "eti-150",
id: "eti-150",
price: 150,
size: "150MB",
validity: "1 Day",
planType: "Night",
network: "9mobile",
description: "T2 150MB  + 100MB Night Data - 150 Naira - 1 day"
},
{
key: "eti-500",
id: "eti-500",
price: 500,
size: "650MB",
validity: "7 Days",
planType: "Weekly",
network: "9mobile",
description: "T2 650MB - 500 Naira - 3 days"
},
{
key: "eti-1000",
id: "eti-1000",
price: 1000,
size: "2GB",
validity: "30 Days",
planType: "Monthly",
network: "9mobile",
description: "9mobile 2GB - 1,000 Naira - 30 Days"
},
{
key: "eti-4000",
id: "eti-4000",
price: 4000,
size: "8.4GB",
validity: "30 Days",
planType: "Monthly",
network: "9mobile",
description: "T2 8.4GB - 4,000 Naira - 30 days"
},
{
key: "eti-2000",
id: "eti-2000",
price: 2000,
size: "4.5GB",
validity: "30 Days",
planType: "Monthly",
network: "9mobile",
description: "T2 4.5GB - 2000 Naira - 30 Days"
},
{
key: "eti-5000",
id: "eti-5000",
price: 5000,
size: "11.4GB",
validity: "30 Days",
planType: "Monthly",
network: "9mobile",
description: "T2 11.4GB - 5,000 Naira - 30 Days"
},
{
key: "eti-3000",
id: "eti-3000",
price: 3000,
size: "6.2GB",
validity: "30 Days",
planType: "Monthly",
network: "9mobile",
description: "T2 6.2G - 3,000 Naira - 30 days"
},
{
key: "eti-1200",
id: "eti-1200",
price: 1200,
size: "2.3GB",
validity: "30 Days",
planType: "Monthly",
network: "9mobile",
description: "T2 2.3GB - 1,200 Naira - 30 Days"
},
{
key: "eti-50",
id: "eti-50",
price: 50,
size: "40MB",
validity: "1 Day",
planType: "Daily",
network: "9mobile",
description: "T2 40MB - 50 Naira - 1 day"
},
{
key: "eti-2500",
id: "eti-2500",
price: 2500,
size: "5.2GB",
validity: "30 Days",
planType: "Monthly",
network: "9mobile",
description: "T2 5.2GB - 2,500 Naira - 30 days"
},
{
key: "t2-250mb-200",
id: "t2-250mb-200",
price: 200,
size: "250MB",
validity: "7 Days",
planType: "Anytime",
network: "9mobile",
description: "T2 N200 - 250MB Anytime Data Plan (7 Days)"
}
] as const;

export const etisalat_dict = Object.fromEntries(
NINEMOBILE_DATA.map(plan => [
plan.description,
[plan.id, plan.price]
])
);


/**
 * DATA PLAN TYPES & REPOSITORY
 * 
 * This section uses the structured data arrays (MTN_DATA, AIRTEL_DATA, GLO_DATA, NINEMOBILE_DATA)
 * as the direct source of truth. All legacy regex parsing and dictionary-to-object 
 * conversion logic has been removed to support fully dynamic plan categories.
 */



/**
 * Merges all structured network data into a single flat array.
 * Categories are derived directly from the plan.planType field, allowing 
 * for dynamic filtering and grouping in the UI without code changes.
 * 
 * @returns {DataPlan[]} The complete list of available data plans
 */
export const dataPlanFunction = (): DataPlan[] => {
  return [
    ...MTN_DATA,
    ...AIRTEL_DATA,
    ...GLO_DATA,
    ...NINEMOBILE_DATA
  ];
};

 
export const NIGERIAN_BANKS = [
  { code: '40195', name: '78 Finance Company Ltd' },
  { code: '090629', name: '9jaPay Microfinance Bank' },
  { code: '120001', name: '9mobile 9Payment Service Bank' },
  { code: '404', name: 'Abbey Mortgage Bank' },
  { code: '51204', name: 'Above Only MFB' },
  { code: '51312', name: 'Abulesoro MFB' },
  { code: '044', name: 'Access Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '602', name: 'Accion Microfinance Bank' },
  { code: '90102', name: 'Adamawa Mortgage Bank Limited' },
  { code: '50315', name: 'Aella MFB' },
  { code: '90077', name: 'AG Mortgage Bank' },
  { code: '50036', name: 'Ahmadu Bello University Microfinance Bank' },
  { code: '120004', name: 'Airtel Smartcash PSB' },
  { code: '51336', name: 'AKU Microfinance Bank' },
  { code: '090561', name: 'Akuchukwu Microfinance Bank Limited' },
  { code: '50055', name: 'Al-Barakah Microfinance Bank' },
  { code: '035A', name: 'ALAT by WEMA' },
  { code: '108', name: 'Alpha Morgan Bank' },
  { code: '000304', name: 'Alternative bank' },
  { code: '50926', name: 'Amju Unique MFB' },
  { code: '50083', name: 'Aramoko MFB' },
  { code: '401', name: 'ASO Savings and Loans' },
  { code: '50092', name: 'Assets Microfinance Bank' },
  { code: 'MFB50094', name: 'Astrapolaris MFB LTD' },
  { code: '090478', name: 'AVUENEGBE MICROFINANCE BANK' },
  { code: '51351', name: 'AWACASH MICROFINANCE BANK' },
  { code: '51337', name: 'AZTEC MICROFINANCE BANK LIMITED' },
  { code: '51229', name: 'Bainescredit MFB' },
  { code: '50117', name: 'Banc Corp Microfinance Bank' },
  { code: '11072', name: 'Bank78 Microfinance Bank' },
  { code: '50572', name: 'BANKIT MICROFINANCE BANK LTD' },
  { code: '51341', name: 'BANKLY MFB' },
  { code: 'MFB50992', name: 'Baobab Microfinance Bank' },
  { code: '51100', name: 'BellBank Microfinance Bank' },
  { code: '51267', name: 'Benysta Microfinance Bank Limited' },
  { code: '50122', name: 'Berachah Microfinance Bank Ltd.' },
  { code: '50123', name: 'Beststar Microfinance Bank' },
  { code: '50725', name: 'BOLD MFB' },
  { code: '51449', name: 'Boost Microfinance Bank' },
  { code: '650', name: 'Bosak Microfinance Bank' },
  { code: '50931', name: 'Bowen Microfinance Bank' },
  { code: 'FC40163', name: 'Branch International Finance Company Limited' },
  { code: '90070', name: 'Brent Mortgage bank' },
  { code: '50645', name: 'BuyPower MFB' },
  { code: '565', name: 'Carbon' },
  { code: '51353', name: 'Cashbridge Microfinance Bank Limited' },
  { code: '865', name: 'CASHCONNECT MFB' },
  { code: '50823', name: 'CEMCS Microfinance Bank' },
  { code: '100762', name: 'Centrum Finance' },
  { code: '50171', name: 'Chanelle Microfinance Bank Limited' },
  { code: '312', name: 'Chikum Microfinance bank' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '070027', name: 'CITYCODE MORTAGE BANK' },
  { code: '50910', name: 'Consumer Microfinance Bank' },
  { code: '51458', name: 'Cool Microfinance Bank Limited' },
  { code: '90089', name: 'Cooperative Mortgage Bank' },
  { code: '50204', name: 'Corestep MFB' },
  { code: '559', name: 'Coronation Merchant Bank' },
  { code: 'FC40128', name: 'County Finance Limited' },
  { code: '40119', name: 'Credit Direct Limited' },
  { code: '51297', name: 'Crescent MFB' },
  { code: '090560', name: 'Crust Microfinance Bank' },
  { code: '50216', name: 'CRUTECH MICROFINANCE BANK LTD' },
  { code: '51368', name: 'Dash Microfinance Bank' },
  { code: '51334', name: 'Davenport MICROFINANCE BANK' },
  { code: '51450', name: 'Dillon Microfinance Bank' },
  { code: '50162', name: 'Dot Microfinance Bank' },
  { code: '50922', name: 'EBSU Microfinance Bank' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '50263', name: 'Ekimogun MFB' },
  { code: '098', name: 'Ekondo Microfinance Bank' },
  { code: '090678', name: 'EXCEL FINANCE BANK' },
  { code: '50126', name: 'Eyowo' },
  { code: '51318', name: 'Fairmoney Microfinance Bank' },
  { code: '51241', name: 'FCMB MFB' },
  { code: '50298', name: 'Fedeth MFB' },
  { code: '51110', name: 'FFS Microfinance Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '51314', name: 'Firmus MFB' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '50934', name: 'First Option MFB' },
  { code: '090164', name: 'FIRST ROYAL MICROFINANCE BANK' },
  { code: '51333', name: 'FIRSTMIDAS MFB' },
  { code: '413', name: 'FirstTrust Mortgage Bank Nigeria' },
  { code: 'D53', name: 'Fortress MFB' },
  { code: '501', name: 'FSDH Merchant Bank Limited' },
  { code: '832', name: 'FUTMINNA MICROFINANCE BANK' },
  { code: 'MFB51093', name: 'Garun Mallam MFB' },
  { code: '812', name: 'Gateway Mortgage Bank LTD' },
  { code: '00103', name: 'Globus Bank' },
  { code: '090574', name: 'Goldman MFB' },
  { code: '100022', name: 'GoMoney' },
  { code: '090664', name: 'GOOD SHEPHERD MICROFINANCE BANK' },
  { code: '50739', name: 'Goodnews Microfinance Bank' },
  { code: '562', name: 'Greenwich Merchant Bank' },
  { code: '51276', name: 'GROOMING MICROFINANCE BANK' },
  { code: '50368', name: 'GTI MFB' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '51251', name: 'Hackman Microfinance Bank' },
  { code: '50383', name: 'Hasal Microfinance Bank' },
  { code: '51364', name: 'Hayat Trust MFB' },
  { code: '120002', name: 'HopePSB' },
  { code: '51211', name: 'IBANK Microfinance Bank' },
  { code: '51279', name: 'IBBU MFB' },
  { code: '51244', name: 'Ibile Microfinance Bank' },
  { code: '90012', name: 'Ibom Mortgage Bank' },
  { code: '50439', name: 'Ikoyi Osun MFB' },
  { code: '50442', name: 'Ilaro Poly Microfinance Bank' },
  { code: '50453', name: 'Imowo MFB' },
  { code: '415', name: 'IMPERIAL HOMES MORTAGE BANK' },
  { code: '51392', name: 'INDULGE MFB' },
  { code: '51462', name: 'INEBA GOGO MFB' },
  { code: '50457', name: 'Infinity MFB' },
  { code: '070016', name: 'Infinity trust  Mortgage Bank' },
  { code: '090701', name: 'ISUA MFB' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '402', name: 'Jubilee Life Mortgage Bank' },
  { code: '50502', name: 'Kadpoly MFB' },
  { code: '51308', name: 'KANOPOLY MFB' },
  { code: '5129', name: 'Kayvee Microfinance Bank' },
  { code: '90028', name: 'Kebbi Homes Savings and Loans Limited' },
  { code: '082', name: 'Keystone Bank' },
  { code: '899', name: 'Kolomoni MFB' },
  { code: '100025', name: 'KONGAPAY (Kongapay Technologies Limited)(formerly Zinternet)' },
  { code: '50200', name: 'Kredi Money MFB LTD' },
  { code: '50211', name: 'Kuda Bank' },
  { code: '90052', name: 'Lagos Building Investment Company Plc.' },
  { code: '091003', name: 'Lemmy MFB' },
  { code: '090420', name: 'Letshego Microfinance Bank' },
  { code: '50549', name: 'Links MFB' },
  { code: '031', name: 'Living Trust Mortgage Bank' },
  { code: '50491', name: 'LOMA MFB' },
  { code: '303', name: 'Lotus Bank' },
  { code: '51444', name: 'Maal MFB' },
  { code: '090171', name: 'MAINSTREET MICROFINANCE BANK' },
  { code: '50563', name: 'Mayfair MFB' },
  { code: '90003', name: 'Mayfresh Mortgage Bank' },
  { code: '50570', name: 'Mega Microfinance Bank' },
  { code: '50304', name: 'Mint MFB' },
  { code: '09', name: 'MINT-FINEX MFB' },
  { code: '946', name: 'Money Master PSB' },
  { code: '50515', name: 'Moniepoint MFB' },
  { code: '120003', name: 'MTN Momo PSB' },
  { code: '090190', name: 'MUTUAL BENEFITS MICROFINANCE BANK' },
  { code: '090679', name: 'NDCC MICROFINANCE BANK' },
  { code: '51361', name: 'NET MICROFINANCE BANK' },
  { code: '51142', name: 'Nigerian Navy Microfinance Bank Limited' },
  { code: '51304', name: 'NIRSAL MICROFINANCE' },
  { code: '50072', name: 'Nombank MFB' },
  { code: '561', name: 'NOVA BANK' },
  { code: '51371', name: 'Novus MFB' },
  { code: '50629', name: 'NPF MICROFINANCE BANK' },
  { code: '51261', name: 'NSUK MICROFINANACE BANK' },
  { code: '50689', name: 'Olabisi Onabanjo University Microfinance Bank' },
  { code: '50697', name: 'OLUCHUKWU MICROFINANCE BANK LTD' },
  { code: '999992', name: 'OPay Digital Services Limited (OPay)' },
  { code: '107', name: 'Optimus Bank Limited' },
  { code: '100002', name: 'Paga' },
  { code: '999991', name: 'PalmPay' },
  { code: '104', name: 'Parallex Bank' },
  { code: '311', name: 'Parkway - ReadyCash' },
  { code: '090680', name: 'PATHFINDER MICROFINANCE BANK LIMITED' },
  { code: '51457', name: 'Paystack MFB' },
  { code: '100039', name: 'Paystack-Titan' },
  { code: '50743', name: 'Peace Microfinance Bank' },
  { code: '51226', name: 'PECANTRUST MICROFINANCE BANK LIMITED' },
  { code: '51146', name: 'Personal Trust MFB' },
  { code: '50746', name: 'Petra Mircofinance Bank Plc' },
  { code: 'MFB51452', name: 'Pettysave MFB' },
  { code: '050021', name: 'PFI FINANCE COMPANY LIMITED' },
  { code: '268', name: 'Platinum Mortgage Bank' },
  { code: '00716', name: 'Pocket App' },
  { code: '076', name: 'Polaris Bank' },
  { code: '50864', name: 'Polyunwana MFB' },
  { code: '105', name: 'PremiumTrust Bank' },
  { code: '50739', name: 'Prospa Capital Microfinance Bank' },
  { code: '050023', name: 'PROSPERIS FINANCE LIMITED' },
  { code: '101', name: 'Providus Bank' },
  { code: '51293', name: 'QuickFund MFB' },
  { code: '502', name: 'Rand Merchant Bank' },
  { code: '090496', name: 'RANDALPHA MICROFINANCE BANK' },
  { code: '90067', name: 'Refuge Mortgage Bank' },
  { code: '50761', name: 'REHOBOTH MICROFINANCE BANK' },
  { code: '50994', name: 'Rephidim Microfinance Bank' },
  { code: '51375', name: 'Retrust Mfb' },
  { code: '51286', name: 'Rigo Microfinance Bank Limited' },
  { code: '50767', name: 'ROCKSHIELD MICROFINANCE BANK' },
  { code: '125', name: 'Rubies MFB' },
  { code: '51113', name: 'Safe Haven MFB' },
  { code: '40165', name: 'SAGE GREY FINANCE LIMITED' },
  { code: '50582', name: 'Shield MFB' },
  { code: '106', name: 'Signature Bank Ltd' },
  { code: '51062', name: 'Solid Allianze MFB' },
  { code: '50800', name: 'Solid Rock MFB' },
  { code: '51310', name: 'Sparkle Microfinance Bank' },
  { code: '51429', name: 'Springfield Microfinance Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '090162', name: 'STANFORD MICROFINANCE BANK' },
  { code: '50809', name: 'STATESIDE MICROFINANCE BANK' },
  { code: '070022', name: 'STB Mortgage Bank' },
  { code: '51253', name: 'Stellas MFB' },
  { code: '232', name: 'Sterling Bank' },
  { code: '00305', name: 'Summit Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '50968', name: 'Supreme MFB' },
  { code: '51056', name: 'Sycamore Microfinance Bank' },
  { code: '302', name: 'TAJ Bank' },
  { code: '51269', name: 'Tangerine Money' },
  { code: '109', name: 'Tatum Bank' },
  { code: '51403', name: 'TENN' },
  { code: '677', name: 'Think Finance Microfinance Bank' },
  { code: '102', name: 'Titan Bank' },
  { code: '090708', name: 'TransPay MFB' },
  { code: '51118', name: 'TRUSTBANC J6 MICROFINANCE BANK' },
  { code: '50840', name: 'U&C Microfinance Bank Ltd (U AND C MFB)' },
  { code: '090706', name: 'UCEE MFB' },
  { code: '51322', name: 'Uhuru MFB' },
  { code: '51080', name: 'Ultraviolet Microfinance Bank' },
  { code: '50870', name: 'Unaab Microfinance Bank Limited' },
  { code: '51447', name: 'UNIABUJA MFB' },
  { code: '50871', name: 'Unical MFB' },
  { code: '51316', name: 'Unilag Microfinance Bank' },
  { code: '50875', name: 'UNIMAID MICROFINANCE BANK' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '50880', name: 'UNIUYO Microfinance Bank Ltd' },
  { code: '50894', name: 'Uzondu Microfinance Bank Awka Anambra State' },
  { code: '050020', name: 'Vale Finance Limited' },
  { code: '566', name: 'VFD Microfinance Bank Limited' },
  { code: '51355', name: 'Waya Microfinance Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '51386', name: 'Weston Charis MFB' },
  { code: '100040', name: 'Xpress Wallet' },
  { code: '594', name: 'Yes MFB' },
  { code: '00zap', name: 'Zap' },
  { code: '057', name: 'Zenith Bank' },
  { code: '51373', name: 'Zitra MFB' },
];


