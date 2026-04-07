import type { DataPlan, Service, NavItem, Transaction, BluePointHistory, Task, Streak, Announcement, Notification, LoyaltyItem, GroupPayment, Network } from '@/types';
import { ENDPOINTS, getRequest} from '@/types';

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutGrid', path: '/dashboard' },
  { id: 'wallet', label: 'Wallet', icon: 'Wallet', path: '/wallet' },
  { id: 'airtime', label: 'Buy Airtime', icon: 'Smartphone', path: '/airtime' },
  { id: 'data', label: 'Buy Data', icon: 'Wifi', path: '/data' },
  { id: 'marketplace', label: 'Market Place', icon: 'Store', path: '/marketplace' },
  { id: 'services', label: 'Services', icon: 'Globe', path: '/services' },
  { id: 'more-services', label: 'More Services', icon: 'Grid3X3', path: '/more-services' },
  { id: 'rewards', label: 'Rewards', icon: 'Gift', path: '/rewards' },
  { id: 'campaigns', label: 'Campaigns', icon: 'Sparkles', path: '/campaigns' },
  { id: 'scanner', label: 'Scanner', icon: 'QrCode', path: '/scanner-assignments' },
  { id: 'support', label: 'Support', icon: 'Headphones', path: '/support' },
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


const mtn_dict = {
            "N100 100MB - 24 hrs": ["mtn-10mb-100", 100],
            "N200 200MB - 2 days": ["mtn-50mb-200", 200],
            "N1000 1.5GB - 30 days": ["mtn-100mb-1000", 1000],
            "N2000 4.5GB - 30 days": ["mtn-500mb-2000", 2000],
            "N1500 6GB - 7 days": ["mtn-20hrs-1500", 1500],
            "N2500 6GB - 30 days": ["mtn-3gb-2500", 2500],
            "N3000 8GB - 30 days": ["mtn-data-3000", 3000],
            "N3500 10GB - 30 days": ["mtn-1gb-3500", 3500],
            "N5000 15GB - 30 days": ["mtn-100hr-5000", 5000],
            "N6000 20GB - 30 days": ["mtn-3gb-6000", 6000],
            "N10000 40GB - 30 days": ["mtn-40gb-10000", 10000],
            "N15000 75GB - 30 days": ["mtn-75gb-15000", 15000],
            "N20000 110GB - 30 days": ["mtn-110gb-20000", 20000],
            "N1500 3GB - 30 days": ["mtn-3gb-1500", 1500],
            "N10000 25GB SME - 1 month": ["mtn-25gb-sme-10000", 10000],
            "N50000 165GB SME - 2 months": ["mtn-165gb-sme-50000", 50000],
            "N100000 360GB SME - 3 months": ["mtn-360gb-sme-100000", 100000],
            "N450000 4.5TB - 1 year": ["mtn-4-5tb-450000", 450000],
            "N110000 1TB - 1 year": ["mtn-1tb-110000", 110000],
            "N600 2.5GB - 2 days": ["mtn-2-5gb-600", 600],
            "N22000 120GB + 80mins - 30 days": ["mtn-120gb-22000", 22000],
            "N20000 100GB - 2 months": ["mtn-100gb-20000", 20000],
            "N30000 160GB - 2 months": ["mtn-160gb-30000", 30000],
            "N50000 400GB - 3 months": ["mtn-400gb-50000", 50000],
            "N75000 600GB - 3 months": ["mtn-600gb-75000", 75000],
            "N300 Xtratalk Weekly": ["mtn-xtratalk-300", 300],
            "N500 Xtratalk Weekly": ["mtn-xtratalk-500", 500],
            "N1000 Xtratalk Monthly": ["mtn-xtratalk-1000", 1000],
            "N2000 Xtratalk Monthly": ["mtn-xtratalk-2000", 2000],
            "N5000 Xtratalk Monthly": ["mtn-xtratalk-5000", 5000],
            "N10000 Xtratalk Monthly": ["mtn-xtratalk-10000", 10000],
            "N15000 Xtratalk Monthly": ["mtn-xtratalk-15000", 15000],
            "N20000 Xtratalk Monthly": ["mtn-xtratalk-20000", 20000],
            "N800 3GB - 2 days": ["mtn-3gb-800", 800],
            "N2000 7GB - 7 days": ["mtn-7gb-2000", 2000],
            "N200 Xtradata": ["mtn-xtradata-200", 200],
}
        
const airtel_dict = {
            "N50 25MB - 1 day": ["airt-50", 50],
            "N100 75MB - 1 day": ["airt-100", 100],
            "N200 200MB - 3 days": ["airt-200", 200],
            "N300 350MB - 7 days": ["airt-300", 300],
            "N500 750MB - 14 days": ["airt-500", 500],
            "N1000 1.5GB - 30 days": ["airt-1000", 1000],
            "N1500 3GB - 30 days": ["airt-1500", 1500],
            "N2000 4.5GB - 30 days": ["airt-2000", 2000],
            "N3000 8GB - 30 days": ["airt-3000", 3000],
            "N4000 11GB - 30 days": ["airt-4000", 4000],
            "N5000 15GB - 30 days": ["airt-5000", 5000],
            "N1500 6GB Binge - 7 days": ["airt-1500-2", 1500],
            "N10000 40GB - 30 days": ["airt-10000", 10000],
            "N15000 75GB - 30 days": ["airt-15000", 15000],
            "N20000 110GB - 30 days": ["airt-20000", 20000],
            "N600 1GB - 14 days": ["airt-600", 600],
            "N1000 1.5GB - 7 days": ["airt-1000-7", 1000],
            "N2000 7GB - 7 days": ["airt-2000-7", 2000],
            "N5000 25GB - 7 days": ["airt-5000-7", 5000],
            "N400 1.5GB - 1 day": ["airt-400-1", 400],
            "N800 3.5GB - 2 days": ["airt-800-2", 800],
            "N6000 23GB - 30 days": ["airt-6000-30", 6000],
}
        
const glo_dict = {
            "N100 105MB - 2 days": ["glo100", 100],
            "N200 350MB - 4 days": ["glo200", 200],
            "N500 1.05GB - 14 days": ["glo500", 500],
            "N1000 2.5GB - 30 days": ["glo1000", 1000],
            "N2000 5.8GB - 30 days": ["glo2000", 2000],
            "N2500 7.7GB - 30 days": ["glo2500", 2500],
            "N3000 10GB - 30 days": ["glo3000", 3000],
            "N4000 13.25GB - 30 days": ["glo4000", 4000],
            "N5000 18.25GB - 30 days": ["glo5000", 5000],
            "N8000 29.5GB - 30 days": ["glo8000", 8000],
            "N10000 50GB - 30 days": ["glo10000", 10000],
            "N15000 93GB - 30 days": ["glo15000", 15000],
            "N18000 119GB - 30 days": ["glo18000", 18000],
            "N1500 4.1GB - 30 days": ["glo1500", 1500],
            "N20000 138GB - 30 days": ["glo20000", 20000],
            "N70 200MB SME - 14 days": ["glo-dg-70", 70],
            "N320 1GB SME - 30 days": ["glo-dg-320", 320],
            "N960 3GB SME - 30 days": ["glo-dg-960", 960],
            "N3100 10GB SME - 30 days": ["glo-dg-3100", 3100],
            "N640 2GB SME - 30 days": ["glo-dg-640", 640],
            "N160 500MB SME - 14 days": ["glo-dg-160-14", 160],
            "N1600 5GB SME - 30 days": ["glo-dg-1600", 1600],
            "N50 45MB + 5MB Night - 1 day": ["glo-daily-50", 50],
            "N100 115MB + 35MB Night - 1 day": ["glo-daily-100", 100],
            "N200 240MB + 110MB Night - 2 days": ["glo-2days-200", 200],
            "N500 800MB + 1GB Night - 2 weeks": ["glo-2weeks-500", 500],
            "N1000 1.9GB + 2GB Night - 30 days": ["glo-monthly-1000", 1000],
            "N1500 3.5GB + 4GB Night - 30 days": ["glo-monthly-1500", 1500],
            "N2000 5.2GB + 4GB Night - 30 days": ["glo-monthly-2000", 2000],
            "N2500 6.8GB + 4GB Night - 30 days": ["glo-monthly-2500", 2500],
            "N3000 10GB + 4GB Night - 30 days": ["glo-monthly-3000", 3000],
            "N4000 14GB + 4GB Night - 30 days": ["glo-monthly-4000", 4000],
            "N5000 20GB + 4GB Night - 30 days": ["glo-monthly-5000", 5000],
            "N8000 27.5GB + 2GB Night - 30 days": ["glo-monthly-8000", 8000],
            "N10000 46GB + 4GB Night - 30 days": ["glo-monthly-10000", 10000],
            "N15000 86GB + 7GB Night - 30 days": ["glo-monthly-15000", 15000],
            "N18000 109GB + 10GB Night - 30 days": ["glo-monthly-18000", 18000],
            "N20000 126GB + 12GB Night - 30 days": ["glo-monthly-20000", 20000],
            "N300 1GB Special": ["glo-special-300", 300],
            "N500 2GB Special": ["glo-special-500", 500],
}
         
const  etisalat_dict = {
            "N100 100MB - 1 day": ["eti-100", 100],
            "N200 650MB - 1 day": ["eti-200", 200],
            "N500 500MB - 30 days": ["eti-500", 500],
            "N1000 1.5GB - 30 days": ["eti-1000", 1000],
            "N2000 4.5GB - 30 days": ["eti-2000", 2000],
            "N5000 15GB - 30 days": ["eti-5000", 5000],
            "N10000 40GB - 30 days": ["eti-10000", 10000],
            "N15000 75GB - 30 days": ["eti-15000", 15000],
            "N27500 30GB - 90 days": ["eti-27500", 27500],
            "N55000 60GB - 180 days": ["eti-55000", 55000],
            "N110000 120GB - 365 days": ["eti-110000", 110000],
            "N300 1GB + 100MB - 1 day": ["eti-300", 300],
            "N2500 11GB - 30 days": ["eti-2500", 2500],
            "N7000 35GB - 30 days": ["eti-7000", 7000],
            "N20000 125GB - 30 days": ["eti-20000", 20000],
            "N1000 4GB - 30 days": ["eti-1000", 1000],
            "N1500 7GB - 7 days": ["eti-1500-7", 1500],
            "N150 200MB - 1 day": ["eti-150-1", 150],
}
        



 function parsePlanDetails(planName:string) {
        // Default values
        let volume = "Bundle";
        let validity = "N/A";
        let type = "ExtraValue"; 

        // 1. Extract Volume (GB, MB, TB)
        const volumeMatch = planName.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
        if (volumeMatch) {
            volume = volumeMatch[0].toUpperCase();
        } else {
            // For Voice/XtraTalk bundles, use the first NGN value followed by 'Bundle'
            const priceMatch = planName.match(/N(\d+,?\d*)/);
            if (priceMatch) {
                volume = `₦${priceMatch[1].replace(/,/g, '')} Bundle`;
            } else if (planName.includes("Voice")) {
                 volume = "Voice Bundle";
            }
        }
   
        // 2. Extract Validity (Days, Weeks, Months, Years, hrs)
        const validityMatch = planName.match(/(\d+)\s*(day|days|week|weeks|month|months|year|yrs|hrs)/i);
        
        if (validityMatch) {
            const num = parseInt(validityMatch[1]);
            const unit = validityMatch[2].toLowerCase();

            if (unit.startsWith('hr')) {
                 validity = `${num} Hrs`;
            } else if (unit.startsWith('day')) {
                validity = `${num} Day${num !== 1 ? 's' : ''}`;
                if (num === 1) type = 'Daily';
                else if (num <= 7) type = 'Daily'; // Keep 2-7 days as Daily for the plan tab grouping
            } else if (unit.startsWith('week')) {
                validity = `${num} Week${num !== 1 ? 's' : ''}`;
                type = 'Weekly';
            } else if (unit.startsWith('month')) {
                validity = `${num} Month${num !== 1 ? 's' : ''}`;
                type = 'Monthly';
            } else if (unit.startsWith('year') || unit.startsWith('yrs')) {
                validity = `${num} Year${num !== 1 ? 's' : ''}`;
                type = 'ExtraValue'; // Yearly plans go to ExtraValue
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

        // Catch edge cases for Daily/Monthly
        if (type === 'ExtraValue' && (validity.includes("Day") && parseInt(validity) <= 7)) {
            type = 'Daily';
        } else if (type === 'ExtraValue' && validity.includes("Day") && parseInt(validity) > 7) {
            type = 'Monthly';
        }

        return { volume, validity, type };
    }


    /**
     * Converts the raw Python dictionary data into the structured JS data format.
     * @param {Object} rawDict 
     * @returns {Object} Structured plans keyed by plan name
     */

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
                planType: details.type as 'Daily' | 'Weekly' | 'Monthly' | 'Extravalue',
                network: network as Network,
                description: name
            });
        }
        return processed;
    }


export const dataPlanFunction = (): DataPlan[] => {
  const mtnPlans = Object.values(processPlans('MTN', mtn_dict))
  const gloPlans = Object.values(processPlans('Glo', glo_dict))
  const airtelPlans = Object.values(processPlans('Airtel', airtel_dict))
  const etisalatPlans = Object.values(processPlans('9mobile', etisalat_dict))

  return [mtnPlans, gloPlans, airtelPlans, etisalatPlans].flat();
  
};


