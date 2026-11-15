export interface MrGPackage {
  id: string;
  name: string;
  priceNgn: number;
  linkCredits: number;
  customAliasCredits: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

// Initial recommended one-off credit bundles for market testing.
// These are product proposals and should be approved before live billing.
export const MRG_PACKAGES: MrGPackage[] = [
  {
    id: 'starter-50',
    name: 'Starter',
    priceNgn: 1500,
    linkCredits: 50,
    customAliasCredits: 5,
    description: 'A simple bundle for personal use and small projects.',
    features: ['50 link creations', '5 custom aliases', 'Basic link management', 'Basic QR generation'],
  },
  {
    id: 'creator-150',
    name: 'Creator',
    priceNgn: 3500,
    linkCredits: 150,
    customAliasCredits: 20,
    description: 'For creators sharing links across multiple channels.',
    features: ['150 link creations', '20 custom aliases', 'Campaign organisation', 'Branded QR styling', '30-day analytics access'],
    recommended: true,
  },
  {
    id: 'business-500',
    name: 'Business',
    priceNgn: 9000,
    linkCredits: 500,
    customAliasCredits: 100,
    description: 'For active vendors and growing businesses.',
    features: ['500 link creations', '100 custom aliases', 'Advanced analytics', 'Password-protected links', 'Campaign management', 'Landing pages'],
  },
  {
    id: 'growth-1500',
    name: 'Growth',
    priceNgn: 22000,
    linkCredits: 1500,
    customAliasCredits: 500,
    description: 'For high-volume marketing and business use.',
    features: ['1,500 link creations', '500 custom aliases', 'Advanced analytics', 'Smart routing controls', 'Priority support eligibility'],
  },
];

export const FREE_LINK_CREDITS = 5;
