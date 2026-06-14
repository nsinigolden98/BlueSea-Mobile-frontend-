// src/data/services.ts
export type ServiceBadge = 'New' | 'Popular' | 'Recommended';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  category: string;
  badge?: ServiceBadge;
}

export const serviceCategories = [
  'Everyday Payments',
  'Wallet & Rewards',
  'Marketplace & Commerce',
  'Finance',
  'Business Tools',
  'Community & Experience',
  'Advanced Services',
];

export const services: Service[] = [
  // Everyday Payments
  { id: 'ep-1', name: 'Airtime', description: 'Recharge any network instantly', icon: 'Smartphone', route: '/airtime', category: 'Everyday Payments', badge: 'Popular' },
  { id: 'ep-2', name: 'Data', description: 'Buy internet data bundles', icon: 'Wifi', route: '/data', category: 'Everyday Payments', badge: 'Popular' },
  { id: 'ep-3', name: 'Electricity', description: 'Pay prepaid & postpaid bills', icon: 'Zap', route: '/light-bills', category: 'Everyday Payments' },
  { id: 'ep-4', name: 'TV Subscription', description: 'DSTV, GOTV, Startimes', icon: 'Tv', route: '/tv-subscription', category: 'Everyday Payments' },
  { id: 'ep-5', name: 'Smart Top-up', description: 'Automate your regular recharges', icon: 'RefreshCw', route: '/auto-topup', category: 'Everyday Payments' },

  // Wallet & Rewards
  { id: 'wr-1', name: 'Wallet', description: 'Manage your primary balance', icon: 'Wallet', route: '/wallet', category: 'Wallet & Rewards' },
  { id: 'wr-2', name: 'Gift Cards', description: 'Buy & trade global gift cards', icon: 'Gift', route: '/gift-cards', category: 'Wallet & Rewards' },
  { id: 'wr-3', name: 'Referral Rewards', description: 'Earn from inviting friends', icon: 'Share2', route: '/rewards', category: 'Wallet & Rewards' },
  { id: 'wr-4', name: 'Blue Points', description: 'Redeem your loyalty points', icon: 'Coins', route: '/rewards', category: 'Wallet & Rewards' },

  // Marketplace & Commerce
  { id: 'mc-1', name: 'Marketplace', description: 'Shop physical & digital goods', icon: 'Store', route: '/marketplace', category: 'Marketplace & Commerce' },
  { id: 'mc-2', name: 'Storefronts', description: 'Manage your online store', icon: 'ShoppingBag', route: '/commerce/storefronts', category: 'Marketplace & Commerce', badge: 'New' },
  { id: 'mc-3', name: 'Freelance', description: 'Hire or work as a freelancer', icon: 'Briefcase', route: '/commerce/freelance', category: 'Marketplace & Commerce' },
  { id: 'mc-4', name: 'Affiliate', description: 'Earn commissions on sales', icon: 'Network', route: '/commerce/affiliate', category: 'Marketplace & Commerce' },
  { id: 'mc-5', name: 'Contracts', description: 'Secure escrow agreements', icon: 'FileSignature', route: '/commerce/contracts', category: 'Marketplace & Commerce' },

  // Finance
  { id: 'fi-1', name: 'Savings Vault', description: 'Earn interest on your funds', icon: 'PiggyBank', route: '/finance/savings', category: 'Finance', badge: 'Recommended' },
  { id: 'fi-2', name: 'Cards', description: 'Virtual & physical debit cards', icon: 'CreditCard', route: '/finance/cards', category: 'Finance' },
  { id: 'fi-3', name: 'Crypto', description: 'Trade & store digital assets', icon: 'Bitcoin', route: '/finance/crypto', category: 'Finance' },
  { id: 'fi-4', name: 'Pension', description: 'Plan for your retirement', icon: 'Umbrella', route: '/finance/pension', category: 'Finance' },
  { id: 'fi-5', name: 'Insurance', description: 'Protect what matters most', icon: 'ShieldCheck', route: '/finance/insurance', category: 'Finance' },

  // Business Tools
  { id: 'bt-1', name: 'Payroll', description: 'Automate staff salaries', icon: 'Calculator', route: '/business/payroll', category: 'Business Tools' },
  { id: 'bt-2', name: 'Invoices', description: 'Generate & track payments', icon: 'FileText', route: '/business/invoices', category: 'Business Tools' },
  { id: 'bt-3', name: 'Properties', description: 'Manage real estate assets', icon: 'Building', route: '/business/properties', category: 'Business Tools' },
  { id: 'bt-4', name: 'Appointments', description: 'Schedule client bookings', icon: 'Calendar', route: '/business/appointments', category: 'Business Tools' },
  { id: 'bt-5', name: 'Analytics', description: 'Business insights & reports', icon: 'PieChart', route: '/business/analytics', category: 'Business Tools' },

  // Community & Experience
  { id: 'ce-1', name: 'Group Payment', description: 'Split bills with friends', icon: 'Users', route: '/group-payment', category: 'Community & Experience' },
  { id: 'ce-2', name: 'BlueSphere', description: 'Join the social ecosystem', icon: 'Orbit', route: '/bluesphere', category: 'Community & Experience', badge: 'New' },
  { id: 'ce-3', name: 'Streams', description: 'Live events and broadcasts', icon: 'PlaySquare', route: '/experience/streams', category: 'Community & Experience' },
  { id: 'ce-4', name: 'Subscriptions', description: 'Manage recurring services', icon: 'Repeat', route: '/subscriptions', category: 'Community & Experience' },

  // Advanced Services
  { id: 'as-1', name: 'Airtime Buyback', description: 'Convert airtime to cash', icon: 'ArrowLeftRight', route: '/airtime-buyback', category: 'Advanced Services' },
];

export const featuredServiceIds = ['ep-1', 'wr-1', 'fi-1', 'ce-2'];
