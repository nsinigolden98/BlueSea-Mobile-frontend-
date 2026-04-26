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
  { id: 'campaigns', label: 'Flights', icon: 'PlaneTakeoff', path: '/flights' },
  { id: 'scanner', label: 'Scanner', icon: 'QrCode', path: '/scanner-assignments' },
  { id: 'support', label: 'Support', icon: 'Headphones', path: '/support' },
    { id: 'bluespere', label: 'BlueSpere', icon: 'Orbit', path: '/bluesphere' },
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
  "N100 100MB - 24 hrs": [
    "mtn-10mb-100",
    100
  ],
  "N200 200MB - 2 days": [
    "mtn-50mb-200",
    200
  ],
  "N1000 1.5GB - 30 days": [
    "mtn-100mb-1000",
    1000
  ],
  "N2000 4.5GB - 30 days": [
    "mtn-500mb-2000",
    2000
  ],
  "N1500 6GB - 7 days": [
    "mtn-20hrs-1500",
    1500
  ],
  "N2500 6GB - 30 days": [
    "mtn-3gb-2500",
    2500
  ],
  "N3000 8GB - 30 days": [
    "mtn-data-3000",
    3000
  ],
  "N3500 10GB - 30 days": [
    "mtn-1gb-3500",
    3500
  ],
  "N5000 15GB - 30 days": [
    "mtn-100hr-5000",
    5000
  ],
  "N6000 20GB - 30 days": [
    "mtn-3gb-6000",
    6000
  ],
  "N10000 40GB - 30 days": [
    "mtn-40gb-10000",
    10000
  ],
  "N15000 75GB - 30 days": [
    "mtn-75gb-15000",
    15000
  ],
  "N20000 110GB - 30 days": [
    "mtn-110gb-20000",
    20000
  ],
  "N1500 3GB - 30 days": [
    "mtn-3gb-1500",
    1500
  ],
  "N10000 25GB SME - 1 month": [
    "mtn-25gb-sme-10000",
    10000
  ],
  "N50000 165GB SME - 2 months": [
    "mtn-165gb-sme-50000",
    50000
  ],
  "N100000 360GB SME - 3 months": [
    "mtn-360gb-sme-100000",
    100000
  ],
  "N110000 1TB - 1 year": [
    "mtn-1tb-110000",
    110000
  ],
  "N600 2.5GB - 2 days": [
    "mtn-2-5gb-600",
    600
  ],
  "N22000 120GB + 80mins - 30 days": [
    "mtn-120gb-22000",
    22000
  ],
  "N20000 100GB - 2 months": [
    "mtn-100gb-20000",
    20000
  ],
  "N30000 160GB - 2 months": [
    "mtn-160gb-30000",
    30000
  ],
  "N50000 400GB - 3 months": [
    "mtn-400gb-50000",
    50000
  ],
  "N75000 600GB - 3 months": [
    "mtn-600gb-75000",
    75000
  ],
  "N300 Xtratalk Weekly": [
    "mtn-xtratalk-300",
    300
  ],
  "N500 Xtratalk Weekly": [
    "mtn-xtratalk-500",
    500
  ],
  "N1000 Xtratalk Monthly": [
    "mtn-xtratalk-1000",
    1000
  ],
  "N2000 Xtratalk Monthly": [
    "mtn-xtratalk-2000",
    2000
  ],
  "N5000 Xtratalk Monthly": [
    "mtn-xtratalk-5000",
    5000
  ],
  "N10000 Xtratalk Monthly": [
    "mtn-xtratalk-10000",
    10000
  ],
  "N15000 Xtratalk Monthly": [
    "mtn-xtratalk-15000",
    15000
  ],
  "N20000 Xtratalk Monthly": [
    "mtn-xtratalk-20000",
    20000
  ],
  "N800 3GB - 2 days": [
    "mtn-3gb-800",
    800
  ],
  "N200 Xtradata": [
    "mtn-xtradata-200",
    200
  ]
}

const airtel_dict = {
  "N50 25MB - 1 day": [
    "airt-50",
    50
  ],
  "N100 75MB - 1 day": [
    "airt-100",
    100
  ],
  "N200 200MB - 3 days": [
    "airt-200",
    200
  ],
  "N300 350MB - 7 days": [
    "airt-300",
    300
  ],
  "N500 750MB - 14 days": [
    "airt-500",
    500
  ],
  "N1000 1.5GB - 30 days": [
    "airt-1000",
    1000
  ],
  "N1500 3GB - 30 days": [
    "airt-1500",
    1500
  ],
  "N2000 4.5GB - 30 days": [
    "airt-2000",
    2000
  ],
  "N3000 8GB - 30 days": [
    "airt-3000",
    3000
  ],
  "N4000 11GB - 30 days": [
    "airt-4000",
    4000
  ],
  "N5000 15GB - 30 days": [
    "airt-5000",
    5000
  ],
  "N1500 6GB Binge - 7 days": [
    "airt-1500-2",
    1500
  ],
  "N10000 40GB - 30 days": [
    "airt-10000",
    10000
  ],
  "N15000 75GB - 30 days": [
    "airt-15000",
    15000
  ],
  "N20000 110GB - 30 days": [
    "airt-20000",
    20000
  ],
  "N600 1GB - 14 days": [
    "airt-600",
    600
  ],
  "N1000 1.5GB - 7 days": [
    "airt-1000-7",
    1000
  ],
  "N2000 7GB - 7 days": [
    "airt-2000-7",
    2000
  ],
  "N5000 25GB - 7 days": [
    "airt-5000-7",
    5000
  ],
  "N400 1.5GB - 1 day": [
    "airt-400-1",
    400
  ],
  "N800 3.5GB - 2 days": [
    "airt-800-2",
    800
  ],
  "N6000 23GB - 30 days": [
    "airt-6000-30",
    6000
  ]
}
        
const glo_dict = {
  "N100 105MB - 2 days": [
    "glo100",
    100
  ],
  "N200 350MB - 4 days": [
    "glo200",
    200
  ],
  "N500 1.05GB - 14 days": [
    "glo500",
    500
  ],
  "N1000 2.5GB - 30 days": [
    "glo1000",
    1000
  ],
  "N2000 5.8GB - 30 days": [
    "glo2000",
    2000
  ],
  "N5000 18.25GB - 30 days": [
    "glo5000",
    5000
  ],
  "N8000 29.5GB - 30 days": [
    "glo8000",
    8000
  ],
  "N10000 50GB - 30 days": [
    "glo10000",
    10000
  ],
  "N15000 93GB - 30 days": [
    "glo15000",
    15000
  ],
  "N18000 119GB - 30 days": [
    "glo18000",
    18000
  ],
  "N1500 4.1GB - 30 days": [
    "glo1500",
    1500
  ],
  "N20000 138GB - 30 days": [
    "glo20000",
    20000
  ],
  "N50 45MB + 5MB Night - 1 day": [
    "glo-daily-50",
    50
  ],
  "N100 115MB + 35MB Night - 1 day": [
    "glo-daily-100",
    100
  ],
  "N200 240MB + 110MB Night - 2 days": [
    "glo-2days-200",
    200
  ],
  "N500 800MB + 1GB Night - 2 weeks": [
    "glo-2weeks-500",
    500
  ],
  "N1000 1.9GB + 2GB Night - 30 days": [
    "glo-monthly-1000",
    1000
  ],
  "N1500 3.5GB + 4GB Night - 30 days": [
    "glo-monthly-1500",
    1500
  ],
  "N2000 5.2GB + 4GB Night - 30 days": [
    "glo-monthly-2000",
    2000
  ],
  "N2500 6.8GB + 4GB Night - 30 days": [
    "glo-monthly-2500",
    2500
  ],
  "N3000 10GB + 4GB Night - 30 days": [
    "glo-monthly-3000",
    3000
  ],
  "N4000 14GB + 4GB Night - 30 days": [
    "glo-monthly-4000",
    4000
  ],
  "N5000 20GB + 4GB Night - 30 days": [
    "glo-monthly-5000",
    5000
  ],
  "N8000 27.5GB + 2GB Night - 30 days": [
    "glo-monthly-8000",
    8000
  ],
  "N15000 86GB + 7GB Night - 30 days": [
    "glo-monthly-15000",
    15000
  ],
  "N18000 109GB + 10GB Night - 30 days": [
    "glo-monthly-18000",
    18000
  ],
  "N20000 126GB + 12GB Night - 30 days": [
    "glo-monthly-20000",
    20000
  ]
}

const  etisalat_dict = {
  "N100 100MB - 1 day": [
    "eti-100",
    100
  ],
  "N200 650MB - 1 day": [
    "eti-200",
    200
  ],
  "N1000 1.5GB - 30 days": [
    "eti-1000",
    1000
  ],
  "N2000 4.5GB - 30 days": [
    "eti-2000",
    2000
  ],
  "N10000 40GB - 30 days": [
    "eti-10000",
    10000
  ],
  "N27500 30GB - 90 days": [
    "eti-27500",
    27500
  ],
  "N55000 60GB - 180 days": [
    "eti-55000",
    55000
  ],
  "N300 1GB + 100MB - 1 day": [
    "eti-300",
    300
  ],
  "N2500 11GB - 30 days": [
    "eti-2500",
    2500
  ],
  "N20000 125GB - 30 days": [
    "eti-20000",
    20000
  ],
  "N1500 7GB - 7 days": [
    "eti-1500-7",
    1500
  ]
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


