import type { DataPlan,  NavItem, Transaction, BluePointHistory, Task, Streak, Announcement, Notification, LoyaltyItem, GroupPayment, Network } from '@/types';
import { ENDPOINTS, getRequest} from '@/types';

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid', path: '/dashboard' },
  { id: 'airtime', label: 'Buy Airtime & Data', icon: 'Smartphone', path: '/airtime' },
//  { id: 'data', label: 'Buy Data', icon: 'Wifi', path: '/data' },
  { id: 'marketplace', label: 'Market Place', icon: 'Store', path: '/marketplace' },
  { id: 'services', label: 'Services', icon: 'Globe', path: '/services' },
 //  { id: 'campaigns', label: 'Discover & Earn', icon: 'HandCoins', path: '/campaigns' },
  { id: 'rewards', label: 'Rewards', icon: 'Gift', path: '/rewards' },
 // { id: 'campaigns', label: 'Flights', icon: 'PlaneTakeoff', path: '/flights' },
  { id: 'scanner', label: 'Scanner', icon: 'QrCode', path: '/scanner-assignments' },
  { id: 'support', label: 'Support', icon: 'Headphones', path: '/support' },
//   { id: 'bluespere', label: 'BlueSpere', icon: 'Orbit', path: '/bluesphere' },
  { id: 'more-services', label: 'More Services', icon: 'Grid3X3', path: '/more-services' },
  { id: 'payroll-pro', label: 'Payroll Pro', icon: 'Briefcase', path: '/payroll-pro' },
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


// ---------------------------------------------------------
// 1. RAW DICTIONARIES (OLD STRUCTURE + NEW CORRECT DATA)
// ---------------------------------------------------------

const mtn_dict = {
  "110MB Daily Plan (1 Day) - N100": ["mtn-10mb-100", 100],
  "230MB Daily Plan (1 Day) - N200": ["mtn-230mb-200", 200],
  "1.5GB Weekly Plan (7 Days) - N1,000": ["mtn-1500mb-1000", 1000],
  "7GB Monthly Plan - N3,500": ["mtn-5.5gb-3500", 3500],
  "3.5GB Weekly Plan (7 Days) - N1,500": ["mtn-3.5gb-1500", 1500],
  "16.5GB Monthly Plan": ["mtn-data-6500", 6500],
  "20GB Monthly Plan": ["mtn-20gb-7500", 7500],
  "36GB Monthly Plan": ["mtn-32gb-11000", 11000],
  "75GB Monthly Plan": ["mtn-75gb-20000", 18000],
  "2.7GB + 2mins + 2GB All Night Streaming + 200MB YouTube Music, Monthly Plan - N2000": ["mtn-2.7gb-2000", 2000],
  "1.8GB + 6mins + 5 SMS, Weekly plan - N1500": ["mtn-1800mb-1500", 1500],
  "MTN N24,000 120GB - 30days": ["mtn-120gb-24000", 24000],
  "480GB 3-Month Plan - N90,000": ["mtn-480gb-90000", 90000],
  "MTN N500 1GB + 1.5mins - 1 day": ["mtn-1gb-350", 500],
  "1GB+5mins Weekly Plan": ["mtn-1gb-600", 800],
  "600MB Xtra Bundle Weekly Data (7 Days) - N500": ["mtn-xtrabundle-500", 500],
  "2GB + 2 Mins Monthly Plan - N1,500": ["mtn-xtra-1000", 1500],
  "12.5GB Monthly Plan - N5,500": ["mtn-11gb-5000", 5500],
  "MTN N900 2.5GB - 2 days": ["mtn-2-5gb-900", 900],
  "150GB 2-Month Plan": ["mtn-150gb-40000", 40000],
  "MTN N3,500 11GB - 7 days": ["mtn-11gb-3500", 3500],
  "500MB Daily Plan (1 Day) - N350": ["mtn-500mb-ex-350", 350],
  "1.5GB Daily Plan (2 Days) - N600": ["mtn-2-5gb-ex-600", 600],
  "2GB Daily Plan (2 Days) - N750": ["mtn-2gb-ex-750", 750],
  "2.7GB Xtra Bundle Monthly Plan": ["mtn-1500mb-ex-1200", 3000],
  "MTN N4,500 10GB + 10mins - 30 days": ["mtn-8gb-ex-3000", 4500],
  "MTN N9,000 25GB + Youtube - 30 days": ["mtn-25gb-9000", 9000],
  "65GB Monthly Plan (30 Days) - N16,000": ["mtn-65gb-ex-16000", 16000],
  "500MB + 1GB YouTube (7 Days) - N500": ["mtn-500mb-500", 500],
  "MTN N1000 3.2GB - 2 days": ["mtn-3.2gb-1000", 1000],
  "MTN N2500 6GB - 7 days": ["mtn-7gb-3000", 2500],
  "MTN N2500 3.5GB +5mins Monthly Plan": ["mtn-3.5gb-2500", 2500],
  "60GB Monthly HyNetFlex Plan - N14,500": ["mtn-hynetflex-14500-30", 14500],
  "450GB 3-Month Broadband Plan - N75,000": ["mtn-hynetflex-75000-90", 75000],
  "30GB Monthly Broadband Plan - N9,000": ["mtn-hynetflex-9000-30", 9000],
  "2.5GB Daily Plan - 750 Naira": ["mtn-2.5-750", 750],
  "20GB Weekly Plan - 5,000 Naira": ["mtn-20-5000", 5000],
  "MTN N1800 7GB - (2 Days)": ["mtn-7gb-1800", 1800],
  "MTN N30,000 150GB + 2GB daily - 5G Router Data (30 Days)": ["mtn-150gb-30000", 30000],
  "MTN N35,000 165GB Monthly Data Plan (30 Days)": ["mtn-165gb-35000", 35000],
  "MTN N37,500 200GB + 5GB Youtube/MSTeams/Zoom - 5G Router Data (30 Days)": ["mtn-200gb-37500", 37500],
  "MTN 260GB + 2GB daily upon exhausting main bundle - N45,000": ["mtn-260gb-monthly", 45000],
  "MTN 1.5TB - N225,000 Broadband Router": ["mtn-1500gb-yearly", 225000],
  "MTN N3000 6.75GB Monthly Plan": ["mtn-6.75gb-3000", 3000],
  "MTN 14.5GB Monthly Plan Monthly": ["mtn-14.5gb-5000", 5000],
  "MTN N1500 5.5GB - (2 days)": ["mtn-5.5gb-2-1500", 1500],
  "MTN N1200 4GB - (2 days)": ["mtn-4gb-2-1200", 1200],
  "MTN N1000 3.5GB - (1 day)": ["mtn-3.5gb-1-1000", 1000],
  "MTN N10000 34GB - (30 days)": ["mtn-34gb-30-10000", 10000]
};

const airtel_dict = {
  "250MB Night Plan (12 - 5 AM) - 50 Naira - 1Day": ["airt-50", 50],
  "200MB Social Plan (2 Days) - 100 Naira - 1Day": ["airt-100", 100],
  "230MB Daily Plan (2 Days) - 200 Naira - 200MB - 1Day": ["airt-200", 200],
  "Airtel Data - 100 Naira - 110MB - 1 Day": ["airt-daily-100", 100],
  "500MB Weekly Plan (7 Days) - 500 Naira": ["airt-500", 500],
  "1.5GB Weekly Plan + Youtube & Social Plans (7 Days) - 1,000 Naira": ["airt-1000-7", 1000],
  "3.5GB Weekly Plan + Youtube & Social Platform (7 Days) - 1,500 Naira": ["airt-1500-7", 1500],
  "3GB Monthly Plan + Youtube & Social Plan (30 Days)- 2,000 Naira": ["airt-2000", 2000],
  "8GB Monthly Plan + Youtube & Social Plan (30 Days) - 3,000 Naira": ["airt-3000", 3000],
  "10GB Monthly Plan + Youtube & Social Plan (30 Days) - 4,000 Naira": ["airt-4000", 4000],
  "13GB Monthly Plan + Youtube & Social Plan (30 Days) - 5,000 Naira": ["airt-5000", 5000],
  "5GB Binge Plan + Youtube & Social Platforms Data (2 Day) - 1,500 Naira": ["airt-1500-2", 1500],
  "35GB Monthly Plan + Youtube & Social Plan (30 Days) - 10,000 Naira": ["airt-10000", 10000],
  "60GB Monthly Plan + Youtube & Social Plan (30 Days) - 15,000 Naira": ["airt-15000", 15000],
  "210GB Data (30 Days) - 40,000 Naira": ["airt-40000", 40000],
  "350GB Monthly Plan + Youtube & Social Plan (120 Days) - 60,000 Naira": ["airt-60000", 60000],
  "680GB Data (365 Days) - 100,000 Naira": ["airt-100000", 100000],
  "100GB Monthly Plan + Youtube & Social Plan (30 Days) - 20,000 Naira": ["airt-20000", 20000],
  "4GB Monthly Plan + Youtube & Social Plan (30 Days) - 2,500 Naira": ["airt-2500", 2500],
  "25GB Monthly Plan + Youtube & Social Plan (30 Days) - 8,000 Naira": ["airt-8000", 8000],
  "160GB Monthly Plan (30 Days) - 30,000 Naira": ["airt-30000", 30000],
  "200GB Monthly Plan (90 Days) - 50,000 Naira": ["airt-50000", 50000],
  "1.5GB Binge Plan + Youtube & Social Plan Data (2 Days) - 600 Naira": ["airt-600", 600],
  "3.2GB Binge Plan + Youtube & Social Plans Data (2 Days)  - 1000 Naira": ["airt-1000-2", 1000],
  "10GB Weekly Plan + Youtube & Social Platform (7 Days) - 3000 Naira": ["airt-3000-7", 3000],
  "18GB Weekly Plan + Youtube & Social Platform (7 Days) - 5000 Naira": ["airt-5000-7", 5000],
  "500 Naira Binge Plan -": ["airt-binge-500-1", 500],
  "1GB Weekly Plan (7 Days) - 800 Naira": ["airt-800-7", 800],
  "18GB Monthly Plan + Youtube & Social Plan (30 Days) - 6000 Naira": ["airt-6000-30", 6000],
  "75MB Daily Plan (1 Day) - 75 Naira": ["airt-75-1", 75],
  "300MB Daily Plan (1 Day) - 300 Naira": ["airt-300-1", 300],
  "1GB Social Plan Plan (3 Days) - 300 Naira": ["airt-social-300-3", 300],
  "2GB Binge Plan + Youtube & Social Plan Data (2 Days) - 750 Naira": ["airt-750-2", 750],
  "2GB Monthly Plan + Youtube & Social Plan (30 Days) - 1,500 Naira": ["airt-1500-30", 1500],
  "6GB Weekly Plan + Youtube & Social Platform (7 Days) - 2,500 Naira": ["airt-2500-7", 2500],
  "13GB MIFI 5 Data - MiFi Only (30 Days) - 5,000 Naira": ["airt-mifi-5000-30", 5000],
  "35GB MIFI 10 Data - MiFi Only (30 Days) - 10,000 Naira": ["airt-mifi-10000-30", 10000],
  "60GB MIFI 15 Data - MiFi Only (30 Days) - 15,000 Naira": ["airt-mifi-15000-30", 15000],
  "Unlimited 20MBPS Data - Router Only (30 Days) - 30,000 Naira": ["airt-mifi-30000-30", 30000],
  "Unlimited 60MBPS Data - Router Only (30 Days) - 50,000 Naira": ["airt-mifi-50000-30", 50000],
  "Unlimited 60MBPS Data - Router Only (90 Days) - 80,000 Naira": ["airt-mifi-80000-90", 80000],
  "Unlimited 60MBPS Data - Router Only (90 Days) - 135,000 Naira": ["airt-mifi-135000-90", 135000],
  "Unlimited 20MBPS Data - Router Only (120 Days) - 150,000 Naira": ["airt-mifi-150000-120", 150000],
  "1.5GB Social Plan - 500 Naira": ["airt-social-500-7", 500],
  "500MB Daily Plan (2 Days) - 350 Naira - 500MB - 2 Days": ["airt-350-500", 350]
};

const glo_dict = {
  "40MB + 5MB Night - N50 - 1 Day": ["glo-daily-50", 50],
  "120MB + 5MB Night - N100 - 1 Day": ["glo-daily-100", 100],
  "250MB + 25MB Night - N200 - 2 Days": ["glo-2days-200", 200],
  "1.1GB + 1.5GB Night - N1000 - 30 Days": ["glo-monthly-1000", 1000],
  "2.2GB + 3GB - N1500 - 30 Days": ["glo-monthly-1500", 1500],
  "3.25GB + 3GB Night - N2000 - 30 Days": ["glo-monthly-2000", 2000],
  "4.25GB + 3GB Night - N2500 - 30 Days": ["glo-monthly-2500", 2500],
  "8.5GB + 2GB Night - N3000 - 30 Days": ["glo-monthly-3000", 3000],
  "10.5GB + 2GB Night - N4000 - 30 Days": ["glo-monthly-4000", 4000],
  "14.5GB + 2.5GB Night - N5000 - 30 Days": ["glo-monthly-5000", 5000],
  "26GB + 2GB - N8,000 - 30 Days": ["glo-monthly-8000", 8000],
  "38GB + 4GB Night - N10,000 - 30 Days": ["glo-monthly-10000", 10000],
  "875MB 1 Day - Weekend N200": ["glo-sunday-200", 200],
  "1GB + 1GB Night - N500 - 2 Days Special": ["glo-special-500", 500],
  "4GB + 2GB Night - N1,500 - 7 Days - Special": ["glo-special-1500", 1500],
  "2.5GB 2 Days - Weekend N500": ["glo-weekend-500", 500],
  "165GB 30 Days - Mega N30000": ["glo-mega-30000", 30000],
  "220GB 30 Days - Mega N40000 Oneoff": ["glo-mega-40000", 40000],
  "310GB 60 Days - Mega N50000": ["glo-mega-50000", 50000],
  "355GB 90 Days - Mega N60000": ["glo-mega-60000", 60000],
  "475GB 90 Days - Mega N75000 Oneoff": ["glo-mega-75000", 75000],
  "Glo TV VOD 500 MB 3days Oneoff": ["glo-tv-150", 150],
  "Glo TV VOD 2GB 7days Oneoff": ["glo-tv-450", 450],
  "Glo TV VOD 6GB 30days": ["glo-tv-1400", 1400],
  "Glo TV Lite 2GB 7 Days": ["glo-tv-900", 900],
  "Glo TV Max 6 GB 30 Days": ["glo-tv-3200", 3200],
  "300MB - GloMyG N100 1 Day": ["glo-social-oneoff-100", 100],
  "Glo MyG N300 1 GB 3 Days OneOff (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)": ["glo-social-oneoff-300", 300],
  "Glo MyG N500 1.5 GB 7 Days (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)": ["glo-social-oneoff-500", 500],
  "Glo MyG N1000 3.5 GB 30 Days (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)": ["glo-social-oneoff-1000", 1000],
  "240MB + 5MB Night - N100 - 1 Day - Camp-Boost": ["glo-campus-booster-100", 100],
  "500MB + 25MB Night - N200 - 2 Days - Camp-Boost": ["glo-campus-booster-200", 200],
  "1.1GB + 1GB Night - N500 - 7 Days - Camp-Boost": ["glo-campus-booster-500", 500],
  "2.2GB + 2GB Night - N1000 - 30 Days - Camp-Boost": ["glo-campus-booster-1000", 1000],
  "6.5GB + 3.5GB - N2,000 - 30 Days - Camp-Boost": ["glo-campus-booster-2000", 2000],
  "29GB + 3GB Night - N5000 - 30 Days - Camp-Boost": ["glo-campus-booster-5000", 5000],
  "1GB (Best Value) - 295 Naira - 3 days": ["glo-dg-295", 295],
  "3GB (Best Value) - 890 Naira - 3 days": ["glo-dg-890", 890],
  "5GB (Best Value) - 1,485 Naira - 3 days": ["glo-dg-1485", 1485],
  "1GB (Best Value) - 345 Naira - 7 days": ["glo-dg-345", 345],
  "3GB (Best Value) - 1,040 Naira - 7 days": ["glo-dg-1040", 1040],
  "5GB (Best Value) - 1,730 Naira - 7 days": ["glo-dg-1730", 1730],
  "1GB (Best Value) - 350 Naira - 14 days Night plan": ["glo-dg-350", 350],
  "3GB (Best Value) - 1,040 Naira - 14 days Night plan": ["glo-dg-1040-14", 1040],
  "5GB (Best Value)  - 1,730 Naira - 14 days Night plan": ["glo-dg-1730-14", 1730],
  "10GB (Best Value) - 3,460 Naira - 14 days Night plan": ["glo-dg-3460", 3460],
  "200MB (Best Value) - 99 Naira - 14 days": ["glo-dg-99", 99],
  "500MB (Best Value) - 250 Naira - 14 days": ["glo-dg-250", 250],
  "500MB (Best Value) - N250 - 30 Days": ["glo-dg-250-30", 250],
  "1GB (Best Value) - 495 Naira - 30 days": ["glo-dg-495", 495],
  "2GB (Best Value) - 990 Naira - 30 days": ["glo-dg-990", 990],
  "3GB (Best Value) - 1,485 Naira - 30 days": ["glo-dg-1485-30", 1485],
  "5GB (Best Value) - 2,475 Naira - 30 days": ["glo-dg-2475", 2475],
  "10GB (Best Value) - 4,950 Naira - 30 days": ["glo-dg-4950", 4950],
  "1.1GB 14 Days - N750": ["glo-750-14", 750],
  "1.7GB + 2GB Night - N1000 - 7 Days": ["glo-1000-7days", 1000],
  "6.5GB + 2.5GB - N2000 - 7 Days": ["glo-2000-7days", 2000],
  "22GB + 2GB Night - N5000 - 7 Days": ["glo-5000-7days", 5000],
  "18.5GB + 2GB Night - N6000 - 30 Days": ["glo-6000-30days", 6000],
  "62GB + 2GB - N15,000 - 30 Days": ["glo-15000-30days", 15000],
  "105GB + 2GB - N20,000 - 30 Days": ["glo-20000-30days", 20000],
  "1GB 1 Day - Special N350": ["glo-350-special-1day", 350],
  "1.55GB + 2GB Night - N600 - 2 Days - Special": ["glo-600-special-2days", 600],
  "3.1GB + 2GB - N1000 - 2 Days - Special": ["glo-1000-special-2days", 1000],
  "135GB 30 Days - Mega N25000 Oneoff": ["glo-25000-mega-30days", 25000],
  "1000GB Yearly - Mega N150,000 Oneoff": ["glo-yearly-mega", 150000],
  "135MB 3 Days - Social Bundles N50": ["glo-social-50-3days", 50],
  "335MB 7 Days - Social Bundles N100": ["glo-special-100-7days", 100],
  "1.1GB 10 Days - Social Bundles N300": ["glo-special-300-10days", 300],
  "1.8GB 15 Days - Social Bundles N500": ["glo-special-500-15days", 500],
  "350MB Night - N60": ["glo-night-60-1day", 60],
  "750MB Night - N120": ["glo-night-120-1day", 120],
  "500MB 1 Day - N200 Oneoff": ["glo-500mb-200-oneoff", 200],
  "1GB 1 Day - N300 Oneoff": ["glo-1000mb-300-oneoff", 300],
  "6.1GB (410MB per day) 15 Days - Always On N2000": ["glo-always-on-2000", 2000],
  "15GB (500MB per day) 30 Days - Always On N3500": ["glo-always-on-3500", 3500],
  "30GB (1GB per day) 30 Days - Always On N5000": ["glo-always-on-5000", 5000],
  "45GB (1.5 per day) 30 Days - Always On N7000": ["glo-always-on-7000", 7000],
  "1GB 1 Day - Youtube Special N250": ["glo-youtube-250", 250],
  "3GB 2 Days - Youtube Special N600": ["glo-youtube-600", 600]
};

const etisalat_dict = {
  "T2 83MB - 100 Naira - 1 day": ["eti-100", 100],
  "T2 150MB  + 100MB Night Data - 150 Naira - 1 day": ["eti-150", 150],
  "T2 650MB - 500 Naira - 3 days": ["eti-500", 500],
  "9mobile 2GB - 1,000 Naira - 30 Days": ["eti-1000", 1000],
  "T2 8.4GB - 4,000 Naira - 30 days": ["eti-4000", 4000],
  "T2 4.5GB - 2000 Naira - 30 Days": ["eti-2000", 2000],
  "T2 11.4GB - 5,000 Naira - 30 Days": ["eti-5000", 5000],
  "T2 6.2G - 3,000 Naira - 30 days": ["eti-3000", 3000],
  "T2 2.3GB - 1,200 Naira - 30 Days": ["eti-1200", 1200],
  "T2 40MB - 50 Naira - 1 day": ["eti-50", 50],
  "T2 5.2GB - 2,500 Naira - 30 days": ["eti-2500", 2500],
  "T2 N200 - 250MB Anytime Data Plan (7 Days)": ["t2-250mb-200", 200]
};

// ---------------------------------------------------------
// 2. PARSING & VALIDATION FUNCTIONS (RESTORED TO OLD WAY)
// ---------------------------------------------------------

function parsePlanDetails(planName: string) {
  let volume = "Bundle";
  let validity = "N/A";
  let type = "ExtraValue"; 

  // Updated Regex to safely grab the correct values from your new descriptions
  const volumeMatch = planName.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
  if (volumeMatch) {
      volume = volumeMatch[0].toUpperCase();
  } else if (planName.toLowerCase().includes("unlimited")) {
      volume = "Unlimited";
  } else {
      const priceMatch = planName.match(/N(\d+,?\d*)/);
      if (priceMatch) {
          volume = `₦${priceMatch[1].replace(/,/g, '')} Bundle`;
      } else if (planName.includes("Voice")) {
           volume = "Voice Bundle";
      }
  }

  const validityMatch = planName.match(/(\d+)\s*(day|days|week|weeks|month|months|year|yrs|hrs)/i);
  if (validityMatch) {
      const num = parseInt(validityMatch[1]);
      const unit = validityMatch[2].toLowerCase();

      if (unit.startsWith('hr')) {
           validity = `${num} Hrs`;
      } else if (unit.startsWith('day')) {
          validity = `${num} Day${num !== 1 ? 's' : ''}`;
          if (num === 1) type = 'Daily';
          else if (num <= 7) type = 'Daily'; 
      } else if (unit.startsWith('week')) {
          validity = `${num} Week${num !== 1 ? 's' : ''}`;
          type = 'Weekly';
      } else if (unit.startsWith('month')) {
          validity = `${num} Month${num !== 1 ? 's' : ''}`;
          type = 'Monthly';
      } else if (unit.startsWith('year') || unit.startsWith('yrs')) {
          validity = `${num} Year${num !== 1 ? 's' : ''}`;
          type = 'ExtraValue';
      }
  } else if (planName.toLowerCase().includes('weekly')) {
      validity = "7 Days";
      type = "Weekly";
  } else if (planName.toLowerCase().includes('monthly') || planName.toLowerCase().includes('30 days')) {
      validity = "30 Days";
      type = "Monthly";
  } else if (planName.toLowerCase().includes('weekend')) {
       validity = "Weekend";
       type = "ExtraValue";
  }

  if (type === 'ExtraValue' && (validity.includes("Day") && parseInt(validity) <= 7)) {
      type = 'Daily';
  } else if (type === 'ExtraValue' && validity.includes("Day") && parseInt(validity) > 7) {
      type = 'Monthly';
  }

  return { volume, validity, type };
}

function processPlans(network: string, rawDict: any): DataPlan[] {
  const processed: DataPlan[] = [];
  for (const name in rawDict) {
      const [id, price] = rawDict[name];
      const details = parsePlanDetails(name);
      
      processed.push({
          id: id,
          price: price,
          size: details.volume,
          validity: details.validity,
          planType: details.type, // Parses dynamically back into Daily/Weekly/Monthly/ExtraValue
          network: network as Network,
          description: name
      });
  }
  return processed;
}

export const dataPlanFunction = (): DataPlan[] => {
  const mtnPlans = Object.values(processPlans('MTN', mtn_dict));
  const gloPlans = Object.values(processPlans('Glo', glo_dict));
  const airtelPlans = Object.values(processPlans('Airtel', airtel_dict));
  const etisalatPlans = Object.values(processPlans('9mobile', etisalat_dict));

  return [mtnPlans, gloPlans, airtelPlans, etisalatPlans].flat();
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
